import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Components, Order } from './orders.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResService {
  constructor(private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}
  private credentials = `${this.configService.get<string>('KEY_ID')}:${this.configService.get<string>('API_KEY')}`;
  private authHeader = 'Basic ' + Buffer.from(this.credentials).toString('base64');
  private headers = {
    'Content-Type': 'application/json', 
    'Authorization': this.authHeader,
  };
  
  private bodyData = {
    "ordering": {
        "ordering_type": "desc",
        "ordering_by": "created_at"
    },
    "pagination": {
        "page_size": "50",
        "page_number": "4"
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
    return response;
  }
}
