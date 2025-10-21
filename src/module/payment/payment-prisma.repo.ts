import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO } from "src/share";
import { IPaymentRepository } from "./payment.port";
import prisma from "src/share/components/prisma";
import { FilterPaymentDTO } from "./payment.model";
import { Payment } from "./payment.model";
import { Payment as PrismaPayment, TransactionStatus } from "@prisma/client";

@Injectable()
export class PaymentPrismaRepository implements IPaymentRepository {
    async get(id: string): Promise<Payment | null> {
        const data = await prisma.payment.findFirst({ where: { id } });
        if (!data) return null;
        
        return data as Payment;
    }

    async list(cond: FilterPaymentDTO, paging: PagingDTO): Promise<Paginated<Payment>> {
        const { minAmount, maxAmount, method, ...rest } = cond;

        let where = {
            ...rest,
        }
        if (minAmount !== undefined) {
            where = {
                ...where,
                amount: {
                    gte: minAmount,
                },
            } as FilterPaymentDTO
        }
        if (maxAmount !== undefined) {
            where = {
                ...where,
                amount: {
                    lte: maxAmount,
                },
            } as FilterPaymentDTO
        }
        if (method) {
            where = {
                ...where,
                method: method,
            } as FilterPaymentDTO
        }

        const total = await prisma.payment.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.payment.findMany({
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

    async listByIds(ids: string[]): Promise<Payment[]> {
        const data = await prisma.payment.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModel);
    }

    async insert(payment: Payment): Promise<void> {
        await prisma.payment.create({ data: payment });
    }

    async update(id: string, dto: Partial<Payment>): Promise<void> {
        await prisma.payment.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.payment.delete({ where: { id } });
    }
    
    private _toModel(data: PrismaPayment): Payment {
        return data as Payment;
    }
}