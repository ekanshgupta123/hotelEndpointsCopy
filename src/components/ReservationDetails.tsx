import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import pic from './checkins.png'
import Image from 'next/image';

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

// interface Components {
//     agreement_number: string,
//     amount_payable: { amount: string, currency_code: string },
//     amount_payable_vat: { amount: string, currency_code: string },
//     amount_payable_with_upsells: { amount: string, currency_code: string },
//     amount_refunded: { amount: string, currency_code: string },
//     amount_sell: { amount: string, currency_code: string },
//     amount_sell_b2b2c: { amount: string, currency_code: string },
//     api_auth_key_id: null,
//     cancellation_info: { free_cancellation_before: null, policies: Policies[] },
//     cancelled_at: null,
//     checkin_at: string,
//     checkout_at: string,
//     contract_slug: string,
//     created_at: string,
//     has_tickets: boolean,
//     hotel_data: { id: string, order_id: string },
//     invoice_id: string,
//     is_cancellable: boolean,
//     is_checked: boolean,
//     meta_data: { voucher_order_comment: null },
//     modified_at: string,
//     nights: number,
//     order_id: number,
//     order_type: string,
//     partner_data: { order_comment: null, order_id: string },
//     payment_data: {
//       invoice_id: number,
//       invoice_id_v2: string,
//       paid_at: null,
//       payment_by: null,
//       payment_due: string,
//       payment_pending: string,
//       payment_type: string
//     },
//     roomnights: number,
//     rooms_data: RoomData[],
//     source: string,
//     status: string,
//     supplier_data: { confirmation_id: null, name: null, order_id: string },
//     taxes: TaxAmount[],
//     total_vat: { amount: string, currency_code: string, included: boolean },
//     upsells: [],
//     user_data: { arrival_datetime: null, email: string, user_comment: null }
//   }

const ReservationDetails: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [hotel, setHotel] = useState<any>(null);

    useEffect(() => {
        if (id) {
            const params = new URLSearchParams(window.location.search)
            const objectPassed = params.get("details")
            if (objectPassed) {
                setHotel(JSON.parse(objectPassed));
            }
        };
    }, [id]);

    if (!hotel) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '2%' }}>
            <label>{'< Return to Trips'}</label>
            <div style={{ display: 'flex', marginTop: '1%', marginBottom: '1.5%' }}>
                <Image src={pic} width={140} height={40} alt='img' />
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1%' }}>
                    <label>{hotel.hotel_data.id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</label>
                    <label>Hotel Address</label>
                    <label>Stars</label>
                </div>
            </div>
            <div style={{fontWeight: '600', fontSize: '17px', marginBottom: '1%' }}>
                Trip Information
            </div>
            <div style={{ fontWeight: '600' }}>
                Room
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1%' }}>
                    <label style={{ marginBottom: '7%'}}>Check-In</label>
                    <label style={{ fontWeight: '600', marginTop: '1%' }}>{new Date(hotel.checkin_at).toDateString()}</label>
                </div>
                <div style={{ marginTop: '2%', marginLeft: '3%' }}>
                    →
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1%', marginLeft: '3.5%' }}>
                    <label style={{ marginBottom: '7%'}}>Check-Out</label>
                    <label style={{ fontWeight: '600', marginTop: '1%' }}>{new Date(hotel.checkout_at).toDateString()}</label>
                </div>
            </div>
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column', marginTop: '1%', fontSize: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    <label>Hotel Agreement/Confirmation #</label>
                    <label>{hotel.agreement_number}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px'}}>
                    <label>Guests</label>
                    <label>{`${hotel.rooms_data[0].guest_data.guests['[0][first_name]']} ${hotel.rooms_data[0].guest_data.guests['[0][last_name]']}`}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px'}}>
                    <label>Email</label>
                    <label>{hotel.user_data.email}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px'}}>
                    <label>Mobile</label>
                    <label>{hotel.user_data.phone}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px'}}>
                    <label>Nights</label>
                    <label>{hotel.nights}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px' }}>
                    <label>Booking/Order ID</label>
                    <label>{hotel.order_id}</label>
                </div>
                <div style={{fontWeight: '600', fontSize: '17px', marginBottom: '1.5%', marginTop: '2.5%' }}>
                    Room Information
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px'}}>
                    <label>Room Type</label>
                    <label>{hotel.rooms_data[0].room_name}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px'}}>
                    <label>Board Basics</label>
                    <label>{hotel.rooms_data[0].meal_name}</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5%', fontSize: '15px' }}>
                    <label>Rooms</label>
                </div>
                <div style={{fontWeight: '600', fontSize: '17px', marginBottom: '1.5%', marginTop: '2.5%' }}>
                    Summary of Charges
                </div>
                <div style={{fontWeight: '600', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <label>Booking Cost</label>
                    <label>{`$${hotel.amount_payable.amount}`}</label>
                </div>
                <div style={{ fontSize: '10px', marginTop: '1%' }}>
                    <label>Payment has been made for the full amount of the reservation; 
                        however, the guest may provide a valid credit card upon check in
                        for any incidentals. Please be advised the hotel may place
                        a pre-authorization on this card that will be released upon checkout. </label>
                </div>
                <div style={{ marginTop: '1%' }}>
                    <label>*Insert Refund Policy Here*</label>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetails;