import { Inject, Injectable } from '@nestjs/common';
import { IOrderCouponRepository, IOrderCouponService, IOrderItemRepository, IOrderItemService, IOrderRepository, IOrderService } from './order.port';
import { ORDER_COUPON_REPOSITORY, ORDER_ITEM_REPOSITORY, ORDER_REPOSITORY } from './order.di-token';
import { AppError, IPublicAddressRpc, IPublicCouponRpc, IPublicVariantRpc, Requester } from 'src/share';
import { v7 } from 'uuid';
import { CreateOrderCouponDTO, CreateOrderDTO, CreateOrderItemDTO, ErrOrderNotFound, ErrShippingAddressIdRequired, OrderStatus, UpdateOrderItemDTO } from './order.model';
import { ADDRESS_RPC, COUPON_RPC } from 'src/share/di-token';

@Injectable()
export class OrderService implements IOrderService {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
        @Inject(ADDRESS_RPC) private readonly shippingRpc: IPublicAddressRpc,
    ) {}
    async create(dto: CreateOrderDTO, requester: Requester): Promise<string> {
        const userId = requester.sub;

        const shippingInfo = await this.shippingRpc.findById(dto.shippingAddressId);
        if (!shippingInfo) {
            throw AppError.from(ErrShippingAddressIdRequired, 404);
        }

        const newId = v7();

        const newOrder = {
            id: newId,
            ...dto,
            status: OrderStatus.PROCESSING,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.orderRepo.insert(newOrder);

        return newId;
    }
    async update(orderId: string, dto: any): Promise<boolean> {
        const orderExist = await this.orderRepo.get(orderId);

        if (!orderExist) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const updatedOrder = {
            ...dto,
            updatedAt: new Date(),
        }

        await this.orderRepo.update(orderId, updatedOrder);

        return true;
    }
    async delete(orderId: string): Promise<boolean> {
        const orderExist = await this.orderRepo.get(orderId);

        if (!orderExist) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        await this.orderRepo.delete(orderId);

        return true;
    }
}

@Injectable()
export class OrderItemService implements IOrderItemService {
    constructor(
        @Inject(ORDER_ITEM_REPOSITORY) private readonly orderItemRepo: IOrderItemRepository,
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    ) {}
    async create(dto: CreateOrderItemDTO): Promise<string> {
        const order = await this.orderRepo.get(dto.orderId);
        if (!order) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const orderItemExist = await this.orderItemRepo.listByOrderId({ orderId: dto.orderId, variantId: dto.variantId });

        if (orderItemExist.length > 0) {
            throw AppError.from(ErrOrderNotFound, 409);
        }

        const newId = v7();

        const newOrderItem = {
            id: newId,
            ...dto,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.orderItemRepo.insert(newOrderItem);

        return newId;
    }
    async update(orderItemId: string, dto: UpdateOrderItemDTO): Promise<boolean> {
        const orderItemExist = await this.orderItemRepo.get(orderItemId);

        if (!orderItemExist) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const updatedOrderItem = {
            ...dto,
            updatedAt: new Date(),
        }

        await this.orderItemRepo.update(orderItemId, updatedOrderItem); 
        return true;
    }
    async delete(orderItemId: string): Promise<boolean> {
        const orderItemExist = await this.orderItemRepo.get(orderItemId);

        if (!orderItemExist) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        await this.orderItemRepo.delete(orderItemId);
        return true;
    }
}

@Injectable()
export class OrderCouponService implements IOrderCouponService {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
        @Inject(COUPON_RPC) private readonly couponRpc: IPublicCouponRpc,
        @Inject(ORDER_COUPON_REPOSITORY) private readonly orderCouponRepo: IOrderCouponRepository,
    ) {}

    async create(dto: CreateOrderCouponDTO): Promise<string> {
        const coupon = await this.couponRpc.findById(dto.couponId);

        if (!coupon) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const order = await this.orderRepo.get(dto.orderId);
        if (!order) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const newId = v7();

        const newOrderCoupon = {
            id: newId,
            ...dto,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.orderCouponRepo.insert(newOrderCoupon);

        return newId;
    }

    async delete(orderId: string): Promise<boolean> {
        const order = await this.orderRepo.get(orderId);
        if (!order) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        await this.orderCouponRepo.delete(orderId);
        return true;
    }
}