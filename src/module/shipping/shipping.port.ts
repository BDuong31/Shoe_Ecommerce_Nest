import { Shipping } from "./shipping.model";
import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateShippingDTO, UpdateShippingDTO, FilterShippingDTO } from "./shipping.model";

export interface IShippingService {
    create(dto: CreateShippingDTO): Promise<string>;
    update(shippingId: string, dto: UpdateShippingDTO): Promise<boolean>;
    delete(shippingId: string): Promise<boolean>;
}

export interface IShippingRepository {
    get(id: string): Promise<Shipping | null>;
    list(cond: FilterShippingDTO, paging: PagingDTO): Promise<Paginated<Shipping>>;
    listByIds(ids: string[]): Promise<Shipping[]>;

    insert(shipping: Shipping): Promise<void>;
    update(id: string, dto: UpdateShippingDTO): Promise<void>;
    delete(id: string): Promise<void>;
}