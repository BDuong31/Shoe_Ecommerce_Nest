import { Injectable } from "@nestjs/common";
import { IPublicAddressRpc, PublicAddress } from "..";
import axios from "axios";

@Injectable()
export class AddressRPCClient implements IPublicAddressRpc {
    constructor(private readonly addressServiceUrl: string) {}

    async findById(id: string): Promise<PublicAddress | null> {
        try {
            const { data } = await axios.get(`${this.addressServiceUrl}/rpc/${id}`)
            const address = data.data;
            return {
                id: address.id,
                userId: address.userId,
                streetAdress: address.streetAddress,
                cityProvince: address.cityProvince,
                isDefault: address.isDefault,
                createdAt: address.createdAt,
                updatedAt: address.updatedAt,
            } as PublicAddress;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<Array<PublicAddress>> {
        try {
            const { data } = await axios.post(`${this.addressServiceUrl}/rpc/list-by-ids`, { ids });

            const addresses = data.data.map((address: any) => {
            return {
                id: address.id,
                userId: address.userId,
                streetAdress: address.streetAddress,
                cityProvince: address.cityProvince,
                isDefault: address.isDefault,
                createdAt: address.createdAt,
                updatedAt: address.updatedAt,
            } as PublicAddress;
        });
        return addresses;
    }
        catch (error) {
            return [];
        }
    }

    async checkAddressBelongToUser(addressId: string, userId: string): Promise<boolean> {
        try {
            const { data } = await axios.get(`${this.addressServiceUrl}/rpc/${addressId}/belongs-to/${userId}`);
            return data.data;
        } catch (error) {
            return false;
        }
    }
}