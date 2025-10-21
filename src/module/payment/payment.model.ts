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

export const FilterPaymentSchema = z.object({
    method: z.string().min(1).max(50).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
})

export type FilterPaymentDTO = z.infer<typeof FilterPaymentSchema>;

