import { z } from 'zod';

export const ErrCategoryNameRequired = new Error('Category name is required');
export const ErrCategoryExist = new Error('Category already exists');
export const ErrCategoryNotFound = new Error('Category not found');

export const categorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, { message: ErrCategoryNameRequired.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface Category extends z.infer<typeof categorySchema> {}

export const createCategoryDTOSchema = categorySchema.pick({
    name: true,
}).required();

export interface CreateCategoryDTO extends z.infer<typeof createCategoryDTOSchema> {}

export const updateCategoryDTOSchema = categorySchema.pick({
    name: true,
}).partial();

export interface UpdateCategoryDTO extends z.infer<typeof updateCategoryDTOSchema> {}

export const filterCategoryDTOSchema = categorySchema.pick({
    name: true,
}).partial();

export interface FilterCategoryDTO extends z.infer<typeof filterCategoryDTOSchema> {}