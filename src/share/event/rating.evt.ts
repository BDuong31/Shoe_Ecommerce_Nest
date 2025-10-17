import { AppEvent } from "../data-model";

export const EvtRatingSubmitted = 'RatingSubmitted';

export type RatingEventPayload = {
  reviewId: string;
  productId: string;
  userId: string;
  score: number; 
  isNew: boolean;
};

// Sự kiện: Người dùng đã gửi điểm số/đánh giá
export class RatingSubmittedEvent extends AppEvent<RatingEventPayload> {
  static create(payload: RatingEventPayload, senderId: string): RatingSubmittedEvent {
    return new RatingSubmittedEvent(EvtRatingSubmitted, payload, { senderId });
  }

  static from(json: any): RatingSubmittedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new RatingSubmittedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}