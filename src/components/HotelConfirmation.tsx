import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from 'axios';
import Image from 'next/image';
import { useRouter } from "next/router";
import Spinner from './Spinner';

interface HotelSpecifics {
    "id": string;
    "name": string;
    "address": string;
    "starRating": number;
    "amenities": string[];
    "price": number;
    "images": string[];
    "description": string;
};

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
};

interface HotelRoom {
    "name": string;
    "price": number;
    "type": string;
    "rg_ext": any
};

interface BookingResponse { 
    "partnerID": string, 
    "userName": string[],
    "confirmation": string
};


const Confirm = () => {
    const router = useRouter();
    const [cancelSelect, setCancelSelect] = useState<boolean>(true);
    const [cancel, setCancel] = useState<string>("");
    const [room, setRoom] = useState<HotelRoom>({
        name: "",
        price: 0,
        type: "",
        rg_ext: {},
    });
    const [parameters, setParameters] = useState<HotelPage>({
        "checkin": "", 
        "checkout": "", 
        "guests": [{
            "adults": 1,
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
    const [status, setStatus] = useState<string>("");
    const [booking, setBooking] = useState<string>("");
    const [user, setUser] = useState<string>("");
    const [orderID, setOrderID] = useState<string>("");
    const [pid, setPid] = useState<string>("");
    const [paymentID, setPaymentID] = useState<string>('');
    const [origin, setOrigin] = useState<string>('');
    const [isHidden, setIsHidden] = useState<boolean>(true);

    const handleStatus = async (partner?: string): Promise<void> => {
        try {
            const statusCall: AxiosResponse<{ status: string, data: string }> = await axios.get('http://localhost:5001/booking/status', {
                params: { pID: partner },  
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            const { status, data } = statusCall.data;
            if (data =='ok') {
                setStatus(status);
            };
            console.log('finished status');

        } catch (e) {
            console.error(e);
        };
    };

    useEffect(() => {
        const windowParam = new URLSearchParams(window.location.search);
        const objectPassedOne = windowParam.get('payID');
        const objectPassedTwo = windowParam.get('nav');
        const PAYID = objectPassedOne && objectPassedOne;
        const ORIGINPAGE = objectPassedTwo && objectPassedTwo;
        setPaymentID(PAYID!);
        setOrigin(ORIGINPAGE!);

        const room = localStorage.getItem('currentRoom');
        const params = localStorage.getItem('searchParams');
        const specifics = localStorage.getItem('currentHotelData');
        const ROOM = room && JSON.parse(room), PARAMS = params && JSON.parse(params), SPECIFICS = specifics && JSON.parse(specifics);
        setRoom(ROOM);
        setParameters(PARAMS);
        setSpecifics(SPECIFICS);

        const wrapper = async () => {
            try {
                setStatus('Please wait a moment.');
                const bookCall: AxiosResponse<{ status: string, data: BookingResponse }> = await axios.post('http://localhost:5001/booking/create', {
                    data: { id: 'test_hotel_do_not_book' || SPECIFICS.id,
                    checkin: PARAMS.checkin,
                    checkout: PARAMS.checkout,
                    guests: [
                        {
                            "adults": PARAMS.guests[0].adults,
                            "children": PARAMS.guests[0].children.length && [PARAMS.guests[0].children.length] || [] 
                        }
                    ],
                    currency: PARAMS.currency,
                    language: PARAMS.language }, lookup: {
                        class: 3,
                        quality: 2,
                        sex: 0,
                        bathroom: 1,
                        bedding: 3,
                        family: 0,
                        capacity: 2,
                        club: 0,
                        bedrooms: 0,
                        balcony: 0,
                        view: 0,
                        floor: 0
                      } || ROOM.lookup 
                    }, 
                    { headers: {"Content-Type" : "application/json"},
                    withCredentials: true },
                );
                const { status, data } = bookCall.data;
                setBooking(status);
                setStatus('Finalizing...');
                const { partnerID, userName, confirmation } = data;
                setUser(userName.join(' '));
                setOrderID(confirmation);
                setPid(partnerID);
                setIsHidden(false);
                await handleStatus(partnerID);
            } catch (e) {
                console.error(e);
                const { data } = await axios.post('/api/payment/cancel-payment-intent/', {
                    paymentID: PAYID
                });
                console.log(data.status);
                router.push(`/hotel/${ORIGINPAGE}?flag=true`);
            };
        };
        wrapper();
    }, []);

    const handleCancellation = async (): Promise<void | null> => {
        setCancel('Processing...');
        const cancelCall: AxiosResponse<{ status: string, data: string }> = await axios.delete('http://localhost:5001/booking/cancel', {
            headers: { 'Content-Type': 'application/json' ,'pID': pid },
            withCredentials: true
        });
        const result = cancelCall.data;
        if (result.data == 'ok') {
            setCancelSelect(false);
        };
        setCancel(result.status);
    };

    return (
        <div style={{ transform: 'scale(0.85)', height: '30%', fontFamily: "gill sans" }}>
            <a style={{ marginLeft: '5%' }} onClick={() => {
                router.push(`/hotel/${origin}`)
            }}> {'<'} Search {specifics.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} hotels</a>
            {!isHidden && <div style={{ marginLeft: '5%', marginTop: '4%' }}>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '90%',
                boxShadow: '0 0 7px rgba(0, 0, 0, 0.5)',
                marginTop: '-2%'
                }}>
                    <div style={{ padding: '1%', marginTop: '1%', justifyContent: 'center', display: 'flex', fontSize: '30px', fontWeight: '600' }}>
                        <label>Hotel Booking Confirmation</label>
                    </div>
                    <div style={{ padding: '0.5 %', justifyContent: 'center', display: 'flex', fontSize: '22px' }}>
                        <label>Confirmation / Order Number: {orderID}</label>
                    </div>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    padding: '0.5%', 
                    justifyContent: 'space-between',
                    marginTop: '3%', 
                    marginLeft: '2%' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center'}}>
                               {specifics.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                            </div>
                            <div style={{ display: 'flex', padding: '1.5%' }}>
                                <Image src={specifics.images[0].replace('{size}', '200x200')} width={360} height={360} alt="Thing" /> 
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <div style={{ padding: '0.5%', display: 'flex', flexDirection: 'column', marginBottom: '40%' }}>
                                    <label>{specifics.address}</label>
                                </div>
                            </div>
                        </div>
                        <div> 
                            <div style={{ marginTop: '8%',
                                marginLeft: '-130%', 
                                display: 'flex',
                                flexDirection: 'column',
                                transform: 'scale(2.5)',
                                transformOrigin: 'top right',
                                width: '200%',
                                fontSize: '8px',
                                boxShadow: '0 1px 1px rgba(0, 0, 0, 0.5)',
                                padding: '1%'
                                }}>
                                <div className='review-hotel' style={{ marginBottom: '3%' }}>
                                    <label>Room & Guests</label>
                                </div>
                                <div className='review-hotel' style={{ width: '97%', padding: '2%', marginBottom: '3%', display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                    <label>Room 1 - {room.type}</label>
                                    <label>{user}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', marginBottom: '3%', display: 'flex', justifyContent: 'space-between' }}>
                                    <label>Checkin Date:</label>
                                    <label>{parameters.checkin}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Checkout Date:</label>
                                    <label>{parameters.checkout}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Nights:</label>
                                    <label> </label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Booking ID:</label>
                                    <label> </label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Amount paid:</label>
                                    <label>{`$${Number(room.price)}`}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'center', marginBottom: '3%' }}>
                                    <label> </label>
                                </div>
                                {cancelSelect && (
                                    <button style={{ transform: 'scale(0.55)' }} onClick={() => handleCancellation()}>
                                    Cancel Booking
                                    </button>
                                )}
                                <label>Cancel: {cancel}</label>
                                <label>Sttaus: {status}</label>
                                <label>Booking: {booking}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div> || <Spinner />}
        </div>
    )
};

export default Confirm