import { CreatePaymentDTO, FilterPaymentDTO, Payment, UpdatePaymentDTO } from "./payment.model";
import { Paginated, PagingDTO, Requester } from "src/share";    

export interface IPaymentService {
    create(dto: CreatePaymentDTO): Promise<string>;
    update(paymentId: string, dto: UpdatePaymentDTO): Promise<boolean>;
    delete(paymentId: string): Promise<boolean>;
}

export interface IPaymentRepository {
    get(id: string): Promise<Payment | null>;
    list(cond: FilterPaymentDTO, paging: PagingDTO): Promise<Paginated<Payment>>;
    listByIds(ids: string[]): Promise<Payment[]>;

    insert(payment: Payment): Promise<void>;
    update(id: string, dto: UpdatePaymentDTO): Promise<void>;
    delete(id: string): Promise<void>;
}