import { Injectable } from "@nestjs/common";
import { IImageRepository } from "./image.port";
import prisma from "src/share/components/prisma";
import { Image } from "./image.model";
import { Paginated, PagingDTO } from "src/share";
import { FilterImageDTO } from "./image.model";

@Injectable()
export class ImagePrismaRepository implements IImageRepository {
    async get(id: string): Promise<Image | null> {
        const data = await prisma.image.findFirst({ where: { id } });
        if (!data) return null;
        
        return this._toModel(data);
    }

    async list(cond: FilterImageDTO, paging: PagingDTO): Promise<Paginated<Image>> {
        const { isMain, productId, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (isMain) {
            where = {
                ...where,
                isMain: isMain,
            } as FilterImageDTO
        }
        if (productId) {
            where = {
                ...where,
                productId: productId,
            } as FilterImageDTO
        }

        const total = await prisma.image.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.image.findMany({
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
            total
        };
    }

    async listByIds(ids: string[]): Promise<Image[]> {
        const data = await prisma.image.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(image: Image): Promise<void> {
        await prisma.image.create({ data: image });
    }

    async update(id: string, dto: Partial<Image>): Promise<void> {
        await prisma.image.update({ where: { id }, data: dto });
    }

    async delete(id: string): Promise<void> {
        await prisma.image.delete({ where: { id } });
    }

    private _toModel(data: any): Image {
        return data as Image;
    }
}

