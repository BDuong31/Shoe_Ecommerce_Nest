import { Injectable } from "@nestjs/common";
import { IPublicUserRpc, PublicUser } from "..";
import axios from "axios";
@Injectable()
export class UserRPCClient implements IPublicUserRpc {
    constructor(private readonly userServiceUrl: string) {}

    async findById(id: string): Promise<PublicUser | null> {
        try {
            const { data } = await axios.get(`${this.userServiceUrl}/rpc/users/${id}`)
            const user = data.data;
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            } as PublicUser;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<Array<PublicUser>> {
        const { data } = await axios.post(`${this.userServiceUrl}/rpc/users/list-by-ids`, { ids });

        const users = data.data.map((user: any) => {
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            } as PublicUser;
        });
        return users;
    }

    async updateUserRpc(id: string, dto: any): Promise<boolean> {
        const { data } = await axios.patch(`${this.userServiceUrl}/rpc/users/${id}`, dto);
        return data.data;
    }
}