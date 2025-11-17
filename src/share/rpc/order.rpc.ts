import { Injectable } from "@nestjs/common";
import { IPublicOrderRpc, PublicOrder, PublicOrderCoupon, PublicOrderItem } from "..";
import axios from "axios";

@Injectable()
export class OrderRPCClient implements IPublicOrderRpc {
    constructor(private readonly orderServiceUrl: string) {}

    async getOrderStatus(id: string): Promise<PublicOrder | null> {
        try {
            const { data } = await axios.post(`${this.orderServiceUrl}/orders/rpc/${id}`)
            const order = data.data;
            console.log('Fetched order data:', order);
            return {
                id: order.id,
                totalAmount: parseFloat(order.totalAmount),
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
            const { data } = await axios.post(`${this.orderServiceUrl}orders/items/rpc/${id}`)
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

    async getOrderCoupon(id: string): Promise<PublicOrderCoupon | null> {
        try {
            const { data } = await axios.get(`${this.orderServiceUrl}/orders/coupons/rpc/${id}`)
            const coupon = data.data;
            return {
                id: coupon.id,
                discountApplied: coupon.discountApplied,
                orderId: coupon.orderId,
                couponId: coupon.couponId,
                createdAt: new Date(coupon.createdAt),
                updatedAt: coupon.updatedAt ? new Date(coupon.updatedAt) : undefined,
            }
        } catch (error) {
            return null;
        }
    }
}