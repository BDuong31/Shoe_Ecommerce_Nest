import e from 'express';
import { PublicUser } from 'src/share';
import { z } from 'zod';
import { Image } from '../image/image.model';

export const ErrReviewExist = new Error('Review already exists'); 
export const ErrReviewNotFound = new Error('Review not found');
export const ReviewSchema = z.object({
    id: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Review = z.infer<typeof ReviewSchema> & { User?: PublicUser, Image?: Image[] };

export const CreateReviewDTOSchema = ReviewSchema.pick({
    rating: true,
    comment: true,
    productId: true,
    userId: true,
}).required();

export type CreateReviewDTO = z.infer<typeof CreateReviewDTOSchema>;

export const UpdateReviewDTOSchema = ReviewSchema.partial().pick({
    rating: true,
    comment: true,
});

export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTOSchema>;

export const FilterReviewDTOSchema = ReviewSchema.partial().pick({
    rating: true,
    userId: true,
    productId: true,
});

export type FilterReviewDTO = z.infer<typeof FilterReviewDTOSchema>;

export const ProdcutAvgRatingSchema = z.object({
    productId: z.string().uuid(),
    avgRating: z.number(),
    totalRating: z.number(),
})

export type ProductAvgRating = z.infer<typeof ProdcutAvgRatingSchema>;    