import { PublicProduct, PublicVariant } from 'src/share';
import { check, z } from 'zod';

export const ProductTokenSchema = z.object({
    id: z.string().uuid(),
    securityCode: z.string().min(1),
    tokenId: z.string(),
    contractAddress: z.string().min(1),

    mintTxHash: z.string(),
    metadataCid: z.string().min(1),
    isTransferred: z.boolean().default(false),
    transferTxHash: z.string().optional(),
    initialOwnerWallet: z.string(),
    currentOwnerWallet: z.string(),
    isAuthentic: z.boolean().default(true),
    variantId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ProductToken = z.infer<typeof ProductTokenSchema> & { Product?: PublicProduct, Variant?: PublicVariant};

export const CreateProductTokenDTOSchema = z.object({
    securityCode: z.string().min(1),
    tokenId: z.string(),
    contractAddress: z.string().min(1),
    
    mintTxHash: z.string(),
    metadataCid: z.string().min(1),
    initialOwnerWallet: z.string(),
    currentOwnerWallet: z.string(),
    variantId: z.string().uuid(),
})

export type CreateProductTokenDTO = z.infer<typeof CreateProductTokenDTOSchema>;

export const UpdateProductTokenDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    tokenId: z.string().optional(),
    contractAddress: z.string().min(1).optional(),
    
    mintTxHash: z.string().optional(),
    metadataCid: z.string().min(1).optional(),
    isTransferred: z.boolean().optional(),
    transferTxHash: z.string().optional(),
    initialOwnerWallet: z.string().optional(),
    currentOwnerWallet: z.string().optional(),
    isAuthentic: z.boolean().optional(),
    variantId: z.string().uuid().optional(),
})

export type UpdateProductTokenDTO = z.infer<typeof UpdateProductTokenDTOSchema>;

export const FilterProductTokenDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    tokenId: z.string().optional(),
    contractAddress: z.string().min(1).optional(),
    
    mintTxHash: z.string().optional(),
    metadataCid: z.string().min(1).optional(),
    isTransferred: z.boolean().optional(),
    transferTxHash: z.string().optional(),
    initialOwnerWallet: z.string().optional(),
    currentOwnerWallet: z.string().optional(),
    isAuthentic: z.boolean().optional(),
    variantId: z.string().uuid().optional(),
})

export type FilterProductTokenDTO = z.infer<typeof FilterProductTokenDTOSchema>;

export const TokenActivationSchema = z.object({
    id: z.string().uuid(),
    securityCode: z.string().min(1),
    productTokenId: z.string().uuid(),
    activatorUserId: z.string().uuid(),
    recipientWallet: z.string().min(1),
    isTransferComplete: z.boolean().default(false),
    transferTxHash: z.string().optional(),
    activatedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type TokenActivation = z.infer<typeof TokenActivationSchema> &{ ProductToken?: ProductToken};

export const CreateTokenActivationDTOSchema = z.object({
    securityCode: z.string().min(1),
    ProductTokenId: z.string().uuid(),
    activatorUserId: z.string().uuid(),
    recipientWallet: z.string().min(1), // FIX: Renamed from recipienWallet
    activateAt: z.date(),
})

export type CreateTokenActivationDTO = z.infer<typeof CreateTokenActivationDTOSchema>;

export const UpdateTokenActivationDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    ProductTokenId: z.string().uuid().optional(),
    activatorUserId: z.string().uuid().optional(),
    recipientWallet: z.string().min(1).optional(), // FIX: Renamed from recipienWallet
    isTransferCompleted: z.boolean().optional(),
    transferTxHash: z.string().optional(),
    activateAt: z.date().optional(),
})

export type UpdateTokenActivationDTO = z.infer<typeof UpdateTokenActivationDTOSchema>;

export const FilterTokenActivationDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    ProductTokenId: z.string().uuid().optional(),
    activatorUserId: z.string().uuid().optional(),
    recipientWallet: z.string().min(1).optional(), // FIX: Renamed from recipienWallet
    isTransferCompleted: z.boolean().optional(),
    transferTxHash: z.string().optional(),
    activateAt: z.date().optional(),
})

export type FilterTokenActivationDTO = z.infer<typeof FilterTokenActivationDTOSchema>;
export const AuthenticationLogSchema = z.object({
    id: z.string().uuid(),
    securityCode: z.string().min(1),
    ipAddress: z.string().min(1),
    userAgent: z.string().min(1),
    isSuspicious: z.boolean().default(true),
    isGenuine: z.boolean().default(false),
    productTokenId: z.string().uuid(),
    checkedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type AuthenticationLog = z.infer<typeof AuthenticationLogSchema> & { ProductToken?: ProductToken};

export const CreateAuthenticationLogDTOSchema = z.object({
    securityCode: z.string().min(1),
    ipAddress: z.string().min(1),
    userAgent: z.string().min(1),
    isSuspicious: z.boolean().default(true),
    isGenuine: z.boolean().default(false),
    ProductTokenId: z.string().uuid(),
    checkedAt: z.date(),
})

export type CreateAuthenticationLogDTO = z.infer<typeof CreateAuthenticationLogDTOSchema>;

export const UpdateAuthenticationLogDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    ipAddress: z.string().min(1).optional(),
    userAgent: z.string().min(1).optional(),
    isSuspicious: z.boolean().optional(),
    isGenuine: z.boolean().optional(),
    ProductTokenId: z.string().uuid().optional(),
    checkedAt: z.date().optional(),
})

export type UpdateAuthenticationLogDTO = z.infer<typeof UpdateAuthenticationLogDTOSchema>;

export const FilterAuthenticationLogDTOSchema = z.object({
    securityCode: z.string().min(1).optional(),
    ipAddress: z.string().min(1).optional(),
    userAgent: z.string().min(1).optional(),
    isSuspicious: z.boolean().optional(),
    isGenuine: z.boolean().optional(),
    ProductTokenId: z.string().uuid().optional(),
    checkedAt: z.date().optional(),
})

export type FilterAuthenticationLogDTO = z.infer<typeof FilterAuthenticationLogDTOSchema>;

export const ErrProductTokenNotFound = new Error('Product token not found');
export const ErrProductTokenExist = new Error('Product token already exists');

export const ErrTokenActivationNotFound = new Error('Token activation not found');
export const ErrTokenActivationExist = new Error('Token activation already exists');

export const ErrAuthenticationLogNotFound = new Error('Authentication log not found');
export const ErrAuthenticationLogExist = new Error('Authentication log already exists');

export interface CheckTokenAuthenticityDTO {
    securityCode: string;
    ipAddress: string;
    userAgent?: string;
}

export const tokenActivationDTOSchema = z.object({
    securityCode: z.string().min(1),
    recipientWallet: z.string().min(1),
}).required();
export interface TokenActivationDTO extends z.infer<typeof tokenActivationDTOSchema> {}