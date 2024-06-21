import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosResponse } from 'axios'
import Navbar from './Navbar'
import '../styles/App.css'

interface Guests {
    age: null,
      first_name: string,
      first_name_original: string,
      is_child: boolean,
      last_name: string,
      last_name_original: string
};

interface GuestData {
  adults_number: number,
  children_number: number,
  guests: Guests[]
};

interface RoomData {
    bedding_name: Array<string>,
    guest_data: GuestData,
    meal_name: string,
    room_idx: number,
    room_name: string
};

interface Policies {
    end_at: null,
    penalty: { amount: string, amount_info: null, currency_code: string },
    start_at: null
};

interface TaxAmount {
    amount_tax: { amount: string, currency_code: string }, 
    is_included: boolean, 
    name: string 
};

interface Components {
    agreement_number: string,
    amount_payable: { amount: string, currency_code: string },
    amount_payable_vat: { amount: string, currency_code: string },
    amount_payable_with_upsells: { amount: string, currency_code: string },
    amount_refunded: { amount: string, currency_code: string },
    amount_sell_b2b2c: { amount: string, currency_code: string },
    api_auth_key_id: null,
    cancellation_info: { free_cancellation_before: null, policies: Policies[] },
    cancelled_at: null,
    checkin_at: string,
    checkout_at: string,
    hotel_data: { id: string, order_id: string },
    invoice_id: string,
    is_cancellable: boolean,
    is_checked: boolean,
    nights: number,
    order_id: number,
    order_type: string,
    partner_data: { order_comment: null, order_id: string },
    payment_data: {
      invoice_id: number,
      invoice_id_v2: string,
      paid_at: null,
      payment_by: null,
      payment_due: string,
      payment_pending: string,
      payment_type: string
    },
    roomnights: number,
    rooms_data: RoomData[],
    status: string,
    supplier_data: { confirmation_id: null, name: null, order_id: string },
    taxes: TaxAmount[],
    user_data: { arrival_datetime: null, email: string, user_comment: null },
    address: string,
    images: string[],
    star_rating: string,
    latitude: string, 
    longitutde: string
  }

