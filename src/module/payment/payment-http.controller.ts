import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PAYMENT_REPOSITORY, PAYMENT_SERVICE } from "./payment.di-token";
import { IPaymentRepository, IPaymentService } from "./payment.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { IPublicUserRpc, paginatedResponse, PagingDTO, pagingDTOSchema, Requester, ReqWithRequester, UserRole } from "src/share";
import { CreatePaymentDTO, FilterPaymentDTO, FilterPaymentSchema } from "./payment.model";

@Controller('v1/payments')
export class PaymentHttpController {
    constructor(
        @Inject(PAYMENT_SERVICE) private readonly service: IPaymentService,
        @Inject(PAYMENT_REPOSITORY) private readonly repo: IPaymentRepository,
    ) {}

    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPayment(@Request() req: ReqWithRequester, @Body() dto: CreatePaymentDTO, requester: Requester) {
        const paymentId = await this.service.create(dto);
        return { id: paymentId };
    }

    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listPayment(@Request() req: ReqWithRequester, @Query() dto: FilterPaymentDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = FilterPaymentSchema.parse(dto);
        const data = await this.repo.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getPayment(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updatePayment(@Request() req: ReqWithRequester, @Param('id') id: string,  @Body() dto: CreatePaymentDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deletePayment(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }

    @Post('rpc/by-list-ids')
    @HttpCode(HttpStatus.OK)
    async getPaymentsByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const data = await this.repo.listByIds(dto.ids);
        return { data };
    }

    @Post('rpc/:id')
    @HttpCode(HttpStatus.OK)
    async getPaymentById(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }
}