import { Injectable } from "@nestjs/common";
import { IPublicCouponRpc, PublicCoupon } from "..";
import axios from "axios";

@Injectable()
export class CouponRPCClient implements IPublicCouponRpc {
    constructor(private readonly couponServiceUrl: string) {}

    async findById(id: string): Promise<PublicCoupon | null> {
        try {
            const { data } = await axios.get(`${this.couponServiceUrl}/coupons/rpc/${id}`)
            const coupon = data.data;
            return {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                discountValue: coupon.discountValue,
                expiryDate: coupon.expiryDate,
                createdAt: coupon.createdAt,
                updatedAt: coupon.updatedAt,
            } as PublicCoupon;
        } catch (error) {
            return null;
        }
    }
    async findByIds(ids: string[]): Promise<Array<PublicCoupon>> {
        try {
            const { data } = await axios.post(`${this.couponServiceUrl}/rpc/list-by-ids`, { ids });

            const coupons = data.data.map((coupon: any) => {
            return {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                discountValue: coupon.discountValue,
                expiryDate: coupon.expiryDate,
                createdAt: coupon.createdAt,
                updatedAt: coupon.updatedAt,
            } as PublicCoupon;
        });
        return coupons;
    }   catch (error) {
            return [];
        }
    }
}