import dotenv from 'dotenv'
import { jwt } from 'zod';

// dotenv.config({
//     // path: '.env'
// })

const port = process.env.PORT || '3000';

export const config = {
    envName: process.env.NODE_ENV,
    port,
    jwtSecret: process.env.JWT_SECRET_KEY || 'baso',

    rpc: {
        jwtSecret: process.env.JWT_SECRET_KEY || 'baso', // Mã khóa dùng để ký và xác minh JWT
        introspectUrl: process.env.VERIFY_TOKEN_URL || `http://localhost:${port}/v1/rpc/introspect`, // URL của dịch vụ xác minh token
        userServiceURL: process.env.USER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ người dùng
        addressServiceURL: process.env.ADDRESS_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ địa chỉ
        productServiceURL: process.env.PRODUCT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ sản phẩm
        brandServiceURL: process.env.BRAND_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ thương hiệu
        categoryServiceURL: process.env.CATEGORY_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ danh mục
        variationServiceURL: process.env.VARIATION_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ biến thể
        imageServiceURL: process.env.IMAGE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ hình ảnh
        cartServiceURL: process.env.CART_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ giỏ hàng
        couponServiceURL: process.env.COUPON_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ coupon
        orderServiceURL: process.env.ORDER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ đơn hàng
        shippingServiceURL: process.env.SHIPPING_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ vận chuyển
        paymentServiceURL: process.env.PAYMENT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ thanh toán
        transactionServiceURL: process.env.TRANSACTION_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ giao dịch
        reviewServiceURL: process.env.REVIEW_SERVICE_URL || `http://localhost:${port}/v1`, // URL của dịch vụ đánh giá
        productAuthenticationServiceURL: process.env.PRODUCT_AUTHENTICATION_SERVICE_URL || `http://localhost:${port}/v1/`, // URL của dịch vụ xác thực sản phẩm
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        url: process.env.REDIS_URL || 'redis://:baso_redis@localhost:6379/0'
    },

    db: {
        name: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    },

    upload: {
        type: 'local',
        path: 'uploads',
        cdn: process.env.CDN_URL || `http://localhost:${port}/uploads`,
    },

    dbURL: `postgresql://baso:baso_secret@localhost:5432/baso-ecom?connection_limit=50`
}