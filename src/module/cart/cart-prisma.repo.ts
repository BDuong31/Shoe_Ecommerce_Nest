import { Injectable } from "@nestjs/common";
import { ICartItemRepository, ICartRepository } from "./cart.port";
import prisma from "src/share/components/prisma";
import { Cart, CartItem, FilterCartItemDTO, UpdateCartItemDTO } from "./cart.model";
import { Cart as PrismaCart, CartItem as PrismaCartItem } from "@prisma/client";
import { Paginated, PagingDTO } from "src/share/data-model";

@Injectable()
export class CartPrismaRepository implements ICartRepository {
    async get(userId: string): Promise<Cart | null> {
        const data = await prisma.cart.findFirst({ where: { OR: [{ userId: userId }, { id: userId }] } });
        if (!data) return null;

        return this._toModel(data);
    }

    async insert(cart: Cart): Promise<void> {
        await prisma.cart.create({ data: cart });
    }

    async update(userId: string, cart: Partial<Cart>): Promise<void> {
        await prisma.cart.update({ where: { userId: userId }, data: cart });
    }

    async delete(userId: string): Promise<void> {
        await prisma.cart.delete({ where: { userId: userId } });
    }

  async increaseCount(userId: string, field: string, step: number): Promise<void> {
    await prisma.cart.update({ where: { userId: userId }, data: { [field]: { increment: step } } });
  }

  async decreaseCount(userId: string, field: string, step: number): Promise<void> {
    await prisma.cart.update({ where: { userId: userId }, data: { [field]: { decrement: step } } });
  }

  private _toModel(data: PrismaCart): Cart {
        return {
            id: data.id,
            userId: data.userId,
            totalItem: data.totalItem,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
}

export class CartItemPrismaRepository implements ICartItemRepository {
    async get(id: string): Promise<CartItem | null> {
        const data = await prisma.cartItem.findFirst({ where: { OR: [{ id: id }, { cartId: id }] } });
        if (!data) return null;

        return this._toModel(data);
    }

    async insert(cartItem: CartItem): Promise<void> {
        await prisma.cartItem.create({ data: cartItem });
    }

    async update(id: string, dto: UpdateCartItemDTO): Promise<void> {
        await prisma.cartItem.update({ where: { id }, data: dto });
    }

    async delete(id: string): Promise<void> {
        await prisma.cartItem.delete({ where: { id } });
    }

    async list(cond: FilterCartItemDTO, paging: PagingDTO): Promise<Paginated<CartItem>> {
        const { cartId, variantId, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (cartId) {
            where = {
                ...where,
                cartId: cartId,
            } as FilterCartItemDTO
        }
        if (variantId) {
            where = {
                ...where,
                variantId: variantId,
            } as FilterCartItemDTO
        }

        const total = await prisma.cartItem.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.cartItem.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                id: 'desc',
            },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        };
    }

    async listByIds(ids: string[]): Promise<CartItem[]> {
        const data = await prisma.cartItem.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    private _toModel(data: PrismaCartItem): CartItem {
        return data;
    }
}