import e from 'express';
import { z } from 'zod';
import { de } from 'zod/v4/locales';

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
    name: z.string().min(1),
    description: z.string().optional(),
    type:  z.nativeEnum(type),
    discountValue: z.number().min(0),
    minSpend: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
    totalUsageLimit: z.number().min(0).optional(),
    currentUsageCount: z.number().min(0).optional(),
    expiryDate: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Coupon = z.infer<typeof couponSchema>;

export const createCouponDTOSchema = couponSchema.pick({
    code: true,
    name: true,
    description: true,
    type: true,
    discountValue: true,
    minSpend: true,
    maxDiscount: true,
    totalUsageLimit: true,
    currentUsageCount: true,
    expiryDate: true,
}).required();

export type CreateCouponDTO = z.infer<typeof createCouponDTOSchema>;

export const updateCouponDTOSchema = couponSchema.pick({
    code: true,
    name: true,
    description: true,
    type: true,
    discountValue: true,
    minSpend: true,
    maxDiscount: true,
    totalUsageLimit: true,
    currentUsageCount: true,
    expiryDate: true,
}).partial();

export type UpdateCouponDTO = z.infer<typeof updateCouponDTOSchema>;

export const filterCouponDTOSchema = couponSchema.pick({
    code: true,
    name: true,
    description: true,
    type: true,
    discountValue: true,
    minSpend: true,
    maxDiscount: true,
    totalUsageLimit: true,
    currentUsageCount: true,
    expiryDate: true,
}).partial();

export type FilterCouponDTO = z.infer<typeof filterCouponDTOSchema>;