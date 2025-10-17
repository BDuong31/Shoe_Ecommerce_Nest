import { Category } from "./category.model";
import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateCategoryDTO, UpdateCategoryDTO, FilterCategoryDTO } from "./category.model";

export interface ICategoryService {
    create(dto: CreateCategoryDTO): Promise<string>;
    update(categoryId: string, dto: UpdateCategoryDTO): Promise<boolean>;
    delete(categoryId: string): Promise<boolean>;
}

export interface ICategoryRepository {
    get(id: string): Promise<Category | null>;
    list(cond: FilterCategoryDTO, paging: PagingDTO): Promise<Paginated<Category>>;
    listByIds(ids: string[]): Promise<Category[]>;

    insert(category: Category): Promise<void>;
    update(id: string, dto: UpdateCategoryDTO): Promise<void>;
    delete(id: string): Promise<void>;
}