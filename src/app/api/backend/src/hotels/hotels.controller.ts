import { Body, Controller, Post, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('hotels')
export class HotelsController {
    constructor(private hotelsService: HotelsService) {}

    @Post('search')
    async searchHotels(@Body() searchParams: any): Promise<any> {
        try {
            const result = await this.hotelsService.searchHotels(searchParams);
            return result;
        } catch (e) {
            console.error(e);
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        };
    };

    @Post('rate')
    async rateLookup (@Body() roomGroup: { id: string, room: any }) {
        return await this.hotelsService.staticImages(roomGroup.id, roomGroup.room);
    };

    @Post('details')
    async fetchDetailsForMultipleHotels(@Body() body: { checkin: string, checkout: string, residency: string, language: string, guests: any[], ids: string[], currency: string }): Promise<any[]> {
        const { checkin, checkout, residency, language, guests, ids, currency } = body;
        return await this.hotelsService.fetchDetailsForMultipleHotels({ checkin, checkout, residency, language, guests, ids, currency });
    };
        
    @Post('rooms') 
    async getRooms(@Body() searchParams: any): Promise<any> {
        try {
            const result = await this.hotelsService.fetchHotelRooms(searchParams);
            return result;
        } catch (e) {
            throw new HttpException('Failed to fetch hotel rooms', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}