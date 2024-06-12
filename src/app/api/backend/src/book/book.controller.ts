import {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  Query,
  Headers,
  Res,
  Ip, 
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookService } from './Book.service';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('booking')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly jwtService: JwtService
  ) {}

  @Get('status')
  @HttpCode(200)
  async checkStatus (@Query('pID') partnerID: string, @Res() response: Response): Promise<Response> {
    try {
      if (!partnerID) {
        return response.status(HttpStatus.BAD_REQUEST)
      };
      const apiCall = await this.bookService.bookingStatus(partnerID);
      return response.status(HttpStatus.OK).json({
          status: 'Booking has been finalized.',
          data: apiCall
        });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  };

  @Post('create')
  @HttpCode(201)
  async createBooking(
    @Req() request: Request,
    @Ip() remoteAddress: string, 
    @Res() response: Response): Promise<Response> {
    try {
      const { id, checkin, checkout, guests } = request.body;
      if (!id || !checkin || !checkout || !guests) {
        return response.status(HttpStatus.BAD_REQUEST)
      };
      const jwtToken: string = request.cookies['token'];
      const { name, email } = this.jwtService.decode(jwtToken);
      const [first, last] = name.split(" ");
      const hashAvailable = await this.bookService.getInfo(
        id,
        checkin,
        checkout,
        guests
      );
      const formBooking = await this.bookService.bookingForm(hashAvailable, remoteAddress);
      const apiCall = await this.bookService.bookingFinish(formBooking, first, last, email); 
      return response.status(HttpStatus.OK).json({
        status: 'Order has been placed.',
        data: apiCall.pID
      });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  };

  @Delete('cancel')
  @HttpCode(204)
  async cancelOrder (@Headers('pID') partnerID: string, @Res() response: Response): Promise<Response> {
    try {
      if (!partnerID) {
        return response.status(HttpStatus.BAD_REQUEST)
      };
      const apiCall = await this.bookService.cancelBooking(partnerID);
      return response.status(HttpStatus.OK).json({
          status: 'Booking has been canceled.',
          data: apiCall 
        });
    } catch (e) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    };
  };
};
