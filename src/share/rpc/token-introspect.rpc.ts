import { Injectable } from "@nestjs/common";
import { ITokenIntrospect, TokenIntrospectResult } from "../interface";
import axios from "axios";

@Injectable()
export class TokenIntrospectRPCClient implements ITokenIntrospect {
    constructor(private readonly url: string) {}

    async introspect(token: string): Promise<TokenIntrospectResult> {
        try {
            const { data } = await axios.post(`${this.url}`, { token});
            const { sub, role } = data.data;
            return {
                payload: { sub, role },
                isOk: true
            };
        } catch (error) {
            return {
                payload: null,
                error: (error as Error),
                isOk: false
            }
        }
    }
}