import { Injectable } from "@nestjs/common";
import { IPublicBrandRpc } from "../interface";
import axios from "axios";
import { PublicBrand } from "../data-model";

@Injectable()
export class BrandRPCClient implements IPublicBrandRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicBrand | null> {
        try {
            const { data } = await axios.get(`${this.productServiceUrl}/rpc/${id}`)
            const brand = data.data;
            return {
                id: brand.id,
                name: brand.name,
                createdAt: new Date(brand.createdAt),
                updatedAt: new Date(brand.updatedAt),
            } as PublicBrand;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<Array<PublicBrand>> {
        try {
            const { data } = await axios.post(`${this.productServiceUrl}/rpc/list-by-ids`, { ids })
            const brands = data.data.map((brand: any) => {
                return {
                    id: brand.id,
                    name: brand.name,
                    createdAt: new Date(brand.createdAt),
                    updatedAt: new Date(brand.updatedAt),
                } as PublicBrand;
            });
            return brands;
        } catch (error) {
            return [];
        }
    }
}