import { Inject, Injectable } from '@nestjs/common';
import { ICartItemRepository, ICartItemService, ICartRepository, ICartService } from './cart.port';
import { CART_ITEM_REPOSITORY, CART_ITEM_SERVICE, CART_REPOSITORY } from './cart.di-token';
import { Cart, CartItem, CreateCartDTO, ErrCartNotFound, UpdateCartItemDTO } from './cart.model';
import { AppError, IEventPublisher, IPublicProductRpc, IPublicUserRpc, IPublicVariantRpc, Requester } from 'src/share';
import { v7 } from 'uuid';
import { EVENT_PUBLISHER, PRODUCT_RPC, USER_RPC, VARIANT_RPC } from 'src/share/di-token';
import { ErrUserNotFound } from '../address/address.model';
import { ErrVariationNotFound } from '../variation/variation.model';
import { CartItemCreatedEvent, CartItemDeletedEvent, CartItemUpdatedEvent } from 'src/share/event';
import { is } from 'zod/v4/locales';

@Injectable()
export class CartService implements ICartService {
    constructor(
        @Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository,
        @Inject(CART_ITEM_REPOSITORY) private readonly cartItemRepo: ICartItemRepository,
        @Inject(VARIANT_RPC) private readonly variantRpc: IPublicVariantRpc,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
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
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
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

        this.eventPublisher.publish(CartItemCreatedEvent.create({ cartId: newCartItem.cartId, cartItemId: newCartItem.id }, newCartItem.id));

        return newId;
    }
    async update(id: string, dto: UpdateCartItemDTO): Promise<boolean> {
        const cartItemExist = await this.cartItemRepo.get(id);
        if (!cartItemExist) {
            return false;
        }
        if (dto.quantity !== undefined && dto.quantity <= 0) {
            throw AppError.from(new Error('Quantity must be greater than 0'), 400);
        }

        let updatedCartItem: UpdateCartItemDTO = {};

        if (dto.variantId !== undefined && dto.variantId !== cartItemExist.variantId) {
            updatedCartItem = {
                quantity: dto.quantity
            }
        } else {
            updatedCartItem = { 
                quantity: dto.quantity,
                variantId: dto.variantId,
            };
        }
            
        await this.cartItemRepo.update(id, updatedCartItem);

        const isStatusChanged = cartItemExist.quantity > dto.quantity ? 'decrease' : 'increase';
        if (isStatusChanged === 'increase') {
            const quantityDiff = dto.quantity! - cartItemExist.quantity;
            this.eventPublisher.publish(CartItemUpdatedEvent.create({ cartId: cartItemExist.cartId, cartItemId: id, statusUpdateCartItem: 'increase', quantity: quantityDiff }, id));
        } else if (isStatusChanged === 'decrease') {
            const quantityDiff = cartItemExist.quantity - dto.quantity!;
            this.eventPublisher.publish(CartItemUpdatedEvent.create({ cartId: cartItemExist.cartId, cartItemId: id, statusUpdateCartItem: 'decrease', quantity: quantityDiff }, id));
        } else {
            this.eventPublisher.publish(CartItemUpdatedEvent.create({ cartId: cartItemExist.cartId, cartItemId: id, statusUpdateCartItem: 'increase', quantity: dto.quantity }, id));
        }

        return true;
    }
    async delete(id: string): Promise<boolean> {
        const cartItemExist = await this.cartItemRepo.get(id);
        if (!cartItemExist) {
            return false;
        }

        await this.cartItemRepo.delete(id);

        this.eventPublisher.publish(CartItemDeletedEvent.create({ cartId: cartItemExist.cartId, cartItemId: id }, id));

        return true;
    }
}

