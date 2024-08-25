import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../styles/Search.css';
import Navbar from '@/components/Navbar';
import search from '@/pages/search';
import { Alert, TextField } from '@mui/material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface SearchParams {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    rooms: number;
}


interface Child {
    age: number;
}

interface Region {
    name: string;
    id: number | null; 
}

const Search = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        destination: '',
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        rooms: 1
    });
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [regionId, setRegionId] = useState<number | null>(null);
    const router = useRouter();

    const [state, setState] = useState([
        {
          startDate: new Date(),
          endDate: null,
          key: 'selection'
        }
      ]);
        
    const [error, setError] = useState<string | null>(null);


    let regionCityId = new Map<String, Number>();

    regionCityId.set("Las Vegas", 2008);
    regionCityId.set("London", 2114);
    regionCityId.set("Bangkok", 604);
    regionCityId.set("Los Angeles", 2011);
    regionCityId.set("Honolulu", 966175153);
    regionCityId.set("Dubai", 6053839);
    regionCityId.set("Paris", 2734);
    regionCityId.set("Miami", 2297);
    regionCityId.set("Singapore", 3168);
    regionCityId.set("New York", 2621);
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prevParams => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const fetchRegions = async (query: string) => {
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
                setSuggestions(cities);  
            } else {
                console.log('No regions found');
                setSuggestions([]); 
            }
        } catch (error) {
            console.log('Error:', error);
            setSuggestions([]);  
        }
    };

    useEffect(() => {
        if (searchParams.destination.length > 2) {
            fetchRegions(searchParams.destination);
        } else {
            setSuggestions([]);
        }
    }, [searchParams.destination]);


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


    const guests = JSON.stringify([{
        adults: searchParams.adults,
        children: children
    }]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchParams.destination) {
            setError("Please enter a destination.");
            return;
        }
        if (!searchParams.checkInDate) {
            setError("Please select a check-in date.");
            return;
        }
        if (!searchParams.checkOutDate) {
            setError("Please select a check-out date.");
            return;
        }
        setError(null);    
        const keys = [
            `pricing: ${regionId}-${searchParams.checkInDate}-${searchParams.checkOutDate}-${searchParams.adults}-${children.length}`,
            `static: ${regionId}`
        ];
        console.log("Search Params: ", searchParams);
        router.push(`/booking?guests=${guests}&regionId=${regionId}&destination=${searchParams.destination}&searchParams=${encodeURIComponent(JSON.stringify(searchParams))}`);
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

    const today = new Date().toISOString().split('T')[0];
    const minCheckOutDate = searchParams.checkInDate ? new Date(new Date(searchParams.checkInDate).getTime() + 86400000).toISOString().split('T')[0] : today;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); 
    const checkOutDate = tomorrow.toISOString().split('T')[0];

    const handleCardClick = (guests: any, regionId: any, destination: any, searchParams: any) => {
        router.push(`/booking?guests=${guests}&regionId=${regionId}&destination=${destination}&searchParams=${encodeURIComponent(JSON.stringify(searchParams))}`);
      };
    

    const tempGuests = JSON.stringify([{
        adults: 1,
        children: []
    }])


    const [tempSearchParams, setTempSearchParams] = useState<SearchParams>({
        destination: '',
        checkInDate: today,
        checkOutDate: checkOutDate,
        adults: 1,
        rooms: 1
    });
      
    return (
        <>
          <header>
            <Navbar />
          </header>
          <div className="hero-section"> 
          {error && (
                <Alert severity="error" className="error-message" onClose={() => setError(null)}>
                    Error: {error}
                </Alert>
            )}
            <div className="bubble-container">
                <h1>Hotel Bookings Redefined</h1>
                <p>
                    Get ready for a wild ride with our AI-powered travel wizardry, uncovering deals so good, even your piggy bank will high-five you! 
                    Let our cheeky AI bot be your travel BFF, dishing out personalized tips and prices that'll make you do a happy dance all the way to your dream destination!
                </p>
            </div>
        <div className="form-container">
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
            <button type="submit" className="search-button" disabled={isLoading}>Search</button>
          </div>
        </form>
      </div>
    </div>
          <div className="destinations-section">
          <div className="title-container">
            <span className="subtitle">Destinations</span>
            <h2 className="title">Book Hotels At Popular Destinations</h2>
        </div>
      <div className="destinations-grid">
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Las Vegas'), 'Las Vegas', tempSearchParams)}>
          <img src="https://media.cnn.com/api/v1/images/stellar/prod/180313182911-01-las-vegas-travel-strip.jpg?q=w_3418,h_2556,x_0,y_0,c_fill" alt="Las Vegas" />
          <div className="destination-name">Las Vegas</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('London'), 'London', tempSearchParams)}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/640px-London_Skyline_%28125508655%29.jpeg" alt="London" />
          <div className="destination-name">London</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Bangkok'), 'Bangkok', tempSearchParams)}>
          <img src="https://media.istockphoto.com/id/483816132/photo/bangkok-cityscape.jpg?s=612x612&w=0&k=20&c=58yp-hppLeL4rmCav2Kvs7IgAfhlqn_JSWh9Jw2QiXs=" alt="Bangkok" />
          <div className="destination-name">Bangkok</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Los Angeles'), 'Los Angeles', tempSearchParams)}>
          <img src="https://media.tacdn.com/media/attractions-content--1x-1/10/47/5a/bf.jpg" alt="Los Angeles" />
          <div className="destination-name">Los Angeles</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Honolulu'), 'Honolulu', tempSearchParams)}>
          <img src="https://cdn.britannica.com/86/93886-050-BE3FAF0A/Waikiki-Honolulu-Hawaii.jpg" alt="Honolulu" />
          <div className="destination-name">Honolulu</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Dubai'), 'Dubai', tempSearchParams)}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg/640px-Dubai_Skylines_at_night_%28Pexels_3787839%29.jpg" alt="Dubai" />
          <div className="destination-name">Dubai</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Paris'), 'Paris', tempSearchParams)}>
          <img src="https://t4.ftcdn.net/jpg/02/96/15/35/360_F_296153501_B34baBHDkFXbl5RmzxpiOumF4LHGCvAE.jpg" alt="Paris" />
          <div className="destination-name">Paris</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('New York'), 'New York', tempSearchParams)}>
          <img src="https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg" alt="New York" />
          <div className="destination-name">New York</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Miami'), 'Miami', tempSearchParams)}>
          <img src="https://media.istockphoto.com/id/802893644/photo/aerial-view-of-downtown-miami-florida.jpg?s=612x612&w=0&k=20&c=QwdSYtoeB-9xTvqgbpnM9aCaRf_39rw8bVw7LsszSGg=" alt="Miami" />
          <div className="destination-name">Miami</div>
        </div>
        <div className="destination-card" onClick={() => handleCardClick(tempGuests, regionCityId.get('Singapore'), 'Singapore', tempSearchParams)}>
          <img src="https://t4.ftcdn.net/jpg/02/94/27/73/360_F_294277354_ev3qw00wjlHAfhqRdEozsrVRpbhixC3S.jpg" alt="Singapore" />
          <div className="destination-name">Singapore</div>
        </div>
      </div>
    </div>
        </>
    );    
};

export default Search;
