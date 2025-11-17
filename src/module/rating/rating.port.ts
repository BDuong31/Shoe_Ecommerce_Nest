import { ProductAvgRating, Review } from './rating.model';
import { Paginated, PagingDTO } from 'src/share';
import { CreateReviewDTO, UpdateReviewDTO, FilterReviewDTO } from './rating.model';

export interface IRatingService {
    create(dto: CreateReviewDTO): Promise<string>;
    update(reviewId: string, dto: UpdateReviewDTO): Promise<boolean>;
    delete(reviewId: string): Promise<boolean>;
}   

export interface IRatingRepository {
    get(id: string): Promise<Review | null>;
    list(cond: FilterReviewDTO, paging: PagingDTO): Promise<Paginated<Review>>;
    listByIds(ids: string[]): Promise<Review[]>;
    getAverageRatingByProduct(productId: string): Promise<ProductAvgRating>;

    insert(review: Review): Promise<void>;
    update(id: string, dto: UpdateReviewDTO): Promise<void>;
    delete(id: string): Promise<void>;
}