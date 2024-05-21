import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import '../styles/App.css';

// Define the types for the hotel properties and rooms
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
    address: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    bookingFor: string;
    regularPrice: number;
    discountedPrice: number;
    savings: number;
    taxesFees: number;
    rooms: Room[];
}

const dummyHotelProperties: HotelProperty[] = [
    {
        id: 1,
        title: 'Hotel Sunshine',
        price: '$100 per night',
        image: 'https://via.placeholder.com/150',
        description: 'A wonderful place to stay with beautiful sunshine.',
        address: '1047 5th Ave, San Diego',
        roomType: 'Premium, 2 Double',
        checkIn: 'Sat, 20 Jan 2024',
        checkOut: 'Sat, 27 Jan 2024',
        bookingFor: '7 nights, 1 adult',
        regularPrice: 2274,
        discountedPrice: 1696,
        savings: 628,
        taxesFees: 232,
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
    // Add more dummy hotels as needed
];

const Reservation: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [hotel, setHotel] = useState<HotelProperty | null>(null);

    useEffect(() => {
        if (id) {
            const foundHotel = dummyHotelProperties.find(hotel => hotel.id === parseInt(id as string));
            setHotel(foundHotel || null);
        }
    }, [id]);

    if (!hotel) {
        return <div>Loading...</div>;
    }

    return (
        <div className="reservation-container">
            <div className="hotel-summary">
                <img src={hotel.image} alt={hotel.title} className="hotel-image" />
                <div>
                    <h1>{hotel.title}</h1>
                    <p>{hotel.address}</p>
                    <p>{hotel.roomType}</p>
                    <p>Check In: {hotel.checkIn}</p>
                    <p>Check Out: {hotel.checkOut}</p>
                    <p>Booking for: {hotel.bookingFor}</p>
                </div>
            </div>
            <div className="price-summary">
                <h2>Price Summary</h2>
                <p>Regular Price: ${hotel.regularPrice}</p>
                <p>Discounted Price: ${hotel.discountedPrice}</p>
                <p>Savings: ${hotel.savings}</p>
                <p>Taxes & Fees: ${hotel.taxesFees}</p>
                <h3>Total: ${hotel.discountedPrice + hotel.taxesFees}</h3>
            </div>
            <div className="payment-form">
                <h2>Payment Information</h2>
                <form>
                    <div>
                        <label>Card Number</label>
                        <input type="text" name="cardNumber" placeholder="1234 1234 1234 1234" />
                    </div>
                    <div>
                        <label>Expiration Date</label>
                        <input type="text" name="expirationDate" placeholder="MM / YY" />
                    </div>
                    <div>
                        <label>CVC</label>
                        <input type="text" name="cvc" placeholder="CVC" />
                    </div>
                    <div>
                        <label>Country</label>
                        <input type="text" name="country" placeholder="United States" />
                    </div>
                    <div>
                        <label>ZIP</label>
                        <input type="text" name="zip" placeholder="12345" />
                    </div>
                    <button type="submit" className="pay-now-button">Pay Now</button>
                </form>
            </div>
        </div>
    );
};

export default Reservation;
