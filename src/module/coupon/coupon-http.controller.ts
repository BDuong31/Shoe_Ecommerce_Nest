import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { COUPON_REPOSITORY, COUPON_SERVICE } from "./coupon.di-token";
import { ICouponRepository, ICouponService } from "./coupon.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CreateCouponDTO, FilterCouponDTO, filterCouponDTOSchema } from "./coupon.model";

@Controller('v1/coupons')
export class CouponHttpController {
    constructor(
        @Inject(COUPON_SERVICE) private readonly service: ICouponService,
        @Inject(COUPON_REPOSITORY) private readonly repo: ICouponRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async createCoupon(@Body() dto: CreateCouponDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listCoupon(@Request() req: ReqWithRequester, @Query() dto: FilterCouponDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterCouponDTOSchema.parse(dto);
        const data = await this.repo.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCoupon(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateCoupon(@Param('id') id: string,  @Body() dto: CreateCouponDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteCoupon(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getCouponById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCouponByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }
}