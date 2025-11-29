import { Requester, TokenPayload } from 'src/share';
import { UserChangePasswordDTO, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from './user.dto';
import { User, UserCoupon } from './user.model';

export interface IUserService {
    register(dto: UserRegistrationDTO): Promise<string>;
    login(dto: UserLoginDTO): Promise<string>;
    profile(userId: string): Promise<Omit<User, 'password' | 'salt'>>;
    update(requester: Requester, userId: string, dto: UserUpdateDTO, file?: Express.Multer.File): Promise<Omit<User, 'password' | 'salt'>>;
    updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO): Promise<void>;
    delete(requester: Requester, userId: string): Promise<void>;
    introspectToken(token: string): Promise<TokenPayload>;
}

export interface IUserRepository {
    get(id: string): Promise<User | null>;
    findByCond(cond: UserCondDTO): Promise<User | null>;
    listByCond(cond: UserCondDTO): Promise<User[]>;
    listByIds(ids: string[]): Promise<User[]>;

    insert(user: User): Promise<void>;
    update(id: string, dto: UserUpdateDTO): Promise<boolean>;
    delete(id: string, isHard: boolean): Promise<void>;
}

export interface IUserCouponRepository {
    get(id: string): Promise<UserCoupon | null>;
    listByUserId(userId: string): Promise<UserCoupon[]>;
    listByIds(ids: string[]): Promise<UserCoupon[]>;    

    insert(userCoupon: UserCoupon): Promise<void>;
    update(id: string, dto: Partial<UserCoupon>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IUserCouponService {
    assignCouponToUser(userId: string, couponId: string): Promise<string>;
    listUserCoupons(userId: string): Promise<UserCoupon[]>;
    checkCouponUsable(userId: string, couponId: string): Promise<boolean>;
    useUserCoupon(userId: string, couponId: string): Promise<void>;
    remmoveUseUserCoupon(userId: string, couponId: string): Promise<void>;
}