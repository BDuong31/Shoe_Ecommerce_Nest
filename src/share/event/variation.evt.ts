import { AppEvent } from "../data-model";

export const EvtInventoryUpdated = 'InventoryUpdated';

export type VariationEventPayload = {
  variationId: string;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  reason: 'ADMIN_UPDATE' | 'RETURN' | 'STOCK_ERROR';
};

export class InventoryUpdatedEvent extends AppEvent<VariationEventPayload> {
  static create(payload: VariationEventPayload, senderId: string): InventoryUpdatedEvent {
    return new InventoryUpdatedEvent(EvtInventoryUpdated, payload, { senderId });
  }

  static from(json: any): InventoryUpdatedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new InventoryUpdatedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}