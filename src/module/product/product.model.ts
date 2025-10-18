import { PublicBrand, publicBrandSchema, PublicCategory, publicCategorySchema } from 'src/share';
import { z } from 'zod';

export const ErrProductNameRequired = new Error('Product name is required');
export const ErrProductPriceInvalid = new Error('Product price is invalid');
export const ErrProductDescriptionRequired = new Error('Product description is required');
export const ErrProductBrandIdRequired = new Error('Product brand ID is required');
export const ErrProductBrandNotFound = new Error('Product brand not found');
export const ErrProductCategoryIdRequired = new Error('Product category ID is required');
export const ErrProductCategoryNotFound = new Error('Product category not found');
export const ErrProductExist = new Error('Product already exists');
export const ErrProductNotFound = new Error('Product not found');

// Mô hình dữ liệu
export const productSchema = z.object({
    id: z.string().uuid(),
    productName: z.string().min(1, { message: ErrProductNameRequired.message }),
    price: z.number().min(0, { message: ErrProductPriceInvalid.message }),
    description: z.string().min(1, { message: ErrProductDescriptionRequired.message }),
    brandId: z.string().uuid().min(1, { message: ErrProductBrandIdRequired.message }),
    categoryId: z.string().uuid().min(1, { message: ErrProductCategoryIdRequired.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Product =  z.infer<typeof productSchema> & { brand?: PublicBrand, category?: PublicCategory }

export const createProductDTOSchema = productSchema.pick({
    productName: true,
    price: true,
    description: true,
    brandId: true,
    categoryId: true,
}).required();

export type CreateProductDTO = z.infer<typeof createProductDTOSchema>;

export const updateProductDTOSchema = productSchema.pick({
    productName: true,
    price: true,
    description: true,
    brandId: true,
    categoryId: true,
}).partial();

export type UpdateProductDTO = z.infer<typeof updateProductDTOSchema>;

export const filterProductDTOSchema = productSchema.pick({
    productName: true,
    price: true,
    description: true,
    brandId: true,
    categoryId: true,
}).partial();

export type FilterProductDTO = z.infer<typeof filterProductDTOSchema>;