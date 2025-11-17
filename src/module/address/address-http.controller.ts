import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ADDRESS_REPOSITORY, ADDRESS_SERVICE } from "./address.di-token";
import { IAddressRepository, IAddressService } from "./address.port";
import { CreateAddressDTO, FilterAddressDTO, filterAddressDTOSchema, UpdateAddressDTO } from "./address.model";
import { IPublicUserRpc, ReqWithRequester } from "src/share/interface";
import { RemoteAuthGuard } from "src/share/guard/auth";
import { PagingDTO, pagingDTOSchema } from "src/share/data-model";
import { USER_RPC } from "src/share/di-token";
import { paginatedResponse } from "src/share";
import { NotFoundError } from "rxjs";

@Controller('v1/addresses')
export class AddressHttpController {
    constructor(
        @Inject(ADDRESS_SERVICE) private readonly service: IAddressService,
        @Inject(ADDRESS_REPOSITORY) private readonly repo: IAddressRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createAddress(@Request() req: ReqWithRequester, @Body() dto: CreateAddressDTO){
        const { requester } = req;
        const data = await this.service.create({...dto, userId: requester.sub});
        return { data };
    }

    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listAddress(@Request() req: ReqWithRequester, @Query() dto: FilterAddressDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        const data: FilterAddressDTO ={
            userId: dto.userId, 
            isDefault: dto.isDefault ? true : dto.isDefault === false ? false : undefined       
        }
        console.log('Filter DTO:', data);
        dto = filterAddressDTOSchema.parse(data);

        const result = await this.repo.list(dto, paging);

        return paginatedResponse(result, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getAddress(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateAddress(@Request() req: ReqWithRequester, @Param('id') id: string, @Body() dto: UpdateAddressDTO){
        const { requester } = req;
        console.log(id);
        const result = await this.service.update(id, dto, requester);
        return { data: result };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteAddress(@Request() req: ReqWithRequester, @Param('id') id: string){
        const { requester } = req;
        const result = await this.service.delete(id, requester);
        return { data: result };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listAddressesByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const { ids } = dto;
        const result = await this.repo.listByIds(ids);
        return { data: result };
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getAddressById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);

        if (!data) {
            return new NotFoundException();
        }
        return { data };
    }

    @Get('rpc/:addressId/belongs-to/:userId')
    @HttpCode(HttpStatus.OK)
    async checkAddressBelongToUser(@Request() req: ReqWithRequester, @Param('addressId') addressId: string, @Param('userId') userId: string){
        const result = await this.service.checkAddressBelongToUser(addressId, userId);
        return { data: result };
    }
}