import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios, { AxiosResponse } from "axios";
import ReviewBooking from "../../components/ReviewBooking";
import CheckoutForm from '../../components/CheckoutForm';
require('dotenv').config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/backend/.env" });

const stripePromise = loadStripe(`pk_test_51MRmu5Lv44uqD0Xkf4p0eZUewscyL3FdPfbZKzxHxAC1Js99vTF7wb60pTUyCbnf8PsvqNbfyIROviRFnoJPEV5E00HXo96HRK`);

const BookingReview = () => {
    const router = useRouter();
    const { id }  = router.query;
    console.log(id, 'nav');
    const [clientKey, setClientKey] = useState<string | null>(null);
    const [clientID, setClientID] = useState<string | null>(null);

    console.log('key: ', clientKey, 'id: ', clientID);
    
    useEffect(() => {
        const roomInfo = localStorage.getItem('currentRoom');
        const wrapper = async () => {
            const { data }: AxiosResponse = await axios.post('/api/payment/create-payment-intent/', {
                amount: roomInfo && JSON.parse(roomInfo).price
            });
            setClientKey(data.clientSecret);
            setClientID(data.paymentID);
            console.log(data);
        };
        wrapper();
    }, []);

    const options = {
        clientSecret: clientKey || '',
        appearance: {
            variables: {
                spacingUnit: '3px',
            },
        },
      };

    console.log(options);

    return (
        <div>
            <ReviewBooking />
            <div style={{ width: '55%', marginLeft: '5%', marginBottom: '2%' }}>
                {clientKey && clientID && <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm clientSecret={clientKey} paymentID={clientID} nav={id} />
                </Elements> || 'Loading...'}
            </div>
        </div>
        
    );
};

export default BookingReview;   