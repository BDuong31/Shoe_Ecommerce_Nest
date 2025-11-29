import { Injectable } from "@nestjs/common";
import { IFavoriteRepository } from "./favorites.port";
import { Favorite, FilterFavoriteDTO } from "./favorites.model";
import { Paginated, PagingDTO } from "src/share/data-model";
import { Favorite as PrismaFavorite } from "@prisma/client";
import prisma from "src/share/components/prisma";
import { Requester } from "src/share/interface";

@Injectable()
export class FavoritePrismaRepository implements IFavoriteRepository {
    async get(id: string): Promise<Favorite | null> {
        const data = await prisma.favorite.findFirst({ where: { id } });
        return data;
    }

    async list(cond: FilterFavoriteDTO, paging: PagingDTO, requester: Requester): Promise<Paginated<Favorite>> {
        const { productId } = cond;
        const userId = requester.sub;
        let where: { userId?: string; productId?: string } = {
            userId: userId,
        };
        if (productId) {
            where = {
                ...where,
                productId: productId,
            };
        }

        const total = await prisma.favorite.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.favorite.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                id: 'desc',
            },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total,
        };
    }

    async listByIds(ids: string[]): Promise<Favorite[]> {
        const data = await prisma.favorite.findMany({ where: { productId: { in: ids } } });
        return data;
    }

    async isProductFavoritedByUser(productId: string, userId: string): Promise<boolean> {
        const count = await prisma.favorite.count({
            where: {
                productId,
                userId,
            },
        });
        return (count > 0 || count === null) ? true : false;
    }

    async insert(favorite: Favorite): Promise<void> {
        await prisma.favorite.create({ data: favorite });
    }

    async delete(id: string): Promise<void> {
        await prisma.favorite.delete({ where: { id } });
    }
    private _toModel(data: PrismaFavorite): Favorite {
        return data as Favorite;
    }
}
