import { Response } from 'express';
import { ZodError } from 'zod';

// Ứng dụng lỗi tùy chỉnh với khả năng bao bọc lỗi gốc, thêm chi tiết và thông điệp đăng nhập
export class AppError extends Error {
    private statusCode: number = 500;
    private rootCause?: Error;

    private details: Record<string, any> = {};
    private logMessage?: string;

    private constructor(err: Error) {
        super(err.message);
    }

    // Tạo một AppError từ một lỗi hiện có với mã trạng thái tùy chọn
    static from(err: Error, statusCode: number = 500) {
        const appError = new AppError(err);
        appError.statusCode = statusCode;
        return appError;
    }

    // Lấy lỗi gốc cuối cùng trong chuỗi lỗi
    getRootCause(): Error | null {
        if (this.rootCause) {
            return this.rootCause instanceof AppError ? this.rootCause.getRootCause() : this.rootCause;
        }
        return null;
    }

    // Bao bọc lỗi gốc trong một AppError mới
    wrap(rootCause: Error): AppError {
        const appError = AppError.from(this, this.statusCode);
        appError.rootCause = rootCause;
        return appError;
    }

    // Thêm chi tiết bổ sung vào lỗi
    withDetail(key: string, value: any): AppError {
        this.details[key] = value;
        return this;
    }

    // Thêm thông điệp đăng nhập bổ sung
    withLog(logMessage: string): AppError {
        this.logMessage = logMessage;
        return this;
    }

    // Cập nhật thông điệp lỗi
    withMessage(message: string): AppError {
        this.message = message;
        return this;
    }

    // Chuyển đổi lỗi thành định dạng JSON, ẩn thông tin nhạy cảm trong môi trường sản xuất
    toJSON(isProduction: boolean = true) {
        const rootCause = this.getRootCause();

        return isProduction ? {
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
        } : {
            message: this.message,
            statusCode: this.statusCode,
            rootCause: rootCause ? rootCause.message : this.message,
            details: this.details,
            logMessage: this.logMessage,
        };
    }

    // Lấy mã trạng thái HTTP của lỗi
    getStatusCode(): number {
        return this.statusCode;
    }
}

// Xử lý lỗi và gửi phản hồi thích hợp dựa trên loại lỗi
export const responseErr = (err: Error, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';
    !isProduction && console.error(err.stack);

    // Xử lý lỗi AppError
    if (err instanceof AppError) {
        const appErr = err as AppError;
        return res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));

        return;
    }

    // Xử lý lỗi xác thực Zod
    if (err instanceof ZodError) {
        const zErr = err as ZodError;
        const appErr = ErrInvalidRequest.wrap(zErr);

        zErr.issues.forEach((issue) => {
            appErr.withDetail(issue.path.join('.'), issue.message);
        });

        res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
        return;
    }

    const appErr = ErrInternalServer.wrap(err);
    res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
};

// Định nghĩa các lỗi ứng dụng phổ biến
export const ErrInternalServer = AppError.from(new Error('Something went wrong, please try again later.'), 500); // Lỗi server
export const ErrInvalidRequest = AppError.from(new Error('Invalid request'), 400); // Lỗi yêu cầu không hợp lệ
export const ErrUnauthorized = AppError.from(new Error('Unauthorized'), 401); // Lỗi không xác thực
export const ErrForbidden = AppError.from(new Error('Forbidden'), 403); // Lỗi không được phép
export const ErrNotFound = AppError.from(new Error('Not found'), 404); // Lỗi không tìm thấy
export const ErrMethodNotAllowed = AppError.from(new Error('Method not allowed'), 405); // Lỗi phương thức không được phép
export const ErrTokenInvalid = AppError.from(new Error('Token is invalid'), 401); // Lỗi token không hợp lệ