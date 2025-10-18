import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { VARIATION_REPOSITORY, VARIATION_SERVICE } from "./variation.di-token";
import { PRODUCT_RPC } from "src/share/di-token";
import { IVariationRepository, IVariationService } from "./variation.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { IPublicProductRpc, paginatedResponse, PagingDTO, pagingDTOSchema, PublicProduct, ReqWithRequester, UserRole } from "src/share";
import { CreateVariationDTO, FilterVariationDTO, filterVariationDTOSchema, Variation } from "./variation.model";

@Controller('v1/variations')
export class VariationHttpController {
    constructor(
        @Inject(VARIATION_SERVICE) private readonly service: IVariationService,
        @Inject(VARIATION_REPOSITORY) private readonly repo: IVariationRepository,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async createVariation(@Body() dto: CreateVariationDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listVariation(@Request() req: ReqWithRequester, @Query() dto: FilterVariationDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterVariationDTOSchema.parse(dto);
        const result = await this.repo.list(dto, paging);

        const productIds = result.data.map(item => item.productId);
        const products = await this.productRpc.findByIds([...new Set(productIds)]);

        const productMap: Record<string, PublicProduct> = {};

        products.forEach(product => {
            productMap[product.id] = product;
        });

        result.data = result.data.map((item) =>{
            const product = productMap[item.productId];
            return { ...item, product } as Variation;
        })

        return paginatedResponse(result, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getVariation(@Param('id') id: string){
        const data = await this.repo.get(id);
        if (!data) {
            throw new NotFoundException();
        }

        const product = await this.productRpc.findById(data.productId);

        return { data: { ...data, product } as Variation };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateVariation(@Param('id') id: string,  @Body() dto: CreateVariationDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteVariation(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getVariationById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listVariationsByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }
}