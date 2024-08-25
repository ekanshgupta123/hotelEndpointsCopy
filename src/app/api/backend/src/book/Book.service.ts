import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Page, PageData, Rates, RatesData, Status, FinalSchema, TokenFormat } from "./book.dto";
import { v4 as uuid } from 'uuid';
import { Injectable } from "@nestjs/common";

@Injectable()
export class BookService {
    private credentials = `${this.configService.get<string>('KEY_ID')}:${this.configService.get<string>('API_KEY')}`;
    private authHeader = 'Basic ' + Buffer.from(this.credentials).toString('base64');
    private headers = {
        'Content-Type': 'application/json', 
        'Authorization': this.authHeader,
    };
    
    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService
    ) {}

    roomMatch = (obj1, obj2) => {
        const keys = Object.keys(obj2);
        for (let key of keys) {
            if (obj1[key] != obj2[key]) return false
        };
        return true;
    };

    async bookingForm(hash: string, ipAddress: string): Promise<RatesData> {
        console.log('bookingForm');
        const UUID: string = uuid();
        const bodyData  = {
            "partner_order_id": UUID,
            "book_hash": hash,
            "language": "en",
            "user_ip": ipAddress
        };
        console.log(bodyData);
        const { data } = await firstValueFrom(this.httpService.post<Rates>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/', 
            bodyData, 
            { headers: this.headers }
        ));
        console.log(data, 'data');
        return data.data;
    };

    async bookingFinish(rates: RatesData, 
        firstName: string, 
        lastName: string, 
        email: string): Promise<FinalSchema> {
            console.log(rates, 'rates');
        const partnerInfo: string = rates.partner_order_id;
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
        return data.status == 'ok' && { 
            pID: partnerInfo,
            confirmation: rates.order_id };
    };

    async bookingStatus(pID: string): Promise<string> {
        const { data } = await firstValueFrom(this.httpService.post<Status>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/', 
            { "partner_order_id": pID }, 
            { headers: this.headers }
        ));
        if (data.status != 'ok') {
            return this.bookingStatus(pID);
        } else {
            return data.status;
        };
    }

    async cancelBooking(pID: string): Promise<string> {
        const { data } = await firstValueFrom(this.httpService.post<Status>(
            'https://api.worldota.net/api/b2b/v3/hotel/order/cancel/', 
            { "partner_order_id": pID }, 
            { headers: this.headers }
        ));
        if (data.status != 'ok') {
            return this.cancelBooking(pID);
        } else {
            return data.status;
        };
    };

    async getInfo(args: any): Promise<string> {
        console.log('getInfo');
        const { data } = await firstValueFrom(this.httpService.post<Page>(
            'https://api.worldota.net/api/b2b/v3/search/hp/', 
            args.data, 
            { headers: this.headers }
        ));
        const response: PageData = data.data;
        console.log(response.hotels[0].rates.filter(rate => this.roomMatch(rate.rg_ext, args.lookup)));
        const rateLookup: string = response.hotels[0].rates.filter(rate => this.roomMatch(rate.rg_ext, args.lookup))[0].book_hash;
        const prebookData = {
            "hash": rateLookup,
            "price_increase_percent": 5
        };
        const availability = await firstValueFrom(this.httpService.post<Page>(
            'https://api.worldota.net/api/b2b/v3/hotel/prebook',
            prebookData,
            { headers: this.headers }
        ));
        const checked: PageData = availability.data.data;
        if (!checked.changes.price_changed) return rateLookup;
        throw new Error('Rate not available.');
    }
};  