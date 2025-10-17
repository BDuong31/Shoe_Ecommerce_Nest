import { AppEvent } from "../data-model";

export const EvtOrderDelivered = 'OrderDelivered';

export type ShippingEventPayload = {
  orderId: string;
  userId: string;
  trackingNumber: string;

  productIds: string[]; 
};

export class OrderDeliveredEvent extends AppEvent<ShippingEventPayload> {
  static create(payload: ShippingEventPayload, senderId: string): OrderDeliveredEvent {
    return new OrderDeliveredEvent(EvtOrderDelivered, payload, { senderId });
  }

  static from(json: any): OrderDeliveredEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new OrderDeliveredEvent(eventName, payload, { id, occurredAt, senderId });
  }
}