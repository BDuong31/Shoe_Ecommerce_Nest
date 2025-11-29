import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class MomoService {
    private config: any;

    constructor(private configService: ConfigService) {
        this.config = {
            endpoint: this.configService.get<string>('MOMO_ENDPOINT'),
            partnerCode: this.configService.get<string>('MOMO_PARTNER_CODE'),
            accessKey: this.configService.get<string>('MOMO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MOMO_SECRET_KEY'),
            returnUrl: this.configService.get<string>('MOMO_RETURN_URL'),
            ipnUrl: this.configService.get<string>('MOMO_IPN_URL'),
        };
    }

    async createPaymentUrl(amount: number, paymentId: string, orderInfo: string, userId: string, method: string): Promise<string> {
        const requestId = uuidv7();
        const requestType = method;
        const extraData = "eyJ1c2VybmFtZSI6ICJtb21vIn0=";
        const paymentIdOriginal = paymentId.split('-rand-')[0];

        const rawSignature = 
            `accessKey=${this.config.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${this.config.ipnUrl}` +
            `&orderId=${paymentId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${this.config.partnerCode}` +
            `&redirectUrl=${this.config.returnUrl}/${paymentIdOriginal}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode: this.config.partnerCode,
            requestId: requestId,
            amount: amount,
            orderId: paymentId,
            orderInfo: orderInfo,
            redirectUrl: `${this.config.returnUrl}/${paymentIdOriginal}`,
            ipnUrl: this.config.ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi',
        };

        try {
            const result = await axios.post(this.config.endpoint, requestBody);
            return result.data.payUrl;
        } catch (error) {
            console.error('MOMO Create Error:', error.response.data);
            throw new Error('Failed to create Momo payment URL');
        }
    }

    verifyWebhook(body: any): boolean {
        const { signature, ...restOfBody } = body;
        
        const rawSignature = `partnerCode=${restOfBody.partnerCode}&accessKey=${restOfBody.accessKey}&requestId=${restOfBody.requestId}&amount=${restOfBody.amount}&orderId=${restOfBody.orderId}&orderInfo=${restOfBody.orderInfo}&orderType=${restOfBody.orderType}&transId=${restOfBody.transId}&message=${restOfBody.message}&localMessage=${restOfBody.localMessage}&responseTime=${restOfBody.responseTime}&errorCode=${restOfBody.errorCode}&payType=${restOfBody.payType}&extraData=`;

        const expectedSignature = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature).digest('hex');

        return expectedSignature === signature;
    }
}