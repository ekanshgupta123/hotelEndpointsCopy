import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Components, Order } from './orders.dto';
import { ConfigService } from '@nestjs/config';
import NodeCache from 'node-cache';

@Injectable()
export class ResService {
  private credentials = `${this.configService.get<string>('KEY_ID')}:${this.configService.get<string>('API_KEY')}`;
  private authHeader = 'Basic ' + Buffer.from(this.credentials).toString('base64');
  private headers = {
    'Content-Type': 'application/json', 
    'Authorization': this.authHeader,
  };
  private cache: NodeCache;

  constructor(private readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 90 })
  }
  
  private bodyData = {
    "ordering": {
        "ordering_type": "desc",
        "ordering_by": "created_at"
    },
    "pagination": {
        "page_size": "50",
        "page_number": "1"
    }, 
    "search": {
        "created_at": {
          "from_date": "2023-12-31T00:00"
        }
    },
    "language":"en"
  };
  async getInfo(): Promise<Array<Order>> {
    const { data } = await firstValueFrom(
      this.httpService.post<Components>("https://api.worldota.net/api/b2b/v3/hotel/order/info/", 
      this.bodyData, 
      { headers: this.headers })
    );
    const response: Array<Order> = data.data.orders;
    this.cache.set('list', response, 0);
    return response;
  };

  async hotelData (args: { id: string, language: string }) {
    const { data } = await firstValueFrom(
      this.httpService.post<{ data: {address: string, images: string[], star_rating: string, latitude: string, longitude: string} }>(
        "https://api.worldota.net/api/b2b/v3/hotel/info/", 
      args, 
      { headers: this.headers })
    );
    const { address, images, star_rating, latitude, longitude } = data.data;
    return { address: address, 
      images: images, 
      star_rating: star_rating, 
      latitude: latitude,
      longitude: longitude }
  };

  see (): Array<Order> {
    const result = this.cache.get<Array<Order>>('list');
    return result
  };

  flush (): void {
    this.cache.flushAll();
  };

};
