import { create } from 'domain';
import { UserRole } from 'src/share'
import { z } from 'zod';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum Status {
    ACTIVE = 'active',
    PENDING = 'pending',
    INACTIVE = 'inactive',
    BANNED = 'banned',
    DELETED = 'deleted',
}

export enum UserCouponStatus {
    AVAILABLE = 'available',
    USED = 'used',
    EXPIRED = 'expired',
}

export const ErrFullNameAtLeast6Chars = new Error('Full name must be at least 6 characters long');
export const ErrPasswordAtLeast6Chars = new Error('Password must be at least 6 characters long');
export const ErrPasswordInvalidChars = new Error('Password can only contain letters, numbers, and special characters');
export const ErrInvalidEmailAndPassword = new Error('Invalid email and password');
export const ErrEmailInvalid = new Error('Email is invalid');
export const ErrPhoneInvalid = new Error('Phone number is invalid');
export const ErrUserInactivated = new Error('User is inactivated or banned');
export const ErrInvalidToken = new Error('Invalid token');
export const ErrRoleInvalid = new Error('Role is invalid');
export const ErrWalletAddressInvalid = new Error('Wallet address is invalid');
export const ErrUserNotFound = new Error('User not found');
export const ErrUserCouponStatusInvalid = new Error('User coupon status is invalid');

// Mô hình dữ liệu
export const userSchema = z.object({
    id: z.string().uuid(),
    avatar: z.string().nullable().optional(),
    fullName: z.string().min(6, { message: ErrFullNameAtLeast6Chars.message }),
    gender: z.nativeEnum(Gender),
    password: z
        .string()
        .min(6, { message: ErrPasswordAtLeast6Chars.message })
        .regex(/^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, { message: ErrPasswordInvalidChars.message }),
    salt: z.string().min(8),
    email: z.string().email("Email is invalid"),
    phone: z.string().min(10).max(15).optional(),
    walletAddress: z.string(),
    role: z.nativeEnum(UserRole, ErrRoleInvalid),
    status: z.nativeEnum(Status).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface User extends z.infer<typeof userSchema> {}

export const UserCouponSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    couponId: z.string().uuid(),
    status: z.nativeEnum(UserCouponStatus, ErrUserCouponStatusInvalid),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type UserCoupon = z.infer<typeof UserCouponSchema>;

export const CreateUserCouponDTOSchema = UserCouponSchema.pick({
    userId: true,
    couponId: true,
}).required();

export type CreateUserCouponDTO = z.infer<typeof CreateUserCouponDTOSchema>;

export const FilterUserCouponDTOSchema = UserCouponSchema.pick({
    userId: true,
    couponId: true,
    status: true,
}).partial();

export type FilterUserCouponDTO = z.infer<typeof FilterUserCouponDTOSchema>;