import {
  Controller,
  Get,
  Delete,
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
  };

  @Get('details')
  @HttpCode(200)
  async information(@Query() info: Details, 
  @Res() response: Response): Promise<Response> {
    try {
      const { hotel, name } = info;
      const apiCall: Array<Order> = this.appService.see();
      const single: Order = apiCall.filter((order) => {
        const guestInfo = order.rooms_data[0].guest_data.guests[0];
        return (
          name.toLowerCase() ==
          `${guestInfo.first_name} ${guestInfo.last_name}`.toLowerCase() && 
          order.invoice_id == hotel
        );
      })[0];
      return response.status(HttpStatus.OK).json({
        status: 'success',
        data: single,
      });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  };

  @Delete('clear')
  @HttpCode(204)
  clearCache (): void {
    this.appService.flush();
  };

  @Get('info')
  @HttpCode(200)
  async additionalInfo (@Query() params: {id: string, language: string}, @Res() response: Response) {
    try {
      const result = await this.appService.hotelData(params);
      return response.status(HttpStatus.OK).json({
        status: 'success',
        data: result,
      });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  }

};
