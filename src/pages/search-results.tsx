import React from 'react';
import { GetServerSideProps } from 'next';
import SearchResults from '@/components/Search-Results';
import axios from 'axios';

interface Hotel {
    id: string;
    price: number;
    name?: string;
    address?: string;
    star_rating?: number;
    images?: string[];
    amenity_groups: string[];
    description_struct: string[];
    room_groups: RoomGroup[];
    latitude: number;
    longitude: number;
    rates: any[];
}

interface RoomGroup {
    images: string[];
    name: string;
    name_struct: {
        bathroom: string | null;
        bedding_type: string | null;
        main_name: string;
    };
    rg_ext: {
        class: number;
        quality: number;
        sex: number;
        bathroom: number;
        bedding: number;
    };
    room_amenities: string[];
    room_group_id: number;
}

interface StaticData {
    id: string;
    star_rating: number;
    address: string;
    name: string;
    amenities: string[];
    price: number;
    meal: string;
}

interface Props {
    initialHotels: Hotel[];
    statics: StaticData[];
    totalHotels: number;
    initialSearchParams: any;
    displayedHotelCount: number;
    page: number;
    prevPage: number;
}

const SearchResultsPage: React.FC<Props> = ({ initialHotels, statics, totalHotels, initialSearchParams, displayedHotelCount, page, prevPage }) => {
    return (
        <SearchResults
            initialHotels={initialHotels}
            statics={statics}
            totalHotels={totalHotels}
            initialSearchParams={initialSearchParams}
            displayedHotelCount={displayedHotelCount}
            page={page}
            prevPage={prevPage}
        />
    );
};

export default SearchResultsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query } = context;
    const { destination, checkInDate, checkOutDate, guests, rooms, regionId, page = 1, prevPage = 1 } = query;
    const parsedGuests = guests ? JSON.parse(guests as string) : [];
    const regionIdNumber = regionId ? parseInt(regionId as string, 10) : null;

    const body = {
        checkin: checkInDate,
        checkout: checkOutDate,
        residency: 'us',
        language: 'en',
        guests: parsedGuests,
        region_id: regionIdNumber,
        currency: 'USD',
        keys: [`pricing: ${destination}-${checkInDate}-${checkOutDate}-${parsedGuests.adults}-0`, `static: ${destination}`],
        pageNumber: page
    };

    try {
        const response = await axios.post("http://localhost:5001/hotels/search", body);
        const [hotelCache] = response.data.data;
        const [idCache] = response.data.data;
        const initialHotels = hotelCache.map((element: string) => JSON.parse(element));
        const ids = idCache.map((element: string) => JSON.parse(element));
        const statics = await fetchStaticData(ids.map((hotel: { id: any; }) => hotel.id));

        let displayedHotelCount = 0;

        if (page >= prevPage) {
            displayedHotelCount = ids.length;
        } else if (page < prevPage) {
            displayedHotelCount = displayedHotelCount % 25 === 0
                ? displayedHotelCount - 25
                : displayedHotelCount - (displayedHotelCount % 25);
        }

        return {
            props: {
                initialHotels,
                statics,
                totalHotels: response.data.total,
                initialSearchParams: { destination, checkInDate, checkOutDate, parsedGuests, rooms },
                displayedHotelCount,
                page: Number(page),
                regionIdNumber,
                prevPage: Number(prevPage),
            }
        };
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return {
            props: {
                hotels: [],
                statics: [],
                totalHotels: 0,
                initialSearchParams: { destination, checkInDate, checkOutDate, parsedGuests, rooms },
                displayedHotelCount: 0,
                page: 1,
                prevPage: 1,
            }
        };
    }
};

async function fetchStaticData(hotelIDs: string[]) {
    try {
        const response = await axios.post('http://localhost:3000/api/connect', { hotelIDs });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching static data:', error);
        return [];
    }
}
