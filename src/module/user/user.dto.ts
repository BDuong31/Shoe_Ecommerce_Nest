import { z } from 'zod';
import { ErrPasswordAtLeast6Chars, userSchema } from './user.model';

export const userRegistrationDTOSchema = userSchema.pick({
    fullName: true,
    gender: true,
    email: true,
    password: true,
}).required();

export const userLoginDTOSchema = userSchema.pick({
    email: true,
    password: true,
}).required();

export interface UserLoginDTO extends z.infer<typeof userLoginDTOSchema> {}

export interface UserRegistrationDTO extends z.infer<typeof userRegistrationDTOSchema> {}

export const userUpdateDTOSchema = userSchema.pick({
    avatar: true,
    fullName: true,
    gender: true,
    email: true,
    phone: true,
    walletAddress: true,
    password: true,
    salt: true,
    role: true,
    status: true,
}).partial();

export interface UserUpdateDTO extends z.infer<typeof userUpdateDTOSchema> {}

export const userChangePasswordDTOSchema = z.object({
    currentPassword: z.string().min(6, { message: ErrPasswordAtLeast6Chars.message }),
    newPassword: z.string().min(6, { message: ErrPasswordAtLeast6Chars.message }),
}).required();

export interface UserChangePasswordDTO extends z.infer<typeof userChangePasswordDTOSchema> {}

export const userUpdateProfileDTOSchema = userUpdateDTOSchema.omit({
    role: true,
    status: true,
}).partial();

export const userCondDTOSchema = userSchema.pick({
    fullName: true,
    email: true,
    phone: true,
    walletAddress: true,
    role: true,
    status: true,
}).partial();

export interface UserCondDTO extends z.infer<typeof userCondDTOSchema> {}

export interface UserUpdateProfileDTO extends z.infer<typeof userUpdateProfileDTOSchema> {}
