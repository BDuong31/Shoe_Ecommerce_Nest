import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO } from "src/share";
import { IShippingRepository } from "./shipping.port";
import prisma from "src/share/components/prisma";
import { FilterShippingDTO, UpdateShippingDTO } from "./shipping.model";
import { Shipping } from "./shipping.model";
import { Shipping as PrismaShipping } from "@prisma/client";

@Injectable()
export class ShippingPrismaRepository implements IShippingRepository {
    async get(id: string): Promise<Shipping | null> {
        const data = await prisma.shipping.findFirst({ where: { id } });
        if (!data) return null;
        
        return data;
    }

    async list(cond: FilterShippingDTO, paging: PagingDTO): Promise<Paginated<Shipping>> {
        const { carrier, ...rest } = cond;

        let where: FilterShippingDTO = {
            ...rest,
        }

        if (carrier) {
            where = {
                ...where,
                carrier: carrier,
            }
        }

        const total = await prisma.shipping.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.shipping.findMany({
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

    async listByIds(ids: string[]): Promise<Shipping[]> {
        const data = await prisma.shipping.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(shipping: Shipping): Promise<void> {
        await prisma.shipping.create({ data: shipping });
    }

    async update(id: string, dto: Partial<Shipping>): Promise<void> {
        await prisma.shipping.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.shipping.delete({ where: { id } });
    }

    private _toModel(data: PrismaShipping): Shipping {
        return data;
    }
}
