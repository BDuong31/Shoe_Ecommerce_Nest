import e from 'express';
import { z } from 'zod';

export const ErrCouponNotFound = new Error('Coupon not found');
export const ErrCouponCodeRequired = new Error('Coupon code is required');
export const ErrCouponCodeExist = new Error('Coupon code already exists');
export const ErrCouponInvalid = new Error('Coupon is invalid');
export const ErrCouponExpired = new Error('Coupon has expired');
export const ErrCouponTypeInvalid = new Error('Coupon type is invalid');
export const ErrCouponExist = new Error('Coupon already exists');
export enum type {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}
export const couponSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(1, { message: ErrCouponCodeRequired.message }),
    type:  z.nativeEnum(type),
    discountValue: z.number().min(0),
    expiryDate: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Coupon = z.infer<typeof couponSchema>;

export const createCouponDTOSchema = couponSchema.pick({
    code: true,
    type: true,
    discountValue: true,
    expiryDate: true,
}).required();

export type CreateCouponDTO = z.infer<typeof createCouponDTOSchema>;

export const updateCouponDTOSchema = couponSchema.pick({
    code: true,
    type: true,
    discountValue: true,
    expiryDate: true,
}).partial();

export type UpdateCouponDTO = z.infer<typeof updateCouponDTOSchema>;

export const filterCouponDTOSchema = couponSchema.pick({
    code: true,
    type: true,
}).partial();

export type FilterCouponDTO = z.infer<typeof filterCouponDTOSchema>;