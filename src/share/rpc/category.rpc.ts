import { Injectable } from "@nestjs/common";
import { IPublicCategoryRpc } from "../interface";
import { PublicCategory } from "../data-model";
import axios from "axios";

@Injectable()
export class BrandRPCClient implements IPublicCategoryRpc{
    constructor(private readonly brandServiceUrl: string) {}
    async findById(id: string): Promise<PublicCategory | null> {
        try {
            const { data } = await axios.get(`${this.brandServiceUrl}/rpc/categories/${id}`)
            const category = data.data;
            return {
                id: category.id,
                name: category.name,
                createdAt: new Date(category.createdAt),
                updatedAt: category.updatedAt ? new Date(category.updatedAt) : undefined,
            } as PublicCategory;
        } catch (error) {
            return null;
        }

    }
    async findByIds(ids: string[]): Promise<Array<PublicCategory>> {
        try {
            const { data } = await axios.post(`${this.brandServiceUrl}/rpc/categories/batch`, { ids })
            const categories = data.data;
            return categories.map((category: any) => {
                return {
                    id: category.id,
                    name: category.name,
                    createdAt: new Date(category.createdAt),
                    updatedAt: category.updatedAt ? new Date(category.updatedAt) : undefined,
                } as PublicCategory;
            });
        } catch (error) {
            return [];
        }
    }
}