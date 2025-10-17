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

export const ErrFirstNameAtLeast2Chars = new Error('First name must be at least 2 characters');
export const ErrLastNameAtLeast2Chars = new Error('Last name must be at least 2 characters');
export const ErrPasswordAtLeast6Chars = new Error('Password must be at least 6 characters long');
export const ErrPasswordInvalidChars = new Error('Password can only contain letters, numbers, and special characters');
export const ErrInvalidEmailAndPassword = new Error('Invalid email and password');
export const ErrEmailInvalid = new Error('Email is invalid');
export const ErrPhoneInvalid = new Error('Phone number is invalid');
export const ErrUserInactivated = new Error('User is inactivated or banned');
export const ErrInvalidToken = new Error('Invalid token');
export const ErrRoleInvalid = new Error('Role is invalid');
export const ErrWalletAddressInvalid = new Error('Wallet address is invalid');

// Mô hình dữ liệu
export const userSchema = z.object({
    id: z.string().uuid(),
    avatar: z.string().nullable().optional(),
    firstName: z.string().min(2, { message: ErrFirstNameAtLeast2Chars.message }),
    lastName: z.string().min(2, { message: ErrLastNameAtLeast2Chars.message }),
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