import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO } from "src/share";
import { IRatingRepository } from "./rating.port";
import prisma from "src/share/components/prisma";
import { FilterReviewDTO, ProductAvgRating } from "./rating.model";
import { Review } from "./rating.model";
import { Review as PrismaReview } from "@prisma/client";

@Injectable()
export class RatingPrismaRepository implements IRatingRepository {
    async get(id: string): Promise<Review | null> {
        const data = await prisma.review.findFirst({ where: { id } });
        if (!data) return null;
        
        return data;
    }

    async list(cond:FilterReviewDTO, paging: PagingDTO): Promise<Paginated<Review>> {
        const { rating, userId, productId, ...rest } = cond;

        let where: any = {
            ...rest,
        }
        if (rating) {
            where = {
                ...where,
                rating: rating,
            } as FilterReviewDTO
        }
        if (userId) {
            where = {
                ...where,
                userId: userId,
            } as FilterReviewDTO
        }
        if (productId) {
            where = {
                ...where,
                productId: productId,
            } as FilterReviewDTO
        }



        const total = await prisma.review.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.review.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                id: 'desc',
            },
        });

        return {
            data: result.map(this._toModdel),
            paging,
            total
        };
    }
    
    async listByIds(ids: string[]): Promise<Review[]> {
        const data = await prisma.review.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModdel);
    } 

    async checkReviewExist(userId: string, productId: string): Promise<boolean> {
        const data = await prisma.review.findFirst({ where: { userId, productId } });
        if (data) {
            if (data.comment === null && data.rating === 0) {
                return true;
            } else {
                return false;
            }
        } else { 
            return false;
        }
    }

    async getAverageRatingByProduct(productId: string): Promise<ProductAvgRating> {
        const result = await prisma.review.findMany({
            where: { productId, NOT: { rating: 0, comment: null } },
            select: {
                rating: true,
            },
        });


        if (result.length === 0) {
            return null;
        }

        const totalRating = result.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / result.length;

        const data = {
            productId,
            avgRating: parseFloat(avgRating.toFixed(2)),
            totalRating: result.length,
        } as ProductAvgRating;

        return data;
    }
    async insert(review: Review): Promise<void> {
        await prisma.review.create({ data: review });
    }

    async update(id: string, dto: Partial<Review>): Promise<void> {
        await prisma.review.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.review.delete({ where: { id } });
    }

    private _toModdel(data: PrismaReview & { User: any }): Review {
        return data;
    }
}