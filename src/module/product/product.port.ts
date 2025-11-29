import { Paginated, PagingDTO, Requester } from "src/share";
import { Product, CreateProductDTO, UpdateProductDTO, FilterProductDTO } from "./product.model";

export interface IProductService {
    create(dto: CreateProductDTO): Promise<string>;
    update(productId: string, dto: UpdateProductDTO): Promise<boolean>;
    delete(productId: string): Promise<boolean>;
}

export interface IProductRepository {
    get(id: string): Promise<Product | null>;
    list(cond: FilterProductDTO, paging: PagingDTO): Promise<Paginated<Product>>;
    listByIds(ids: string[], ): Promise<Product[]>;
    listBySearch(keyword: string, paging: PagingDTO): Promise<Paginated<Product>>;

    insert(product: Product): Promise<void>;
    update(id: string, dto: UpdateProductDTO): Promise<void>;
    delete(id: string): Promise<void>;
}