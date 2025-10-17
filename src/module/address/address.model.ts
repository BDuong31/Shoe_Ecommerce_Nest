import { create } from 'domain';
import { z } from 'zod';

export const ErrAddressLine1Required = new Error('Address line 1 is required');
export const ErrCityRequired = new Error('City/Province is required');
export const ErrUserNotFound = new Error('User not found');
export const ErrAddressNotFound = new Error('Address not found');

// Mô hình dữ liệu
export const addressSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    streetAdress: z.string().min(1, { message: ErrAddressLine1Required.message }),
    cityProvince: z.string().min(1, { message: ErrCityRequired.message }),
    isDefault: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface Address extends z.infer<typeof addressSchema> {}

export const createAddressDTOSchema = addressSchema.pick({
    userId: true,
    streetAdress: true,
    cityProvince: true,
    isDefault: true,
}).required();

export interface CreateAddressDTO extends z.infer<typeof createAddressDTOSchema> {}

export const updateAddressDTOSchema = addressSchema.pick({
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
