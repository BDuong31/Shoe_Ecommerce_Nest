import { z } from 'zod';

// Error Cart
export const ErrCartNotFound = new Error('Cart not found');
export const ErrCartEmpty = new Error('Cart is empty');

// Error Cart Item
export const ErrCartItemNotFound = new Error('Cart item not found');
export const ErrCartItemExist = new Error('Cart item already exists');
export const ErrCartItemQuantityInvalid = new Error('Cart item quantity is invalid');
export const ErrCartItemInsufficientQuantity = new Error('Insufficient cart item quantity');
export const ErrCartItemExceedMaxQuantity = new Error('Cart item exceed max quantity');
export const ErrCartItemEmpty = new Error('Cart has no items');
export const ErrCartItemVariantRequired = new Error('Cart item variant is required');
export const ErrCartItemQuantityRequired = new Error('Cart item quantity is required');

// Mô hình dữ liệu
export const cartSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    totalItem: z.number().int().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Cart = z.infer<typeof cartSchema>;

export const createCartDTOSchema = cartSchema.pick({
    userId: true,
}).required();

export type CreateCartDTO = z.infer<typeof createCartDTOSchema>;

export const cartItemSchema = z.object({
    id: z.string().uuid(),
    quantity: z.number().int().positive(),

    cartId: z.string().uuid(),
    variantId: z.string().uuid(),

    createdAt: z.date(),
    updatedAt: z.date(),
})

export type CartItem = z.infer<typeof cartItemSchema>;

export const createCartItemDTOSchema = cartItemSchema.pick({
    quantity: true,
    cartId: true,
    variantId: true,
}).required();

export type CreateCartItemDTO = z.infer<typeof createCartItemDTOSchema>;

export const updateCartItemDTOSchema = cartItemSchema.pick({
    variantId: true,
    quantity: true,
}).partial();

export type UpdateCartItemDTO = z.infer<typeof updateCartItemDTOSchema>;

export const filterCartItemDTOSchema = cartItemSchema.pick({
    cartId: true,
    variantId: true,
}).partial();

export type FilterCartItemDTO = z.infer<typeof filterCartItemDTOSchema>;