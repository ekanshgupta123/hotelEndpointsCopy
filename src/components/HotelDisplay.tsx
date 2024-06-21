import React from 'react';
import '../styles/HotelDisplay.css';

interface HotelDetails {
    id: string;
    name: string;
    address: string;
    starRating: number;
    amenities: string[];
    price: number;
    images: string[];
    description: string;
    main_name: string;
    room_images: string[];
}

interface HotelDisplayProps {
    hotel: HotelDetails;
    searchParams: HotelSearchParams
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

const HotelDisplay: React.FC<HotelDisplayProps> = ({ hotel, searchParams }) => {
    const handleCardClick = (hotelId: string, hotelData: HotelDetails, searchParams: HotelSearchParams) => {
        localStorage.setItem('currentHotelData', JSON.stringify(hotelData));
        localStorage.setItem('searchParams', JSON.stringify(searchParams));
        window.open(`/hotel/${hotelId}`, '_blank');
    };

  
    let image = hotel.images[0];
    let imageResult = image.slice(0, 27) + "240x240" + image.slice(33);
    return (
        <div className="hotel-item" onClick={() => handleCardClick(hotel.id, hotel, searchParams)}>
            <h3>{hotel.name}</h3>
            <p>{hotel.address}</p>
            <p>Rating: {hotel.starRating} stars</p>
            <p className="price"> ${hotel.price}</p>
            <div className="hotel-images">
                <img key={image} src={imageResult} alt={`View of ${hotel.name}`} />
            </div>
        </div>
    );
};

export default HotelDisplay;