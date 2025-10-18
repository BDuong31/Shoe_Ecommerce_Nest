import { z } from 'zod';
import { Cart, CartItem, CreateCartDTO, FilterCartItemDTO, UpdateCartItemDTO } from './cart.model';
import { Paginated, PagingDTO, Requester } from 'src/share';

export interface ICartRepository {
    get(userId: string): Promise<Cart | null>;
    insert(cart: CreateCartDTO): Promise<void>;
    update(userId: string, cart: Partial<Cart>): Promise<void>;
    delete(userId: string): Promise<void>;
    increaseCount(userId: string, field: string, step: number): Promise<void>;
    decreaseCount(userId: string, field: string, step: number): Promise<void>;
}

export interface ICartItemRepository {
    get(id: string): Promise<CartItem | null>;
    insert(cartItem: CartItem): Promise<void>;
    update(id: string, dto: UpdateCartItemDTO): Promise<void>;
    delete(id: string): Promise<void>;

    list(cond: FilterCartItemDTO, paging: PagingDTO): Promise<Paginated<CartItem>>
    listByIds(ids: string[]): Promise<CartItem[]>;
}

export interface ICartService {
    create(dto: CreateCartDTO): Promise<string>;
    update(id: string, dto: Partial<Cart>): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}

export interface ICartItemService {
    create(dto: CartItem): Promise<string>;
    update(id: string, dto: Partial<CartItem>): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}