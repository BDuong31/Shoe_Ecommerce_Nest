import { Injectable } from "@nestjs/common";
import { IPublicProductRpc, Paginated, PagingDTO } from "src/share";
import { IProductRepository } from "./product.port";
import prisma from "src/share/components/prisma";
import { FilterProductDTO } from "./product.model";
import { Product as PrismaProduct } from "@prisma/client";
import { Product } from "./product.model";

@Injectable()
export class ProductPrismaRepository implements IProductRepository {
    async get(id: string): Promise<Product | null> {
        const data = await prisma.product.findFirst({ where: { id } });
        if (!data) return null;
        
        return this._toModel(data);
    }

    async list(cond: FilterProductDTO, paging: PagingDTO): Promise<Paginated<Product>> {
        const { productName, price, description, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (productName) {
            where = {
                ...where,
                productName: productName,
            } as FilterProductDTO
        }

        if (price) {
            where = {
                ...where,
                price: price,
            } as FilterProductDTO
        }

        if (description) {
            where = {
                ...where,
                description: description,
            } as FilterProductDTO
        }

        const total = await prisma.product.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.product.findMany({
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

    async listByIds(ids: string[]): Promise<Product[]> {
        const data = await prisma.product.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(product: Product): Promise<void> {
        await prisma.product.create({ data: product });
    }

    async update(id: string, dto: Partial<Product>): Promise<void> {
        await prisma.product.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.product.delete({
            where: { id },
        });
    }

    private _toModel(data: PrismaProduct): Product {
        return data;
    }
}