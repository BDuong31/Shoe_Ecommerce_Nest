import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VNPay } from 'vnpay';

interface VNPayReturnObject {
    isSuccess: boolean;
    [key: string]: any;
}

@Injectable()
export class VnpayService {
    private vnpay: VNPay;
    private returnUrl: string;

    constructor(private configService: ConfigService) {
        this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');
        
        this.vnpay = new VNPay({
            vnpayHost: this.configService.get<string>('VNPAY_URL'),
            tmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
            secureSecret: this.configService.get<string>('VNPAY_HASH_SECRET'),
        });
    }

    async createPaymentUrl(amount: number, paymentId: string, userId: string, bankCode: string): Promise<string> {
        try {
            const url = await this.vnpay.buildPaymentUrl({
                vnp_Amount: amount * 100, 
                vnp_TxnRef: paymentId,
                vnp_OrderInfo: `Payment for ${paymentId}`,
                vnp_BankCode: bankCode,
                vnp_ReturnUrl: this.returnUrl,
                vnp_IpAddr: '127.0.0.1', 
            });
            return url;
        } catch (error) {
            console.error("VNPAY Build URL Error:", error);
            throw new Error("Failed to create VNPAY URL");
        }
    }

    async verifyReturn(query: any): Promise<boolean> {
        try {
            const result: VNPayReturnObject = await this.vnpay.verifyReturnUrl(query);
            return result.isSuccess; // Trả về boolean
        } catch (error) {
            console.error('VNPAY verify failed:', error);
            return false;
        }
    }
}