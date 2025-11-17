import { Paginated, PagingDTO, Requester } from "src/share";
import { Address, CreateAddressDTO, FilterAddressDTO, UpdateAddressDTO } from "./address.model";

export interface IAddressService {
    create(dto: CreateAddressDTO): Promise<string>;
    update(addressId: string, dto: UpdateAddressDTO, requester: Requester): Promise<boolean>;
    delete(addressId: string, requester: Requester): Promise<boolean>;
    checkAddressBelongToUser(addressId: string, userId: string): Promise<boolean>;
}

export interface IAddressRepository {
    get(id: string): Promise<Address | null>;
    list(cond: FilterAddressDTO, paging?: PagingDTO): Promise<Paginated<Address>>;
    listByIds(ids: string[]): Promise<Address[]>;

    insert(address: Address): Promise<void>;
    update(id: string, dto: UpdateAddressDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
