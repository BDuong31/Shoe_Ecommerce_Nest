import { Injectable } from "@nestjs/common";
import { IPublicCategoryRpc, Paginated, PagingDTO } from "src/share";
import { ICategoryRepository } from "./category.port";
import prisma from "src/share/components/prisma";
import { FilterCategoryDTO } from "./category.model";
import { Category as PrismaCategory } from "@prisma/client";
import { Category } from "./category.model";

@Injectable()
export class CategoryPrismaRepository implements ICategoryRepository {
    async get(id: string): Promise<Category | null> {
        const data = await prisma.category.findFirst({ where: { id } });
        if (!data) return null;
        
        return data;
    }

    async list(cond: any, paging: PagingDTO): Promise<Paginated<Category>> {
        const { name, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (name) {
            where = {
                ...where,
                name: name,
            } as FilterCategoryDTO
        }

        const total = await prisma.category.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.category.findMany({
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

    async listByIds(ids: string[]): Promise<Category[]> {
        const data = await prisma.category.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModdel);
    }

    async insert(category: Category): Promise<void> {
        await prisma.category.create({ data: category });
    }

    async update(id: string, dto: Partial<Category>): Promise<void> {
        await prisma.category.update({ where: { id }, data: dto });
    }

    async delete(id: string): Promise<void> {
        await prisma.category.delete({ where: { id } });
    }

    private _toModdel(data: PrismaCategory): Category {
        return data;
    }
}