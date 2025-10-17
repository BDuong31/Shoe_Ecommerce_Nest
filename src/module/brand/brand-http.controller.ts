import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { BRAND_REPOSITORY, BRAND_SERVICE } from "./brand.di-token";
import { IBrandRepository, IBrandService } from "./brand.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CreateBrandDTO, FilterBrandDTO, filterBrandDTOSchema } from "./brand.model";

@Controller('v1/brands')
export class BrandHttpController {
    constructor(
        @Inject(BRAND_SERVICE) private readonly service: IBrandService,
        @Inject(BRAND_REPOSITORY) private readonly repo: IBrandRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async createBrand(@Body() dto: CreateBrandDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listBrand(@Request() req: ReqWithRequester, @Query() dto: FilterBrandDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterBrandDTOSchema.parse(dto);
        const data = await this.repo.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getBrand(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateBrand(@Param('id') id: string,  @Body() dto: CreateBrandDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteBrand(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getBrandById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listBrandsByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }
}