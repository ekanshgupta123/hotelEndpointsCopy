import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Page, PageData, Rates, RatesData, Status, Schema } from "./book.dto";
import { v4 as uuid } from 'uuid';
import { Injectable } from "@nestjs/common";

@Injectable()
export class BookService {
    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService
    ) {}
    private credentials = `${this.configService.get<string>('KEY_ID')}:${this.configService.get<string>('API_KEY')}`;
    private authHeader = 'Basic ' + Buffer.from(this.credentials).toString('base64');
    private headers = {
        'Content-Type': 'application/json', 
        'Authorization': this.authHeader,
    };

    async bookingForm(hash: string, ipAddress: string): Promise<RatesData> {
        const UUID: string = uuid()
        const bodyData  = {
            "partner_order_id": UUID,
            "book_hash": hash,
            "language": "en",
            "user_ip": ipAddress
        };
        const { data } = await firstValueFrom(this.httpService.post<Rates>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/', 
            bodyData, 
            { headers: this.headers }
        ));
        return data.data;
    }

    async bookingFinish(rates: RatesData, firstName: string, lastName: string, email: string): Promise<Schema> {
        const partnerInfo: string = rates.partner_order_id
        const paymentInfo: { currency_code: string } = rates.payment_types.filter(method => {
            return method.currency_code == 'USD';
        })[0];
        const bodyData = {
            "language": "en",
            "partner": {
                "partner_order_id": partnerInfo
            },
            "payment_type": paymentInfo,
            "rooms": [
                {
                    "guests": [
                        {
                            "first_name": firstName || "Vimal", // test first name
                            "last_name": lastName || "Ratehawk" // test last name
                        }
                    ]
                }
            ],
            "user": {
                "email": email || "operations@chekins.com", // test email
                "phone": "6503088202" // test phone
            }
        };
        const { data } = await firstValueFrom(this.httpService.post<Status>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/', 
            bodyData, 
            { headers: this.headers }
        ));
        const response: string = data.status;
        return {result: response, pID: partnerInfo};
    }

    async bookingStatus(pID: string): Promise<string> {
        const { data } = await firstValueFrom(this.httpService.post<Status>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/', 
            { "partner_order_id": pID }, 
            { headers: this.headers }
        ));
        const response: string = data.status;
        if (response != 'ok') {
            return this.bookingStatus(pID);
        } else {
            return response;
        }
    }

    async cancelBooking(pID: string): Promise<string> {
        const { data } = await firstValueFrom(this.httpService.post<Status>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/cancel/', 
            { "partner_order_id": pID }, 
            { headers: this.headers }
        ));
        const response: string = data.status;
        if (response != 'ok') {
            return this.cancelBooking(pID);
        } else {
            return response;
        }
    }

    async getInfo(id: string, 
        checkin: string, 
        checkout: string, 
        guests: {adults: number, children: number[]}[]): Promise<string> {
        const bodyData = {
            "id": id,
            "checkin": checkin,
            "checkout": checkout,
            "guests": guests
        };
        const { data } = await firstValueFrom(this.httpService.post<Page>(
            'https://api.worldota.net/api/b2b/v3/search/hp/', 
            bodyData, 
            { headers: this.headers }
        ));
        const response: PageData = data.data;
        const bookHash: string = response.hotels[0].rates[0].book_hash;
        const prebookData = {
            "hash": bookHash,
            "price_increase_percent": 20
        };
        const availability = await firstValueFrom(this.httpService.post<Page>(
            'https://api.worldota.net/api/b2b/v3/hotel/prebook',
            prebookData,
            { headers: this.headers }
        ))
        const checked: PageData = availability.data.data
        return checked.hotels[0].rates[0].book_hash;
    }
}  