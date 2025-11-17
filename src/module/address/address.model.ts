import { create } from 'domain';
import { z } from 'zod';

export const ErrAddressLine1Required = new Error('Address line 1 is required');
export const ErrCityRequired = new Error('City/Province is required');
export const ErrUserNotFound = new Error('User not found');
export const ErrAddressNotFound = new Error('Address not found');
export const ErrFullNameAtLeast6Chars = new Error('Full name must be at least 6 characters long');

// Mô hình dữ liệu
export const addressSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    fullName: z.string().min(6, { message: ErrFullNameAtLeast6Chars.message }),
    phone: z.string().min(10).max(15).optional(),
    streetAdress: z.string().min(1, { message: ErrAddressLine1Required.message }),
    cityProvince: z.string().min(1, { message: ErrCityRequired.message }),
    isDefault: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface Address extends z.infer<typeof addressSchema> {}

export const createAddressDTOSchema = addressSchema.pick({
    userId: true,
    fullName: true,
    phone: true,
    streetAdress: true,
    cityProvince: true,
    isDefault: true,
}).required();

export interface CreateAddressDTO extends z.infer<typeof createAddressDTOSchema> {}

export const updateAddressDTOSchema = addressSchema.pick({
    fullName: true,
    phone: true,
    streetAdress: true,
    cityProvince: true,
    isDefault: true,
}).partial();

export interface UpdateAddressDTO extends z.infer<typeof updateAddressDTOSchema> {}

export const filterAddressDTOSchema = addressSchema.pick({
    userId: true,
    isDefault: true,
}).partial();

export interface FilterAddressDTO extends z.infer<typeof filterAddressDTOSchema> {}
