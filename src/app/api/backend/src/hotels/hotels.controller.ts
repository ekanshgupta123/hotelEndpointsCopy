import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Response } from 'express';

@Controller('hotels')
export class HotelsController {
    constructor(private hotelsService: HotelsService) {}

    @Post('search')
    async searchHotels(@Body() searchParams: any, @Res() res: Response) {
        try {
            const result = await this.hotelsService.searchHotels(searchParams);
            res.status(HttpStatus.OK).json(result);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e.message });
        }
    }

    @Post('details')
    async getHotelDetails(@Body('id') hotelId: string, @Body('language') language: string = 'en') {
        return this.hotelsService.fetchHotelDetails(hotelId, language);
    }

    @Post('rooms') 
    async getRooms(@Body() searchParams: any, @Res() res: Response) {
        try {
            const result = await this.hotelsService.fetchHotelRooms(searchParams);
            res.status(HttpStatus.OK).json(result);
        } catch(e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e.message });
        }
    }
}