import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { SHIPPING_REPOSITORY, SHIPPING_SERVICE } from "./shipping.di-token";
import { IShippingRepository, IShippingService } from "./shipping.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CreateShippingDTO, FilterShippingDTO, FilterShippingDTOSchema } from "./shipping.model";

@Controller('v1/shippings')
export class ShippingHttpController {
    constructor(
        @Inject(SHIPPING_SERVICE) private readonly service: IShippingService,
        @Inject(SHIPPING_REPOSITORY) private readonly repo: IShippingRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createShipping(@Body() dto: CreateShippingDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listShipping(@Request() req: ReqWithRequester, @Query() dto: FilterShippingDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = FilterShippingDTOSchema.parse(dto);
        const data = await this.repo.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getShipping(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateShipping(@Param('id') id: string,  @Body() dto: CreateShippingDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteShipping(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc')
    @HttpCode(HttpStatus.OK)
    async createShippingRpc(@Body() dto: CreateShippingDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Delete('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async deleteShippingRpc(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getShippingById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listShippingsByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }
}