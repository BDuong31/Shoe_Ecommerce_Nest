import { AppEvent } from "../data-model";

export const EvtCategoryUpdated = 'CategoryUpdated';

export type CategoryEventPayload = {
  categoryId: string;
  name: string;
  changeType: 'CREATED' | 'UPDATED' | 'DELETED';
};

export class CategoryUpdatedEvent extends AppEvent<CategoryEventPayload> {
  
  static create(payload: CategoryEventPayload, senderId: string): CategoryUpdatedEvent {
    return new CategoryUpdatedEvent(EvtCategoryUpdated, payload, { senderId });
  }

  static from(json: any): CategoryUpdatedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CategoryUpdatedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}
