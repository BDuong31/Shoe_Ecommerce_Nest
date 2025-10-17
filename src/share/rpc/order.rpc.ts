import { Injectable } from "@nestjs/common";
import { IPublicOrderRpc, PublicOrder, PublicOrderItem } from "..";
import axios from "axios";

@Injectable()
export class OrderRPCClient implements IPublicOrderRpc {
    constructor(private readonly orderServiceUrl: string) {}

    async getOrderStatus(id: string): Promise<PublicOrder | null> {
        try {
            const { data } = await axios.get(`${this.orderServiceUrl}/rpc/orders/${id}`)
            const order = data.data;
            return {
                id: order.id,
                totalAmout: order.totalAmout,
                status: order.status,
                userId: order.userId,
                shippingAddressId: order.shippingAddressId,
                createdAt: new Date(order.createdAt),
                updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
            } as PublicOrder;
        } catch (error) {
            return null;
        }
    }

    async getOrderItems(id: string): Promise<Array<PublicOrderItem> | null> {
        try {
            const { data } = await axios.get(`${this.orderServiceUrl}/rpc/orders/${id}/items`)
            const items = data.data.map((item: any) => {
                return {
                    id: item.id,
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtPurchase,
                    orderId: item.orderId,
                    variantId: item.variantId,
                    createdAt: new Date(item.createdAt),
                    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
                } as PublicOrderItem;
            });
            return items;
        } catch (error) {
            return null;
        }
    }
}