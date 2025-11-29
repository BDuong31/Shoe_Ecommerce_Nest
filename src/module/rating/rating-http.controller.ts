import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { RATING_REPOSITORY, RATING_SERVICE } from "./rating.di-token";
import { IRatingRepository, IRatingService } from "./rating.port";
import { RemoteAuthGuard, RolesGuard } from "src/share/guard";
import { IPublicImageRpc, IPublicUserRpc, paginatedResponse, PagingDTO, pagingDTOSchema, PublicImage, PublicUser, ReqWithRequester, UserRole } from "src/share";
import { CreateReviewDTO, FilterReviewDTO, FilterReviewDTOSchema, Review } from "./rating.model";
import { IMAGE_RPC, USER_RPC } from "src/share/di-token";
import { IMAGE_REPOSITORY } from "../image/image.di-token";

@Controller('v1/ratings')
export class RatingHttpController {
    constructor(
        @Inject(RATING_SERVICE) private readonly service: IRatingService,
        @Inject(RATING_REPOSITORY) private readonly repo: IRatingRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createReview(@Body() dto: CreateReviewDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listReview(@Request() req: ReqWithRequester, @Query() dto: FilterReviewDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = FilterReviewDTOSchema.parse(dto)

        const result = await this.repo.list(dto, paging);

        const UserIds = result.data.map(item => item.userId);
        const RatingIds = result.data.map(item => item.id);

        const users = await this.userRpc.findByIds([...new Set(UserIds)]);
        const images = await this.imageRpc.getImagesByRefId([...new Set(RatingIds)], 'rating');

        const userMap: Record<string, PublicUser> = {};
        const imageMap: Record<string, PublicImage[]> = {};
        users.forEach(user => {
            userMap[user.id] = user;
        })
        result.data.forEach(rating => {
            imageMap[rating.id] = images.filter(img => img.refId === rating.id);
        });

        result.data = result.data.map((item) => {
            const user = userMap[item.userId];
            const images = imageMap[item.id];
            return { ...item, user, images } as Review;
        })
        return paginatedResponse(result, dto);
    }

    @Get('check-exist/:productId')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async checkReviewExist(@Request() req: ReqWithRequester, @Param('productId') productId: string){
        const id = req.requester.sub;
        const data = await this.repo.checkReviewExist(id, productId);
        return { data };
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getReview(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateReview(@Param('id') id: string,  @Body() dto: CreateReviewDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteReview(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc')
    @HttpCode(HttpStatus.OK)
    async createReviewRpc(@Body() dto: CreateReviewDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getReviewById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listReviewsByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }

    @Get('rpc/average-rating/:productId')
    @HttpCode(HttpStatus.OK)
    async getAverageRating(@Param('productId') productId: string){
        const data = await this.repo.getAverageRatingByProduct(productId);
        return { data };
    }
}  