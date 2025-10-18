import { PublicProduct } from 'src/share';
import { z } from 'zod';

export const ErrVariationNameRequired = new Error('Variation name is required');
export const ErrVariationExist = new Error('Variation already exists');
export const ErrVariationNotFound = new Error('Variation not found');
export const ErrVariationSizeRequired = new Error('Variation size is required');
export const ErrVariationColorRequired = new Error('Variation color is required');
export const ErrVariationSKURequired = new Error('Variation SKU is required');
export const ErrVariationQuantityInvalid = new Error('Variation quantity is invalid');
export const ErrVariationProductIdRequired = new Error('Variation product ID is required')

export const variationSchema = z.object({
    id: z.string().uuid(),
    size: z.number().min(1, { message: ErrVariationNameRequired.message }),
    color: z.string().min(1, { message: ErrVariationNameRequired.message }),
    sku: z.string().min(1, { message: ErrVariationNameRequired.message }),
    quantity: z.number().min(0),
    productId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Variation = z.infer<typeof variationSchema> & { product?: PublicProduct };

export const createVariationDTOSchema = variationSchema.pick({
    size: true,
    color: true,
    sku: true,
    quantity: true,
    productId: true,
}).required();

export type CreateVariationDTO = z.infer<typeof createVariationDTOSchema>;

export const updateVariationDTOSchema = variationSchema.pick({
    size: true,
    color: true,
    sku: true,
    quantity: true,
}).partial();

export type UpdateVariationDTO = z.infer<typeof updateVariationDTOSchema>;

export const filterVariationDTOSchema = variationSchema.pick({
    size: true,
    color: true,
    sku: true,
    productId: true,
}).partial();

export type FilterVariationDTO = z.infer<typeof filterVariationDTOSchema>;