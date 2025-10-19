import { Inject, Injectable } from "@nestjs/common";
import { IShippingRepository, IShippingService } from "./shipping.port";
import { SHIPPING_REPOSITORY } from "./shipping.di-token";
import { CreateShippingDTO, CreateShippingDTOSchema, ErrShippingExist, ErrShippingNotFound, UpdateShippingDTO, UpdateShippingDTOSchema } from "./shipping.model";
import { AppError } from "src/share";
import { v7 } from "uuid";

@Injectable()
export class ShippingService implements IShippingService {
    constructor(
        @Inject(SHIPPING_REPOSITORY) private readonly shippingRepo: IShippingRepository,
    ) {}

    async create(dto: CreateShippingDTO): Promise<string> {

        const data = CreateShippingDTOSchema.parse(dto);

        const shippingExist = await this.shippingRepo.list(data, { page: 1, limit: 1 });

        if (!shippingExist) {
            throw AppError.from(ErrShippingExist, 409);
        }

        const newId = v7();

        const newShipping = {
            id: newId,
            carrier: data.carrier!,
            trackingNumber: data.trackingNumber!,
            shippingCost: data.shippingCost!,
            orderId: data.orderId!,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.shippingRepo.insert(newShipping);

        return newId;
    }

    async update(shippingId: string, dto: UpdateShippingDTO): Promise<boolean> {

        const data = UpdateShippingDTOSchema.parse(dto);

        const shippingExist = await this.shippingRepo.get(shippingId);

        if (!shippingExist) {
            throw AppError.from(ErrShippingNotFound, 404);
        }

        const updatedShipping = {
            ...data,
            updatedAt: new Date(),
        }

        await this.shippingRepo.update(shippingId, updatedShipping);

        return true;
    }

    async delete(shippingId: string): Promise<boolean> {

        const shippingExist = await this.shippingRepo.get(shippingId);

        if (!shippingExist) {
            throw AppError.from(ErrShippingNotFound, 404);
        }

        await this.shippingRepo.delete(shippingId);

        return true;
    }
}