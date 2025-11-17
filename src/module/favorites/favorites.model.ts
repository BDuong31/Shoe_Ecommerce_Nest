import { z } from 'zod';

// Errors
export const ErrFavoriteExist = new Error('Favorite already exists');
export const ErrFavoriteNotFound = new Error('Favorite not found');
export const ErrFavoriteInvalidUserId = new Error('Favorite user ID is invalid');
export const ErrFavoriteInvalidProductId = new Error('Favorite product ID is invalid');

// Mô hình dữ liệu
export const favoriteSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Favorite = z.infer<typeof favoriteSchema>;

export const createFavoriteDTOSchema = favoriteSchema.pick({
    userId: true,
    productId: true,
}).required();

export type CreateFavoriteDTO = z.infer<typeof createFavoriteDTOSchema>;

export const filterFavoriteDTOSchema = favoriteSchema.pick({
    userId: true,
    productId: true,
}).partial();

export type FilterFavoriteDTO = z.infer<typeof filterFavoriteDTOSchema>;