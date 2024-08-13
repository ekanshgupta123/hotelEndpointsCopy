import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HotelDisplay from '../components/HotelDisplay';
import '../styles/App.css';
import { Alert, TextField, Slider, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

interface Hotel {
    id: string;
    price: number;
    name?: string;
    address?: string;
    star_rating?: number;
    images?: string[];
    amenity_groups: string[];
    description_struct: string[];
    room_groups: RoomGroup[];
    latitude: number;
    longitude: number;
    rates: any[];
}

interface RoomGroup {
    images: string[];
    name: string;
    name_struct: {
        bathroom: string | null;
        bedding_type: string | null;
        main_name: string;
    };
    rg_ext: {
        class: number;
        quality: number;
        sex: number;
        bathroom: number;
        bedding: number;
    };
    room_amenities: string[];
    room_group_id: number;
}

interface StaticData {
    id: string;
    star_rating: number;
    address: string;
    name: string;
    price: number;
}

interface Props {
    initialHotels: Hotel[];
    statics: StaticData[];
    totalHotels: number;
    initialSearchParams: any;
    initialDisplayedHotelCount: number;
    initialPage: number;
    initialPrevPage: number;
}

const SearchResults = ({ initialHotels, statics, totalHotels, initialSearchParams, initialDisplayedHotelCount, initialPage, initialPrevPage }: Props) => {
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(initialPage);
    const [prevPage, setPrevPage] = useState<number>(initialPrevPage);
    const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
    const [displayedHotelCount, setDisplayedHotelCount] = useState<number>(initialDisplayedHotelCount);

    const mealOptions = [
        { label: 'No meals included', value: 'nomeal' },
        { label: 'Breakfast included', value: 'breakfast' },
        { label: 'Breakfast + dinner or lunch included', value: 'breakfast_dinner_lunch' },
        { label: 'Breakfast, lunch and dinner included', value: 'all_meals' },
        { label: 'All-inclusive', value: 'all_inclusive' },
    ];

    useEffect(() => {
        console.log("Page changed:", page);  // Debugging to ensure page change is detected
        const fetchHotels = async () => {
            const body = {
                checkin: initialSearchParams.checkInDate,
                checkout: initialSearchParams.checkOutDate,
                residency: 'us',
                language: 'en',
                guests: initialSearchParams.parsedGuests,
                region_id: initialSearchParams.regionIdNumber,
                currency: 'USD',
                keys: [`pricing: ${initialSearchParams.regionIdNumber}-${initialSearchParams.checkInDate}-${initialSearchParams.checkOutDate}-${initialSearchParams.parsedGuests.adults}-0`, `static: ${initialSearchParams.regionIdNumber}`],
                pageNumber: page
            };
            try {
                const response = await axios.post('http://localhost:5001/hotels/search', body);
                const [hotelCache] = response.data.data;
                const [idCache] = response.data.data;
                const newHotels = hotelCache.map((element: string) => JSON.parse(element));
                const ids = idCache.map((element: string) => JSON.parse(element));

                if (page > prevPage) {
                    setDisplayedHotelCount(prevCount => prevCount + ids.length);
                } else if (page < prevPage) {
                    setDisplayedHotelCount(prevCount => (prevCount % 25 === 0 ? prevCount - 25 : prevCount - (prevCount % 25)));
                }

                setHotels(newHotels);
                const staticData = await fetchStaticData(ids.map((hotel: { id: any; }) => hotel.id));
                setPrevPage(page);
            } catch (error) {
                setError('Failed to fetch hotels');
            }
        };

        if (page !== prevPage) {
            fetchHotels();
        }
    }, [page, prevPage, initialSearchParams]);

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as number[]);
    };

    const handleRatingChange = (rating: number) => {
        setSelectedRatings((prevRatings) => {
            if (prevRatings.includes(rating)) {
                return prevRatings.filter((r) => r !== rating);
            } else {
                return [...prevRatings, rating];
            }
        });
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

    const handleMealChange = (meal: string) => {
        setSelectedMeals((prevSelectedMeals) => {
            if (prevSelectedMeals.includes(meal)) {
                return prevSelectedMeals.filter((m) => m !== meal);
            } else {
                return [...prevSelectedMeals, meal];
            }
        });
    };

    const filterHotels = (hotels: any[]) => {
        const ratingsToCheck = selectedRatings.length === 0 ? [0, 1, 2, 3, 4, 5] : selectedRatings;
        const mealsToCheck = selectedMeals.length === 0 ? ['nomeal', 'breakfast', 'breakfast_dinner_lunch', 'all_inclusive'] : selectedMeals;

        return hotels.filter((hotel) => {
            const hotelStaticData = statics.find((staticData: { id: any; }) => staticData.id === hotel.id);
            const hotelPrice = hotel.rates[0].daily_prices[0];
            const matchesPrice = hotelPrice >= priceRange[0] && hotelPrice <= priceRange[1];
            const matchesRating = hotelStaticData && ratingsToCheck.includes(hotelStaticData.star_rating || 0);
            const matchesMeal = hotel.rates && hotel.rates[0] && mealsToCheck.includes(hotel.rates[0].meal);
            return matchesPrice && matchesRating && matchesMeal;
        });
    };

    const isSelectedMeal = (meal: string) => selectedMeals.includes(meal);
    const filteredHotels = filterHotels(hotels);

    const handleNextPage = () => {
        console.log("Next Page clicked");  // Debugging to ensure click is detected
        if (displayedHotelCount < totalHotels) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        console.log("Previous Page clicked");  // Debugging to ensure click is detected
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div className="main-wrapper">
            <header><Navbar /></header>
            <div className="search-container">
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
                                        onChange={(e) => setPriceRange([Math.max(0, Math.min(parseInt(e.target.value), priceRange[1])), priceRange[1]])}
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
                                        onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], Math.min(parseInt(e.target.value), 5000))])}
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
                        <div className="filter-option">
                            <label>Meals</label>
                            <div className="meal-options-container">
                                {mealOptions.map((meal) => (
                                    <div key={meal.value} className="meal-option">
                                        <FormControlLabel
                                            control={<Checkbox checked={isSelectedMeal(meal.value)} onChange={() => handleMealChange(meal.value)} />}
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
                        {filteredHotels.map((hotel) => {
                            const hotelStatics = statics.find((staticData) => staticData.id === hotel.id);
                            return (
                                <div key={hotel.id}>
                                    <HotelDisplay
                                        hotel={hotel}
                                        searchParams={initialSearchParams}
                                        statics={hotelStatics}
                                    />
                                </div>
                            );
                        })}
                        <button className="btn"
                            disabled={displayedHotelCount >= totalHotels} onClick={handleNextPage}>Next Page</button>
                        <button className="btn"
                            disabled={page === 1} onClick={handlePreviousPage}>Previous Page</button>
                    </div>
                </div>
                {error && <Alert severity="error">Error: {error}</Alert>}
            </div>
        </div>
    );
};

export default SearchResults;