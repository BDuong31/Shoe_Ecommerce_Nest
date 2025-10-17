import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { AppError, ErrForbidden, ErrNotFound, ITokenProvider, Requester, TokenPayload, UserRole } from "src/share";
import { v7 } from "uuid";
import { TOKEN_PROVIDER, USER_REPOSITORY } from "./user.di-token";
import { UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserUpdateDTO, userUpdateDTOSchema, UserChangePasswordDTO, userChangePasswordDTOSchema } from "./user.dto";
import { ErrInvalidToken, ErrInvalidEmailAndPassword, ErrUserInactivated, ErrEmailInvalid, Status, User, ErrPhoneInvalid, ErrWalletAddressInvalid } from "./user.model";
import { IUserRepository, IUserService } from "./user.port";
import * as path from 'path';
import { boolean, string } from "zod";
// Lớp UserService cung cấp các phương thức xử lý logic liên quan đến người dùng
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository, 
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) { }

  // Phương thức đăng ký người dùng mới
  async register(dto: UserRegistrationDTO): Promise<string> {
    const data = userRegistrationDTOSchema.parse(dto);

    // 1. Kiểm tra xem email đã tồn tại hay chưa
    const user = await this.userRepo.findByCond({ email: data.email });
    if (user) throw AppError.from(ErrEmailInvalid, 400);

    // 2. Tạo Salt và Mật khẩu mã hoá
    const salt = bcrypt.genSaltSync(8); 
    const hashPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

    // 3. Tạo người dùng mới
    const newId = v7();
    const newUser: User = {
        id: newId,
        avatar: null,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender, 
        password: hashPassword,
        salt: salt,
        email: data.email,
        phone: '',
        walletAddress: '',
        role: UserRole.CUSTOMER,
        status: Status.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    // 4. Thêm người dùng mới vào Database
    await this.userRepo.insert(newUser);
    return newId;
  }

  // Phương thức đăng nhập
  async login(dto: UserLoginDTO): Promise<string> {
    const data = userLoginDTOSchema.parse(dto);

    // 1. Tìm người dùng trong DTO
    const user = await this.userRepo.findByCond({ email: dto.email });
    if (!user) {
      throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog('Email not found');
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(`${dto.password}.${user.salt}`, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog('Password is incorrect');
    }

    // 3. Kiểm tra trạng thái người dùng
    if (user.status === Status.DELETED || user.status === Status.INACTIVE) {
      throw AppError.from(ErrUserInactivated, 400);
    }

    // 3. Trả về token
    const role = user.role;
    const token = await this.tokenProvider.generateToken({ sub: user.id, role });
    return token;
  }
  
  // Phương thức xác thực token
  async introspectToken(token: string): Promise<TokenPayload> {

    // 1. Xác thực token
    const payload = await this.tokenProvider.verifyToken(token);

    // 2. Kiểm tra token
    if (!payload) {
      throw AppError.from(ErrInvalidToken, 400);
    }

    // 3. Lấy thông tin người dùng
    const user = await this.userRepo.get(payload.sub);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    // 4. Kiểm tra trạng thái người dùng
    if (user.status === Status.DELETED || user.status === Status.INACTIVE || user.status === Status.BANNED) {
      throw AppError.from(ErrUserInactivated, 400);
    }

    return {
      sub: user.id,
      role: user.role,
    };
  }

  // Phương thức lấy thông tin người dùng
  async profile(userId: string): Promise<Omit<User, 'password' | 'salt'>> {
    
    // 1. Lấy thông tin người dùng
    const user = await this.userRepo.get(userId);
    
    // 2. Kiểm tra người dùng
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    const { password, salt, ...rest } = user;
    return rest;
  }

  // Phương thức cập nhật thông tin người dùng
  async update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<void> {
    // 2. Kiểm tra dữ liệu đầu vào
    const data = userUpdateDTOSchema.parse(dto);

    // 3. Kiểm tra người dùng
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    if (user.phone !== data.phone) {
      throw AppError.from(ErrPhoneInvalid, 400);
    }

    if (user.walletAddress !== data.walletAddress) {
      throw AppError.from(ErrWalletAddressInvalid, 400);
    }
    // 4. Cập nhật thông tin người dùng
    await this.userRepo.update(userId, data);
  }

  async updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO): Promise<void> {
    // 1. Kiểm tra quyền hạn
    if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
      throw AppError.from(ErrForbidden, 400);
    }

    // 2. Kiểm tra dữ liệu đầu vào
    const data = userChangePasswordDTOSchema.parse(dto);

    // 3. Kiểm tra người dùng
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    //4. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(`${data.currentPassword}.${user.salt}`, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog('Old password is incorrect');
    }

    // 5. Tạo Salt và Mật khẩu mã hoá
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${data.newPassword}.${salt}`, 10);

    // 6. Cập nhật mật khẩu
    await this.userRepo.update(userId, { password: hashPassword, salt: salt });
  }

  // Phương thức xóa người dùng
  async delete(requester: Requester, userId: string): Promise<void> {
    // 1. Kiểm tra quyền hạn
    if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
      throw AppError.from(ErrForbidden, 400);
    }

    // 2. Xóa người dùng
    await this.userRepo.delete(userId, true);
  }
}
