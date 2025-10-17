import { Injectable } from "@nestjs/common";
import { IAddressRepository } from "./address.port";
import { Address, FilterAddressDTO } from "./address.model";
import prisma from "src/share/components/prisma";
import { PagingDTO, Paginated, Requester } from "src/share";
import { Address as PrismaAddress } from "@prisma/client";

@Injectable()
export class AddressPrismaRepository implements IAddressRepository {

    async get(id: string): Promise<Address | null> {
        const data = await prisma.address.findFirst({ where: { id } });
        if (!data) return null;

        return data;
    }

    async list(cond: FilterAddressDTO, paging: PagingDTO): Promise<Paginated<Address>> {
        const { userId, isDefault, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            } as FilterAddressDTO
        }

        if (isDefault) {
            where = {
                ...where,
                isDefault: isDefault,
            } as FilterAddressDTO
        }

        const total = await prisma.address.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.address.findMany({
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
    async listByIds(ids: string[]): Promise<Address[]> {
        const data = await prisma.address.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(address: Address): Promise<void> {
        await prisma.address.create({ data: address });
    }
    async update(id: string, dto: any): Promise<void> {
        await prisma.address.update({ where: { id }, data: dto });
    }
    async delete(id: string): Promise<void> {
        await prisma.address.delete({ where: { id } });
    }

    private _toModel(data: PrismaAddress): Address {
        return {
            ...data,
            isDefault: data.isDefault ?? false,
        }
    }
}