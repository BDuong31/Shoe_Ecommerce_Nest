import { AppEvent } from "../data-model";

export const EvtPaymentSuccess = 'PaymentSuccess';
export const EvtPaymentFailed = 'PaymentFailed';

export type PaymentEventPayload = {
  orderId: string;
  paymentId: string;
  userId: string;
  amount: number;

  itemsDeducted: Array<{ variationId: string; quantity: number }>; 
};

export class PaymentSuccessEvent extends AppEvent<PaymentEventPayload> {
  static create(payload: PaymentEventPayload, senderId: string): PaymentSuccessEvent {
    return new PaymentSuccessEvent(EvtPaymentSuccess, payload, { senderId });
  }

  static from(json: any): PaymentSuccessEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PaymentSuccessEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class PaymentFailedEvent extends AppEvent<PaymentEventPayload> {
  static create(payload: PaymentEventPayload, senderId: string): PaymentFailedEvent {
    return new PaymentFailedEvent(EvtPaymentFailed, payload, { senderId });
  }

  static from(json: any): PaymentFailedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PaymentFailedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}