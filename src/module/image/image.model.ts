import { z } from 'zod';

export const ErrImageUrlRequired = new Error('Image URL is required');
export const ErrImageProductIdRequired = new Error('Image product ID is required');
export const ErrImagePublicIdRequired = new Error('Image public ID is required');
export const ErrImageNotFound = new Error('Image not found');
export const ErrImageInsertFailed = new Error('Failed to insert image');
export const ErrImageUpdateFailed = new Error('Failed to update image');
export const ErrImageDeleteFailed = new Error('Failed to delete image');
export const ErrImageExist = new Error('Image already exists');

// Mô hình dữ liệu
export const imageSchema = z.object({
    id: z.string().uuid(),
    url: z.string().min(1, { message: ErrImageUrlRequired.message }),
    isMain: z.preprocess(
    (val) => typeof val === 'string' ? val === 'true' : val,
      z.boolean()
    ).optional().default(false),
    publicId: z.string().min(1, { message: ErrImagePublicIdRequired.message }),
    productId: z.string().uuid().min(1, { message: ErrImageProductIdRequired.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Image = z.infer<typeof imageSchema>;

export const createImageDTOSchema = imageSchema.pick({
    isMain: true,
    productId: true,
}).required();

export type CreateImageDTO = z.infer<typeof createImageDTOSchema>;

export const updateImageDTOSchema = imageSchema.pick({
    url: true,
    isMain: true,
    productId: true,
}).partial();

export type UpdateImageDTO = z.infer<typeof updateImageDTOSchema>;

export const filterImageDTOSchema = imageSchema.pick({
    url: true,
    isMain: true,
    productId: true,
}).partial();

export type FilterImageDTO = z.infer<typeof filterImageDTOSchema>;