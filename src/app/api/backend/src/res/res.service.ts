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
  private pathName: string = '/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/backend/src/res/worker.ts';

  constructor(private readonly httpService: HttpService,
    private configService: ConfigService
  ) {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 90 })
  };

  async getInfo(name: string, pg: number): Promise<PageNum | { list: [], new: boolean }> {
    console.log(pg);
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
    const multiple: Array<Order> = data.data.orders.filter(order => {
      const guestInfo = order.rooms_data[0].guest_data.guests[0];
      return (
        name.toLowerCase() ==
        `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase() && 
        order.invoice_id != null
      );
    });

    // const test = async (): Promise<any> => {
    //   try {
    //     return new Promise((resolve, reject) => {
    //       const worker = new Worker(this.pathName, {
    //           workerData: bodyData
    //       });
    //       worker.on('message', data => {
    //         resolve(data);
    //       });
    //       worker.on('error', reject);
    //       worker.on('exit', (code) => {
    //         if (code !== 0)
    //           reject(new Error(`Worker stopped with exit code ${code}`));
    //       });
    //     });
    //   } catch (e) {
    //     console.error(e);
    //     throw e
    //   };
    // };
    // const nextPage = await test();
    // console.log(nextPage, 'final');
    // const workerInfo: Array<Order> = nextPage.list.orders.filter(order => {
    //   const guestInfo = order.rooms_data[0].guest_data.guests[0];
    //   return (
    //     name.toLowerCase() ==
    //     `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase() && 
    //     order.invoice_id != null
    //   );
    // });
    // Surround these with functions, potentially?

    // console.log(workerInfo, 'info');

    const prev: Array<Order> | undefined = pg == 1 && [] || this.cache.get<Array<Order>>('list');
    if (prev) {
      if (multiple.length == 0) {
        return { list: [], new: data.data.found_pages > pg };
      };
      const cachedList = [...prev, ...multiple]; // ...workerInfo
      this.cache.set('list', cachedList, 0);
    } 
    // else {
    //   this.cache.set('list', [...multiple, ...workerInfo]);
    // };
    return { list: multiple, // ...workerInfo
      new: data.data.found_pages > pg};  // & nextPage.new
    };

  see (hotel: string): Order | undefined {
    const resList: Array<Order> | undefined = this.cache.get<Array<Order>>('list')
    const single: Order | undefined = resList?.filter((order) => {
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
