import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, IProductService } from "./product.port";
import { PRODUCT_REPOSITORY, PRODUCT_SERVICE } from "./product.di-token";
import { BRAND_RPC, CATEGORY_RPC } from "src/share/di-token";
import { CreateProductDTO, createProductDTOSchema, ErrProductExist, ErrProductNotFound, updateProductDTOSchema } from "./product.model";
import { AppError, IPublicBrandRpc, IPublicCategoryRpc, Requester } from "src/share";
import { v7 } from "uuid";
import { ErrBrandNotFound } from "../brand/brand.model";
import { ErrCategoryNotFound } from "../category/category.model";

@Injectable()
export class ProductService implements IProductService {
    constructor(
        @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
        @Inject(BRAND_RPC) private readonly brandRpc: IPublicBrandRpc,
        @Inject(CATEGORY_RPC) private readonly categoryRpc: IPublicCategoryRpc,
    ) { }
    async create(dto: CreateProductDTO): Promise<string> {

        const data = createProductDTOSchema.parse(dto);

        const productExist = await this.repo.list(data, { page: 1, limit: 1 });

        if (productExist.data.length > 0) {
            throw AppError.from(ErrProductExist, 409);
        }

        const brand = await this.brandRpc.findById(data.brandId);

        if (!brand) {
            throw AppError.from(ErrBrandNotFound, 404);
        }

        const category = await this.categoryRpc.findById(data.categoryId);

        if (!category) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        const newId = v7();

        const newProduct = {
            id: newId,
            productName: data.productName,
            price: data.price,
            description: data.description,
            brandId: data.brandId,
            categoryId: data.categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.repo.insert(newProduct);

        return newId;
    }

    async update(productId: string, dto: CreateProductDTO): Promise<boolean> {

        const data = updateProductDTOSchema.parse(dto);

        const productExist = await this.repo.get(productId);

        if (!productExist) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const brand = await this.brandRpc.findById(data.brandId);

        if (!brand) {
            throw AppError.from(ErrBrandNotFound, 404);
        }

        const category = await this.categoryRpc.findById(data.categoryId);

        if (!category) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        const updatedProduct = {
            ...data,
            updatedAt: new Date(),
        }

        await this.repo.update(productId, updatedProduct);

        return true;
    }

    async delete(productId: string): Promise<boolean> {

        const productExist = await this.repo.get(productId);

        if (!productExist) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        await this.repo.delete(productId);

        return true;
    }
}