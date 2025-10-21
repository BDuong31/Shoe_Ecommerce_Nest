import { Inject, Injectable } from '@nestjs/common';
import { IPaymentRepository, IPaymentService } from './payment.port';
import { PAYMENT_REPOSITORY } from './payment.di-token';
import { AppError, IPublicOrderRpc, IPublicPaymentRpc } from 'src/share';
import { v7 } from 'uuid';
import { ORDER_RPC } from 'src/share/di-token';
import {ErrPaymentNotFound, CreatePaymentDTO, CreatePaymentSchema, Payment, UpdatePaymentSchema } from './payment.model';

@Injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
        @Inject(ORDER_RPC) private readonly orderRpc: IPublicOrderRpc,
    ) {}

    async create(dto: CreatePaymentDTO): Promise<string> {
        const data = CreatePaymentSchema.parse(dto);

        const order = await this.orderRpc.getOrderStatus(data.orderId);

        if (!order) {
            throw AppError.from(ErrPaymentNotFound, 409);
        }

        const newId = v7();

        const newPayment = {
            id: newId,
            method: data.method,
            amount: data.amount,
            orderId: data.orderId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Payment;

        await this.paymentRepo.insert(newPayment);

        return newId
    }
    async update(paymentId: string, dto: CreatePaymentDTO): Promise<boolean> {
        const data = UpdatePaymentSchema.parse(dto);

        const paymentExist = await this.paymentRepo.get(paymentId);

        if (!paymentExist) {
            throw AppError.from(ErrPaymentNotFound, 404);
        }

        const updatedPayment = {
            ...data,
            updatedAt: new Date(),
        }

        await this.paymentRepo.update(paymentId, updatedPayment);

        return true;
    }
    async delete(paymentId: string): Promise<boolean> {
        const paymentExist = await this.paymentRepo.get(paymentId);

        if (!paymentExist) {
            throw AppError.from(ErrPaymentNotFound, 404);
        }

        await this.paymentRepo.delete(paymentId);

        return true;
    }
}   