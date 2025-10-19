import { z } from 'zod';

export const ErrShippingNotFound = new Error('Shipping information not found');
export const ErrInvalidTrackingNumber = new Error('Invalid tracking number');
export const ErrCarrierRequired = new Error('Carrier is required');
export const ErrShippingCostNegative = new Error('Shipping cost must be non-negative');
export const ErrTrackingNumberRequired = new Error('Tracking number is required');
export const ErrOrderIdRequired = new Error('Order ID is required');
export const ErrShippingExist = new Error('Shipping information already exists');

export const ShippingSchema = z.object({
    id: z.string().uuid(),
    carrier: z.string().min(1, ErrCarrierRequired.message),
    trackingNumber: z.string().min(1, ErrTrackingNumberRequired.message),
    shippingCost: z.number().nonnegative({ message: ErrShippingCostNegative.message }),
    orderId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Shipping = z.infer<typeof ShippingSchema>;

export const CreateShippingDTOSchema = ShippingSchema.pick({
    carrier: true,
    trackingNumber: true,
    shippingCost: true,
    orderId: true,
}).required();

export type CreateShippingDTO = z.infer<typeof CreateShippingDTOSchema>;

export const UpdateShippingDTOSchema = ShippingSchema.pick({
    carrier: true,
    trackingNumber: true,
    shippingCost: true,
}).partial();

export type UpdateShippingDTO = z.infer<typeof UpdateShippingDTOSchema>;

export const FilterShippingDTOSchema = ShippingSchema.pick({
    carrier: true,
    orderId: true,
}).partial();

export type FilterShippingDTO = z.infer<typeof FilterShippingDTOSchema>;