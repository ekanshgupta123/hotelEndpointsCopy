import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';

interface Room {
    id: number;
    type: string;
    occupancy: string;
    bed: string;
    price: string;
    cancellationPolicy: string;
    image: string;
}

interface HotelProperty {
    id: number;
    title: string;
    price: string;
    image: string;
    description: string;
    rooms: Room[];
}

const dummyHotelProperties: HotelProperty[] = [
    {
        id: 1,
        title: 'Hotel Sunshine',
        price: '$100 per night',
        image: 'https://via.placeholder.com/150',
        description: 'A wonderful place to stay with beautiful sunshine.',
        rooms: [
            {
                id: 1,
                type: 'Superior',
                occupancy: 'Sleeps 2',
                bed: '1 Queen Bed and 1 Sofa Bed (or Twin Bed)',
                price: '$367',
                cancellationPolicy: 'Fully Refundable Before January 8',
                image: 'https://via.placeholder.com/300'
            },
            {
                id: 2,
                type: 'Premier',
                occupancy: 'Sleeps 2',
                bed: '1 Double Bed',
                price: '$375',
                cancellationPolicy: 'Fully Refundable Before January 10',
                image: 'https://via.placeholder.com/300'
            },
            {
                id: 3,
                type: 'Suite, 1 Bedroom',
                occupancy: 'Sleeps 2',
                bed: '1 Double Bed',
                price: '$383',
                cancellationPolicy: 'Fully Refundable Before January 10',
                image: 'https://via.placeholder.com/300'
            }
        ]
    },
];

const HotelDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [hotel, setHotel] = useState<HotelProperty | null>(null);

    useEffect(() => {
        if (id) {
            const foundHotel = dummyHotelProperties.find(hotel => hotel.id === parseInt(id as string));
            setHotel(foundHotel || null);
        }
    }, [id]);

    const handleReserve = (roomId: number) => {
        router.push(`/hotel/reservation?id=${id}&roomId=${roomId}`);
    };

    if (!hotel) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{hotel.title}</h1>
            <p className="price">{hotel.price}</p>
            <img src={hotel.image} alt={hotel.title} className="property-image" />
            <p>{hotel.description}</p>

            <h2>Rooms</h2>
            <div className="rooms-container">
                {hotel.rooms.map(room => (
                    <div key={room.id} className="room-item">
                        <img src={room.image} alt={room.type} className="room-image" />
                        <h3>{room.type}</h3>
                        <p>{room.occupancy}</p>
                        <p>{room.bed}</p>
                        <p className="price">{room.price} Per Day / Room</p>
                        <p>Cancellation Policy: {room.cancellationPolicy}</p>
                        <button className="reserve-button" onClick={() => handleReserve(room.id)}>Reserve</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelDetails;
