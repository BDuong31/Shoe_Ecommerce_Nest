import { AppEvent, PublicAddress, PublicBrand, PublicCategory, PublicCoupon, PublicImage, PublicOrder, PublicOrderCoupon, PublicOrderItem, PublicPayment, PublicProduct, PublicRating, PublicShipping, PublicUser, PublicVariant } from "./data-model";
export interface TokenPayload {
  sub: string;
  role: UserRole;
}

// Định nghĩa interface cho requester
export interface Requester extends TokenPayload { }

export interface ReqWithRequester { requester: Requester; } // Requester bắt buộc phải có
export interface ReqWithRequesterOpt { requester?: Requester; } // Requester có thể không có

// Định nghĩa interface cho token provider
export interface ITokenProvider {
  // Tạo mã truy cập token
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

export type TokenIntrospectResult = {
  payload: TokenPayload | null;
  error?: Error;
  isOk: boolean;
};

export interface ITokenIntrospect {
  introspect(token: string): Promise<TokenIntrospectResult>;
}

// Định nghĩa emun cho user role
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface IPublicUserRpc {
  findById(id: string): Promise<PublicUser | null>;
  findByIds(ids: string[]): Promise<Array<PublicUser>>;
  updateUserRpc(id: string, dto: any): Promise<boolean>;
}

export interface IPublicAddressRpc {
  findById(id: string): Promise<PublicAddress | null>;
  findByIds(ids: string[]): Promise<Array<PublicAddress>>;
  checkAddressBelongToUser(addressId: string, userId: string): Promise<boolean>;
}

export interface IPublicBrandRpc {
  findById(id: string): Promise<PublicBrand | null>;
  findByIds(ids: string[]): Promise<Array<PublicBrand>>;
}

export interface IPublicCategoryRpc {
  findById(id: string): Promise<PublicCategory | null>;
  findByIds(ids: string[]): Promise<Array<PublicCategory>>;
}

export interface IPublicProductRpc {
  findById(id: string): Promise<PublicProduct | null>;
  findByIds(ids: string[]): Promise<Array<PublicProduct>>;
}

export interface IPublicVariantRpc {
  findById(id: string): Promise<PublicVariant | null>;
  findByIds(ids: string[]): Promise<Array<PublicVariant>>;
}

export interface IPublicRatingRpc {
  getProductAvgRating(id: string): Promise<PublicRating | null>;
}

export interface IPublicCouponRpc {
  findById(id: string): Promise<PublicCoupon | null>;
  findByIds(ids: string[]): Promise<Array<PublicCoupon>>;
}

export interface IPublicOrderRpc {
  listByUser(userId: string): Promise<PublicOrder[]>;
  getOrderStatus(id: string): Promise<PublicOrder | null>;
  getOrderItems(id: string): Promise<Array<PublicOrderItem> | null>;
  getOrderCoupon(id: string): Promise<PublicOrderCoupon | null>;
}

export interface IPublicPaymentRpc {
  getPaymentStatus(id: string): Promise<PublicPayment | null>;
}

export interface IPublicShippingRpc {
  getShippingStatus(id: string): Promise<PublicShipping | null>;
}

export interface IPublicFavoriteRpc {
  isProductFavoritedByUser(productId: string, userId: string): Promise<boolean>;
}

export interface IPublicImageRpc {
  getImagesByRefId(refId: string[] | string, type: string, isMain?: boolean): Promise<PublicImage[]>;
}
export type EventHandler = (msg: string) => void;

export interface IEventPublisher {
  publish<T>(event: AppEvent<T>): Promise<void>;
}