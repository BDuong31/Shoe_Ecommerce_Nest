import { AppEvent } from "../data-model"; 

export const EvtOrderCheckout = 'OrderCheckout';

export type CartCheckoutEventPayload = {
  cartId: string;
  userId: string;
  totalAmount: number;
  items: Array<{ variationId: string; quantity: number; price: number }>; // Thông tin chi tiết giỏ hàng
  shippingAddressId: string;
};

export class CartEvent<T extends CartCheckoutEventPayload> extends AppEvent<T> {
  protected constructor(
    eventName: string,
    payload: T,
    options: { id?: string; occurredAt?: Date; senderId: string; }
  ) {
    super(eventName, payload, options);
  }
  
  protected static createEvent<T extends CartCheckoutEventPayload>(
    eventName: string,
    payload: T,
    senderId: string
  ): CartEvent<T> {
    return new CartEvent(eventName, payload, { senderId });
  }

  protected static fromJson<T extends CartCheckoutEventPayload>(json: any): CartEvent<T> {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CartEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class OrderCheckoutEvent extends CartEvent<CartCheckoutEventPayload> {
  
  static create(payload: CartCheckoutEventPayload, senderId: string): OrderCheckoutEvent {
    return CartEvent.createEvent(EvtOrderCheckout, payload, senderId) as OrderCheckoutEvent;
  }

  static from(json: any): OrderCheckoutEvent {
    return CartEvent.fromJson<CartCheckoutEventPayload>(json) as OrderCheckoutEvent;
  }
}