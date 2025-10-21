import { Requester, PagingDTO } from 'src/share';
import { AuthenticationLog, ProductToken, TokenActivation, TokenActivationDTO, CheckTokenAuthenticityDTO, CreateProductTokenDTO, UpdateProductTokenDTO, FilterProductTokenDTO, CreateTokenActivationDTO, UpdateTokenActivationDTO, FilterTokenActivationDTO, CreateAuthenticationLogDTO, UpdateAuthenticationLogDTO, FilterAuthenticationLogDTO } from './token.model';
export interface ITokenService {
    createProductToken(requester: Requester, dto: CreateProductTokenDTO): Promise<string>;
    listProductTokens(requester: Requester, filter: FilterProductTokenDTO, paging: PagingDTO): Promise<ProductToken[]>;

    activateToken(requesterId: string, dto: TokenActivationDTO): Promise<string>;

    handleTransferCallback(txHash: string): Promise<void>;

    checkAuthenticity(dto: CheckTokenAuthenticityDTO): Promise<{ isGenuine: boolean, productTokenId: string }>;

    listAuthenticationLogs(requester: Requester, filter: FilterAuthenticationLogDTO, paging: PagingDTO): Promise<AuthenticationLog[]>;
}

export interface IProductTokenRepository {
    get(id: string): Promise<ProductToken | null>;
    list(filter: FilterProductTokenDTO, paging: PagingDTO): Promise<ProductToken[]>;
    insert(token: ProductToken): Promise<void>;
    update(id: string, dto: UpdateProductTokenDTO): Promise<void>;
    delete(id: string): Promise<void>;
    
    getBySecurityCode(code: string): Promise<ProductToken | null>;
    updateTransferStatus(tokenId: string, txHash: string, currentOwnerWallet: string): Promise<void>;
}

export interface ITokenActivationRepository {
    get(id: string): Promise<TokenActivation | null>;
    list(filter: FilterTokenActivationDTO, paging: PagingDTO): Promise<TokenActivation[]>;
    insert(activation: TokenActivation): Promise<void>;
    update(id: string, dto: UpdateTokenActivationDTO): Promise<void>;
    
    getActivationByTokenId(tokenId: string): Promise<TokenActivation | null>;
    getActivationByTxHash(txHash: string): Promise<TokenActivation | null>;
}

export interface IAuthenticationLogRepository {
    // AuthenticationLog CRUD
    get(id: string): Promise<AuthenticationLog | null>;
    list(filter: FilterAuthenticationLogDTO, paging: PagingDTO): Promise<AuthenticationLog[]>;
    insert(log: AuthenticationLog): Promise<void>;
}