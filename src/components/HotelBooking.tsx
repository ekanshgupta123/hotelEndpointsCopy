import React, { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import Navbar from './Navbar';
import HotelDisplay from './HotelDisplay';
import { Alert, TextField } from '@mui/material';
import Spinner from './Spinner';
import axios, { CancelTokenSource } from 'axios';
import GoogleMapsComponent from './GoogleMapsComponent';
import { Slider, Checkbox, FormControlLabel } from '@mui/material';
import { Tooltip, CircularProgress, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/router';
import SearchModal from './SearchModal';
import SearchSummary from './SearchSummary';
import search from '@/pages/search';


interface Child {
    age: number;
}

const HotelBooking = () => {
    const router = useRouter();
    const [hotelSearchParams, setHotelSearchParams] = useState({
        checkin:  '',
        checkout: '',
        residency: 'us',
        language: 'en',
        guests: [],
        region_id: 0,
        currency: 'USD',
        destination: '',
        adults: 1,
        rooms: 1,
    });
    
    React.useEffect(() => {
        if (!router.isReady) return;
        if (router.isReady) {
          const { guests, regionId, searchParams, destination } = router.query;

          if (!regionId) return;
          const parsedGuests = guests ? JSON.parse(guests as string) : [];
            const parsedSearchParams = searchParams ? JSON.parse(searchParams as string) : {};


            setHotelSearchParams({
                checkin: parsedSearchParams.checkInDate || '',
                checkout: parsedSearchParams.checkOutDate || '',
                residency: 'us',
                language: 'en',
                guests: parsedGuests,
                region_id: Number(regionId),
                currency: 'USD',
                destination: destination as string || '',
                adults: parsedSearchParams.adults || 1,
                rooms: parsedSearchParams.rooms || 1,
            });
          console.log(router.query);
        }
      }, [router.isReady]);


    console.log("regionid: ", hotelSearchParams.region_id);
    console.log("destination from hotelsearch: ", hotelSearchParams.destination);

    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [totalHotels, setTotalHotels] = useState(0);
    const [displayedHotelCount, setDisplayedHotelCount] = useState(0);
    const [page, setPage] = useState<number>(1);
    const [prevPage, setPrevPage] = useState<number>(1);
    const [myHotels, setMyHotels] = useState<any[]>([]);
    const [myIds, setMyIds] = useState<any[]>([]);
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const mealOptions = [
        { label: 'No meals included', value: 'nomeal' },
        { label: 'Breakfast included', value: 'breakfast' },
        { label: 'Breakfast + dinner or lunch included', value: 'breakfast_dinner_lunch' },
        { label: 'Breakfast, lunch and dinner included', value: 'all_meals' },
        { label: 'All-inclusive', value: 'all_inclusive' },
    ];


    useEffect(() => {
        searchHotels();
    }, [page]);


    const handleSearch = (searchParams: any) => {
        console.log('Searching with params:', searchParams);
        const childrenArray = Array.from({ length: searchParams.children }, () => ({ age: 0 }));
        console.log("childrenArray: ", childrenArray);
        const guests = [{
            adults: searchParams.adults,
            children: childrenArray
        }];

        const guestsStringify = JSON.stringify([{
            adults: searchParams.adults,
            children: children
        }]);

        console.log("guests: ", guests);
    
        setHotelSearchParams({
            checkin: searchParams.checkInDate,
            checkout: searchParams.checkOutDate,
            residency: 'us',
            language: 'en',
            guests: guests,
            region_id: Number(searchParams.regionId),
            currency: 'USD',
            destination: searchParams.destination,
            adults: searchParams.adults,
            rooms: searchParams.rooms
        })
        router.push(`/booking?guests=${guestsStringify}&regionId=${searchParams.regionId}&destination=${searchParams.destination}&searchParams=${encodeURIComponent(JSON.stringify(searchParams))}`);
    };
    
    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(0, Math.min(parseInt(event.target.value), priceRange[1]));
        setPriceRange([value, priceRange[1]]);
    };

    const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(priceRange[0], Math.min(parseInt(event.target.value), 5000));
        setPriceRange([priceRange[0], value]);
    };

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as number[]);
    };

    const handleMealChange = (meal: string) => {
        setSelectedMeals(prevSelectedMeals => {
            if (prevSelectedMeals.includes(meal)) {
                return prevSelectedMeals.filter(m => m !== meal);
            } else {
                return [...prevSelectedMeals, meal];
            }
        });
    };
    
    const isSelectedMeal = (meal: string) => selectedMeals.includes(meal);

    const handleRatingChange = (rating: number) => {
        setSelectedRatings((prevRatings) => {
            if (prevRatings.includes(rating)) {
                return prevRatings.filter((r) => r !== rating);
            } else {
                return [...prevRatings, rating];
            }
        });
    };

    const handleErrors = (error: unknown) => {
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
        } else if (error.response) {
            console.error('Error fetching hotels:', error.response.data);
            setError(`Failed to fetch hotels: ${error.response.data.message}`);
        } else {
            console.error('Unexpected error:', error);
            setError('An unexpected error occurred');
        }
    };


    useEffect(() => {
        if (hotelSearchParams.region_id && hotelSearchParams.region_id > 0) {
            searchHotels();
        }
    }, [hotelSearchParams, page]);
    

    
    const searchHotels = async () => {
        if (!hotelSearchParams.region_id || hotelSearchParams.region_id <= 0) {
            setError('Invalid region selected. Please choose a valid region.');
            return;
        }
    
        setIsLoading(true);
        setError(null);
    
        if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel("Canceled due to new request");
        }
        cancelTokenRef.current = axios.CancelToken.source();

        const keys = [
            `pricing: ${hotelSearchParams.region_id}-${hotelSearchParams.checkin}-${hotelSearchParams.checkout}-${hotelSearchParams.guests[0].adults}-${hotelSearchParams.guests[0].children.length}`,
            `static: ${hotelSearchParams.region_id}`
        ];
        

        console.log("Keys: ", keys);
    
        const body = {
            ...hotelSearchParams,
            keys,
            pageNumber: page
        };
            
        try {
            const response = await axios.post("http://localhost:5001/hotels/search", body, {
                cancelToken: cancelTokenRef.current.token
            });
    
            if (response.data && response.data.data) {
                const [hotelCache] = response.data.data;
                const [idCache] = response.data.data;
                const hotels = hotelCache.map((element: string) => JSON.parse(element));
                const ids = idCache.map((element: string) => JSON.parse(element));
                if (page >= prevPage) {
                    setDisplayedHotelCount(prevCount => prevCount + ids.length);
                } else if (page < prevPage) {
                    setDisplayedHotelCount(prevCount =>
                        prevCount % 25 === 0
                            ? prevCount - 25
                            : prevCount - (prevCount % 25)
                    );
                }
                setMyHotels(hotels);
                const staticData = await fetchStaticData(ids.map((hotel: { id: any; }) => hotel.id));
                setMyIds(staticData);
                if (response.data.total) setTotalHotels(response.data.total);
            } else {
                setMyHotels([]);
                setTotalHotels(0);
            }
        } catch (error) {
            handleErrors(error);
        } finally {
            setIsLoading(false);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    

    const fetchStaticData = async (hotelIDs: string[]) => {
        try {
            const response = await axios.post('/api/connect', { hotelIDs });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching static data:', error);
            return [];
        }
    };

    const filterHotels = (hotels: any[]) => {
        const ratingsToCheck = selectedRatings.length === 0 ? [0, 1, 2, 3, 4, 5] : selectedRatings;
        const mealsToCheck = selectedMeals.length === 0 ? ['nomeal', 'breakfast', 'breakfast_dinner_lunch', 'all_inclusive'] : selectedMeals;
    
        return hotels.filter((hotel) => {
            const hotelStaticData = myIds.find((staticData: { id: any; }) => staticData.id === hotel.id);
            console.log("hotel: ,", hotel);
            const hotelPrice = hotel.rates[0].daily_prices[0];
            const matchesPrice = hotelPrice >= priceRange[0] && hotelPrice <= priceRange[1];
            const matchesRating = hotelStaticData && ratingsToCheck.includes(hotelStaticData.star_rating || 0);
            const matchesMeal = hotel.rates && hotel.rates[0] && mealsToCheck.includes(hotel.rates[0].meal);
            console.log("Hotel ID:", hotel.id, "Static Data ID:", hotelStaticData?.id);
            return matchesPrice && matchesRating && matchesMeal;
        });
    };
    

    const filteredHotels = filterHotels(myHotels);

    const today = new Date().toISOString().split('T')[0];
    const minCheckOutDate = hotelSearchParams.checkin ? new Date(new Date(hotelSearchParams.checkout).getTime() + 86400000).toISOString().split('T')[0] : today;


    return (
        <div className="main-wrapper">
            <header><Navbar /></header>
            <div className="search-container">
                {isLoading ? (
                    <div className="spinner-container">
                        <CircularProgress /> {/* Spinner */}
                    </div>
                ) : (
                    <>
                        {/* {error && (
                            <Alert severity="error">
                                Error: {error}
                            </Alert>
                        )} */}
                    </>
                )}
                <div className="content-wrapper">
                    <div className="filter-container">
                        <h3>Filter Options</h3>
                        <SearchSummary
                            destination={hotelSearchParams.destination}
                            checkInDate={hotelSearchParams.checkin}
                            checkOutDate={hotelSearchParams.checkout}
                            rooms={hotelSearchParams.rooms}
                            guests={hotelSearchParams.guests}
                            onEdit={() => setIsModalOpen(true)} // Opens the modal to edit the search
                        />
                        <div className="filter-option">
                            <label>Price Range</label>
                            <div className="price-range-container">
                        <div className="price-range-inputs">
                            <TextField
                                label="Min Price"
                                variant="outlined"
                                type="number"
                                value={priceRange[0]}
                                onChange={handleMinPriceChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: 0,
                                    max: 5000,
                                    step: 1,
                                }}
                            />
                            <TextField
                                label="Max Price"
                                variant="outlined"
                                type="number"
                                value={priceRange[1]}
                                onChange={handleMaxPriceChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: 0,
                                    max: 5000,
                                    step: 1,
                                }}
                            />
                        </div>
                        <Slider
                            value={priceRange}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={5000}
                            marks
                            step={1}
                        />
                    </div>
                        </div>
                        <div className="filter-option">
                            <label>Star Rating</label>
                            <div className="star-rating-container">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <FormControlLabel
                                        key={star}
                                        control={<Checkbox checked={selectedRatings.includes(star)} onChange={() => handleRatingChange(star)} />}
                                        label={
                                            <span className="stars">
                                                {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                                            </span>
                                        }
                                    />
                                ))}
                                <FormControlLabel
                                    control={<Checkbox checked={selectedRatings.includes(0)} onChange={() => handleRatingChange(0)} />}
                                    label={<span className="stars">☆ or without star rating</span>}
                                />
                            </div>
                        </div>
                        <div className='filter-option'>
                            <label>Meals</label>
                            <div className="meal-options-container">
                                {mealOptions.map((meal) => (
                                    <div key={meal.value} className="meal-option">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isSelectedMeal(meal.value)}
                                                    onChange={() => handleMealChange(meal.value)}
                                                />
                                            }
                                            label={
                                                <div className="meal-label">
                                                    {meal.label}
                                                    <Tooltip title={`Info about ${meal.label}`} placement="top">
                                                        <InfoIcon fontSize="small" className="info-icon" />
                                                    </Tooltip>
                                                </div>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hotel-list-container">
                        <h2>Displaying {filteredHotels.length} out of {totalHotels} hotels</h2>
                        {filteredHotels.map((hotel) => (
                            <div key={hotel.id}>
                                <HotelDisplay
                                    hotel={hotel}
                                    searchParams={hotelSearchParams}
                                    statics={myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)}
                                    price={hotel.rates[0].daily_prices[0]}
                                />
                            </div>
                        ))}
                        <button className="btn"
                            disabled={displayedHotelCount === totalHotels} onClick={() => {
                                setPrevPage(page);
                                setPage(page + 1);
                            }}>Next Page</button>
                        <button className="btn"
                            disabled={page === 1} onClick={() => {
                                setPrevPage(page);
                                setPage(page - 1);
                            }}>Previous Page</button>
                    </div>
                    <div className="map-container">
                        <GoogleMapsComponent addresses={filteredHotels.map((hotel) => ({
                            address: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.address,
                            name: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.name,
                            price: hotel.rates[0].daily_prices[0],
                            rating: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.star_rating,
                            amenities: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.amenities,
                            statics: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)
                        }))} loading={isLoading} searchParams={hotelSearchParams} />
                    </div>
                </div>
                <SearchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSearch={handleSearch}
                    originalDestination={hotelSearchParams.destination}
                    originalCheckInDate={hotelSearchParams.checkin}
                    originalCheckOutDate={hotelSearchParams.checkout}
                    originalAdults={hotelSearchParams.guests.length > 0 ? hotelSearchParams.guests[0].adults : 1}
                    originalChildren={hotelSearchParams.guests.length > 0 ? hotelSearchParams.guests[0].children.length : 0}
                    originalRooms={hotelSearchParams.rooms}
                />

            </div>
        </div>
    );
};

export default HotelBooking;
