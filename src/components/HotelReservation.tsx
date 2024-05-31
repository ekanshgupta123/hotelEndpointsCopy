import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import axios from 'axios'
import '../styles/App.css';
import Navbar from './Navbar'

interface Guests {
    age: null,
      first_name: string,
      first_name_original: string,
      is_child: boolean,
      last_name: string,
      last_name_original: string
}

interface GuestData {
  adults_number: number,
  children_number: number,
  guests: Guests[]
}

interface RoomData {
    bedding_name: Array<string>,
    guest_data: GuestData,
    meal_name: string,
    room_idx: number,
    room_name: string
}

interface Policies {
    end_at: null,
    penalty: { amount: string, amount_info: null, currency_code: string },
    start_at: null
}

interface TaxAmount {
    amount_tax: { amount: string, currency_code: string }, 
    is_included: boolean, 
    name: string 
}

interface Components {
    agreement_number: string,
    amount_payable: { amount: string, currency_code: string },
    amount_payable_vat: { amount: string, currency_code: string },
    amount_payable_with_upsells: { amount: string, currency_code: string },
    amount_refunded: { amount: string, currency_code: string },
    amount_sell: { amount: string, currency_code: string },
    amount_sell_b2b2c: { amount: string, currency_code: string },
    api_auth_key_id: null,
    cancellation_info: { free_cancellation_before: null, policies: Policies[] },
    cancelled_at: null,
    checkin_at: string,
    checkout_at: string,
    contract_slug: string,
    created_at: string,
    has_tickets: boolean,
    hotel_data: { id: string, order_id: null },
    invoice_id: string,
    is_cancellable: boolean,
    is_checked: boolean,
    meta_data: { voucher_order_comment: null },
    modified_at: string,
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
    source: string,
    status: string,
    supplier_data: { confirmation_id: null, name: null, order_id: string },
    taxes: TaxAmount[],
    total_vat: { amount: string, currency_code: string, included: boolean },
    upsells: [],
    user_data: { arrival_datetime: null, email: string, user_comment: null }
  }

const Reservation: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [rendered, setRendered] = useState<boolean>(false)
    const [hotel, setHotel] = useState<string | null>(null);
    const [user, setUser] = useState<string | null>(null)
    const [reservations, setReservations] = useState<Components[] | null>(null);
    const [details, setDetails] = useState<Components | null>(null);
    const [retrieving, setRetrieving] = useState<boolean>(false)
    const [scale, setScale] = useState<boolean>(false)

    useEffect(() => {
        const apiCall = async (): Promise<void> => {
            try {
                const response = await axios.post('/api/reservation/list')
                const { multiple, userName } = response.data
                setReservations(multiple);
                setUser(userName);
            } catch (e) {
                console.error(e)
            }
        }
        if (!rendered) {
            apiCall();
            setRendered(true);
        }
    }, [])

    useEffect(() => {
        const reservationLookup = async (): Promise<void> => {
            if (hotel) {
                try {
                    const response = await axios.post('/api/reservation/details', {
                        hotel: hotel, name: user
                    })
                    const { single } = response.data;
                    setDetails(single);
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
    }

    const handleViewItinerary = (ID: typeof id) => {
        const objectString = JSON.stringify(details)
        router.push(`/hotel/details/${ID}?details=${encodeURIComponent(objectString)}`)
    }

    const sideItinerary = () => {
        if (details) {
            return (
                <div>
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
        } else if (!details && retrieving) {
            return <p>Loading...</p>
        } 
    }
    return (
        <>
            <header><Navbar /></header>
            <div className={`reservation-container ${scale ? 'scale' : ''}`}>
                <div className='above-columns'>
                    <label className='guest-label'>Guests</label>
                    <label className='in-label'>In</label>
                    <label className='out-label'>Out</label>
                    <label className='hotel-label'>Hotel</label>
                    <label className='nights-label'>Nights</label>
                </div>
                {reservations.map(order => (
                    <div className='columns'>
                        <label>{user}</label>
                        <label style={{ marginRight: '20px', maxWidth: '100px' }}>{new Date(order.checkin_at).toDateString()}</label>
                        <label style={{ marginRight: '10px', maxWidth: '100px' }}>{new Date(order.checkout_at).toDateString()}</label>
                        <button className='button-specific' onClick={function () {
                            setHotel(order.invoice_id);
                            setScale(true);
                            setRetrieving(true);
                        }}>{order.hotel_data.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</button>
                        <label style={{ maxWidth: '5px' }}>{order.nights}</label>
                    </div>
                ))}
            </div>
            {scale && 
            <div className='itin-tag'>
                <div style={{ marginTop: '30%' }}>{sideItinerary() || <p>No Hotel Selected</p>}</div>
                <button onClick={() => setScale(false)} style={{ marginTop: '5%' }}>Close Itinerary</button>
                <button onClick={() => handleViewItinerary(id || "")}>View Full Itinerary</button>
            </div>
            }
            <div>
                <div>
                    <button onClick={() => setScale(true)}>Toggle Side Itinerary</button>
                </div>
            </div>
        </>
    );
};

export default Reservation;
