import { Inject, Injectable } from '@nestjs/common';
import { v7 } from 'uuid';
import { AUTHENTICATIONLOG_REPOSITORY, TOKEN_ACTIVATION_REPOSITORY, TOKEN_REPOSITORY, TOKEN_SERVICE } from './token.di-token';
import { ITokenService, IProductTokenRepository, ITokenActivationRepository, IAuthenticationLogRepository } from './token.port';
import { AppError, ErrForbidden, UserRole, Requester, PagingDTO } from 'src/share';
import {
    ErrProductTokenNotFound, ErrProductTokenExist, ErrTokenActivationNotFound, ErrTokenActivationExist,
    TokenActivationDTO, CheckTokenAuthenticityDTO, AuthenticationLog, TokenActivation,
    CreateProductTokenDTO, UpdateProductTokenDTO, FilterProductTokenDTO,
    FilterTokenActivationDTO, FilterAuthenticationLogDTO, ProductToken,
    AuthenticationLog as AuthLogModel,
} from './token.model';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        
        @Inject(TOKEN_REPOSITORY) private readonly tokenRepo: IProductTokenRepository,
        @Inject(TOKEN_ACTIVATION_REPOSITORY) private readonly activationRepo: ITokenActivationRepository,
        @Inject(AUTHENTICATIONLOG_REPOSITORY) private readonly authLogRepo: IAuthenticationLogRepository,
        
    ) {}
    async createProductToken(requester: Requester, dto: CreateProductTokenDTO): Promise<string> {
        if (requester.role !== UserRole.ADMIN) {
            throw AppError.from(ErrForbidden, 403);
        }
    
        const newToken: ProductToken = {
            id: v7(),
            ...dto,
            isTransferred: false,
            isAuthentic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.tokenRepo.insert(newToken);
        return newToken.id;
    }

    async updateProductToken(requester: Requester, tokenId: string, dto: UpdateProductTokenDTO): Promise<void> {
        if (requester.role !== UserRole.ADMIN) {
            throw AppError.from(ErrForbidden, 403);
        }

        const token = await this.tokenRepo.get(tokenId);
        if (!token) {
            throw AppError.from(ErrProductTokenNotFound, 404);
        }
        
        await this.tokenRepo.update(tokenId, dto);
    }

    async listProductTokens(requester: Requester, filter: FilterProductTokenDTO, paging: PagingDTO): Promise<ProductToken[]> {
        if (requester.role !== UserRole.ADMIN) {
            throw AppError.from(ErrForbidden, 403);
        }
        // Thêm logic filter/paging vào repo
        return this.tokenRepo.list(filter, paging);
    }
    
    // Signature now matches ITokenService (TokenActivationDTO)
    async activateToken(requesterId: string, dto: TokenActivationDTO): Promise<string> {
        // 1. Tìm ProductToken bằng SecurityCode
        const productToken = await this.tokenRepo.getBySecurityCode(dto.securityCode);
        if (!productToken) {
            throw AppError.from(ErrProductTokenNotFound, 404);
        }

        // 2. Kiểm tra Token đã được kích hoạt chưa (dùng activationRepo)
        const existingActivation = await this.activationRepo.getActivationByTokenId(productToken.id);
        if (existingActivation) {
            throw AppError.from(ErrTokenActivationExist, 400);
        }
        
        // 3. Tạo bản ghi kích hoạt
        const activationId = v7();
        const newActivation: TokenActivation = {
            id: activationId,
            securityCode: dto.securityCode,
            productTokenId: productToken.id,
            activatorUserId: requesterId,
            recipientWallet: dto.recipientWallet,
            isTransferComplete: false,
            transferTxHash: null,
            activatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.activationRepo.insert(newActivation);
        
        // TODO: Bắn sự kiện Redis/Kafka để Blockchain Service xử lý chuyển giao NFT
        // Ví dụ: this.eventBus.emit('nft.transfer.request', { activationId, wallet: dto.recipientWallet });

        return activationId;
    }
    
    async handleTransferCallback(txHash: string): Promise<void> {
        // 1. Tìm bản ghi Activation dựa trên TxHash
        const activation = await this.activationRepo.getActivationByTxHash(txHash);
        if (!activation) {
             throw AppError.from(new Error('Activation not found for TxHash'), 404);
        }

        // 2. Cập nhật trạng thái Activation
        await this.activationRepo.update(activation.id, { isTransferCompleted: true });

        // 3. Cập nhật ProductToken (đánh dấu đã chuyển)
        const productToken = await this.tokenRepo.get(activation.productTokenId);
        if (!productToken) {
             throw AppError.from(ErrProductTokenNotFound, 404);
        }
        
        await this.tokenRepo.updateTransferStatus(
            activation.productTokenId, 
            txHash, 
            activation.recipientWallet // Wallet mới
        );
    }

    async listTokenActivations(requester: Requester, filter: FilterTokenActivationDTO, paging: PagingDTO): Promise<TokenActivation[]> {
        if (requester.role !== UserRole.ADMIN) {
            throw AppError.from(ErrForbidden, 403);
        }
        return this.activationRepo.list(filter, paging);
    }
    
    // =========================================================================
    // AUTHENTICITY CHECK LOGIC (Public/Internal RPC)
    // =========================================================================

    async checkAuthenticity(dto: CheckTokenAuthenticityDTO): Promise<{ isGenuine: boolean, productTokenId: string }> {
        const productToken = await this.tokenRepo.getBySecurityCode(dto.securityCode);
        
        // Token được coi là hợp lệ nếu tìm thấy và cờ isAuthentic là TRUE
        const isGenuine = !!productToken && productToken.isAuthentic;
        
        // 1. Ghi Log xác thực (AuthenticationLog)
        const log: AuthLogModel = {
            id: v7(),
            securityCode: dto.securityCode,
            productTokenId: productToken?.id || '00000000-0000-0000-0000-000000000000', // Dùng ID placeholder nếu không tìm thấy
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
            isSuspicious: false, // Cần logic phát hiện suspicious
            isGenuine: isGenuine,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.authLogRepo.insert(log);

        return { isGenuine, productTokenId: productToken?.id || '' };
    }

    async listAuthenticationLogs(requester: Requester, filter: FilterAuthenticationLogDTO, paging: PagingDTO): Promise<AuthLogModel[]> {
        // Chỉ Admin mới được quyền truy vấn Log
        if (requester.role !== UserRole.ADMIN) {
             throw AppError.from(ErrForbidden, 403);
        }
        // Gọi AuthLog Repository
        return this.authLogRepo.list(filter, paging);
    }
}