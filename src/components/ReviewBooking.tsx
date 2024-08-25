import React, { useEffect, useState } from 'react';
import InfoIcon from './Info';
import '../styles/App.css';

interface HotelSpecifics {
    "id": string;
    "name": string;
    "address": string;
    "star_rating": number;
    "amenity_groups": { amenities: string[], group_name: string }[];
    "price": number;
    "images": string[];
    "description": string;
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
    "taxes": any[];
    "key": string;
    "name": string;
    "price": number;
    "type": string;
    "cancellation": { type: string, date: any, refund: number}[];
    "cancellation_type": string;
    "rg_ext": any
}

interface BookingResponse { 
    "partnerID": string, 
    "objectID": string, 
    "pUUID": string,
    "credit": boolean,
    "userName": string[],
    "confirmation": string
};
  
const ReviewBooking: React.FC = () => {
    const [user, setUser] = useState<string>("");
    const [room, setRoom] = useState<HotelRoom | null>(null);
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
        star_rating: 0,
        amenity_groups: [{amenities: [""], group_name: ""}],
        price: 0,
        images: [""],
        description: "",
    });
    const [prices, setPrices] = useState<any>({});

    const [imgArray, setImgArray] = useState<string[]>(['']);
    const [imgMap, setImgMap] = useState<{ [ key: number ]: number }>({});


    useEffect(() => {
        const room = localStorage.getItem('currentRoom');
        const params = localStorage.getItem('searchParams');
        const specifics = localStorage.getItem('currentHotelData');
        const prices = localStorage.getItem('priceParams');
        const images = localStorage.getItem('images');
        if (room && params && specifics && prices && images) {
            setRoom(JSON.parse(room));
            setParameters(JSON.parse(params));
            setSpecifics(JSON.parse(specifics));
            setPrices(JSON.parse(prices));
            setImgArray(JSON.parse(images));
        };
    }, []);

    const handleDots = (index, size) => {
        const dots = Array(size).fill('◦');
        dots[index] = '•';
        return (dots.map(dot => <label>{dot}</label>));
    };

    const handleDecrease = (key, group) => {
        const value = imgMap[key];
        if (value || value == 0) {
            let result;
            value == 0
            ? (result = <label>{group[0]}</label>, setImgMap(prevMap => ({
                ...prevMap,
                [key]: group.length - 1
            })))
            : (result = <label>{group[value+1]}</label>, setImgMap(prevMap => ({
                ...prevMap,
                [key]: value - 1
            })));
            return result;
        } else {
            setImgMap(prevMap => ({
                ...prevMap,
                [key]: group.length - 1
            }));
            return <label>{group[1]}</label>
        };
    };

    const handleIncrease = (key, group) => {
        const value = imgMap[key];
        if (value) {
            let result;
            value == group.length - 1
            ? (result = <label>{group[0]}</label>, setImgMap(prevMap => ({
                ...prevMap,
                [key]: 0
            })))
            : (result = <label>{group[value+1]}</label>, setImgMap(prevMap => ({
                ...prevMap,
                [key]: value + 1
            })));
            return result;
        } else {
            setImgMap(prevMap => ({
                ...prevMap,
                [key]: 1
            }));
            return <label>{group[1]}</label>
        };
    };

    return (
        <div>
            <div style={{ marginTop: '2%' }}>
                <label style={{ marginLeft: '5%'}}>{'< Review Your Booking'}</label>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '55%',
                marginLeft: '5%',
                marginTop: '2%',
                borderStyle: 'solid',
                borderRadius: '8px',
                padding: '1%'
                }}>
                    <div style={{ display: 'flex'}}>
                        <div style={{ display: 'flex', marginRight: '2%', marginBottom: '1%' }}>
                            {imgArray.map((_, index) => (
                                index == 0 && 
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex' }}>
                                        <button onClick={() => handleDecrease(index, imgArray)}
                                        disabled={imgArray.length == 1}
                                        style={{ width: '14%', height: '14%', borderRadius: '20px', marginTop: '41%', marginRight: '2%', borderWidth: '1px', backgroundColor: 'transparent' }}>{'<'}</button>
                                        <img src={imgArray[imgMap[index] || 0].replace('{size}', '120x120')} alt='Room Image' style={{ marginRight: '1%', marginTop: '10%' }}/>
                                        <button onClick={() => handleIncrease(index, imgArray)}
                                        disabled={imgArray.length == 1}
                                        style={{ width: '14%', height: '14%', borderRadius: '20px', marginTop: '40%', marginLeft: '1.5%', borderWidth: '1px', backgroundColor: 'transparent' }}>{'>'}</button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <p>{handleDots(imgMap[index] || 0, imgArray.length)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1%' }}>
                            <div className='review-hotel'>
                                <label>{specifics.name}</label>
                            </div>
                            <div style={{ padding: '1%', marginBottom: '0.5%' }}>
                                <label>{Array(specifics.star_rating).fill('⭐').join('')}</label>
                            </div>
                            <div className='arbitrary'>
                                <label>{specifics.address}</label>
                            </div>
                            <div style={{ padding: '1%', marginBottom: '5%', marginTop: '10%', width: '140%' }}>
                                <label style={{ fontWeight: '600' }}>{room?.key}</label>
                            </div>
                        </div>
                    </div>
                    <div className='amenities'>
                        {specifics.amenity_groups.slice(0,8).map(group => (
                            <div>
                                <h4>{group.group_name}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column'}}>
                                    {group.amenities.slice(0,7).map(feat => (
                                        <li>{feat}</li>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', 
                flexDirection: 'column', 
                width: '55%',
                marginLeft: '5%',
                marginTop: '1%',
                marginBottom: '1%',
                borderStyle: 'solid',
                borderRadius: '8px'
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
                                {parameters.guests[0].adults} Adults, {parameters.guests[0].children.length} Children
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1%', marginTop: '1%' }}>
                        <div style={{ display: 'flex', gap: '7px' }}>
                            <label>Refund Policy: {room?.cancellation_type}</ label>
                            {room && room?.cancellation_type != 'No Refund' && <InfoIcon infoText={room.cancellation} flag='remove' />}
                        </div>
                        {/* <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: '600', marginBottom: '1%' }}>Refund: </label>
                            {room.cancellation.includes('\n') && room.cancellation.split('\n').map((opt, index) => <p style={{ whiteSpace: 'pre-wrap' }}>{index == 1 && ('↳' + opt) || opt }</p>) || room.cancellation}
                        </div> */}
                    </div>
                </div>
            </div>
            <div style={{ top: '10%', 
            left: '61%', 
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            width: '30%',
            borderStyle: 'solid',
            padding: '1%',
            borderRadius: '8px'
            }}>
                <div className='review-hotel' style={{ backgroundColor: 'navy', padding: '2%', color: 'white', marginBottom: '2%' }}>
                    <label>Price Summary</label>
                </div>
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <input placeholder='Optional: Guest Name' onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUser(e.target.value)
                    }}/>
                </div>
                <div style={{ padding: '1%', marginTop: '1%', marginBottom: '2%' }}>
                    <label>Room: {room?.key}</label>
                </div>
                <hr />
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>Booking Cost:</label>
                    <label>${room?.price}</label>
                </div>
                {room?.taxes.map(tax => <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1%' }}>
                    <label>+ {tax.name.replace('_', ' ')}</label>
                    <label>${tax.amount}</label>
                </div>)}
                <hr />
                <div style={{ padding: '1%', marginTop: '1%', display: 'flex', justifyContent: 'space-between', marginBottom: '2%' }}>
                    <label>Subtotal:</label>
                    <label>{`$${(Number(room?.price) + room?.taxes.reduce((acc, curr) => acc + Number(curr.amount), 0)).toFixed(2)}`}</label>
                </div>
            </div>
        </div>
    )
};

export default ReviewBooking;