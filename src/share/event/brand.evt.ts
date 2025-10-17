import { AppEvent } from "../data-model";

export const EvtBrandUpdated = 'BrandUpdated';
export const EvtBrandCreated = 'BrandCreated';

export type BrandEventPayload = {
  brandId: string;
  name: string;
  changeType: 'CREATED' | 'UPDATED' | 'DELETED';
};

export class BrandUpdatedEvent extends AppEvent<BrandEventPayload> {
  
  static create(payload: BrandEventPayload, senderId: string): BrandUpdatedEvent {
    return new BrandUpdatedEvent(EvtBrandUpdated, payload, { senderId });
  }

  static from(json: any): BrandUpdatedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new BrandUpdatedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}
