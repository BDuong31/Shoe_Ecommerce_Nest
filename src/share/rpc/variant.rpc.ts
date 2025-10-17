import { Injectable } from "@nestjs/common";
import { IPublicVariantRpc, PublicVariant } from "..";
import axios from "axios";

@Injectable()
export class VariantRPCClient implements IPublicVariantRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicVariant | null> {
        try {
            const { data } = await axios.get(`${this.productServiceUrl}/rpc/variants/${id}`)
            const variant = data.data;
            return {
                id: variant.id,
                productId: variant.productId,
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                quantity: variant.quantity,
                createdAt: new Date(variant.createdAt),
                updatedAt: variant.updatedAt ? new Date(variant.updatedAt) : undefined,
            } as PublicVariant;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<Array<PublicVariant>> {
        const { data } = await axios.post(`${this.productServiceUrl}/rpc/variants/list-by-ids`, { ids });

        const variants = data.data.map((variant: any) => {
            return {
                id: variant.id,
                productId: variant.productId,
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                quantity: variant.quantity,
                createdAt: new Date(variant.createdAt),
                updatedAt: variant.updatedAt ? new Date(variant.updatedAt) : undefined,
            } as PublicVariant;
        });
        return variants;
    }
}