import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HotelsService {
    constructor(private readonly httpService: HttpService,
        private configService: ConfigService
    ) {}

    private convertToISO8601Format(dateString: string): string {
        if (dateString.includes('/')) {
            const [month, day, year] = dateString.split('/');
            const dateObject = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            return dateObject.toISOString().split('T')[0];
        } else if (dateString.includes('-')) {
            return dateString;
        } else {
            const dateObject = new Date(dateString);
            return dateObject.toISOString().split('T')[0];
        }
    }

    async searchHotels(searchParams: any): Promise<any> {
        const keyId = this.configService.get<string>('KEY_ID');
        const apiKey = this.configService.get<string>('API_KEY');        
        const { residency, language, guests, region_id, currency } = searchParams;

        const checkin = this.convertToISO8601Format(searchParams.checkin);
        const checkout = this.convertToISO8601Format(searchParams.checkout);
        
        searchParams.guests.forEach((guest: any, index: number) => {
            const childrenAges = guest.children.map((child: { age: number }) => child.age);
        });
        
        const requestBody = {
            checkin,
            checkout,
            residency,
            language,
            guests: guests.map(guest => ({
                adults: guest.adults,
                children: guest.children.map((child: { age: number }) => child.age)
            })),
            region_id,
            currency
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${Buffer.from(`${keyId}:${apiKey}`).toString('base64')}`
            },
            data: requestBody
        };

        const response = this.httpService.post('https://api.worldota.net/api/b2b/v3/search/serp/region/', requestBody, { headers: requestOptions.headers })
            .pipe(
                map(res => res.data)
            );
        const result = await lastValueFrom(response);
        return result;
    };

    async fetchHotelDetails(hotelId: string, language: string): Promise<any> {
        const url = `https://api.worldota.net/api/b2b/v3/hotel/info/`;
        const keyId = this.configService.get<string>('KEY_ID');
        const apiKey = this.configService.get<string>('API_KEY');

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(`${keyId}:${apiKey}`).toString('base64')}`
        };

        const body = {
            id: hotelId,
            language: language
        };

        return this.httpService.post(url, body, { headers }).pipe(
            map(response => response.data),
            catchError((error) => {
                console.error(`Error fetching hotel details for ID ${hotelId}:`, error.response?.data || error.message);
                return throwError(new HttpException('Failed to fetch hotel details', HttpStatus.INTERNAL_SERVER_ERROR));
            })
            
        ).toPromise();
    }
    
    async fetchHotelRooms(searchParams: any): Promise<any> {
        const keyId = this.configService.get<string>('KEY_ID');
        const apiKey = this.configService.get<string>('API_KEY');

        const { residency, language, guests, id, currency } = searchParams;

        const checkin = this.convertToISO8601Format(searchParams.checkin);
        const checkout = this.convertToISO8601Format(searchParams.checkout);

        searchParams.guests.forEach((guest: any, index: number) => {
            const childrenAges = guest.children.map((child: { age: number }) => child.age);
        });

        const requestBody = {
            checkin,
            checkout,
            residency,
            language,
            guests: guests.map(guest => ({
                adults: guest.adults,
                children: guest.children.map((child: { age: number }) => child.age)
            })),
            id,
            currency
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${Buffer.from(`${keyId}:${apiKey}`).toString('base64')}`
            },
            data: requestBody
        };

        return this.httpService.post('https://api.worldota.net/api/b2b/v3/search/hp/', requestBody, { headers: requestOptions.headers })
            .pipe(
                map(response => response.data)
            )
            .toPromise();
    }
}