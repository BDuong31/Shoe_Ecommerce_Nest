import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CART_REPOSITORY, CART_SERVICE, CART_ITEM_REPOSITORY, CART_ITEM_SERVICE } from "./cart.di-token";
import { ICartItemRepository, ICartItemService, ICartRepository, ICartService } from "./cart.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CartItem, CreateCartDTO, FilterCartItemDTO, filterCartItemDTOSchema, UpdateCartItemDTO } from "./cart.model";

@Controller('v1/carts')
export class CartHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly service: ICartService,
        @Inject(CART_REPOSITORY) private readonly repo: ICartRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createCart(@Body() dto: CreateCartDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCart(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateCart(@Param('id') id: string,  @Body() dto: CreateCartDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteCart(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getCartById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }
}

@Controller('v1/carts/items')
export class CartItemHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly service: ICartService,
        @Inject(CART_REPOSITORY) private readonly repo: ICartRepository,
        @Inject(CART_ITEM_REPOSITORY) private readonly cartItemRepo: ICartItemRepository,
        @Inject(CART_ITEM_SERVICE) private readonly cartItemService: ICartItemService,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createCartItem(@Body() dto: CartItem){
        const data = await this.cartItemService.create(dto);
        return { data };
    }

    @Get('list')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItems(@Request() req: ReqWithRequester, @Query() dto: FilterCartItemDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterCartItemDTOSchema.parse(dto);

        const data = await this.cartItemRepo.list(dto, paging);

        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCartItem(@Param('id') id: string){
        const data = await this.cartItemRepo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateCartItem(@Param('id') id: string,  @Body() dto: UpdateCartItemDTO){
        const data = await this.cartItemService.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteCartItem(@Param('id') id: string){
        const data = await this.cartItemService.delete(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartItemsByIds(@Request() req: ReqWithRequester, @Body() body: { ids: string[] }){
        const data = await this.cartItemRepo.listByIds(body.ids);
        return { data };
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getCartItemById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.cartItemRepo.get(id);
        return { data };
    }
}