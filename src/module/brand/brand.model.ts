import { z } from 'zod';

export const ErrBrandNameRequired = new Error('Brand name is required');
export const ErrBrandExist = new Error('Brand already exists');
export const ErrBrandNotFound = new Error('Brand not found');

// Mô hình dữ liệu
export const brandSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, { message: ErrBrandNameRequired.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Brand = z.infer<typeof brandSchema>;

export const createBrandDTOSchema = brandSchema.pick({
    name: true,
}).required();

export type CreateBrandDTO = z.infer<typeof createBrandDTOSchema>;

export const updateBrandDTOSchema = brandSchema.pick({
    name: true,
}).partial();

export type UpdateBrandDTO = z.infer<typeof updateBrandDTOSchema>;

export const filterBrandDTOSchema = brandSchema.pick({
    name: true,
}).partial();

export type FilterBrandDTO = z.infer<typeof filterBrandDTOSchema>;