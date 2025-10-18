import { Injectable } from "@nestjs/common";
import { IPublicProductRpc, Paginated, PagingDTO } from "src/share";
import { IVariationRepository } from "./variation.port";
import prisma from "src/share/components/prisma";
import { FilterVariationDTO } from "./variation.model";
import { Variation } from "./variation.model";
import { ProductVariant as PrismaVariation } from "@prisma/client";

@Injectable()
export class VariationPrismaRepository implements IVariationRepository {
    async get(id: string): Promise<Variation | null> {
        const data = await prisma.productVariant.findFirst({ where: { id } });
        if (!data) return null;
        
        return data;
    }

    async list(cond: FilterVariationDTO, paging: PagingDTO): Promise<Paginated<Variation>> {
        const { size, color, sku, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (size) {
            where = {
                ...where,
                size: size,
            } as FilterVariationDTO
        }
        if (color) {
            where = {
                ...where,
                color: color,
            } as FilterVariationDTO
        }
        if (sku) {
            where = {
                ...where,
                sku: sku,
            } as FilterVariationDTO
        }
        if (size) {
            where = {
                ...where,
                size: size,
            } as FilterVariationDTO
        }

        const total = await prisma.productVariant.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.productVariant.findMany({
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

    async listByIds(ids: string[]): Promise<Variation[]> {
        const data = await prisma.productVariant.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModdel);
    }

    async insert(variation: Variation): Promise<void> {
        await prisma.productVariant.create({ data: variation });
    }

    async update(id: string, dto: Partial<Variation>): Promise<void> {
        await prisma.productVariant.update({ where: { id }, data: dto });
    }

    async delete(id: string): Promise<void> {
        await prisma.productVariant.delete({ where: { id } });
    }

    private _toModdel(data: PrismaVariation): Variation {
        return data
    }
}