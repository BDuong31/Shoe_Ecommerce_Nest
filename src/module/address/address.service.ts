import { Inject, Injectable } from "@nestjs/common";
import { IAddressRepository, IAddressService } from "./address.port";
import { CreateAddressDTO, createAddressDTOSchema, ErrAddressNotFound, ErrUserNotFound, UpdateAddressDTO, updateAddressDTOSchema } from "./address.model";

import { AppError, IEventPublisher, IPublicUserRpc, Requester } from "src/share";
import { ADDRESS_REPOSITORY } from "./address.di-token";
import { EVENT_PUBLISHER, USER_RPC } from "src/share/di-token";
import { v7 } from "uuid";

@Injectable()
export class AddressService implements IAddressService {
    constructor(
        @Inject(ADDRESS_REPOSITORY) private readonly addressRepo: IAddressRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,

    ) {}
    async create(dto: CreateAddressDTO) : Promise<string> {

        const data = createAddressDTOSchema.parse(dto);

        const userExist = await this.userRpc.findById(data.userId);

        if (!userExist) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        const addressList = await this.addressRepo.list({ userId: data.userId });

        if (addressList.data.length === 0) {
            data.isDefault = true;
        }

        if (data.isDefault) {
            for (const addr of addressList.data) {
                if (addr.isDefault) {
                    await this.addressRepo.update(addr.id, { isDefault: false });
                }
            }
        }

        const newId = v7();

        const newAddress = {
            id: newId,
            userId: data.userId,
            fullName: data.fullName,
            phone: data.phone,
            streetAdress: data.streetAdress,
            cityProvince: data.cityProvince,
            isDefault: data.isDefault ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.addressRepo.insert(newAddress);

        return newId;

    }
    async update(addressId: string, dto: UpdateAddressDTO, requester: Requester) : Promise<boolean> {

        console.log('Update address called with addressId:', addressId, 'and dto:', dto);
        const data = updateAddressDTOSchema.parse(dto);

        const addressExist = await this.addressRepo.get(addressId);

        if (!addressExist) {
            throw AppError.from(ErrAddressNotFound, 404);
        }

        if (addressExist.userId !== requester.sub) {
            throw AppError.from(ErrUserNotFound, 403);
        }

        const addressList = await this.addressRepo.list({ userId: requester.sub });

        if (data.isDefault) {
            for (const addr of addressList.data) {
                if (addr.isDefault) {
                    await this.addressRepo.update(addr.id, { isDefault: false });
                }
            }
        }

        const updatedAddress = {
            ...data,
            updatedAt: new Date(),
        }

        await this.addressRepo.update(addressId, updatedAddress);
        return true;

    }
    async delete(addressId: string, requester: Requester) : Promise<boolean> {

        const addressExist = await this.addressRepo.get(addressId);

        if (!addressExist) {
            throw AppError.from(ErrAddressNotFound, 404);
        }

        if (addressExist.userId !== requester.sub) {
            throw AppError.from(ErrUserNotFound, 403);
        }

        await this.addressRepo.delete(addressId);
        return true;
    }

    async checkAddressBelongToUser(addressId: string, userId: string) : Promise<boolean> {
        const addressExist = await this.addressRepo.get(addressId);

        if (!addressExist) {
            return false;
        }

        return addressExist.userId === userId;
    }
}