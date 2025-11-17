import e from 'express';
import { v7 } from 'uuid';
import { z } from 'zod';
import { id, is } from 'zod/v4/locales';

export enum BaseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BANNED = 'banned',
  DELETED = 'deleted',
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export const publicUserSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    avatar: z.string().nullable().optional(),
    email: z.string().email(),
    phone: z.string().min(10),
})

export interface PublicUser extends z.infer<typeof publicUserSchema> {}

export const pagingDTOSchema = z.object({
  page: z.coerce.number().min(1, { message: 'Page number must be at least 1' }).default(1),
  limit: z.coerce.number().min(1, { message: 'Limit must be at least 1' }).max(100).default(20),
  sort: z.string().optional(),
  order: z.string().optional(),
});

export interface PagingDTO extends z.infer<typeof pagingDTOSchema> { total?: number; }

export type Paginated<E> = {
    data: E[];
    paging: PagingDTO,
    total: number,
}

export class PubSubMessage {
  public readonly ID: string;
  public readonly SenderID?: string;
  public readonly Topic: string;
  public readonly Payload: Record<string, any>;
  public readonly CreatedAt: Date;
  constructor(senderID: string | undefined, topic: string, payload: Record<string, any>) {
    ; (this.ID = v7()), (this.SenderID = senderID), (this.Topic = topic), (this.Payload = payload);
    this.CreatedAt = new Date();
  }
}

export const publicAddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  streetAdress: z.string(),
  cityProvince: z.string(),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicAddress extends z.infer<typeof publicAddressSchema> {}

export const publicBrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicBrand extends z.infer<typeof publicBrandSchema> {}

export const publicCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicCategory extends z.infer<typeof publicCategorySchema> {}

export const publicProductSchema = z.object({
  id: z.string().uuid(),
  productName: z.string(),
  description: z.string().optional(),
  price : z.number().int().nonnegative().default(0),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicProduct extends z.infer<typeof publicProductSchema> {}

export const publicVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  size: z.number().int().nonnegative().default(0),
  color: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicVariant extends z.infer<typeof publicVariantSchema> {}

export const publicRatinngSchema = z.object({
  productId: z.string().uuid(),
  avgRating: z.number().min(0).max(5).default(0),
  totalRating: z.number().int().nonnegative().default(0),
})

export interface PublicRating extends z.infer<typeof publicRatinngSchema> {}

export const publicCouponSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  type: z.nativeEnum(CouponType),
  discountValue: z.number().nonnegative().default(0),
  expiryDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicCoupon extends z.infer<typeof publicCouponSchema> {}

export const publicOrderSchema = z.object({
  id: z.string().uuid(),
  totalAmount: z.number().int().nonnegative().default(0),
  status: z.string().default('pending'),
  userId: z.string().uuid(),
  shippingAddressId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicOrder extends z.infer<typeof publicOrderSchema> {}

export const publicOrderItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().nonnegative().default(0),
  priceAtPurchase: z.number().nonnegative().default(0),
  orderId: z.string().uuid(),
  variantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicOrderItem extends z.infer<typeof publicOrderItemSchema> {}

export const publicOrderCouponSchema = z.object({
    id: z.string().uuid(),
    discountApplied: z.number().nonnegative(),
    orderId: z.string().uuid(),
    couponId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export interface PublicOrderCoupon extends z.infer<typeof publicOrderCouponSchema> {}

export const PublicPaymentSchema = z.object({
  id: z.string().uuid(),
  method: z.string(),
  amount: z.number().int().nonnegative().default(0),
  status: z.string().default('pending'),
  orderId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicPayment extends z.infer<typeof PublicPaymentSchema> {}

export const PublicShippingSchema = z.object({
  id: z.string().uuid(),
  carrier: z.string(),
  trackingNumber: z.string(),
  shippingCost: z.number().nonnegative().default(0),
  status: z.string().default('pending'),
  orderId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export interface PublicShipping extends z.infer<typeof PublicShippingSchema> {}

export abstract class AppEvent<Payload> {
  private _id: string; // 
  private _occurredAt: Date;
  private _senderId?: string;

  constructor(
    private readonly _eventName: string,
    private readonly _payload: Payload,
    dtoProps?: {
      id?: string,
      occurredAt?: Date,
      senderId?: string;
    }
  ) {
    this._id = dtoProps?.id ?? v7();
    this._occurredAt = dtoProps?.occurredAt ?? new Date();
    this._senderId = dtoProps?.senderId;
  }

  // Lấy tên sự kiện
  get eventName(): string {
    return this._eventName;
  }

  // Lấy id sự kiện
  get id(): string {
    return this._id;
  }

  // Lấy thời gian xảy ra sự kiện
  get occurredAt(): Date {
    return this._occurredAt;
  }

  // Lấy id người gửi
  get senderId(): string | undefined {
    return this._senderId;
  }

  // Lấy dữ liệu sự kiện
  get payload(): Payload {
    return this._payload;
  }

  // Chuyển đổi sự kiện thành đối tượng bình thường
  plainObject() {
    return {
      id: this._id,
      occurredAt: this._occurredAt,
      senderId: this._senderId,
      eventName: this._eventName,
      payload: this._payload,
    };
  }
}
