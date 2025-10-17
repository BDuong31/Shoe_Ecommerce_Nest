import { Inject, Injectable } from "@nestjs/common";
import { ICategoryRepository, ICategoryService } from "./category.port";
import { CATEGORY_REPOSITORY } from "./category.di-token";
import { CreateCategoryDTO, createCategoryDTOSchema, ErrCategoryExist, ErrCategoryNotFound, updateCategoryDTOSchema } from "./category.model";
import { AppError } from "src/share";
import { v7 } from "uuid";

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
    ) {}

    async create(dto: CreateCategoryDTO): Promise<string> {

        const data = createCategoryDTOSchema.parse(dto);

        const categoryExist = await this.categoryRepo.list(data, { page: 1, limit: 1 });

        if (!categoryExist) {
            throw AppError.from(ErrCategoryExist, 409);
        }

        const newId = v7();

        const newCategory = {
            id: newId,
            name: data.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.categoryRepo.insert(newCategory);

        return newId;
    }

    async update(categoryId: string, dto: CreateCategoryDTO): Promise<boolean> {

        const data = updateCategoryDTOSchema.parse(dto);

        const categoryExist = await this.categoryRepo.get(categoryId);

        if (!categoryExist) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        const updatedCategory = {
            ...data,
            updatedAt: new Date(),
        }

        await this.categoryRepo.update(categoryId, updatedCategory);

        return true;
    }

    async delete(categoryId: string): Promise<boolean> {

        const categoryExist = await this.categoryRepo.get(categoryId);

        if (!categoryExist) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        await this.categoryRepo.delete(categoryId);

        return true;
    }
}