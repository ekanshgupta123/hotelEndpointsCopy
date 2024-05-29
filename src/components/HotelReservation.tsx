import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { NextResponse } from 'next/server';
import axios from 'axios'
import '../styles/App.css';
import { NextApiResponse } from 'next';

interface UserInter {
    name: string,
    email: string,
    password: string
}
const dummyUser: UserInter = {
    name: "Vimal Kohli",
    email: "vimal@checkins.ai",
    password: "xyz"
}

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
    const [reservations, setReservations] = useState<Components[] | null>(null);
    const [details, setDetails] = useState<Components | null>(null);

    useEffect(() => {
        const apiCall = async (): Promise<void> => {
            try {
                const response = await axios.post('/api/reservation/details', {
                    name: dummyUser.name
                })
                const { multiple } = response.data
                setReservations(multiple)
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
                        hotel: hotel, name: dummyUser.name
                    })
                    const { single } = response.data
                    setDetails(single)
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

    return (
        <div className="reservation-container">
            {reservations.map(order => (
                <div key={order.order_id}>
                    <label className='label-div'>Guest: {dummyUser.name}</label>
                    <label className='label-div'>In: {order.checkin_at}</label>
                    <label className='label-div'>Out: {order.checkout_at}</label>
                    <button className='label-div' onClick={() => setHotel(order.invoice_id)}>Hotel: {order.hotel_data.id}</button>
                    <label className='label-div'>Nights: {order.nights}</label>
                </div>
            ))}
            <div>{details?.hotel_data.id}</div>
            <div>{details?.checkin_at}</div>
            <div>{details?.checkout_at}</div>
            <div>
                <button onClick={() => handleViewItinerary(id || "some_id")}>View Full Itinerary</button>
            </div>
        </div>
    );
};

export default Reservation;
