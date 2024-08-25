import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import '../styles/HotelDisplay.css';
import ImageSlider from './Slider';
import InfoIcon from './Info';
import BedIcon, { MealIcon, 
    RefundIcon, 
    SparkleIcon, 
    WifiIcon, 
    ParkingIcon,
    SmokingIcon, 
    BathIcon } from './Icons';
import Spinner from './Spinner';
import GoogleMapComponent from './Map';

interface HotelDetails {
    id: string;
    price: number;
    name?: string;
    address?: string;
    star_rating?: number;
    images?: string[];
    amenity_groups: AmenityGroup[];
    description_struct: DescriptionStruct[];
    room_groups: RoomGroup[];
    latitude: string,
    longitude: string
}

interface AmenityGroup {
    group_name: string;
    amenities: string[];
}

interface DescriptionStruct {
    title: string;
    paragraphs: string[];
}

interface RoomGroup {
    room_group_id: number;
    images: string[];
    name: string;
    room_amenities: string[];
    rg_ext: {
        class: number;
        quality: number;
        sex: number;
        bathroom: number;
        bedding: number;
    };
    name_struct: {
        main_name: string;
        bathroom: string | null;
        bedding_type: string | null;
    };
}

interface HotelSearchParams {
    checkin: string;
    checkout: string;
    residency: string;
    language: string;
    guests: {
        adults: number;
        children: {
            age: number;
        }[];
    }[];
    region_id: number | null;
    currency: string;
}

interface RoomPrice {
    key: string;
    name: string;
    price: number;
    amenities: string[];
    miscRoom: string | null;
    meal: string;
    cancellation_type: string;
    cancellation: { type: string, date: any, refund: number }[] | string | null;
    refundable: boolean;
    taxes: any;
}

interface HotelRoom {
    priceWithoutMealNoRefund: RoomPrice;
    hotel: string;
    options: RoomPrice[];
    type: string;
    room_data_trans?: {
        main_room_type: string;
        main_name: string;
        bathroom: string;
        bedding_type: string;
        misc_room_type: string;
    };
    meal?: string;
    bedding_type: string;
    cancellable: RoomPrice[];
    meals: RoomPrice[]
}

