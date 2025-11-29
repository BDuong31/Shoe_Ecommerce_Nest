import { Inject, Injectable } from '@nestjs/common';
import { IPaymentRepository, IPaymentService } from './payment.port';
import { PAYMENT_REPOSITORY } from './payment.di-token';
import { AppError, IPublicOrderRpc, IPublicPaymentRpc, Requester } from 'src/share';
import { v7 } from 'uuid';
import { ORDER_RPC } from 'src/share/di-token';
import {ErrPaymentNotFound,ErrPaymentMethodNotSupported, CreatePaymentDTO, CreatePaymentSchema, Payment, UpdatePaymentSchema, TransactionStatus, InitiatePaymentDTO, ErrPaymentOrderMismatch, UpdatePaymentDTO } from './payment.model';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZalopayService } from './zalo.service';
import { date } from 'zod';

@Injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
        @Inject(ORDER_RPC) private readonly orderRpc: IPublicOrderRpc,
        private readonly vnpayService: VnpayService,
        private readonly momoService: MomoService,
        private readonly zalopayService: ZalopayService,
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

    async initiatePayment(dto: InitiatePaymentDTO, user: Requester): Promise<{ paymentUrl?: string; paymentId?: string; success: boolean }> {
        const userId = user.sub;
        const payment = await this.paymentRepo.get(dto.paymentId);
        if (!payment) {
            throw AppError.from(ErrPaymentNotFound, 404);
        }

        const order = await this.orderRpc.getOrderStatus(payment.orderId);
        if (!order || order.userId !== userId) {
            throw AppError.from(ErrPaymentOrderMismatch, 403);
        }

        const orderCoupon = await this.orderRpc.getOrderCoupon(order.id);
        const discount = orderCoupon ? orderCoupon.discountApplied : 0;
        const amountDelivery = order.shippingAddressId === 'collect_in_store' ? 0 : 60000; 
        const amountToPay = order.totalAmount + amountDelivery - discount;
        if (dto.method === 'cod') {
            const paymentId = await this.updatePaymentRecord('cod', amountToPay, dto.paymentId, TransactionStatus.SUCCESS);
            // await this.orderRpc.updateOrderStatus(dto.orderId, 'Processing');
            return { success: true, paymentId: paymentId };
        }

        const fullMethodString = dto.methodChild ? `${dto.method}-${dto.methodChild}` : dto.method;
        let paymentId = await this.updatePaymentRecord(fullMethodString, amountToPay, dto.paymentId, TransactionStatus.PENDING);
        const orderInfo = `Payment for order ${payment.orderId}`;
        paymentId = paymentId + '-rand-' + v7()  // thay đổi mỗi khi tạo đơn hàng thanh toán mới
        let paymentUrl = '';

        switch (dto.method.toUpperCase()) {
            case 'VNPAY':
                paymentUrl = await this.vnpayService.createPaymentUrl(amountToPay, paymentId, userId, dto.methodChild || '');
                break;
            case 'MOMO':
                paymentUrl = await this.momoService.createPaymentUrl(amountToPay, paymentId, orderInfo, userId, dto.methodChild || '');
                break;
            case 'ZALOPAY':
                paymentUrl = await this.zalopayService.createPaymentUrl(amountToPay, paymentId, orderInfo, userId, dto.methodChild || '');
                break;
            default:
                throw AppError.from(ErrPaymentMethodNotSupported, 400);
        }

        return { success: true, paymentUrl: paymentUrl };
    }

    async handleWebhook(gateway: string, payload: any, signatureOrQuery: any): Promise<boolean> {
        let isValid: boolean = false;
        let paymentId: string = ''; 
        let amount: number = 0;

        switch (gateway.toUpperCase()) {
            case 'VNPAY':
                isValid = await this.vnpayService.verifyReturn(signatureOrQuery);
                paymentId = signatureOrQuery.vnp_TxnRef;
                amount = parseInt(signatureOrQuery.vnp_Amount) / 100;
                break;
            case 'MOMO':
                isValid = this.momoService.verifyWebhook(payload);
                paymentId = payload.orderId; 
                amount = payload.amount;
                break;
            case 'ZALOPAY':
                isValid = this.zalopayService.verifyWebhook(payload);
                const data = JSON.parse(payload.data);
                paymentId = data.app_trans_id.split('_').pop(); 
                amount = data.amount;
                break;
        }

        if (!isValid) {
            console.error(`Webhook ${gateway} signature invalid.`);
            return false;
        }

        const payment = await this.paymentRepo.get(paymentId);
        if (!payment) {
            console.error(`Payment not found: ${paymentId}`);
            return false;
        }

        if (payment.status !== TransactionStatus.PENDING) {
            return true;
        }
        if (payment.amount !== amount) {
             throw new Error(`Amount mismatch: ${payment.amount} (DB) vs ${amount} (Webhook)`);
        }

        await this.paymentRepo.update(paymentId, {
            status: TransactionStatus.SUCCESS,
        });

        return true;
    }

    private async updatePaymentRecord(method: string, amount: number, paymentId: string, status: TransactionStatus): Promise<string> {
        const data: UpdatePaymentDTO = {
            method,
            status,
            amount,
        };

        await this.paymentRepo.update(paymentId, data);
        return paymentId;
    }
}   