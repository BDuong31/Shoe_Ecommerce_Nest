import { Coupon } from "./coupon.model";
import { Paginated, PagingDTO, Requester } from "src/share";
import { CreateCouponDTO, UpdateCouponDTO, FilterCouponDTO } from "./coupon.model";

export interface ICouponService {
    create(dto: CreateCouponDTO): Promise<string>;
    update(couponId: string, dto: UpdateCouponDTO): Promise<boolean>;
    delete(couponId: string): Promise<boolean>;
}

export interface ICouponRepository {
    get(id: string): Promise<Coupon | null>;
    list(cond: FilterCouponDTO, paging: PagingDTO): Promise<Paginated<Coupon>>;
    listByIds(ids: string[]): Promise<Coupon[]>;

    insert(coupon: Coupon): Promise<void>;
    update(id: string, dto: UpdateCouponDTO): Promise<void>;
    delete(id: string): Promise<void>;
}