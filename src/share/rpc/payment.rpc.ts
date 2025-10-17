import { Injectable } from "@nestjs/common";
import { IPublicPaymentRpc, PublicPayment } from "..";
import axios from "axios";

@Injectable()
export class PaymentRPCClient implements IPublicPaymentRpc {
    constructor(private readonly paymentServiceUrl: string) {}

    async getPaymentStatus(id: string): Promise<PublicPayment | null> {
        try {
            const { data } = await axios.get(`${this.paymentServiceUrl}/rpc/payments/${id}`)
            const payment = data.data;
            return {
                id: payment.id,
                method: payment.method,
                amount: payment.amount,
                status: payment.status,
                orderId: payment.orderId,
                createdAt: new Date(payment.createdAt),
                updatedAt: payment.updatedAt ? new Date(payment.updatedAt) : undefined,
            } as PublicPayment;
        } catch (error) {
            return null;
        }
    }
}