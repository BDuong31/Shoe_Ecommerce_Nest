import { Injectable } from "@nestjs/common";
import { IPublicRatingRpc, PublicRating } from "..";
import axios from "axios";

@Injectable()
export class RatingRPCClient implements IPublicRatingRpc {
    constructor(private readonly productServiceUrl: string) {}

    async getProductAvgRating(id: string): Promise<PublicRating | null> {
        try {
            const { data } = await axios.get(`${this.productServiceUrl}/rpc/ratings/product-avg-rating/${id}`)
            const rating = data.data;
            return {
                productId: rating.productId,
                avgRating: rating.avgRating,
                totalRating: rating.totalRating,
            } as PublicRating;
        } catch (error) {
            return null;
        }
    }
}