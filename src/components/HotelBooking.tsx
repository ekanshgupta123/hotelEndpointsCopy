import React, { useState, useEffect, useRef } from 'react';
import '../styles/App.css';
import Navbar from './Navbar';
import HotelDisplay from './HotelDisplay';
import { Alert, TextField } from '@mui/material';
import Spinner from './Spinner';
import axios, { CancelTokenSource } from 'axios';
import GoogleMapsComponent from './GoogleMapsComponent';
import { Slider, Checkbox, FormControlLabel } from '@mui/material';
import { Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface Region {
    name: string;
    id: number | null; 
}

interface Child {
    age: number;
}

interface SearchParams {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    rooms: number;
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

const Search = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        destination: '',
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        rooms: 1
    });

    const [hotelSearchParams, setHotelSearchParams] = useState<HotelSearchParams>({
        checkin: '',
        checkout: '',
        residency: '',
        language: '',
        guests: [{
            adults: 1,
            children: [],
        }],
        region_id: null,
        currency: ''
    });

    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [regionId, setRegionId] = useState<number | null>(null);
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


    const mealOptions = [
        { label: 'No meals included', value: 'nomeal' },
        { label: 'Breakfast included', value: 'breakfast' },
        { label: 'Breakfast + dinner or lunch included', value: 'breakfast_dinner_lunch' },
        { label: 'Breakfast, lunch and dinner included', value: 'all_meals' },
        { label: 'All-inclusive', value: 'all_inclusive' },
    ];
    

    const incrementAdults = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setSearchParams(prevParams => ({
            ...prevParams,
            adults: prevParams.adults + 1
        }));
    };

    const decrementAdults = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setSearchParams(prevParams => ({
            ...prevParams,
            adults: Math.max(1, prevParams.adults - 1)
        }));
    };

    const incrementChildren = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setChildren(prevChildren => [...prevChildren, { age: 2 }]);
    };

    const decrementChildren = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setChildren(prevChildren => prevChildren.slice(0, -1));
    };

    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(0, Math.min(parseInt(event.target.value), priceRange[1]));
        setPriceRange([value, priceRange[1]]);
    };

    const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(priceRange[0], Math.min(parseInt(event.target.value), 5000));
        setPriceRange([priceRange[0], value]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prevParams => ({
            ...prevParams,
            [name]: name === 'adults' ? parseInt(value, 10) || 0 : value
        }));
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

    const getRegionId = async (query: string) => {
        const body = JSON.stringify({
            query: query,
            lang: "en"
        });

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        };

        try {
            const response = await fetch("/api/search/proxy", requestOptions);
            const result = await response.json();
            console.log("Result:", result);

            if (result.data && result.data.regions) {
                const cities = result.data.regions.filter((region: any) => region.type === 'City');
                return cities;
            } else {
                console.log('No regions found');
                return [];
            }
        } catch (error) {
            console.log('Error:', error);
            return [];
        }
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchParams.destination.length > 2) {
                const regions = await getRegionId(searchParams.destination);
                setSuggestions(regions);
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [searchParams.destination]);

    useEffect(() => {
        if (myIds.length !== 0) searchHotels();
    }, [page]);

    const [rates, setRates] = useState<{ [key: string]: number }>({});

    const searchHotels = async (flag?: boolean) => {
        console.log("Loading...");
        setIsLoading(true);
        setError(null);
        if (flag) {
            setPage(1);
            setPrevPage(1);
        }

        if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel("Canceled due to new request");
        }
        cancelTokenRef.current = axios.CancelToken.source();

        const guests = [{
            adults: Number(searchParams.adults),
            children: children?.map(child => ({ age: child.age })) || []
        }];

        console.log(searchParams.checkInDate);

        const body = {
            checkin: searchParams.checkInDate,
            checkout: searchParams.checkOutDate,
            residency: "us",
            language: "en",
            guests: guests,
            region_id: regionId,
            currency: "USD",
            keys: [`pricing: ${regionId}-${searchParams.checkInDate}-${searchParams.checkOutDate}-${guests[0].adults}-${guests[0].children.length}`, `static: ${regionId}`],
            pageNumber: page
        };

        console.log('curr: ', page, 'prev:', prevPage);

        setHotelSearchParams(body);

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
                console.log(response.data.total);
                const prices = hotels.reduce((acc: { [key: string]: number }, hotel: any) => {
                    if (hotel && hotel.id && hotel.rates) {
                        for (let i = 0; i < hotel.rates.length; i++) {
                            if (hotel.rates[i] && hotel.rates[i].daily_prices && hotel.rates[i].daily_prices[0]) {
                                acc[hotel.id] = hotel.rates[i].daily_prices[0];
                                break;
                            }
                        }
                    }
                    return acc;
                }, {});
                setRates(prices);
            } else {
                console.log("No hotels data found");
                setMyHotels([]);
                setTotalHotels(0);
            }
        } catch (error) {
            handleErrors(error);
        } finally {
            setIsLoading(false);
            console.log("Loading complete.");
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

    const handleSuggestionClick = (region: Region) => {
        setSearchParams(prevState => ({
            ...prevState,
            destination: region.name
        }));
        setRegionId(region.id);
        console.log(region);
        setSuggestions([]);
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchParams.destination || !searchParams.checkInDate || !searchParams.checkOutDate) {
            setError("Please fill in all required fields.");
            return;
        }
        setMyHotels([]);
        setMyIds([]);
        setSearchParams({ ...searchParams });
        setDisplayedHotelCount(0);
        setTotalHotels(0);
        await searchHotels(true);
    };

    console.log("MyIds: ", myIds);

    const filterHotels = (hotels: any[]) => {
        const ratingsToCheck = selectedRatings.length === 0 ? [0, 1, 2, 3, 4, 5] : selectedRatings;
        const mealsToCheck = selectedMeals.length === 0 ? ['nomeal', 'breakfast', 'breakfast_dinner_lunch', 'all_inclusive'] : selectedMeals;
    
        return hotels.filter((hotel) => {
            const hotelStaticData = myIds.find((staticData: { id: any; }) => staticData.id === hotel.id);
            console.log("hotel: ,", hotel);
            const hotelPrice = rates[hotel.id];
            const matchesPrice = hotelPrice >= priceRange[0] && hotelPrice <= priceRange[1];
            const matchesRating = hotelStaticData && ratingsToCheck.includes(hotelStaticData.star_rating || 0);
            const matchesMeal = hotel.rates && hotel.rates[0] && mealsToCheck.includes(hotel.rates[0].meal);
            console.log("Hotel ID:", hotel.id, "Static Data ID:", hotelStaticData?.id);
            return matchesPrice && matchesRating && matchesMeal;
        });
    };
    

    const filteredHotels = filterHotels(myHotels);

    const today = new Date().toISOString().split('T')[0];
    const minCheckOutDate = searchParams.checkInDate ? new Date(new Date(searchParams.checkInDate).getTime() + 86400000).toISOString().split('T')[0] : today;

    return (
        <div className="main-wrapper">
            <header><Navbar /></header>
            <div className="search-container">
                <form className="search-form" onSubmit={onSubmit}>
                    <div className="form-row">
                        <div className="input-wrapper">
                            <input
                                className="destination-input"
                                type="text"
                                name="destination"
                                value={searchParams.destination}
                                onChange={handleInputChange}
                                placeholder="Destination"
                            />
                            {suggestions.length > 0 && (
                                <div className="suggestions-list-wrapper">
                                    <ul className="suggestions-list">
                                        {suggestions.map((region) => (
                                            <li key={region.id} onClick={() => handleSuggestionClick(region)}>
                                                <div className="suggestion-text">
                                                    <span className="suggestion-name">{region.name}, {region.country_code}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <input
                            className="date-input"
                            type="date"
                            name="checkInDate"
                            value={searchParams.checkInDate}
                            onChange={handleInputChange}
                            min={today}
                        />
                        <input
                            className="date-input"
                            type="date"
                            name="checkOutDate"
                            value={searchParams.checkOutDate}
                            onChange={handleInputChange}
                            min={minCheckOutDate}
                        />
                        <div className="input-group">
                            <span className="input-label">Adults</span>
                            <button onClick={decrementAdults} disabled={searchParams.adults <= 1}>-</button>
                            <input type="text" readOnly value={searchParams.adults} aria-label="Adults" />
                            <button onClick={incrementAdults}>+</button>
                        </div>
                        <div className="input-group">
                            <span className="input-label">Children</span>
                            <button onClick={decrementChildren} disabled={children.length <= 0}>-</button>
                            <input type="text" readOnly value={children.length} aria-label="Children" />
                            <button onClick={incrementChildren}>+</button>
                        </div>
                        <button type="submit" className="search-button" disabled={isLoading}> Search </button>
                    </div>
                </form>
                {isLoading}
                {error && (
                    <Alert severity="error">
                        Error: {error}
                    </Alert>
                )}
                <div className="content-wrapper">
                    <div className="filter-container">
                        <h3>Filter Options</h3>
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
                            max={5000}  // Update the max value to 5000
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
                                    price={rates[hotel.id]}
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
                            price: rates[hotel.id],
                            rating: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.star_rating,
                            amenities: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)?.amenities,
                            statics: myIds.find((staticData: { id: any; }) => staticData.id === hotel.id)
                        }))} loading={isLoading} searchParams={hotelSearchParams} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;