import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO } from "src/share";
import { ICouponRepository } from "./coupon.port";
import prisma from "src/share/components/prisma";
import { FilterCouponDTO } from "./coupon.model";
import { Coupon } from "./coupon.model";
import { Coupon as PrismaCoupon } from "@prisma/client";

@Injectable()
export class CouponPrismaRepository implements ICouponRepository {
    async get(id: string): Promise<Coupon | null> {
        const data = await prisma.coupon.findUnique({ where: { id } });
        if (!data) return null;

        return data as Coupon;
    }

    async list(cond: FilterCouponDTO, paging: PagingDTO): Promise<Paginated<Coupon>> {
        const { code, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (code) {
            where = {
                ...where,
                code: code,
            } as FilterCouponDTO
        }

        const total = await prisma.coupon.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.coupon.findMany({
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

    async listByIds(ids: string[]): Promise<Coupon[]> {
        const data = await prisma.coupon.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(coupon: Coupon): Promise<void> {
        await prisma.coupon.create({ data: coupon });
    }

    async update(id: string, dto: Partial<Coupon>): Promise<void> {
        await prisma.coupon.update({ where: { id }, data: dto });
    }

    async delete(id: string): Promise<void> {
        await prisma.coupon.delete({ where: { id } });
    }

    private _toModel(data: PrismaCoupon): Coupon {
        return data as Coupon;
    }
}