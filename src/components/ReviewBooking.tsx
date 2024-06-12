import { useRouter } from 'next/router';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';

interface HotelSpecifics {
    id: string;
    name: string;
    address: string;
    starRating: number;
    amenities: string[];
    price: number;
    images: string[];
    description: string;
}

interface HotelPage {
    "checkin": string, 
    "checkout": string, 
    "guests": {
        adults: number;
        children: {
            age: number;
        }[];
    }[];
    "language": string,
    "currency": string,
}

interface HotelRoom {
    name: string;
    price: number;
    type: string;
}

interface HotelDetails {
    room: HotelRoom,
    params: HotelPage,
    specifics: HotelSpecifics
}

interface CreditToken {
    "object_id": string,
    "pay_uuid": string,
    "init_uuid": string,
    "user_first_name": string,
    "user_last_name": string,
    "cvc": string,
    "credit_card_data_core": {
        "year": string,
        "card_number": string,
        "card_holder": string,
        "month": string
    },
    "is_cvc_required": boolean,
}

const dummyHotelSelected: HotelPage = {
    "checkin": "2024-06-13",
    "checkout": "2024-06-15",
    "guests": [
        {
            "adults": 1,
            "children": []
        }
    ],
    "language": "en", 
    "currency": "USD"
  };

const dummyProps = {
    reviews: 60,
    bookFor: '7 nights, 1 adults',
    taxes: '$232',
    refund: 'Non-Refundable',
    cancellation: '...'
}

