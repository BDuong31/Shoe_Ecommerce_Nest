import { Injectable } from "@nestjs/common";
import { IPublicProductRpc, PublicProduct } from "..";
import axios from "axios";

@Injectable()
export class ProductRPCClient implements IPublicProductRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicProduct | null> {
        try {
            const { data } = await axios.get(`${this.productServiceUrl}/rpc/products/${id}`)
            const product = data.data;
            return {
                id: product.id,
                productName: product.productName,
                description: product.description,
                price: product.price,
                brandId: product.brandId,
                categoryId: product.categoryId,
                createdAt: new Date(product.createdAt),
                updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
            } as PublicProduct;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<Array<PublicProduct>> {
        const { data } = await axios.post(`${this.productServiceUrl}/rpc/products/list-by-ids`, { ids });

        const products = data.data.map((product: any) => {
            return {
                id: product.id,
                productName: product.productName,
                description: product.description,
                price: product.price,
                brandId: product.brandId,
                categoryId: product.categoryId,
                createdAt: new Date(product.createdAt),
                updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
            } as PublicProduct;
        });
        return products;
    }
}