import React, {useState, useEffect } from "react"
import axios, { AxiosResponse } from 'axios';
import Image from 'next/image';
import pic from './checkins.png';

const Confirm = () => {
    const [data, setData] = useState(null);
    const [cancelSelect, setCancelSelect] = useState<boolean>(true);
    const [cancel, setCancel] = useState<string>("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const objectPassed = params.get('details');
        if (objectPassed) {
            setData(JSON.parse(objectPassed));
        }
    }, []);

    const handleCancellation = async (): Promise<void | null> => {
        setCancel('Processing...');
        const cancelCall: AxiosResponse<{ status: string, data: string }> = await axios.delete('http://localhost:5001/booking/cancel', {
            headers: { 'Content-Type': 'application/json' ,'pID': data?.pID },
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
            <label style={{ marginLeft: '5%' }}>{'Booking Details'}</label>
            <div style={{ marginLeft: '5%', marginTop: '4%' }}>
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
                        <label>Confirmation Number: *Checkins-specific number*</label>
                    </div>
                    <div style={{ display: 'flex', 
                    flexDirection: 'row',
                    padding: '0.5%', 
                    justifyContent: 'space-between',
                    marginTop: '3%' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center'}}>
                               Test Hotel 
                            </div>
                            <div>
                                <Image src={pic} width={700} height={200} alt="Thing" /> 
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <div style={{ padding: '0.5%', display: 'flex', flexDirection: 'column', marginBottom: '40%' }}>
                                    <label>{data?.address}</label>
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
                                    <label>Room 1 - Dormitory Room</label>
                                    <label>Guest Name</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', marginBottom: '3%', display: 'flex', justifyContent: 'space-between' }}>
                                    <label>Checkin Date:</label>
                                    <label>{data?.checkin}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Checkout Date:</label>
                                    <label>{data?.checkout}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Nights:</label>
                                    <label>{data?.bookFor}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Booking ID:</label>
                                    <label>*specific ID*</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '3%' }}>
                                    <label>Amount paid:</label>
                                    <label>{`$${Number(data?.price.slice(1)) + Number(data?.taxes.slice(1))}`}</label>
                                </div>
                                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'center', marginBottom: '3%' }}>
                                    <label>{data?.refund}</label>
                                </div>
                                {cancelSelect && (
                                    <button style={{ transform: 'scale(0.55)' }} onClick={handleCancellation}>
                                    Cancel Booking
                                    </button>
                                )}
                                <label>{cancel}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Confirm