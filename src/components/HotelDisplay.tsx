import React from 'react';
import pic from './checkins.png';
import '../styles/HotelDisplay.css';

interface HotelDetails {
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
};

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

interface HotelDisplayProps {
    hotel: HotelDetails;
    searchParams: HotelSearchParams;
    statics: any;
    price: number
}

interface HotelSearchParams {
    checkin: string;
    checkout: string;
    residency: string;
    language: string;
    guests: {
        adults: number;
        children: {
            age: number;
        }[];
    }[];
    region_id: number | null;
    currency: string;
}

const HotelDisplay: React.FC<HotelDisplayProps> = ({ hotel, searchParams, statics, price }) => {
    const handleCardClick = (hotelId: string, hotelData: HotelDetails, searchParams: HotelSearchParams) => {
        localStorage.setItem('currentHotelData', JSON.stringify(hotelData));
        localStorage.setItem('searchParams', JSON.stringify(searchParams));
        localStorage.setItem('priceParams', JSON.stringify(price));
        window.open(`/hotel/${hotelId}`, '_blank');
    };

    const image = statics.images?.[0];
    const imageResult = image
        ? `${image.slice(0, 27)}240x240${image.slice(33)}`
        : pic;
    return (
        <div className="hotel-item" onClick={() => handleCardClick(hotel.id, statics, searchParams)}>
            <h3>{statics.name}</h3>
            <p>{statics.address}</p>
            <div className="rating">{Array(statics.star_rating).fill('⭐').join('')}</div>
            <p className="price"> ${price}</p>
            <div className="hotel-images">
                <img key={image} 
                src={imageResult} 
                alt={`View of ${statics.name}`} />
            </div>
        </div>
    );
};

export default HotelDisplay;