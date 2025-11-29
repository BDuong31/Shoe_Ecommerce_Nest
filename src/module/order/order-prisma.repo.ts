import { Injectable } from "@nestjs/common";
import { IOrderRepository, IOrderItemRepository, IOrderCouponRepository } from "./order.port";
import prisma from "src/share/components/prisma";
import { CreateOrderCouponDTO, FilterOrderDTO, FilterOrderItemDTO, OrderCoupon } from "./order.model";
import { Order, OrderItems } from "./order.model";
import { Order as PrismaOrder, OrderItem as PrismaOrderItems } from "@prisma/client";
import { Paginated, PagingDTO } from "src/share/data-model";
import { Requester } from "src/share/interface";

@Injectable()
export class OrderPrismaRepository implements IOrderRepository {
    async get(id: string): Promise<Order | null> {
        const data = await prisma.order.findFirst({ where: { id } });
        if (!data) return null;
        
        return data as Order;
    }

    async list(cond: FilterOrderDTO, paging: PagingDTO, requester: Requester): Promise<Paginated<Order>> {
        const { totalAmount, status, shippingAddressId } = cond;
        const userId = requester.sub;
        let where = {
            ...cond,
        }
        if (totalAmount !== undefined) {
            where = {
                ...where,
                totalAmount: totalAmount,
            } as FilterOrderDTO
        }
        if (status) {
            where = {
                ...where,
                status: status,
            } as FilterOrderDTO
        }
        if (userId) {
            where = {
                ...where,
                userId: userId,
            } as FilterOrderDTO
        }
        if (shippingAddressId) {
            where = {
                ...where,
                shippingAddressId: shippingAddressId,
            } as FilterOrderDTO
        }

        const total = await prisma.order.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.order.findMany({
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

    // Lấy danh sách đơn hàng theo danh sách id
    async listByIds(ids: string[]): Promise<Order[]> {
        const data = await prisma.order.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(order: Order): Promise<void> {
        await prisma.order.create({ data: order });
    }

    async update(id: string, dto: Partial<Order>): Promise<void> {
        await prisma.order.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.order.delete({ where: { id } });
    }

    private _toModel(data: PrismaOrder): Order {
        return data as Order;
    }
}

@Injectable()
export class OrderItemPrismaRepository implements IOrderItemRepository {
    async get(id: string): Promise<OrderItems | null> {
        const data = await prisma.orderItem.findFirst({ where: { id } });
        if (!data) return null;
        
        return data as OrderItems;
    }

    async listByOrderId(cond: FilterOrderItemDTO): Promise<OrderItems[]> {
        const { orderId, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (orderId) {
            where = {
                ...where,
                orderId: orderId,
            } as FilterOrderItemDTO
        }

        const result = await prisma.orderItem.findMany({
            where,
            orderBy: {
                id: 'desc',
            },
        });

        return result.map(this._toModel);
    }

    async listByIds(ids: string[]): Promise<OrderItems[]> {
        const data = await prisma.orderItem.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(orderItem: OrderItems): Promise<void> {
        await prisma.orderItem.create({ data: orderItem });
    }

    async update(id: string, dto: Partial<OrderItems>): Promise<void> {
        await prisma.orderItem.update({
            where: { id },
            data: dto,
        });
    }       

    async delete(id: string): Promise<void> {
        await prisma.orderItem.delete({ where: { id } });
    }

    private _toModel(data: PrismaOrderItems): OrderItems {
        return data as OrderItems;
    }
}   

@Injectable()
export class OrderCouponPrismaRepository implements IOrderCouponRepository {
    async get(orderId: string): Promise<OrderCoupon | null> {
        const data = await prisma.orderCoupon.findFirst({ where: { orderId } });
        if (!data) return null;
        
        return data as OrderCoupon;
    }
    async insert(dto: OrderCoupon): Promise<void> {
        await prisma.orderCoupon.create({ data: dto });
    }

    async delete(orderId: string): Promise<void> {
        await prisma.orderCoupon.deleteMany({ where: { orderId: orderId } });
    }
}