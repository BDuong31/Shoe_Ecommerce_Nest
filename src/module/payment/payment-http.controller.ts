import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PAYMENT_REPOSITORY, PAYMENT_SERVICE } from "./payment.di-token";
import { IPaymentRepository, IPaymentService } from "./payment.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { IPublicUserRpc, paginatedResponse, PagingDTO, pagingDTOSchema, Requester, ReqWithRequester, UserRole } from "src/share";
import { CreatePaymentDTO, FilterPaymentDTO, FilterPaymentSchema, InitiatePaymentDTO, InitiatePaymentSchema } from "./payment.model";
import { ConfigService } from '@nestjs/config';

@Controller('v1/payments')
export class PaymentHttpController {
    constructor(
        @Inject(PAYMENT_SERVICE) private readonly service: IPaymentService,
        @Inject(PAYMENT_REPOSITORY) private readonly repo: IPaymentRepository,
        private readonly configService: ConfigService, 
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

    @Post('initiate')
    @UseGuards(RemoteAuthGuard) 
    @HttpCode(HttpStatus.OK)
    async initiatePayment(@Request() req: ReqWithRequester, @Body() dto: InitiatePaymentDTO) {
        const data = InitiatePaymentSchema.parse(dto);
        const response = await this.service.initiatePayment(data, req.requester);
        return response;
    }

    @Get('webhook/vnpay') 
    @HttpCode(HttpStatus.OK)
    async handleVnpayWebhook(@Query() query: any) {
        const isValid = await this.service.handleWebhook('VNPAY', {}, query);
        const returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');
        if (!isValid) return { RspCode: '97', Message: 'Invalid Signature' };
        return { RspCode: '00', Message: 'Success' };
    }

    @Post('webhook/momo')
    @HttpCode(HttpStatus.OK)
    async handleMomoWebhook(@Body() payload: any) {
        const isValid = await this.service.handleWebhook('MOMO', payload, payload);
        if (!isValid) return { resultCode: 1, message: 'Invalid Signature' };
        return { resultCode: 0, message: 'Success' };
    }

    @Post('webhook/zalopay')
    @HttpCode(HttpStatus.OK)
    async handleZalopayWebhook(@Body() payload: any) {
        const isValid = await this.service.handleWebhook('ZALOPAY', payload, payload);
        if (!isValid) return { return_code: -1, return_message: "Invalid Signature" };
        return { return_code: 1, return_message: "Success" };
    }
}