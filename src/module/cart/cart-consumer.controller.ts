import { Controller, Inject } from "@nestjs/common";
import { RedisClient } from "src/share/components";
import { CART_REPOSITORY } from "./cart.di-token";
import { ICartRepository } from "./cart.port";
import { CartItemCreatedEvent, CartItemDeletedEvent, CartItemUpdatedEvent, EvtCartItemCreated, EvtCartItemDeleted, EvtCartItemUpdated } from "src/share/event";

@Controller()
export class CartConsumerController {
  constructor(
    @Inject(CART_REPOSITORY) private readonly repo: ICartRepository,
  ) {
    this.subscribe();
  }

  async CartItemCreated(evt: CartItemCreatedEvent) {
    this.repo.increaseCount(evt.payload.cartId, "totalItem", 1);
  }

  async CartItemDeleted(evt: CartItemDeletedEvent) {
    this.repo.decreaseCount(evt.payload.cartId, "totalItem", 1);
  }

  async CartItemUpdate(evt: CartItemUpdatedEvent) {
    if (evt.payload.statusUpdateCartItem === 'increase')
      this.repo.increaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
    else
      this.repo.decreaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
  }

  subscribe() {
    RedisClient.getInstance().subscribe(EvtCartItemCreated, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = CartItemCreatedEvent.from(data);
      this.CartItemCreated(evt);
    });

    RedisClient.getInstance().subscribe(EvtCartItemUpdated, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = CartItemUpdatedEvent.from(data);
      this.CartItemUpdate(evt);
    });

    RedisClient.getInstance().subscribe(EvtCartItemDeleted, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = CartItemDeletedEvent.from(data);
      this.CartItemDeleted(evt);
    });
  }
}