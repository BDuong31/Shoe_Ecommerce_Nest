import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateFavoriteDTO, Favorite } from "./favorites.model";
import { FilterAddressDTO } from "../address/address.model";

export interface IFavoriteService {
    create(dto: CreateFavoriteDTO, requester: Requester): Promise<string>;
    delete(favoriteId: string): Promise<boolean>;
}

export interface IFavoriteRepository {
    get(id: string): Promise<Favorite | null>;
    list(cond: FilterAddressDTO, paging: PagingDTO, requester: Requester): Promise<Paginated<Favorite>>
    listByIds(ids: string[]): Promise<Favorite[]>;
    isProductFavoritedByUser(productId: string, userId: string): Promise<boolean>;

    insert(favorite: Favorite): Promise<void>;
    delete(id: string): Promise<void>;
}