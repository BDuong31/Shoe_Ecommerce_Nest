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

export interface Brand extends z.infer<typeof brandSchema> {}

export const createBrandDTOSchema = brandSchema.pick({
    name: true,
}).required();

export interface CreateBrandDTO extends z.infer<typeof createBrandDTOSchema> {}

export const updateBrandDTOSchema = brandSchema.pick({
    name: true,
}).partial();

export interface UpdateBrandDTO extends z.infer<typeof updateBrandDTOSchema> {}

export const filterBrandDTOSchema = brandSchema.pick({
    name: true,
}).partial();

export interface FilterBrandDTO extends z.infer<typeof filterBrandDTOSchema> {}