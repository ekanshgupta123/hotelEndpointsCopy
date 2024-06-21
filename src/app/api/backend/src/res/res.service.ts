import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Components, Details, Order, PageNum } from './orders.dto';
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
  };

  async getInfo(name: string, pg: number): Promise<PageNum> {
    const bodyData = {
      "ordering": {
          "ordering_type": "desc",
          "ordering_by": "created_at"
      },
      "pagination": {
          "page_size": "50",
          "page_number": `${pg}`
      }, 
      "search": {
          "created_at": {
            "from_date": "2024-03-31T00:00"
          }
      },
      "language":"en"
    };
    const { data } = await firstValueFrom(
      this.httpService.post<Components>("https://api.worldota.net/api/b2b/v3/hotel/order/info/", 
      bodyData, 
      { headers: this.headers })
    );
    let multiple: Array<Order> = data.data.orders.filter(order => {
      const guestInfo = order.rooms_data[0].guest_data.guests[0];
      return (
        name.toLowerCase() ==
        `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase() && 
        order.invoice_id != null
      );
    });
    const prev: Array<Order> | null = pg == 1 && [] || this.cache.get<Array<Order>>('list')
    if (prev) {
      multiple = [...prev, ...multiple];
    };
    this.cache.set('list', multiple, 0);
    return { list: multiple, pages: data.data.found_pages};
  };

  see (hotel: string): Order {
    const resList = this.cache.get<Array<Order>>('list')
    const single: Order = resList.filter((order) => {
      return ( 
        order.invoice_id == hotel
      );
    })[0];
    return single
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

  flush (): void {
    this.cache.flushAll();
  };

};
