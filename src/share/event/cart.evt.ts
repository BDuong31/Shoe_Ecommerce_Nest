import { AppEvent } from "../data-model"; 

export const EvtOrderCheckout = 'OrderCheckout';
export const EvtCartItemCreated = 'CartItemCreated';
export const EvtCartItemDeleted = 'CartItemDeleted';
export const EvtCartItemUpdated = 'CartItemUpdated';

export type CartEventPayload = {
  cartId?: string;
  userId?: string;
  totalAmount?: number;
  items?: Array<{ variationId: string; quantity: number; price: number }>; // Thông tin chi tiết giỏ hàng
  shippingAddressId?: string;
  cartItemId?: string;
  statusUpdateCartItem?: 'increase' | 'decrease';
  quantity?: number;
};

export class CartEvent<T extends CartEventPayload> extends AppEvent<T> {
  protected constructor(
    eventName: string,
    payload: T,
    options: { id?: string; occurredAt?: Date; senderId: string; }
  ) {
    super(eventName, payload, options);
  }
  
  protected static createEvent<T extends CartEventPayload>(
    eventName: string,
    payload: T,
    senderId: string
  ): CartEvent<T> {
    return new CartEvent(eventName, payload, { senderId });
  }

  protected static fromJson<T extends CartEventPayload>(json: any): CartEvent<T> {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CartEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class CartItemCreatedEvent extends CartEvent<CartEventPayload> {
  
  static create(payload: CartEventPayload, senderId: string): CartItemCreatedEvent {
    return CartEvent.createEvent(EvtCartItemCreated, payload, senderId) as CartItemCreatedEvent;
  }

  static from(json: any): CartItemCreatedEvent {
    return CartEvent.fromJson<CartEventPayload>(json) as CartItemCreatedEvent;
  }
}

export class CartItemUpdatedEvent extends CartEvent<CartEventPayload> {
  
  static create(payload: CartEventPayload, senderId: string): CartItemUpdatedEvent {
    return CartEvent.createEvent(EvtCartItemUpdated, payload, senderId) as CartItemUpdatedEvent;
  }

  static from(json: any): CartItemUpdatedEvent {
    return CartEvent.fromJson<CartEventPayload>(json) as CartItemUpdatedEvent;
  }
}

export class CartItemDeletedEvent extends CartEvent<CartEventPayload> {
  
  static create(payload: CartEventPayload, senderId: string): CartItemDeletedEvent {
    return CartEvent.createEvent(EvtCartItemDeleted, payload, senderId) as CartItemDeletedEvent;
  }

  static from(json: any): CartItemDeletedEvent {
    return CartEvent.fromJson<CartEventPayload>(json) as CartItemDeletedEvent;
  }
}

export class OrderCheckoutEvent extends CartEvent<CartEventPayload> {
  
  static create(payload: CartEventPayload, senderId: string): OrderCheckoutEvent {
    return CartEvent.createEvent(EvtOrderCheckout, payload, senderId) as OrderCheckoutEvent;
  }

  static from(json: any): OrderCheckoutEvent {
    return CartEvent.fromJson<CartEventPayload>(json) as OrderCheckoutEvent;
  }
}