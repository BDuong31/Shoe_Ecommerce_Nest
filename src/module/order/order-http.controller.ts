import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ORDER_REPOSITORY, ORDER_SERVICE, ORDER_ITEM_REPOSITORY, ORDER_ITEM_SERVICE, ORDER_COUPON_SERVICE, ORDER_COUPON_REPOSITORY } from "./order.di-token";
import { IOrderRepository, IOrderService, IOrderItemRepository, IOrderItemService, IOrderCouponService, IOrderCouponRepository } from "./order.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CreateOrderCouponDTO, CreateOrderDTO, CreateOrderItemDTO, FilterOrderDTO, FilterOrderItemDTO, FilterOrderItemSchema, FilterOrderSchema, UpdateOrderStatusDTO } from "./order.model";

@Controller('v1/orders')
export class OrderHttpController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly service: IOrderService,
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
        @Inject(ORDER_ITEM_SERVICE) private readonly orderItemService: IOrderItemService,
        @Inject(ORDER_ITEM_REPOSITORY) private readonly orderItemRepo: IOrderItemRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createOrder(@Request() req: ReqWithRequester, @Body() dto: CreateOrderDTO){
        const data = await this.service.create(dto, req.requester);
        return { data };
    }

    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrder(@Request() req: ReqWithRequester, @Query() dto: FilterOrderDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = FilterOrderSchema.parse(dto);
        const data = await this.orderRepo.list(dto, paging, req.requester);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrder(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.orderRepo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateOrder(@Param('id') id: string,  @Body() dto: UpdateOrderStatusDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteOrder(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listOrderByIds(@Body('ids') ids: string[]){
        const data = await this.orderRepo.listByIds(ids);
        return { data: data };
    }

    @Post('rpc/list-by-user/:userId')
    @HttpCode(HttpStatus.OK)
    async listOrdersByUser(@Request() req: ReqWithRequester, @Param('userId') userId: string){
        const paging: PagingDTO = { page: 1, limit: 10 };
        const data = await this.orderRepo.list({ userId: userId }, paging, req.requester);
        return { data };
    }
    
    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getOrderById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.orderRepo.get(id);
        return { data };
    }
}

@Controller('v1/orders/items')
export class OrderItemHttpController {
    constructor(
        @Inject(ORDER_ITEM_SERVICE) private readonly service: IOrderItemService,
        @Inject(ORDER_ITEM_REPOSITORY) private readonly repo: IOrderItemRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createOrderItem(@Body() dto: CreateOrderItemDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get('list')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItem(@Request() req: ReqWithRequester, @Query() dto: FilterOrderItemDTO){
        dto = FilterOrderItemSchema.parse(dto);
        const data = await this.repo.listByOrderId(dto);
        return { data };
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderItem(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteOrderItem(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc')
    @HttpCode(HttpStatus.OK)
    async createOrderItemRpc(@Request() req: ReqWithRequester, @Body() dto: CreateOrderItemDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getOrderItemById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Post('rpc/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listOrderItemsByIds(@Body('ids') ids: string[]){
        const data = await this.repo.listByIds(ids);
        return { data };
    }
}

@Controller('v1/orders/coupons')
export class OrderCouponHttpController {
    constructor(
        @Inject(ORDER_COUPON_SERVICE) private readonly service: IOrderCouponService,
        @Inject(ORDER_COUPON_REPOSITORY) private readonly repo: IOrderCouponRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async applyCouponToOrder(@Body() dto: CreateOrderCouponDTO){
        await this.service.create(dto);
        return { data: true };
    }

    @Get(':orderId')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCouponOfOrder(@Request() req: ReqWithRequester, @Param('orderId') orderId: string){
        const data = await this.repo.get(orderId);
        return { data };
    }

    @Delete(':orderId')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async removeCouponFromOrder(@Param('orderId') orderId: string){
        await this.service.delete(orderId);
        return { data: true };
    }

    @Post('rpc')
    @HttpCode(HttpStatus.OK)
    async createOrderCouponRpc(@Request() req: ReqWithRequester, @Body() dto: CreateOrderCouponDTO){
        const data = await this.service.create(dto);
        return { data };
    }

    @Get('rpc/:orderId')
    @HttpCode(HttpStatus.OK)
    async getOrderCouponRpc(@Request() req: ReqWithRequester, @Param('orderId') orderId: string){
        const data = await this.repo.get(orderId);
        return { data };
    }

    @Delete('rpc/:orderId')
    @HttpCode(HttpStatus.OK)
    async deleteOrderCouponRpc(@Request() req: ReqWithRequester, @Param('orderId') orderId: string){
        const data = await this.service.delete(orderId);
        return { data };
    }
}