const Reservation: React.FC = () => {
    const router = useRouter();
    const [hotel, setHotel] = useState<string | null>(null);
    const [user, setUser] = useState<string | null>(null);
    const [pageNum, setPageNum] = useState<number>(1);
    const [currNum, setCurrNum] = useState<number>(1);
    const [reservations, setReservations] = useState<Components[] | null>(null);
    const [details, setDetails] = useState<Components | null>(null);
    const [show, setShow] = useState<boolean>(false);
    const [retrieving, setRetrieving] = useState<boolean>(false);
    const [scale, setScale] = useState<boolean>(false);
    const hasMounted = useRef(true);

    const increment = () => {
        setCurrNum(prevNum => prevNum + 1);
    };

    const flushCache = async () => {
        await axios.delete('http://localhost:5001/reservation/clear', {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        console.log('cleared');
    };

    const apiCall = async (currPage: number): Promise<Array<Components>> => {
        try {
            if (!reservations) {
                await flushCache();
            }
            const request: AxiosResponse = await 
            axios.get('http://localhost:5001/reservation/list', {
                params: { pg: currPage },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            const { data } = request.data;
            const { list, pages, user } = data;
            console.log(list, currNum, pageNum, user);
            setUser(user);  
            if (pages > 1 || pageNum != pages) {
                setPageNum(pages); 
            };
            if (!reservations) {
                setReservations(list);
            };
            return list;
        } catch (e) {
            console.error(e)
            return []
        };
    };

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            const initialLoad = async () => {
                await apiCall(currNum);
            };
            initialLoad();
            return
        };
        const wrapper = async () => {
            const n = reservations?.length || 0;
            const arr = await apiCall(currNum);
            if (reservations && arr.length > n) {
                console.log('check');
                setReservations(arr);
                setCurrNum(currNum);
                setShow(false);
                return
            } else {  
                if (currNum != pageNum) {
                    increment();
                };
            };
        };
        wrapper();
    }, [currNum])

    console.log(user);

    useEffect(() => {
        const reservationLookup = async (): Promise<void> => {
            if (hotel) {
                try {
                    const request: AxiosResponse = await axios.get('http://localhost:5001/reservation/details', {
                        params: { hotel: hotel },
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    });
                    const { data } = request.data;
                    setDetails(data);
                    setRetrieving(false);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        reservationLookup();
    }, [hotel])

    if (!reservations) {
        return <div>Loading...</div>;
    };

    const handleViewHotel = async () => {
        await flushCache();
        localStorage.setItem('reservationDetails', JSON.stringify(details))
        router.push(`/reservation/details?info=${details?.agreement_number}`)
    };

    const sideItinerary = () => {  
        if (details && !retrieving) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '-25%' }}>
                    <h3>Trip Details:</h3>
                    <div className='itin-items'>
                        <p>Hotel:</p>
                        <p>{details.hotel_data.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</p>
                    </div>
                    <div className='itin-items'>
                        <p>Check In:</p>
                        <p>{details.checkin_at}</p>
                    </div>
                    <div className='itin-items'>
                        <p>Check Out:</p>
                        <p>{details.checkin_at}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Nights:</p>
                        <p>{details.nights}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Booked By:</p>
                        <p>{details.payment_data.payment_by || user}</p>
                    </div> 
                    <h3>Room Information</h3>
                    <div className='itin-items'>
                        <p>Order ID:</p>
                        <p>{details.order_id}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Room Type:</p>
                        <p>{details.rooms_data[0].bedding_name[0][0].toUpperCase() + details.rooms_data[0].bedding_name[0].substring(1)}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Room Name:</p>
                        <p>{details.rooms_data[0].room_name.split('(')[0].trim().split(/\s+/).slice(0, 4).join(' ')}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Email:</p>
                        <p>{details.user_data.email}</p>
                    </div> 
                    <div className='itin-items'>
                        <p>Price:</p>
                        <p>{`$${details.amount_payable.amount}`}</p>
                    </div> 
                </div>  
            )
        } else if (retrieving) {
            return <p>Loading...</p>
        }; 
    };

    return (
        <>
            <header><Navbar /></header>
            <div className={`reservation-container ${scale ? 'scale' : ''}`}>
                <div style={{ marginBottom: '2%', marginTop: '-2%', marginLeft: '86.5%' }}>
                    <button onClick={() => setScale(true)} style={{ backgroundColor: 'transparent', padding: '1%', borderStyle: 'dashed' }}>{'>> Toggle Side Itinerary'}</button>
                </div>
                <div className='above-columns'>
                    <label className='item-label'>Guests</label>
                    <label className='item-label'>Day In</label>
                    <label style={{ marginRight: '10%' }}>Day Out</label>
                    <label className='item-label'>Hotel</label>
                    <label>Nights</label>
                </div>
                {reservations.map(order => (
                    <div className='columns' onClick={() => {
                        setHotel(order.invoice_id);
                        setScale(true);
                        setRetrieving(true);
                    }}>
                        <label>{user}</label>
                        <label style={{ marginRight: '20px', width: '120px' }}>{new Date(order.checkin_at).toDateString()}</label>
                        <label style={{ marginRight: '10px', width: '120px' }}>{new Date(order.checkout_at).toDateString()}</label>
                        <label className='hotel-specific'>{order.hotel_data.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</label>
                        <label style={{ maxWidth: '5px' }}>{order.nights}</label>
                    </div>
                ))}
                {currNum != pageNum && <button disabled={currNum == pageNum} style={{ backgroundColor: 'transparent', borderColor: 'transparent', color: 'navy'}} onClick={() => {
                    setCurrNum(currNum + 1);
                    setShow(true);
                }}>Show More...</button>}
                {show && <label>Loading...</label>}
            </div>
            {scale && 
            <div className='itin-tag'>
                <div style={{ marginTop: '30%' }}>{sideItinerary() || <p>No Hotel Selected</p>}</div>
                <button onClick={() => handleViewHotel()} style={{ marginTop: '5%', marginRight: '45.7%', padding: '1%' }}>View Full Itinerary</button>
                <button onClick={() => setScale(false)} style={{ marginTop: '5%', padding: '1%' }}>Close Itinerary</button>
            </div>}
        </>
    );
};

export default Reservation;
