import { Injectable} from '@nestjs/common';
import { IPublicPaymentRpc, IPublicShippingRpc, PublicShipping } from '..';
import axios from 'axios';

@Injectable()
export class ShippingRPCClient implements IPublicShippingRpc {
    constructor(private readonly shippingServiceUrl: string) {}

    async getShippingStatus(id: string): Promise<PublicShipping | null> {
        try {
            const { data } = await axios.get(`${this.shippingServiceUrl}/rpc/shippings/${id}`);
            const shipping = data.data;
            return {
                id: shipping.id,
                orderId: shipping.orderId,
                trackingNumber: shipping.trackingNumber,
                status: shipping.status,
                carrier: shipping.carrier,
                shippingCost: shipping.shippingCost,
                createdAt: new Date(shipping.createdAt),
                updatedAt: shipping.updatedAt ? new Date(shipping.updatedAt) : undefined,
            } as PublicShipping;
        } catch (error) {
            return null;
        }
    }
}