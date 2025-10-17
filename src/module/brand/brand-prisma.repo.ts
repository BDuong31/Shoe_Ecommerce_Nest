import { Injectable } from "@nestjs/common";
import { IPublicBrandRpc, Paginated, PagingDTO } from "src/share";
import { IBrandRepository } from "./brand.port";
import prisma from "src/share/components/prisma";
import { FilterBrandDTO } from "./brand.model";
import { Brand } from "./brand.model";
import { Brand as PrismaBrand } from "@prisma/client";

@Injectable()
export class BrandPrismaRepository implements IBrandRepository {
    async get(id: string): Promise<Brand | null> {
        const data = await prisma.brand.findFirst({ where: { id } });
        if (!data) return null;
        
        return data;
    }

    async list(cond: any, paging: PagingDTO): Promise<Paginated<Brand>> {
        const { name, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (name) {
            where = {
                ...where,
                name: name,
            } as FilterBrandDTO
        }

        const total = await prisma.brand.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.brand.findMany({
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

    async listByIds(ids: string[]): Promise<Brand[]> {
        const data = await prisma.brand.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModdel);
    }

    async insert(brand: Brand): Promise<void> {
        await prisma.brand.create({ data: brand });
    }

    async update(id: string, dto: Partial<Brand>): Promise<void> {
        await prisma.brand.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.brand.delete({ where: { id } });
    }

    private _toModdel(data: PrismaBrand): Brand {
        return data;
    }
}