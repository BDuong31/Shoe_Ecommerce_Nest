import { Inject, Injectable } from "@nestjs/common";
import { IVariationRepository, IVariationService } from "./variation.port";
import { VARIATION_REPOSITORY } from "./variation.di-token";
import { CreateVariationDTO, createVariationDTOSchema, ErrVariationExist, ErrVariationNotFound, UpdateVariationDTO, updateVariationDTOSchema } from "./variation.model";
import { AppError, IPublicProductRpc } from "src/share";
import { v7 } from "uuid";
import { PRODUCT_RPC } from "src/share/di-token";
import { ErrProductNotFound } from "../product/product.model";

@Injectable()
export class VariationService implements IVariationService {
    constructor(
        @Inject(VARIATION_REPOSITORY) private readonly variationRepo: IVariationRepository,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
    ) {}

    async create(dto: CreateVariationDTO): Promise<string> {

        const data = createVariationDTOSchema.parse(dto);

        const product = await this.productRpc.findById(data.productId);

        if (!product) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const newId = v7();

        const newVariation = {
            id: newId,
            size: data.size,
            color: data.color,
            sku: data.sku,
            quantity: data.quantity,
            productId: data.productId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.variationRepo.insert(newVariation);

        return newId;
    }

    async update(variationId: string, dto: UpdateVariationDTO): Promise<boolean> {

        const data = updateVariationDTOSchema.parse(dto);

        const variationExist = await this.variationRepo.get(variationId);

        if (!variationExist) {
            throw AppError.from(ErrVariationNotFound, 404);
        }

        const updatedVariation = {
            ...data,
            updatedAt: new Date(),
        }

        await this.variationRepo.update(variationId, updatedVariation);

        return true;
    }

    async delete(variationId: string): Promise<boolean> {

        const variationExist = await this.variationRepo.get(variationId);

        if (!variationExist) {
            throw AppError.from(ErrVariationNotFound, 404);
        }

        await this.variationRepo.delete(variationId);

        return true;
    }
}