import { CreateOrderDTO, CreateOrderItemDTO, FilterOrderDTO, FilterOrderItemDTO, Order, OrderItems, UpdateOrderItemDTO, UpdateOrderStatusDTO } from './order.model';
import { Paginated, PagingDTO, Requester } from 'src/share';

export interface IOrderService {
    create(dto: CreateOrderDTO, requester: Requester): Promise<string>;
    update(orderId: string, dto: UpdateOrderStatusDTO): Promise<boolean>;
    delete(orderId: string): Promise<boolean>;
}

export interface IOrderItemService {
    create(dto: CreateOrderItemDTO): Promise<string>;
    update(orderItemId: string, dto: UpdateOrderItemDTO): Promise<boolean>;
    delete(orderItemId: string): Promise<boolean>;
}

export interface IOrderRepository {
    get(id: string): Promise<Order | null>;
    list(cond: FilterOrderDTO, paging: PagingDTO, requester: Requester): Promise<Paginated<Order>>;
    listByIds(ids: string[]): Promise<Order[]>;

    insert(order: Order): Promise<void>;
    update(id: string, dto: UpdateOrderStatusDTO): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IOrderItemRepository {
    get(id: string): Promise<OrderItems | null>;
    listByOrderId(cond: FilterOrderItemDTO): Promise<OrderItems[]>;
    listByIds(ids: string[]): Promise<OrderItems[]>;

    insert(orderItem: OrderItems): Promise<void>;
    update(id: string, dto: UpdateOrderItemDTO): Promise<void>;
    delete(id: string): Promise<void>;
}