import { Requester, TokenPayload } from 'src/share';
import { UserChangePasswordDTO, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from './user.dto';
import { User } from './user.model';

export interface IUserService {
    register(dto: UserRegistrationDTO): Promise<string>;
    login(dto: UserLoginDTO): Promise<string>;
    profile(userId: string): Promise<Omit<User, 'password' | 'salt'>>;
    update(requester: Requester, userId: string, dtoo: UserUpdateDTO): Promise<void>;
    updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO): Promise<void>;
    delete(requester: Requester, userId: string): Promise<void>;
    introspectToken(token: string): Promise<TokenPayload>;
}

export interface IUserRepository {
    get(id: string): Promise<User | null>;
    findByCond(cond: UserCondDTO): Promise<User | null>; 
    listByIds(ids: string[]): Promise<User[]>;

    insert(user: User): Promise<void>;
    update(id: string, dto: UserUpdateDTO): Promise<void>;
    delete(id: string, isHard: boolean): Promise<void>;
}