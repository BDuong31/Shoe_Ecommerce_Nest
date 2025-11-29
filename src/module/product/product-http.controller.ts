import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PRODUCT_REPOSITORY, PRODUCT_SERVICE } from "./product.di-token";
import { CATEGORY_RPC, BRAND_RPC, RATING_RPC, FAVORITES_RPC, IMAGE_RPC } from "src/share/di-token";
import { IProductRepository, IProductService } from "./product.port";
import { RemoteAuthGuard, RemoteAuthGuardOptional, Roles, RolesGuard } from "src/share/guard";
import { IPublicBrandRpc, IPublicCategoryRpc, IPublicFavoriteRpc, IPublicImageRpc, IPublicRatingRpc, paginatedResponse, PagingDTO, pagingDTOSchema, PublicBrand, PublicCategory, PublicImage, PublicRating, ReqWithRequester, UserRole } from "src/share";
import { CreateProductDTO, FilterProductDTO, filterProductDTOSchema, Product } from "./product.model";
import { NotFoundError } from "rxjs";

@Controller('v1/products')
export class ProductHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly service: IProductService,
        @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
        @Inject(BRAND_RPC) private readonly brandRpc: IPublicBrandRpc,
        @Inject(CATEGORY_RPC) private readonly categoryRpc: IPublicCategoryRpc,
        @Inject(RATING_RPC) private readonly ratingRpc: IPublicRatingRpc,
        @Inject(FAVORITES_RPC) private readonly favoriteRpc: IPublicFavoriteRpc,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
        @Inject(FAVORITES_RPC) private readonly favoritesRpc: IPublicFavoriteRpc,
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
    @UseGuards(RemoteAuthGuardOptional)
    @HttpCode(HttpStatus.OK)
    async listProduct(@Request() req: ReqWithRequester, @Query() dto: FilterProductDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterProductDTOSchema.parse(dto);

        const result = await this.repo.list(dto, paging)
        const userId = req.requester?.sub;

        const brandIds = result.data.map(item => item.brandId);
        const categoryIds = result.data.map(item => item.categoryId);
        const productIds = result.data.map(item => item.id);

        const brands = await this.brandRpc.findByIds([...new Set(brandIds)]);
        const categories = await this.categoryRpc.findByIds([...new Set(categoryIds)]);
        const images = await this.imageRpc.getImagesByRefId([...new Set(productIds)], 'product');

        const averageRatings: PublicRating[] = [];
        
        const brandMap: Record<string, PublicBrand> = {};
        const categoriesMap: Record<string, PublicCategory> = {};
        const averageRatingMap: Record<string, PublicRating> = {};
        const imageMap: Record<string, PublicImage[]> = {};
        const favoriteUserProductMap: Record<string, boolean> = {};

        productIds.map(async (productId) => {
            const ratings = await this.ratingRpc.getProductAvgRating(productId);
            if (ratings){
                averageRatings[productId] = ratings;
            } else {
                averageRatings[productId] = {productId: productId, avgRating: 0, totalRating: 0 };
            }
        });

        brands.forEach(brand => {
            brandMap[brand.id] = brand;
        });

        categories.forEach(category => {
            categoriesMap[category.id] = category;
        });

        images.forEach(image => {
            if (!imageMap[image.refId]) {
                imageMap[image.refId] = [];
            }
            imageMap[image.refId].push(image);
        });

        for (const productId of productIds) {
            const isFavorited = await this.favoritesRpc.isProductFavoritedByUser(productId, userId);
            favoriteUserProductMap[productId] = isFavorited;
        }

        productIds.forEach(productId => {
            averageRatingMap[productId] = averageRatings[productId];
        });

        result.data = result.data.map((item) =>{
            const brand = brandMap[item.brandId];
            const category = categoriesMap[item.categoryId];
            const averageRating = averageRatingMap[item.id];
            const images = imageMap[item.id];
            const isFavorited = favoriteUserProductMap[item.id];
            return { ...item, brand, category, averageRating, images, isFavorited } as Product;
        })

        return paginatedResponse(result, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuardOptional)
    @HttpCode(HttpStatus.OK)
    async getProduct(@Request() req: ReqWithRequester, @Param('id') id: string){
        const result = await this.repo.get(id);
        if (!result) {
            return new NotFoundException();
        }

        const brand = await this.brandRpc.findById(result.brandId);
        const category = await this.categoryRpc.findById(result.categoryId);
        let averageRating = await this.ratingRpc.getProductAvgRating(result.id);
        const images = await this.imageRpc.getImagesByRefId([result.id], 'product');
        const isFavorited = await this.favoritesRpc.isProductFavoritedByUser(result.id, req.requester?.sub);
        if (!averageRating) {
            averageRating = { productId: result.id, avgRating: 0, totalRating: 0 };
        } else {
            averageRating = averageRating;
        }

        const data = { ...result, brand, category, averageRating, images, isFavorited } as Product;
        
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

    @Get('search/:keyword')
    @HttpCode(HttpStatus.OK)
    async searchProduct(@Request() req: ReqWithRequester,  @Param('keyword') keyword: string, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);

        const result = await this.repo.listBySearch(keyword, paging);
        const userId = req.requester?.sub;

        const brandIds = result.data.map(item => item.brandId);
        const categoryIds = result.data.map(item => item.categoryId);
        const productIds = result.data.map(item => item.id);

        const brands = await this.brandRpc.findByIds([...new Set(brandIds)]);
        const categories = await this.categoryRpc.findByIds([...new Set(categoryIds)]);
        const images = await this.imageRpc.getImagesByRefId([...new Set(productIds)], 'product');

        const averageRatings: PublicRating[] = [];

        const brandMap: Record<string, PublicBrand> = {};
        const categoriesMap: Record<string, PublicCategory> = {};
        const averageRatingMap: Record<string, PublicRating> = {};
        const imageMap: Record<string, PublicImage[]> = {};
        const favoriteUserProductMap: Record<string, boolean> = {};
        
        productIds.map(async (productId) => {
            const ratings = await this.ratingRpc.getProductAvgRating(productId);
            if (ratings){
                averageRatings[productId] = ratings;
            } else {
                averageRatings[productId] = {productId: productId, avgRating: 0, totalRating: 0 };
            }
        });

        brands.forEach(brand => {
            brandMap[brand.id] = brand;
        });

        categories.forEach(category => {
            categoriesMap[category.id] = category;
        });
        images.forEach(image => {
            if (!imageMap[image.refId]) {
                imageMap[image.refId] = [];
            }
            imageMap[image.refId].push(image);
        });

        for (const productId of productIds) {
            const isFavorited = await this.favoritesRpc.isProductFavoritedByUser(productId, userId);
            favoriteUserProductMap[productId] = isFavorited;
        }

        productIds.forEach(productId => {
            averageRatingMap[productId] = averageRatings[productId];
        });

        result.data = result.data.map((item) =>{
            const brand = brandMap[item.brandId];
            const category = categoriesMap[item.categoryId];
            const averageRating = averageRatings[item.id];
            const images = imageMap[item.id];
            const isFavorited = favoriteUserProductMap[item.id];
            return { ...item, brand, category, averageRating, images, isFavorited } as Product;
        })
        return paginatedResponse(result, {});
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