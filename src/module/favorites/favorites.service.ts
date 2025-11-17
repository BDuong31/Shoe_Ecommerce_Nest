import { Inject, Injectable } from "@nestjs/common";
import { IFavoriteRepository, IFavoriteService } from "./favorites.port";
import { FAVORITES_REPOSITORY } from "./favorites.di-token";
import { CreateFavoriteDTO, ErrFavoriteExist, ErrFavoriteNotFound } from "./favorites.model";
import { AppError, IPublicProductRpc, IPublicUserRpc, Requester } from "src/share";
import { PRODUCT_RPC, USER_RPC } from "src/share/di-token";
import { ErrUserNotFound } from "../address/address.model";
import { ErrProductNotFound } from "../product/product.model";
import { v7 } from "uuid";

@Injectable()
export class FavoritesService implements IFavoriteService {
    constructor(
        @Inject(FAVORITES_REPOSITORY) private readonly favoritesRepo: IFavoriteRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
    ){}

    async create(dto: CreateFavoriteDTO, requester: Requester): Promise<string>{
        const user = await this.userRpc.findById(dto.userId);

        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        const product = await this.productRpc.findById(dto.productId)

        if (!product) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const newId = v7();

        const newFavorite = {
            id: newId,
            userId: dto.userId,
            productId: dto.productId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.favoritesRepo.insert(newFavorite);
        return newId;
    }

    async delete(favoriteId: string): Promise<boolean> {
        const favorite = await this.favoritesRepo.get(favoriteId);

        if(!favorite){
            throw AppError.from(ErrFavoriteNotFound, 404)
        }

        await this.favoritesRepo.delete(favoriteId);
        return true;
    }
}