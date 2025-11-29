import { Injectable } from "@nestjs/common";
import { IPublicFavoriteRpc } from "..";
import axios from "axios";

@Injectable()
export class FavoriteRPCClient implements IPublicFavoriteRpc {
    constructor(private readonly favoriteServiceUrl: string) {}
    
    async isProductFavoritedByUser(productId: string, userId: string): Promise<boolean> {
        try {
            const { data } = await axios.post(`${this.favoriteServiceUrl}/favorites/rpc/is-favorited`, { productId, userId });
            return data.data;
        } catch (error) {
            return false;
        }
    }
}