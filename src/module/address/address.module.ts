import { Module, Provider } from "@nestjs/common";
import { AddressService } from "./address.service";
import { AddressPrismaRepository } from "./address-prisma.repo";
import { ADDRESS_REPOSITORY, ADDRESS_SERVICE } from "./address.di-token";
import { REMOTE_AUTH_GUARD, USER_RPC } from "src/share/di-token";
import { UserRPCClient } from "src/share/rpc/user.rpc";
import { RemoteAuthGuard } from "src/share/guard";
import { ShareModule } from "src/share/module";
import { AddressHttpController } from "./address-http.controller";

const dependencies: Provider[] = [
    { provide: ADDRESS_SERVICE, useClass: AddressService },
    { provide: ADDRESS_REPOSITORY, useClass: AddressPrismaRepository },
    { provide: REMOTE_AUTH_GUARD, useClass: RemoteAuthGuard }
];

@Module({
    imports: [ShareModule],
    controllers: [AddressHttpController],
    providers: [...dependencies],
})

export class AddressModule {}