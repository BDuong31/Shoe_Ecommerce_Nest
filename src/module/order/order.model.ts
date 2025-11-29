import { z } from 'zod';

export enum OrderStatus {
    PROCESSING = 'Processing',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    CANCELLED = 'Canceled'
}

export const ErrOrderNotFound = new Error('Order not found');
export const ErrOrderAlreadyExists = new Error('Order already exists');
export const ErrInvalidOrderStatus = new Error('Invalid order status');
export const ErrTotalAmountRequired = new Error('Total amount is required');
export const ErrUserIdRequired = new Error('User ID is required');
export const ErrShippingAddressIdRequired = new Error('Shipping Address ID is required');
export const ErrOrderItemQuantityRequired = new Error('Order item quantity is required');
export const ErrOrderItemPriceRequired = new Error('Order item price is required');

export const OrderSchema = z.object({
    id: z.string().uuid(),
    totalAmount: z.number().nonnegative(),
    status: z.nativeEnum(OrderStatus),
    userId: z.string().uuid(),
    shippingAddressId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = z.object({
    totalAmount: z.number().nonnegative(),
    userId: z.string().uuid(),
    shippingAddressId: z.string().uuid()
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus)
});

export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;

export const FilterOrderSchema = z.object({
    totalAmount: z.number().nonnegative().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    shippingAddressId: z.string().uuid().optional(),
    userId: z.string().uuid().optional()
});

export type FilterOrderDTO = z.infer<typeof FilterOrderSchema>;

export const OrderItemsSchema = z.object({
    id: z.string().uuid(),
    quantity: z.number().positive(),
    priceAtPurchase: z.number().nonnegative(),
    orderId: z.string().uuid(),
    variantId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export type OrderItems = z.infer<typeof OrderItemsSchema>;

export const CreateOrderItemSchema = z.object({
    orderId: z.string().uuid(),
    quantity: z.number().positive(),
    priceAtPurchase: z.number().nonnegative(),
    variantId: z.string().uuid()
});

export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;

export const UpdateOrderItemSchema = z.object({
    quantity: z.number().positive().optional(),
    priceAtPurchase: z.number().nonnegative().optional()
});

export type UpdateOrderItemDTO = z.infer<typeof UpdateOrderItemSchema>;

export const FilterOrderItemSchema = z.object({
    orderId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional()
});

export type FilterOrderItemDTO = z.infer<typeof FilterOrderItemSchema>;

export const OrderCouponSchema = z.object({
    id: z.string().uuid(),
    discountApplied: z.number().nonnegative(),
    orderId: z.string().uuid(),
    couponId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type OrderCoupon = z.infer<typeof OrderCouponSchema>;

export const CreateOrderCouponSchema = z.object({
    discountApplied: z.number().nonnegative(),
    orderId: z.string().uuid(),
    couponId: z.string().uuid()
});

export type CreateOrderCouponDTO = z.infer<typeof CreateOrderCouponSchema>;

export const UpdateOrderCouponSchema = z.object({
    discountApplied: z.number().nonnegative().optional()
});

export type UpdateOrderCouponDTO = z.infer<typeof UpdateOrderCouponSchema>;

export const FilterOrderCouponSchema = z.object({
    orderId: z.string().uuid().optional(),
    couponId: z.string().uuid().optional()
});

export type FilterOrderCouponDTO = z.infer<typeof FilterOrderCouponSchema>;