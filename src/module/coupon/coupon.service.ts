import { Inject, Injectable } from '@nestjs/common';
import { ICouponRepository, ICouponService } from './coupon.port';
import { COUPON_REPOSITORY } from './coupon.di-token';
import { CreateCouponDTO, createCouponDTOSchema, ErrCouponExist, ErrCouponNotFound, updateCouponDTOSchema } from './coupon.model';
import { AppError } from 'src/share';
import { v7 } from 'uuid';

@Injectable()
export class CouponService implements ICouponService {
    constructor(
        @Inject(COUPON_REPOSITORY) private readonly couponRepo: ICouponRepository,
    ) {}

    async create(dto: CreateCouponDTO): Promise<string> {
        dto.expiryDate = new Date(dto.expiryDate);
        const data = createCouponDTOSchema.parse(dto);

        const couponExist = await this.couponRepo.list({ code: data.code }, { page: 1, limit: 1 });

        if (couponExist.total > 0) {
            throw AppError.from(ErrCouponExist, 409);
        }

        const newId = v7();

        const newCoupon = {
            id: newId,
            code: data.code,
            type: data.type,
            discountValue: data.discountValue,
            expiryDate: data.expiryDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.couponRepo.insert(newCoupon);

        return newId;
    }

    async update(couponId: string, dto: CreateCouponDTO): Promise<boolean> {
        const data = updateCouponDTOSchema.parse(dto);

        const couponExist = await this.couponRepo.get(couponId);

        if (!couponExist) {
            throw AppError.from(ErrCouponNotFound, 404);
        }

        const updatedCoupon = {
            ...data,
            updatedAt: new Date(),
        }

        await this.couponRepo.update(couponId, updatedCoupon);

        return true;
    }

    async delete(couponId: string): Promise<boolean> {
        const couponExist = await this.couponRepo.get(couponId);

        if (!couponExist) {
            throw AppError.from(ErrCouponNotFound, 404);
        }

        await this.couponRepo.delete(couponId);

        return true;
    }
}