import { Inject, Injectable } from "@nestjs/common";
import { IBrandRepository, IBrandService } from "./brand.port";
import { BRAND_REPOSITORY } from "./brand.di-token";
import { CreateBrandDTO, createBrandDTOSchema, ErrBrandExist, ErrBrandNotFound, updateBrandDTOSchema } from "./brand.model";
import { AppError, Requester } from "src/share";
import { v7 } from "uuid";

@Injectable()
export class BrandService implements IBrandService {
    constructor(
        @Inject(BRAND_REPOSITORY) private readonly brandRepo: IBrandRepository,
    ) {}

    async create(dto: CreateBrandDTO): Promise<string> {

        const data = createBrandDTOSchema.parse(dto);

        const brandExist = await this.brandRepo.list(data, { page: 1, limit: 1 });

        if (!brandExist) {
            throw AppError.from(ErrBrandExist, 409);
        }

        const newId = v7();

        const newBrand = {
            id: newId,
            name: data.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.brandRepo.insert(newBrand);

        return newId;
    }

    async update(brandId: string, dto: CreateBrandDTO): Promise<boolean> {

        const data = updateBrandDTOSchema.parse(dto);

        const brandExist = await this.brandRepo.get(brandId);

        if (!brandExist) {
            throw AppError.from(ErrBrandNotFound, 404);
        }

        const updatedBrand = {
            ...data,
            updatedAt: new Date(),
        }

        await this.brandRepo.update(brandId, updatedBrand);

        return true;
    }

    async delete(brandId: string): Promise<boolean> {

        const brandExist = await this.brandRepo.get(brandId);

        if (!brandExist) {
            throw AppError.from(ErrBrandNotFound, 404);
        }

        await this.brandRepo.delete(brandId);

        return true;
    }
}