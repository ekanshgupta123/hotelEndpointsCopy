import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';

interface HotelPage {
    "id": string, 
    "checkin": string, 
    "checkout": string, 
    "guests": [{
        "adults": number,
        "children": [] | [number]
    }],
    "language"?: string,
    "currency"?: string,
    "residency"?: string
}

interface Booking {
    pid: string
}

const dummyHotelSelected: HotelPage = {
    "id": "test_hotel_do_not_book",
    "checkin": "2024-06-01",
    "checkout": "2024-06-02",
    "guests": [
        {
            "adults": 1,
            "children": []
        }
    ]
  };

const Booking: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [hotel, setHotel] = useState<HotelPage>(dummyHotelSelected)
    const [booking, setBooking] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [cancel, setCancel] = useState<string>("")

    const handleOnClick = async () => {
        const createRes = await fetch('api/booking/create', {
            method: "POST",
            body: JSON.stringify({
                id: hotel.id, 
                checkin: hotel.checkin, 
                checkout: hotel.checkout, 
                guests: hotel.guests
            })
        })
        const res = await createRes.json();
        const result = await res.pid
        setBooking(result)
    }

    const handleStatus = async (partnerID: string): Promise<void> => {
        const statusRes = await fetch('/api/booking/status', {
            method: "POST",
            body: JSON.stringify({ pid: partnerID })
        });
        const res = await statusRes.json();
        const statusArrive = await res.result;
        setStatus(statusArrive);
    
        if (statusArrive !== 'ok' && partnerID) {
            setTimeout(() => {
                handleStatus(partnerID);
            }, 1000);
        }
    };

    const handleCancellation = async (partnerID:string) => {
        const call = await fetch('/api/booking/cancel', {
            method: "POST",
            body: JSON.stringify({ pid: partnerID})
        })
        const data = await call.json()
        const status = await data.status
        setCancel(status)
    }

    return (
        <div>
            <div>{hotel.id}</div>
            <div>{hotel.checkin}</div>
            <div>{hotel.checkout}</div>
            <div>{hotel.guests[0].adults}</div>
            <div>
                <button onClick={() => handleOnClick()}>Book Now</button>
            </div>
                <button onClick={() => handleStatus(booking)}>See Status</button>
                <label>{status}</label>
            <div>
                <button onClick={() => handleCancellation(booking)}>Cancel</button>
                <label>{cancel}</label>
            </div>
        </div>
    )
}

export default Booking;