const ReviewBooking: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [hotel, setHotel] = useState<HotelPage>(dummyHotelSelected);
    const [booking, setBooking] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [room, setRoom] = useState<HotelRoom>({
        name: "",
        price: 0,
        type: ""
    });
    const [parameters, setParameters] = useState<HotelPage>({
        "checkin": "", 
        "checkout": "", 
        "guests": [{
            "adults": 0,
            "children": [] 
        }],
        "language": "",
        "currency": ""
    });
    const [specifics, setSpecifics] = useState<HotelSpecifics>({
        id: "",
        name: "",
        address: "",
        starRating: 0,
        amenities: [""],
        price: 0,
        images: [""],
        description: "",
    });
    const [pid, setPid] = useState<string>("");

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const data = searchParams.get('details');
        if (data) {
            const hotelDetails: HotelDetails = JSON.parse(data);
            const { room, params, specifics } = hotelDetails;
            setRoom(room);
            setParameters(params);
            setSpecifics(specifics);
        }
        setBooking("");
        setStatus("");
    }, [])

    const handleOnClick = async (): Promise<void> => {
        try {
            setStatus('Please wait a moment.');
            const bookCall = await axios.post('http://localhost:5001/booking/create', {
                id: specifics.id,
                checkin: parameters.checkin,
                checkout: parameters.checkout,
                guests: [
                    {
                        "adults": parameters.guests[0].adults,
                        "children": [parameters.guests[0].children.length]
                    }
                ]
            }, 
                { headers:{"Content-Type" : "application/json"},
                withCredentials: true
            });
            const result = await bookCall.data;
            setBooking(result.status);
            setStatus('Finalizing...');
            await handleStatus(result.data);
        } catch (e) {
            console.error(e);
        };
    };

    const handleStatus = async (partner?: string): Promise<void> => {
        try {
            if (partner) {
                setPid(partner);
            };
            const statusCall: AxiosResponse = await axios.get('http://localhost:5001/booking/status', {
                params: { pID: partner },  
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            const result = await statusCall.data;
            if (result.data == 'ok') {
                seeConfirm(partner);
            };
        } catch (e) {
            console.error(e);
        };
    };

    const seeConfirm = (partner?: string) => {
        const sendObj = { ...dummyProps, ...dummyHotelSelected, pID: pid || partner };
        const objectString = JSON.stringify(sendObj);
        router.push(`/confirmation/?details=${encodeURIComponent(objectString)}`)
    }

    return (
        <div>
            <div style={{ marginTop: '2%' }}>
                <label style={{ marginLeft: '10%'}}>{'< Review Your Booking'}</label>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '51.5%',
                marginLeft: '10%',
                marginTop: '2%',
                borderStyle: 'solid'
                }}>
                    <div className='review-hotel'>
                        <label>{specifics.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</label>
                    </div>
                    <div style={{ padding: '1%', marginBottom: '0.5%' }}>
                        <label>{Array(specifics.starRating).fill('⭐').join('')}</label>
                        <label> | {dummyProps.reviews} reviews</label>
                    </div>
                    <div className='review-hotel'>
                        <label>{specifics.address}</label>
                        <label>O km from center</label>
                    </div>
                    <div style={{ padding: '1%', marginBottom: '5%', marginLeft: '41%' }}>
                        <label>{room.type}</label>
                    </div>
                    <div className='review-hotel'>
                        {specifics.amenities.map(feat => (
                            <label>{feat}</label>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '51.5%',
                marginLeft: '10%',
                marginTop: '1%',
                borderStyle: 'solid'
                }}>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    padding: '1%', 
                    justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ marginBottom: '8%' }}>
                                Checkin:
                            </div>
                            <div style={{ color: 'navy', fontWeight: '600' }}>
                                {parameters.checkin}
                            </div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '8%' }}>
                                Checkout:
                            </div>
                            <div style={{ color: 'navy', fontWeight: '600' }}>
                                {parameters.checkout}
                            </div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '8%' }}>
                                Booking For:
                            </div>
                            <div style={{ color: 'navy', fontWeight: '600' }}>
                                {dummyProps.bookFor}
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1%', marginTop: '1%' }}>
                        <label>Room Only, {dummyProps.refund}</label>
                    </div>
                    <div style={{ padding: '1%', marginTop: '1%' }}>
                        <label>View Booking and Cancellation Policy</label>
                    </div>
                </div>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '55%',
                marginLeft: '10%',
                marginTop: '1%'
                }}>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'start', 
                    marginBottom: '6%' }}>
                        <div style={{ marginRight: '30%'}}>
                            <input placeholder='Card' style={{ width: '250%', height: '250%' }}></input>
                        </div>
                        <div>
                            <input placeholder='Google Pay' style={{ width: '250%', height: '250%' }}></input>
                        </div>
                    </div>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'start', 
                    marginBottom: '6%' }}>
                        <div style={{ marginRight: '30%'}}>
                            <input placeholder='Card Number (1234 1234 1234 1234)' style={{ width: '250%', height: '250%' }}></input>
                        </div>
                        <div>
                            <input placeholder='Expiration (MM/YY)' style={{ width: '125%', height: '250%' }}></input>
                        </div>
                        <div>
                        <input placeholder='CVC' style={{ marginLeft: '25%', width: '125%', height: '250%' }}></input>
                        </div>
                    </div>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'start', 
                    marginBottom: '3%' }}>
                        <div style={{ marginRight: '30%'}}>
                            <select style={{ width: '350%', height: '250%' }}>
                                <option>United States</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <input placeholder='ZIP' style={{ marginLeft: '29%', width: '250%', height: '250%' }}></input>
                        </div>
                    </div>
                    <button style={{ width: '93.5%', marginTop: '3.5%'}} onClick={() => handleOnClick()}>Book Now</button>
                    <label>{booking}</label>
                    <label>{status}</label>
                </div>
            </div>
            <div style={{ top: '10.1%', 
            left: '62.5%', 
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            width: '25%',
            borderStyle: 'solid',
            padding: '1%',
            zIndex: '9999'
            }}>
                <div className='review-hotel' style={{ marginBottom: '2%' }}>
                    <label>Price Summary</label>
                </div>
                <div className='review-hotel' style={{ backgroundColor: 'navy', width: '100%', padding: '2%', color: 'white', marginBottom: '2%' }}>
                    <label>Description</label>
                </div>
                <div style={{ padding: '1%', marginTop: '1%', marginBottom: '2%' }}>
                    <label>Room 1 {dummyProps.roomType}</label>
                </div>
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>Retail Price:</label>
                    <label>{dummyProps.price}</label>
                </div>
                <hr />
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>Booking Cost:</label>
                    <label>{dummyProps.price}</label>
                </div>
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>Taxes and Fees:</label>
                    <label>{dummyProps.taxes}</label>
                </div>
                <hr />
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>To Pay:</label>
                    <label>{`$${Number(dummyProps.price.slice(1)) + Number(dummyProps.taxes.slice(1))}`}</label>
                </div>
            </div>
        </div>
    )
};

export default ReviewBooking;