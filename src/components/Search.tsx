import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../styles/Search.css';

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
        const keys = [
            `pricing: ${regionId}-${searchParams.checkInDate}-${searchParams.checkOutDate}-${searchParams.adults}-${children.length}`,
            `static: ${regionId}`
        ];
        router.push({
            pathname: '/booking',
            query: {
                ...searchParams,
                guests: guests,
                regionId: regionId, 
            },
        });
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

    

    return (
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
                    <button type="submit" className="search-button" disabled={isLoading}> Search </button>
                </div>
            </form>
        </div>
    );    
};

export default Search;
