import { Variation } from "./variation.model";
import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateVariationDTO, UpdateVariationDTO, FilterVariationDTO } from "./variation.model";

export interface IVariationService {
    create(dto: CreateVariationDTO): Promise<string>;
    update(variationId: string, dto: UpdateVariationDTO): Promise<boolean>;
    delete(variationId: string): Promise<boolean>;
}

export interface IVariationRepository {
    get(id: string): Promise<Variation | null>;
    list(cond: FilterVariationDTO, paging: PagingDTO): Promise<Paginated<Variation>>;
    listByIds(ids: string[]): Promise<Variation[]>;
    listColors(): Promise<string[]>;
    listSizes(): Promise<number[]>;

    insert(variation: Variation): Promise<void>;
    update(id: string, dto: UpdateVariationDTO): Promise<void>;
    delete(id: string): Promise<void>;
}