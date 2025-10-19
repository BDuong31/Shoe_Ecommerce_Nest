import { Inject, Injectable } from '@nestjs/common';
import { ICartItemRepository, ICartItemService, ICartRepository, ICartService } from './cart.port';
import { CART_ITEM_REPOSITORY, CART_ITEM_SERVICE, CART_REPOSITORY } from './cart.di-token';
import { Cart, CartItem, CreateCartDTO, ErrCartNotFound } from './cart.model';
import { AppError, IPublicProductRpc, IPublicUserRpc, IPublicVariantRpc, Requester } from 'src/share';
import { v7 } from 'uuid';
import { PRODUCT_RPC, USER_RPC, VARIANT_RPC } from 'src/share/di-token';
import { ErrUserNotFound } from '../address/address.model';
import { ErrVariationNotFound } from '../variation/variation.model';

@Injectable()
export class CartService implements ICartService {
    constructor(
        @Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository,
        @Inject(CART_ITEM_REPOSITORY) private readonly cartItemRepo: ICartItemRepository,
        @Inject(VARIANT_RPC) private readonly variantRpc: IPublicVariantRpc,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
    ) {}

    async create(userId: CreateCartDTO): Promise<string> {
        const user = await this.userRpc.findById(userId.userId);
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        const newId = v7();

        const newCart: Cart = {
            id: newId,
            userId: userId.userId,
            totalItem: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.cartRepo.insert(newCart);

        return newId;

    }

    async update(id: string, dto: Partial<Cart>): Promise<boolean> {
        const cartExist = await this.cartRepo.get(id);
        if (!cartExist) {
            return false;
        }

        const updatedCart = {
            ...dto,
            updatedAt: new Date(),
        };

        await this.cartRepo.update(id, updatedCart);

        return true;
    }

    async delete(id: string): Promise<boolean> {
        const cartExist = await this.cartRepo.get(id);
        if (!cartExist) {
            return false;
        }

        await this.cartRepo.delete(id);

        return true;
    }
}

export class CartItemService implements ICartItemService {
    constructor(
        @Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository,
        @Inject(CART_ITEM_REPOSITORY) private readonly cartItemRepo: ICartItemRepository,
    ) {}

    async create(dto: CartItem): Promise<string> {
        const cartExist = await this.cartRepo.get(dto.cartId);
        if (!cartExist) {
            throw AppError.from(ErrCartNotFound, 404);
        }

        const newId = v7();

        const newCartItem: CartItem = {
            id: newId,
            cartId: dto.cartId,
            variantId: dto.variantId,
            quantity: dto.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.cartItemRepo.insert(newCartItem);

        return newId;
    }
    async update(id: string, dto: Partial<CartItem>): Promise<boolean> {
        const cartItemExist = await this.cartItemRepo.get(id);
        if (!cartItemExist) {
            return false;
        }
        
        const updatedCartItem = {
            ...dto,
            updatedAt: new Date(),
        };
        await this.cartItemRepo.update(id, updatedCartItem);

        return true;
    }
    async delete(id: string): Promise<boolean> {
        const cartItemExist = await this.cartItemRepo.get(id);
        if (!cartItemExist) {
            return false;
        }

        await this.cartItemRepo.delete(id);

        return true;
    }
}

