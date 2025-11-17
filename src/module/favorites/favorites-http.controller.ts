import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { FAVORITES_REPOSITORY, FAVORITES_SERVICE } from "./favorites.di-token";
import { IFavoriteRepository, IFavoriteService } from "./favorites.port";
import { RemoteAuthGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester } from "src/share";
import { CreateFavoriteDTO, FilterFavoriteDTO, filterFavoriteDTOSchema } from "./favorites.model";

@Controller('v1/favorites')
export class FavoriteHttpController {
    constructor(
        @Inject(FAVORITES_SERVICE) private readonly service: IFavoriteService,
        @Inject(FAVORITES_REPOSITORY) private readonly repo: IFavoriteRepository,
    ){}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createFavorites(@Request() req: ReqWithRequester, @Body() dto: CreateFavoriteDTO){
        const data = await this.service.create(dto, req.requester)
        return { data };
    }

    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listFavorites(@Request() req: ReqWithRequester, @Query() dto: FilterFavoriteDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging)
        dto = filterFavoriteDTOSchema.parse(dto)
        const data = await this.repo.list(dto, paging, req.requester)
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getFavorites(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data }
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteFavorites(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data }
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getFavoriteById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/is-favorited')
    @HttpCode(HttpStatus.OK)
    async isProductFavoritedByUser(@Request() req: ReqWithRequester, @Body() dto: FilterFavoriteDTO) {
        dto = filterFavoriteDTOSchema.parse(dto);
        const data = await this.repo.isProductFavoritedByUser(dto.productId, dto.userId);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listFavoriteByIds(@Request() req: ReqWithRequester, @Body() dto: {ids: string[]}){
        const data = await this.repo.listByIds(dto.ids)
        return { data }
    }
}