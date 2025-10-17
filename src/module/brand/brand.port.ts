import { Brand } from "./brand.model";
import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateBrandDTO, UpdateBrandDTO, FilterBrandDTO } from "./brand.model";

export interface IBrandService {
    create(dto: CreateBrandDTO): Promise<string>;
    update(brandId: string, dto: UpdateBrandDTO): Promise<boolean>;
    delete(brandId: string): Promise<boolean>;
}

export interface IBrandRepository {
    get(id: string): Promise<Brand | null>;
    list(cond: FilterBrandDTO, paging: PagingDTO): Promise<Paginated<Brand>>;
    listByIds(ids: string[]): Promise<Brand[]>;

    insert(brand: Brand): Promise<void>;
    update(id: string, dto: UpdateBrandDTO): Promise<void>;
    delete(id: string): Promise<void>;
}