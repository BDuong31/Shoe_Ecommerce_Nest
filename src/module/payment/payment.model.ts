import { z } from 'zod';

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export const ErrPaymentNotFound = new Error('ErrPaymentNotFound');
export const ErrPaymentAlreadyExists = new Error('ErrPaymentAlreadyExists');
export const ErrPaymentInvalidStatus = new Error('ErrPaymentInvalidStatus');
export const ErrPaymentInsufficientAmount = new Error('ErrPaymentInsufficientAmount');
export const ErrPaymentMethodNotSupported = new Error('ErrPaymentMethodNotSupported');
export const ErrPaymentOrderMismatch = new Error('ErrPaymentOrderMismatch');
export const ErrPaymentUnauthorized = new Error('ErrPaymentUnauthorized');


export const PaymentsSchema = z.object({
    id: z.string().uuid(),
    method: z.string().min(1).max(50),
    amount: z.number().nonnegative(),
    status: z.nativeEnum(TransactionStatus),
    orderId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Payment = z.infer<typeof PaymentsSchema>;

export const CreatePaymentSchema = PaymentsSchema.pick({
    method: true,
    amount: true,
    orderId: true,
})

export type CreatePaymentDTO = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = PaymentsSchema.partial().pick({
    method: true,
    amount: true,
    status: true,
})

export type UpdatePaymentDTO = z.infer<typeof UpdatePaymentSchema>;

export const FilterPaymentSchemaTable = z.object({
    orderId: z.string().uuid().optional(),
    method: z.string().min(1).max(50).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
})

export const FilterPaymentSchema = FilterPaymentSchemaTable.partial().pick({
    orderId: true,
    method: true,
    status: true,
    minAmount: true,
    maxAmount: true,
})

export type FilterPaymentDTO = z.infer<typeof FilterPaymentSchema>;

export const InitiatePaymentSchemaTable = z.object({
    paymentId: z.string().uuid(),
    method: z.string().min(1).max(50),
    methodChild: z.string().min(1).max(50).optional(), 
});

export const InitiatePaymentSchema = InitiatePaymentSchemaTable.partial().pick({
    paymentId: true,
    method: true,
    methodChild: true,
}); 
export type InitiatePaymentDTO = z.infer<typeof InitiatePaymentSchema>;