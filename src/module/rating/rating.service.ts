import { Inject, Injectable } from '@nestjs/common';
import { IRatingRepository, IRatingService } from './rating.port';
import { RATING_REPOSITORY } from './rating.di-token';
import { CreateReviewDTO, CreateReviewDTOSchema, ErrReviewExist, ErrReviewNotFound, UpdateReviewDTOSchema } from './rating.model';
import { AppError, IPublicProductRpc, IPublicUserRpc } from 'src/share';
import { v7 } from 'uuid';
import { ErrUserNotFound } from '../address/address.model';
import { ErrProductNotFound } from '../product/product.model';
import { PRODUCT_RPC, USER_RPC } from 'src/share/di-token';

@Injectable()
export class RatingService implements IRatingService {
    constructor(
        @Inject(RATING_REPOSITORY) private readonly ratingRepo: IRatingRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
    ) {}

    async create(dto: CreateReviewDTO): Promise<string> {

        const data = CreateReviewDTOSchema.parse(dto);

        const reviewExist = await this.ratingRepo.list(data, { page: 1, limit: 1 });

        if (!reviewExist) {
            throw AppError.from(ErrReviewExist, 409);
        }

        const user = await this.userRpc.findById(data.userId);

        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        const product = await this.productRpc.findById(data.productId);

        if (!product) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const newId = v7();

        const newReview = {
            id: newId,
            userId: data.userId,
            productId: data.productId,
            rating: data.rating,
            comment: data.comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.ratingRepo.insert(newReview);

        return newId;
    }

    async update(reviewId: string, dto: Partial<CreateReviewDTO>): Promise<boolean> {

        const data = UpdateReviewDTOSchema.parse(dto);

        const reviewExist = await this.ratingRepo.get(reviewId);

        if (!reviewExist) {
            throw AppError.from(ErrReviewNotFound, 404);
        }

        const updatedReview = {
            ...data,
            updatedAt: new Date(),
        }

        await this.ratingRepo.update(reviewId, updatedReview);

        return true;
    }

    async delete(reviewId: string): Promise<boolean> {

        const reviewExist = await this.ratingRepo.get(reviewId);

        if (!reviewExist) {
            throw AppError.from(ErrReviewNotFound, 404);
        }

        await this.ratingRepo.delete(reviewId);

        return true;
    }
}