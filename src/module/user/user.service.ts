import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { AppError, ErrForbidden, ErrInvalidRequest, ErrNotFound, IPublicCouponRpc, IPublicUserRpc, ITokenProvider, Requester, TokenPayload, UserRole } from "src/share";
import { v7 } from "uuid";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { TOKEN_PROVIDER, USER_COUPON_REPOSITORY, USER_REPOSITORY } from "./user.di-token";
import { UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserUpdateDTO, userUpdateDTOSchema, UserChangePasswordDTO, userChangePasswordDTOSchema } from "./user.dto";
import { ErrInvalidToken, ErrInvalidEmailAndPassword, ErrUserInactivated, ErrEmailInvalid, Status, User, ErrPhoneInvalid, ErrWalletAddressInvalid, UserCoupon, UserCouponStatus } from "./user.model";
import { IUserCouponRepository, IUserCouponService, IUserRepository, IUserService } from "./user.port";
import * as path from 'path';
import { boolean, string } from "zod";
import { COUPON_RPC, USER_RPC } from "src/share/di-token";
import { create } from "domain";
// Lớp UserService cung cấp các phương thức xử lý logic liên quan đến người dùng
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository, 
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) { 
    cloudinary.config(process.env.CLOUDINARY_URL || '');
  }

  onModuleInit() {
    if (!process.env.CLOUDINARY_URL) {
      console.warn("CLOUDINARY_URL is not set. Cloudinary operations will likely fail.");
    }
  }

  private fileToDataUri(file: Express.Multer.File): string {
    if (!file.buffer) {
      throw new BadRequestException("File buffer is missing. Check Multer setup.");
    }
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

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
        fullName: data.fullName,
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
  async update(requester: Requester, userId: string, dto: UserUpdateDTO, file?: Express.Multer.File): Promise<Omit<User, 'password' | 'salt'>> {
    // 2. Kiểm tra dữ liệu đầu vào
    const data = userUpdateDTOSchema.parse(dto);

    let uploadResult: UploadApiResponse;

    // 3. Kiểm tra người dùng
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    // 4. Kiểm tra số điện thoại
    if(user.phone !== data.phone) { 
      const phoneUsers = await this.userRepo.listByCond({ phone: data.phone || '' });
      let lengthPhoneUser = phoneUsers.length;

      if (lengthPhoneUser > 3) {
        throw AppError.from(ErrPhoneInvalid, 400);
      }
    }

    if(user.email !== data.email) {
      const emailUser = await this.userRepo.findByCond({ email: data.email || '' });
      if (emailUser) {
        throw AppError.from(ErrEmailInvalid, 400);
      }
    }

    // 5. Kiểm tra địa chỉ ví
    if (user.walletAddress !== data.walletAddress && data.walletAddress !== undefined) {
      const walletUsers = await this.userRepo.findByCond({ walletAddress: data.walletAddress || '' });
      if (walletUsers) {
        throw AppError.from(ErrWalletAddressInvalid, 400);
      }
    }

    // 6. Xử lý ảnh đại diện nếu có
    if (file) {
      try {
        const fileUri = this.fileToDataUri(file);
        uploadResult = await cloudinary.uploader.upload(fileUri, {
            folder: `ecommerce/avatars/${userId}`, 
        });
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new BadRequestException('Image upload failed to Cloudinary.');
      }

      if (uploadResult && uploadResult.secure_url) {
        data.avatar = uploadResult.secure_url;
      }
    }

    const updatedUsers = await this.userRepo.update(userId, data);

    if (!updatedUsers) {
      throw AppError.from(ErrNotFound, 400);
    }


    const updatedUser = await this.userRepo.get(userId);
    if (!updatedUser) {
      throw AppError.from(ErrNotFound, 400);
    }


    const { password, salt, ...rest } = updatedUser;
    return rest;
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

@Injectable()
export class UserCouponService implements IUserCouponService {
  constructor(
    @Inject(USER_COUPON_REPOSITORY) private readonly userCouponRepo: IUserCouponRepository,
    @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
    @Inject(COUPON_RPC) private readonly couponRpc: IPublicCouponRpc,
  ){}

  async assignCouponToUser(userId: string, couponId: string): Promise<string> {
    const user = await this.userRpc.findById(userId);
    
    if (!user) {
      throw AppError.from(ErrNotFound, 404).withLog(`User with id ${userId} not found`);
    }

    const coupon = await this.couponRpc.findById(couponId);

    if (!coupon) {
      throw AppError.from(ErrNotFound, 404).withLog(`Coupon with id ${couponId} not found`);
    }

    const newId = v7();

    const newUserCoupon: UserCoupon = {
      id: newId,
      userId: userId,
      couponId: couponId,
      status: UserCouponStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.userCouponRepo.insert(newUserCoupon);

    return newId;
  }

  async listUserCoupons(userId: string): Promise<UserCoupon[]> {
    const userCoupons =  await this.userCouponRepo.listByUserId(userId);
    return userCoupons;
  }

  async checkCouponUsable(userId: string, couponId: string): Promise<boolean> {
    const userCoupons =  await this.userCouponRepo.listByUserId(userId);
    const userCoupon = userCoupons.find(uc => uc.couponId === couponId);

    if (!userCoupon) {
      return false;
    }

    return userCoupon.status === UserCouponStatus.AVAILABLE;
  }

  async useUserCoupon(userId: string, couponId: string): Promise<void> {
    const userCoupons =  await this.userCouponRepo.listByUserId(userId);
    const userCoupon = userCoupons.find(uc => uc.couponId === couponId);

    if (!userCoupon) {
      throw AppError.from(ErrNotFound, 404).withLog(`UserCoupon with couponId ${couponId} not found for user ${userId}`);
    }

    if (userCoupon.status !== UserCouponStatus.AVAILABLE) {
      throw AppError.from(ErrInvalidRequest, 400).withLog(`UserCoupon with couponId ${couponId} is not available`);
    }

    await this.userCouponRepo.update(userCoupon.id, { status: UserCouponStatus.USED });
  }

  async remmoveUseUserCoupon(userId: string, couponId: string): Promise<void> {
    const userCoupons =  await this.userCouponRepo.listByUserId(userId);
    const userCoupon = userCoupons.find(uc => uc.couponId === couponId);  
    if (!userCoupon) {
      throw AppError.from(ErrNotFound, 404).withLog(`UserCoupon with couponId ${couponId} not found for user ${userId}`);
    }

    if (userCoupon.status !== UserCouponStatus.USED) {
      throw AppError.from(ErrInvalidRequest, 400).withLog(`UserCoupon with couponId ${couponId} is not used`);
    }

    await this.userCouponRepo.update(userCoupon.id, { status: UserCouponStatus.AVAILABLE });
  }
}
