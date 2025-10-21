import { Injectable } from '@nestjs/common';
import prisma from 'src/share/components/prisma';
import { IProductTokenRepository, ITokenActivationRepository, IAuthenticationLogRepository } from './token.port';
import { AuthenticationLog, ProductToken, TokenActivation, UpdateProductTokenDTO, FilterProductTokenDTO, FilterTokenActivationDTO, UpdateTokenActivationDTO, FilterAuthenticationLogDTO, CreateProductTokenDTO, CreateTokenActivationDTO, CreateAuthenticationLogDTO } from './token.model';
import { PagingDTO, UserRole } from 'src/share';
import { ProductToken as ProductTokenPrisma } from '@prisma/client';

const mapFilterToWhere = (filter: any): any => {
    const where: any = {};
    for (const key in filter) {
        if (filter[key] !== undefined) {
            where[key] = filter[key];
        }
    }
    return where;
};

@Injectable()
export class ProductTokenPrismaRepository implements IProductTokenRepository {

    async get(id: string): Promise<ProductToken | null> {
        const data = await prisma.productToken.findUnique({ where: { id } });
        return data as ProductToken;
    }

    async list(filter: FilterProductTokenDTO, paging: PagingDTO): Promise<ProductToken[]> {
        const where = mapFilterToWhere(filter);

        const skip = (paging.page - 1) * paging.limit;
        
        const data = await prisma.productToken.findMany({
            where,
            take: paging.limit,
            skip,
            orderBy: { createdAt: 'desc' }
        });
        return data as ProductToken[];
    }

    async insert(token: ProductToken): Promise<void> {
        await prisma.productToken.create({ data: token });
    }
    
    async update(id: string, dto: UpdateProductTokenDTO): Promise<void> {
        await prisma.productToken.update({ where: { id }, data: dto });
    }
    
    async delete(id: string): Promise<void> {
        await prisma.productToken.delete({ where: { id } });
    }

    async getBySecurityCode(code: string): Promise<ProductToken | null> {
        const data = await prisma.productToken.findUnique({ where: { securityCode: code } });
        return data as ProductToken;
    }
    
    async updateTransferStatus(tokenId: string, txHash: string, currentOwnerWallet: string): Promise<void> {
        await prisma.productToken.update({
            where: { id: tokenId },
            data: { 
                isTransferred: true, 
                transferTxHash: txHash,
                currentOwnerWallet: currentOwnerWallet
            },
        });
    }
}

@Injectable()
export class TokenActivationPrismaRepository implements ITokenActivationRepository {
    
    async get(id: string): Promise<TokenActivation | null> {
        const data = await prisma.tokenActivation.findUnique({ where: { id } });
        return data as TokenActivation;
    }

    async list(filter: FilterTokenActivationDTO, paging: PagingDTO): Promise<TokenActivation[]> {
        const where = mapFilterToWhere(filter);

        const skip = (paging.page - 1) * paging.limit;
        
        const data = await prisma.tokenActivation.findMany({
            where,
            take: paging.limit,
            skip,
            orderBy: { activatedAt: 'desc' }
        });
        return data as TokenActivation[];
    }
    
    async insert(activation: TokenActivation): Promise<void> {
        await prisma.tokenActivation.create({ data: activation });
    }
    
    async update(id: string, dto: UpdateTokenActivationDTO): Promise<void> {
        await prisma.tokenActivation.update({ where: { id }, data: dto });
    }

    async getActivationByTokenId(tokenId: string): Promise<TokenActivation | null> {
        const data = await prisma.tokenActivation.findUnique({ where: { productTokenId: tokenId } });
        return data as TokenActivation;
    }
    
    async getActivationByTxHash(txHash: string): Promise<TokenActivation | null> {
        const data = await prisma.tokenActivation.findUnique({ where: { transferTxHash: txHash } });
        return data as TokenActivation;
    }
}

@Injectable()
export class AuthenticationLogPrismaRepository implements IAuthenticationLogRepository {
    
    async get(id: string): Promise<AuthenticationLog | null> {
        const data = await prisma.authenticationLog.findUnique({ where: { id } });
        return data as AuthenticationLog;
    }
    
    async list(filter: FilterAuthenticationLogDTO, paging: PagingDTO): Promise<AuthenticationLog[]> {
        const where = mapFilterToWhere(filter);

        const skip = (paging.page - 1) * paging.limit;
        
        const data = await prisma.authenticationLog.findMany({
            where,
            take: paging.limit,
            skip,
            orderBy: { checkedAt: 'desc' }
        });
        return data as AuthenticationLog[];
    }
    
    async insert(log: AuthenticationLog): Promise<void> {
        await prisma.authenticationLog.create({ data: log });
    }
}