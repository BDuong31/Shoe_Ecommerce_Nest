import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AppError, ErrNotFound, paginatedResponse, PagingDTO, ReqWithRequester, UserRole } from "src/share";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { AUTHENTICATIONLOG_REPOSITORY, TOKEN_ACTIVATION_REPOSITORY, TOKEN_REPOSITORY, TOKEN_SERVICE } from "./token.di-token";
import { ITokenService, ITokenActivationRepository, IAuthenticationLogRepository, IProductTokenRepository } from "./token.port";
import {
    CreateProductTokenDTO, UpdateProductTokenDTO, FilterProductTokenDTO, FilterTokenActivationDTO,
    TokenActivationDTO, CheckTokenAuthenticityDTO, FilterAuthenticationLogDTO,
} from "./token.model";

@Controller('v1/tokens')
export class TokenHttpController {
    constructor(
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
        @Inject(TOKEN_REPOSITORY) private readonly tokenRepo: IProductTokenRepository,
        @Inject(TOKEN_ACTIVATION_REPOSITORY) private readonly activationRepo: ITokenActivationRepository,
        @Inject(AUTHENTICATIONLOG_REPOSITORY) private readonly authLogRepo: IAuthenticationLogRepository,
    ) {}
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createProductToken(@Request() req: ReqWithRequester, @Body() dto: CreateProductTokenDTO) {
        const data = await this.tokenService.createProductToken(req.requester, dto);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateProductToken(@Request() req: ReqWithRequester, @Param('id') id: string, @Body() dto: UpdateProductTokenDTO) {
        await this.tokenRepo.update(id, dto); 
        return { message: 'Token updated successfully' };
    }

    @Get('list')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listProductTokens(@Request() req: ReqWithRequester, @Query() filter: FilterProductTokenDTO, @Query() paging: PagingDTO) {
        const data = await this.tokenService.listProductTokens(req.requester, filter, paging);
        return { data }; 
    }
    
    @Post('activate')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async activateToken(@Request() req: ReqWithRequester, @Body() dto: TokenActivationDTO) {
        const activationId = await this.tokenService.activateToken(req.requester.sub, dto);
        return { activationId, message: 'Token activation requested. NFT transfer processing.' };
    }

    // API: Lấy danh sách Token Activations (Chỉ Admin)
    @Get('activations')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listActivations(@Request() req: ReqWithRequester, @Query() filter: FilterTokenActivationDTO, @Query() paging: PagingDTO) {
        const data = await this.activationRepo.list(filter, paging);
        return { data };
    }

    // API: Webhook Callback cho việc chuyển NFT hoàn tất (Internal/Blockchain Service)
    @Post('callback/transfer/:txHash')
    @HttpCode(HttpStatus.OK)
    async handleTransferCallback(@Param('txHash') txHash: string) {
        // Gọi service để xử lý callback và cập nhật trạng thái
        await this.tokenService.handleTransferCallback(txHash);
        return { message: 'Transfer status updated' };
    }
}

// Lớp TokenRpcHttpController cung cấp các phương thức xử lý RPC nội bộ và kiểm tra công khai
@Controller('v1/rpc/tokens')
export class TokenRpcHttpController {
    constructor(
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
        // FIX: Removed unused/undefined injection for AUTHENTICATIONLOG_SERVICE. AuthLog logic is routed through ITokenService.
    ) {}
    
    // =========================================================================
    // AUTHENTICITY CHECK (Public RPC)
    // =========================================================================

    // API: Kiểm tra xác thực (Public/Thường là QR code scanner gọi)
    @Post('authenticity')
    @HttpCode(HttpStatus.OK)
    async checkAuthenticity(@Body() dto: CheckTokenAuthenticityDTO) {
        // Gọi service để kiểm tra tính xác thực và ghi log
        // Lưu ý: ipAddress và userAgent cần được lấy từ HTTP request context, không chỉ từ Body nếu là gRPC.
        const { isGenuine, productTokenId } = await this.tokenService.checkAuthenticity(dto);
        return { data: { isGenuine, productTokenId } };
    }

    // API: Lấy danh sách Authentication Logs (Chỉ Admin)
    @Get('admin/auth-logs')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listAuthLogs(@Request() req: ReqWithRequester, @Query() filter: FilterAuthenticationLogDTO, @Query() paging: PagingDTO) {
        // Gọi service để lấy danh sách log
        const data = await this.tokenService.listAuthenticationLogs(req.requester, filter, paging);
        return { data };
    }
}