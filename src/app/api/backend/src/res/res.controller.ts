import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResService } from './res.service';
import { JwtService } from '@nestjs/jwt';
import { Order, Details } from './orders.dto';
import { Request, Response } from 'express';

@Controller('reservation')
export class ResController {
  constructor(
    private readonly appService: ResService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('list')
  @HttpCode(200)
  async findAll(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const apiCall: Array<Order> = await this.appService.getInfo();
      const jwtToken: string = request.cookies['token'];
      const { name } = this.jwtService.decode(jwtToken);
      const multiple: Array<Order> = apiCall.filter((order) => {
        const guestInfo = order.rooms_data[0].guest_data.guests[0];
        return (
          name.toLowerCase() ==
          `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase()
        );
      });
      return response.status(HttpStatus.OK).json({
        status: 'success',
        data: { list: multiple, user: name },
      });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  }

  @Get('details')
  @HttpCode(200)
  async hotelInfo(@Query() info: Details, 
  @Res() response: Response): Promise<Response> {
    try {
      const { hotel, list } = info;
      if (!hotel || !list) {
        return response.status(HttpStatus.BAD_REQUEST);
      }
      const single: Order = list.filter((order: Order) => {
        return (order.invoice_id == hotel);
      })[0];
      return response.status(HttpStatus.OK).json({
        status: 'success',
        data: single,
      });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  };
};