const HotelPage = () => {
    console.log("I'm here in Hotel Page");
    const [hotelData, setHotelData] = useState<HotelDetails | null>(null);
    const [searchParams, setSearchParams] = useState<HotelSearchParams | null>(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [stuff, setStuff] = useState<{ [key: string]: HotelRoom }>({});
    const [hotelPrice, setHotelPrice] = useState(0);
    const [groups, setGroups] = useState<string[][]>([['']]);
    const [imgMap, setImgMap] = useState<{ [ key: string ]: number }>({});
    const [selectedOption, setSelectedOption] = useState<string | undefined>('');
    const [cancellationOption, setCancellationOption] = useState<string>('');
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [mealOption, setMealOption] = useState<string>('');
    const [hasMeal, setHasMeal] = useState<boolean>(false);
    const [visibleItems, setVisibleItems] = useState({});
    const [initialDisplay, setInitialDisplay] = useState<boolean>(false);
    const router = useRouter();

    const targetDivRef = useRef(null);

    const scrollToDiv = () => {
        if (targetDivRef.current)
        targetDivRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchedHotelData = localStorage.getItem('currentHotelData');
        const fetchedSearchParams = localStorage.getItem('searchParams');
        const fetchedPriceParams = localStorage.getItem('priceParams');
        if (fetchedHotelData) {
            const parsedHotelData = JSON.parse(fetchedHotelData);
            console.log('Fetched hotelData:', parsedHotelData); 
            setHotelData(parsedHotelData);
        }
        if (fetchedSearchParams) {
            const parsedSearchParams = JSON.parse(fetchedSearchParams);
            console.log('Fetched searchParams:', parsedSearchParams); 
            setSearchParams(parsedSearchParams);
        }
        if (fetchedPriceParams) {
            const parsedPriceParams = JSON.parse(fetchedPriceParams);
            console.log('Fetched priceParams: ', parsedPriceParams);
            setHotelPrice(parsedPriceParams);
        }
    }, []);

    const rateLookup = async (id: string, rate: any) => {
        console.log("Id in rateLookUp: ", id);
        const match: AxiosResponse = await axios.post("http://localhost:5001/hotels/rate", { id: id, room: rate });
        const lookup: string[] = await match.data;
        return lookup;
    };

    useEffect(() => {
        const getRooms = async () => {
            if (!hotelData || !searchParams || dataFetched) return;

            const body = {
                checkin: searchParams.checkin,
                checkout: searchParams.checkout,
                residency: "us",
                language: "en",
                guests: searchParams.guests,
                id: hotelData.id,
                currency: "USD"
            };

            try {
                const response = await axios.post("http://localhost:5001/hotels/rooms", body);
                const hotelsData = response.data.data.hotels;
                if (hotelsData.length > 0) {

                    const updatedHotelData = { ...hotelData, room_groups: hotelsData[0].room_groups };
                    setHotelData(updatedHotelData);
                    setDataFetched(true);

                    const images = await Promise.all(hotelsData[0].rates.map(async (rate) => {
                        console.log("Rate passing: ", rate, hotelData.id);
                        return await rateLookup(hotelData.id, rate.rg_ext);
                    }));

                    setGroups(images);

                    const roomGroups: { [key: string]: HotelRoom } = {};
                    hotelsData[0].rates.forEach(async (rate: { 
                        serp_filters: any, 
                        rg_ext: any, 
                        room_data_trans: { main_name: string; misc_room_type: string; main_room_type: any; bathroom: any; bedding_type: any; }; 
                        payment_options: { payment_types: { tax_data: { taxes: any[] }, 
                        cancellation_penalties: { policies: any[]; }; }[]; }; 
                        daily_prices: string[]; 
                        amenities_data: any; 
                        meal: string; 
                        room_name: any; 
                        }) => {
                        
                        const options = {
                            month: 'long' as 'long',
                            day: 'numeric' as 'numeric',
                            hour: 'numeric' as 'numeric',
                            minute: 'numeric' as 'numeric',
                            hour12: true
                        };

                        let refundable: boolean = false;
                        let extent: string = '';
                        let refundPolicy: { type: string, date: any, refund: number }[] | null = null;
                        if (
                            rate.payment_options &&
                            rate.payment_options.payment_types &&
                            rate.payment_options.payment_types[0] &&
                            rate.payment_options.payment_types[0].cancellation_penalties &&
                            rate.payment_options.payment_types[0].cancellation_penalties.policies 
                        ) {
                            const policy = rate.payment_options.payment_types[0].cancellation_penalties.policies;
                            policy.length > 2
                            ? (extent='Full Refund', refundable=true, refundPolicy=[{type: 'Full Refund', date: new Date(policy[0].end_at).toLocaleDateString('en-US', options), refund: Number(rate.daily_prices[0])-Number(policy[0].amount_charge)}, {type: 'Partial Refund', date: new Date(policy[1].end_at).toLocaleDateString('en-US', options), refund: Number(rate.daily_prices[0])-Number(policy[1].amount_charge)}])
                            : (policy.length > 1 
                                ? (policy[0].amount_charge == '0.00' 
                                    ? (extent='Full Refund', refundable=true, refundPolicy=[{type: 'Full Refund', date: new Date(policy[0].end_at).toLocaleDateString('en-US', options), refund: Number(rate.daily_prices[0])-Number(policy[0].amount_charge)}])
                                    : (extent='Partial Refund', refundable=true, refundPolicy=[{type: 'Partial Refund', date: new Date(policy[0].end_at).toLocaleDateString('en-US', options), refund: Number(rate.daily_prices[0])-Number(policy[0].amount_charge)}]))
                                : (extent='No Refund', refundable=false, refundPolicy=null));
                        };

                        const roomKey = `${rate.room_data_trans.main_room_type}${rate.room_data_trans.bedding_type!=null && `-${rate.room_data_trans.bedding_type}` || ''}`;

                        const roomPrice = {
                            key: roomKey,
                            name: rate.room_name,
                            price: parseFloat(rate.daily_prices[0]),
                            amenities: [...rate.amenities_data, ...rate.serp_filters] || [],
                            miscRoom: rate.room_data_trans.misc_room_type || null,
                            meal: rate.meal,
                            cancellation_type: extent,
                            cancellation: refundPolicy, 
                            refundable: refundable,
                            taxes: rate.payment_options.payment_types[0].tax_data.taxes,
                            lookup: rate.rg_ext,
                        };

                        !roomGroups[roomKey]
                        ? roomGroups[roomKey] = {
                            type: rate.room_data_trans.main_name,
                            hotel: hotelData.id,
                            priceWithoutMealNoRefund: roomPrice,
                            bedding_type: rate.room_data_trans.bedding_type,
                            options: [roomPrice],
                            cancellable: roomPrice.cancellation_type == 'Full Refund' && [roomPrice] || [],
                            meals: roomPrice.meal != 'nomeal' && [roomPrice] || []
                        }
                        : roomGroups[roomKey].options.push(roomPrice);
                        if (roomPrice.cancellation_type == 'Full Refund') roomGroups[roomKey].cancellable.push(roomPrice);
                        if (roomPrice.meal != 'nomeal') roomGroups[roomKey].meals.push(roomPrice);
                    });
                    setStuff(roomGroups);
                    setDataFetched(true);
                }
            } catch (error) {
                console.error('Error fetching room data:', error);
            };
        };
        getRooms();
    }, [hotelData, searchParams, dataFetched]);

    if (!hotelData) {
        return <p>Loading...</p>;
    };

    const combineParagraphs = (descriptionStruct: DescriptionStruct[]): React.JSX.Element[] => {
        return descriptionStruct.slice(1,).map((desc) => desc.paragraphs.join(' ')).map(par => <div style={{ marginBottom: '2%' }}>{par}</div>);
    };

    const handleShowMore = (index, value?) => {
        setVisibleItems((prevVisibleItems) => ({
            ...prevVisibleItems,
            [index]: value != prevVisibleItems[index] && value || null, 
        }));
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
    const regex = /(\d+\s*km from the city center)/;

    const handleReservation = (roomToReserve, images) => {
        localStorage.setItem('currentRoom', JSON.stringify(roomToReserve));
        localStorage.setItem('images', JSON.stringify(images));
        const { id } = router.query;
        router.push(`/review-booking/${id}`);
    };

    const handleOptionChange = (event) => {
        event.target.value == 'flexible bedding'
        ? setSelectedOption(undefined)
        : setSelectedOption(event.target.value);
    };

    const handleCancelChange = (event) => {
        event.target.value == '' ? setIsCancel(false) : setIsCancel(true);
        setCancellationOption(event.target.value);
    };

    const handleMealChange = (event) => {
        event.target.value == '' ? setHasMeal(false) : setHasMeal(true);
        setMealOption(event.target.value);
    }

    const roomPolicy = (item: HotelRoom) => {
        return isCancel 
        ? hasMeal && item.meals.filter(obj => obj.cancellation_type == 'Full Refund') || item.cancellable 
        : (hasMeal 
            ? item.meals
            : item.options);
    };

    return (
        <div>
            {router.query.flag && <div style={{ marginLeft: '2%', width: '30%', padding: '1%', color: 'white', marginBottom: '2%' }}>
                Error: the room rate you requested is not available any more.
            </div>}
            <a href='/booking' style={{ marginLeft: '2%', marginTop: '2%', backgroundColor: 'transparent', textDecoration: 'none' }}>{'<< Back To Search'}</a>
            <div className='top-details'>
                <div className='hotel-front'>
                    <div className="rating">{Array(hotelData.star_rating).fill('⭐ ').join('')}</div>
                    <label style={{ fontSize: '24px' }}>{hotelData.name}</label>
                    <label className="subtitle" style={{ color: 'rgba(0, 0, 128, 0.763)' }}>{hotelData.address}</label>
                    <label className="subtitle" style={{ color: 'rgba(0, 0, 128, 0.763)' }}>{hotelData.description_struct[0].paragraphs[0].match(regex) && hotelData.description_struct[0].paragraphs[0].match(regex)![0]}</label>
                </div>
                <div className='price-column'>
                    <label className='price-label'> from ${Number(hotelPrice)}</label>
                    <button onClick={scrollToDiv} className='rooms-button'>Show Rooms</button>
                </div>
            </div>
            <div>
                <div style={{ width: '1200px', marginLeft: '2%' }}>
                    <ImageSlider images={hotelData.images} />
                </div>
                <div className="hotel-container">
                    <div className="hotel-details">
                        <div style={{ display: 'flex' }}>
                            <div className="hotel-info">
                                <h2>About</h2>
                                <p>{combineParagraphs(hotelData.description_struct)}</p>
                            </div>
                            <div className="hotel-amenities">
                                <h2>Main Amenities</h2>
                                {hotelData.amenity_groups[0].amenities.slice(0, 9).map((amenity, index) => (
                                    <label key={index}>- {amenity}</label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <GoogleMapComponent lat={parseFloat(hotelData.latitude)} lng={parseFloat(hotelData.longitude)}/>
                        </div>
                    </div>
                </div>
            </div>
            <div ref={targetDivRef} style={{ fontFamily: 'Roboto, sans-serif' }}>
                {(Object.keys(stuff).length === 0) && <Spinner /> || 
                    <div style={{ display: 'flex', justifyContent: 'space-around', width: '82.5%', padding: '1%', backgroundColor: 'beige', marginLeft: '2%', marginBottom: '2%', borderRadius: '16px' }}>
                        <div className='filter-container'>
                            <label>Bedding Type</label>
                            <select value={selectedOption} onChange={handleOptionChange} className='bed-filter'>
                                <option value={''}>all types</option>
                                {Object.values(stuff).reduce<Array<string | undefined>>((acc, curr) => {
                                    const bedding = curr.bedding_type && curr.bedding_type || undefined;
                                    if (!acc.includes(bedding)) acc.push(bedding);
                                    return acc
                                }, []).map((type, index) => <option key={index} value={type}>{!type && 'flexible bedding' || type}</option>)}
                            </select>
                        </div>
                        <div className='filter-container'>
                            <label>Cancellation</label>
                            <select value={cancellationOption} onChange={handleCancelChange} className='bed-filter'>
                                <option value={''}>any policy</option>
                                <option>free cancellation</option>
                            </select>
                        </div>
                        <div className='filter-container'>
                            <label>Meal</label>
                            <select value={mealOption} onChange={handleMealChange} className='bed-filter'>
                                <option value={''}>any plan</option>
                                <option>meal included</option>
                            </select>
                        </div>
                    </div>}
                {Object.entries(stuff).filter(([_, value]) => {
                    return selectedOption == '' ? true : value.bedding_type == selectedOption
                }).map(([key, value], index) => (
                    roomPolicy(value).length > 0 && (initialDisplay && index < roomPolicy(value).length || index < 3) &&  <div key={index} style={{ padding: '1%', marginBottom: '2%', boxShadow: '2px 2px 6px #888888', marginLeft: '2%', width: roomPolicy(value).length < 3 && `${350 * roomPolicy(value).length}px` || '1065px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '2%', marginTop: '1%' }}>
                                {key.split('-').map((str, index) => <label style={{ fontSize: index == 0 && '20px' || '16px' }}>{str}</label>)}
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', height: `${Math.ceil((visibleItems[index] || 3) / 3) * 575}px`, flexWrap: 'wrap', gap: '40px', justifyContent: 'flex-start' }}>
                                    {roomPolicy(value)?.slice(0, (visibleItems[index] || 3)).map((option, idx) => (
                                        <div key={idx} style={{ height: '200px', width: '325px' }}>
                                            {<div className='card-container'>
                                                {groups[index].length != 1 &&  <div style={{ position: 'relative' }}>
                                                    <button onClick={() => handleDecrease(`${index}-${idx}`, groups[index])}
                                                    disabled={groups[index].length == 1}
                                                    className='arrow-format'
                                                    style={{ top: '100px', left: '12px' }}>{'<'}</button>
                                                    <button onClick={() => handleIncrease(`${index}-${idx}`, groups[index])}
                                                    disabled={groups[index].length == 1}
                                                    className='arrow-format'
                                                    style={{ top: '100px', left: '290px' }}>{'>'}</button>
                                                </div>}
                                                <img src={groups[index][imgMap[`${index}-${idx}`] || 0].replace('{size}', '1024x768')} alt='Room Image' className='center-div card-img' style={{ minHeight: '200px'}} />
                                                <div id={`cardSpacing${index}${idx}`} className='card-bottom'>
                                                    <div className='scroll-bar'>
                                                        {option.miscRoom && option.miscRoom.split(', ').sort().map((qual, _) => {
                                                            const quality = qual[0] != '+' && (qual[0].toUpperCase() + qual.slice(1,)) || (qual[2].toUpperCase() + qual.slice(3,));
                                                            return (quality.includes('bed') || quality.includes('Bed')) && 
                                                            <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{BedIcon}</label> <label>{quality}</label>
                                                            </div> || 
                                                            <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{SparkleIcon}</label> <label>{quality}</label>  
                                                            </div>
                                                        })}
                                                        {option.meal != 'nomeal' && 
                                                        <div className='space-out'>
                                                            <label style={{ width: '7%'}}>{MealIcon}</label>
                                                            <label>{option.meal[0].toUpperCase() + option.meal.slice(1,)} Included</label>
                                                        </div>}
                                                        {option.cancellation_type != 'No Refund' && 
                                                            <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{RefundIcon}</label> <label>Refundable</label>
                                                            </div>}
                                                        {option.amenities.map(amenity => {
                                                            if (amenity.includes('internet')) return <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{WifiIcon}</label> <label>Free Internet</label>
                                                            </div>
                                                            if (amenity.includes('parking')) return <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{ParkingIcon}</label> <label>Parking Available</label>
                                                            </div>
                                                            if (amenity.includes('non-smoking')) return <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{SmokingIcon}</label> <label>Non-Smoking</label>
                                                            </div>
                                                            if (amenity.includes('bathroom')) return <div className='space-out'>
                                                                <label style={{ width: '7%'}}>{BathIcon}</label> <label>Bathroom</label>
                                                            </div>
                                                        })}
                                                    </div>
                                                    <div className='flex-col'>
                                                        <div className='flex-col' style={{ marginBottom: '10px', alignItems: 'flex-start', height: '50px'}}>
                                                            <div style={{ display: 'flex', gap: '7px' }}>
                                                                <label style={{ textDecoration: 'underline dotted' }}>{option.cancellation_type}</ label>
                                                                {option.cancellation_type != 'No Refund' && <InfoIcon infoText={option.cancellation} />}
                                                            </div>
                                                            {option.cancellation_type != 'No Refund' && <label style={{ fontSize: '10px', marginBottom: '-11.5px' }}>{typeof option.cancellation != 'string' && option.cancellation && 'Before ' + option.cancellation[0].date.match(/(.*?)\sat\s/)[1]}</label>}
                                                        </div>
                                                        <div className='reserve-top'>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <label style={{ fontSize: '26px'}}>${option.price}</label>
                                                                <label style={{ fontSize: '10px' }}>excl. taxes and fees:</label>
                                                                {option.taxes.map(tax => <label style={{ fontSize: '10px' }}>+ ${tax.amount} as {tax.name.replace('_', ' ')}</label>)}
                                                            </div>
                                                            <div className='reserve-button'>
                                                                <button className='button-specifics' onClick={() => handleReservation(option, groups[index])}>Reserve</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    {roomPolicy(value).length > 3 && (
                                        <button style={{ backgroundColor: 'red', borderColor: 'transparent', borderRadius: '8px', color: 'white', padding: '5px' }}
                                        onClick={() => handleShowMore(index, value.options.length)}>{!visibleItems[index] && `Show ${roomPolicy(value)?.length - 3} More` || 'Show Less'}</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => {
                        if (!initialDisplay) setInitialDisplay(true)
                    }}>See all</button>
            </div>
        </div>
    );
};

export default HotelPage;

{/* <div key={idx} style={{ display: 'flex', borderBottom: '1px solid gray', padding: '1%', marginBottom: '10px', marginTop: '1%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', marginRight: '1.5%' }}>
            <div className='flex-column' style={{ width: '160px' }}>
                <img src={groups[index][imgMap[`${index}-${idx}`] || 0].replace('{size}', '1024x768')} alt='Room Image' className='center-div' />
                <div className='flex-row'>
                    <button onClick={() => handleDecrease(`${index}-${idx}`, groups[index])}
                    disabled={groups[index].length == 1}
                    style={{ width: '14%', height: '14%', backgroundColor: 'transparent', borderColor: 'transparent' }}>{'◄'}</button>
                    <button onClick={() => handleIncrease(`${index}-${idx}`, groups[index])}
                    disabled={groups[index].length == 1}
                    style={{ width: '14%', height: '14%', backgroundColor: 'transparent', borderColor: 'transparent' }}>{'►'}</button>
                </div>
            </div>
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'column', width: '25%' }}> 
            {option.miscRoom && option.miscRoom.split(', ').sort().map(qual => {
                const quality = qual[0] != '+' && (qual[0].toUpperCase() + qual.slice(1,)) || (qual[2].toUpperCase() + qual.slice(3,));
                return <p> + {quality}</p>
            })}
            <div style={{ border: '1px solid black', padding: '1%' }}>
                <label>Room amenities: </label>
                {option.amenities.map((amenity, index) => <label>{index != option.amenities.length - 1 && amenity.replace('_', ' ') + ',' || amenity.replace('_', ' ')} </label>)}
            </div>
        </div>
        <hr />
        {option.meal != 'nomeal' && <InfoIcon infoText={option.meal} flag={'check'} /> || <InfoIcon infoText={option.meal} flag={'cross'} />}
        <hr />
        {(option.refundable === true) && (<p>✓</p>) || (<p>-</p>)}
        <hr />
        <div className='refund-content'>
            <div>{option.cancellation_type}</ div>
            {option.cancellation_type != 'No Refund' && <InfoIcon infoText={option.cancellation} />}
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p>${option.price}</p>
            {option.taxes.map(tax => <label style={{ fontSize: '12px' }}>+ ${tax.amount} as {tax.name.replace('_', ' ')}</label>)}
            <button className='reserve-button' onClick={() => handleReservation(option, groups[index])}>Reserve Room</button>
        </div>
    </div> */}