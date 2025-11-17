import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';
import * as dayjs from 'dayjs';

@Injectable()
export class ZalopayService {
    private config: any;

    constructor(private configService: ConfigService) {
        this.config = {
            app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
            key1: this.configService.get<string>('ZALOPAY_KEY_1'),
            key2: this.configService.get<string>('ZALOPAY_KEY_2'),
            endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT'),
            ipn_url: this.configService.get<string>('ZALOPAY_IPN_URL'),
            return_url: this.configService.get<string>('ZALOPAY_RETURN_URL'),
        };
    }

    async createPaymentUrl(amount: number, paymentId: string, orderInfo: string, userId: string, bankCode: string): Promise<string> {

        const paymentIdOriginal = paymentId.split('-')[0];

        const app_trans_id = `${dayjs().format('YYMMDD')}_${Math.floor(Math.random() * 100000)}`;

        const embed_data = {
            redirecturl: `${this.config.return_url}/${paymentIdOriginal}`,
        };

        const items = [{}];

        const order: any = {
            app_id: this.config.app_id,
            app_trans_id,
            app_user: userId,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount,
            description: orderInfo,
            bank_code: bankCode,
            callback_url: this.config.ipn_url,
        };

        const data = [
            order.app_id,
            order.app_trans_id,
            order.app_user,
            order.amount,
            order.app_time,
            order.embed_data,
            order.item
        ].join('|');

        order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

        try {
            const result = await axios.post(
                this.config.endpoint,
                qs.stringify(order),       // <--- phải stringify theo form-urlencoded
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );

            if (result.data.return_code !== 1) {
                console.error("ZaloPay Error:", result.data);
                throw new Error(result.data.return_message);
            }

            return result.data.order_url;

        } catch (error) {
            console.error("ZALOPAY Create Error:", error.response?.data || error.message);
            throw new Error("Failed to create ZaloPay payment URL");
        }
    }
    verifyWebhook(body: any): boolean {
        try {
            const mac = CryptoJS.HmacSHA256(body.data, this.config.key2).toString();

            if (mac !== body.mac) {
                console.warn('ZaloPay Webhook MAC mismatch');
                return false;
            }
            return true;

        } catch (error) {
            console.error('ZaloPay Verify Error:', error);
            return false;
        }
    }
}
