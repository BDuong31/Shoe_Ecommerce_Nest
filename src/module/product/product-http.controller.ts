import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PRODUCT_REPOSITORY, PRODUCT_SERVICE } from "./product.di-token";
import { CATEGORY_RPC, BRAND_RPC } from "src/share/di-token";
import { IProductRepository, IProductService } from "./product.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { IPublicBrandRpc, IPublicCategoryRpc, paginatedResponse, PagingDTO, pagingDTOSchema, PublicBrand, PublicCategory, ReqWithRequester, UserRole } from "src/share";
import { CreateProductDTO, FilterProductDTO, filterProductDTOSchema, Product } from "./product.model";
import { NotFoundError } from "rxjs";

@Controller('v1/products')
export class ProductHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly service: IProductService,
        @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
        @Inject(BRAND_RPC) private readonly brandRpc: IPublicBrandRpc,
        @Inject(CATEGORY_RPC) private readonly categoryRpc: IPublicCategoryRpc,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async createProduct(@Body() dto: CreateProductDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listProduct(@Request() req: ReqWithRequester, @Query() dto: FilterProductDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterProductDTOSchema.parse(dto);

        const result = await this.repo.list(dto, paging);

        const brandIds = result.data.map(item => item.brandId);
        const categoryIds = result.data.map(item => item.categoryId);

        const brands = await this.brandRpc.findByIds([...new Set(brandIds)]);
        const categories = await this.categoryRpc.findByIds([...new Set(categoryIds)]);

        const brandMap: Record<string, PublicBrand> = {};
        const categoriesMap: Record<string, PublicCategory> = {};

        brands.forEach(brand => {
            brandMap[brand.id] = brand;
        });

        categories.forEach(category => {
            categoriesMap[category.id] = category;
        });

        result.data = result.data.map((item) =>{
            const brand = brandMap[item.brandId];
            const category = categoriesMap[item.categoryId];
            return { ...item, brand, category } as Product;
        })

        return paginatedResponse(result, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getProduct(@Param('id') id: string){
        const result = await this.repo.get(id);

        if (!result) {
            return new NotFoundException();
        }

        const brand = await this.brandRpc.findById(result.brandId);
        const category = await this.categoryRpc.findById(result.categoryId);

        const data = { ...result, brand, category } as Product;
        
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateProduct(@Param('id') id: string,  @Body() dto: CreateProductDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteProduct(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getProductById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listProductByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }
}