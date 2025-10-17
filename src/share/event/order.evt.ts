import { AppEvent } from "../data-model";

export const EvtOrderPlaced = 'OrderPlaced';
export const EvtOrderStatusUpdated = 'OrderStatusUpdated';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderEventPayload = {
  orderId: string;
  userId: string;
  status: OrderStatus;
};

export class OrderPlacedEvent extends AppEvent<OrderEventPayload> {
  static create(payload: OrderEventPayload, senderId: string): OrderPlacedEvent {
    return new OrderPlacedEvent(EvtOrderPlaced, payload, { senderId });
  }

  static from(json: any): OrderPlacedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new OrderPlacedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class OrderStatusUpdatedEvent extends AppEvent<OrderEventPayload> {
  static create(payload: OrderEventPayload, senderId: string): OrderStatusUpdatedEvent {
    return new OrderStatusUpdatedEvent(EvtOrderStatusUpdated, payload, { senderId });
  }

  static from(json: any): OrderStatusUpdatedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new OrderStatusUpdatedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}