import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';


interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (searchParams: {
        destination: string;
        checkInDate: string;
        checkOutDate: string;
        adults: number;
        children: number;
        rooms: number;
        regionId: number | null;
    }) => void;
    originalDestination: string;
    originalCheckInDate: string;
    originalCheckOutDate: string;
    originalAdults: number;
    originalChildren: number;
    originalRooms: number;
}

interface Region {
    name: string;
    id: number | null; 
}



const SearchModal: React.FC<SearchModalProps> =  ({ isOpen, onClose, onSearch, originalDestination, originalCheckInDate, originalCheckOutDate, originalAdults, originalChildren, originalRooms }) => {
    const [destination, setDestination] = useState(originalDestination);
    const [checkInDate, setCheckInDate] = useState(originalCheckInDate);
    const [checkOutDate, setCheckOutDate] = useState(originalCheckOutDate);
    const [adults, setAdults] = useState(originalAdults);
    const [children, setChildren] = useState(originalChildren);
    const [rooms, setRooms] = useState(originalRooms);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [regionId, setRegionId] = useState<number | null>(null);


    const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setDestination(value);
    };

    const handleSuggestionClick = (region: Region) => {
        setDestination(region.name);
        setRegionId(region.id);
        console.log(region);
        setSuggestions([]);
    };


    useEffect(() => {
        if (isOpen) {
            setDestination(originalDestination || '');
            setCheckInDate(originalCheckInDate);
            setCheckOutDate(originalCheckOutDate);
            setAdults(originalAdults);
            setChildren(originalChildren);
            setRooms(originalRooms);
        }
    }, [isOpen, originalDestination, originalCheckInDate, originalCheckOutDate, originalAdults, originalChildren, originalRooms]);


    useEffect(() => {
        if (destination.length > 2) {
            fetchRegions(destination);
        } else {
            setSuggestions([]);
        }
    }, [destination]);


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
            // console.log("Result:", result);

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



    console.log("destination: ", destination);

  const handleSubmit = () => {
    onSearch({ destination, checkInDate, checkOutDate, adults, children, rooms, regionId});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Search for Hotels</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Destination"
          value={destination}
          onChange={handleDestinationChange}
          margin="normal"
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
        <TextField
          fullWidth
          label="Check-in Date"
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Check-out Date"
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Number of Adults"
          type="number"
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          margin="normal"
          inputProps={{ min: 1 }}
        />
        <TextField
          fullWidth
          label="Number of Children"
          type="number"
          value={children}
          onChange={(e) => setChildren(Number(e.target.value))}
          margin="normal"
          inputProps={{ min: 0 }}
        />
        <TextField
          fullWidth
          label="Number of Rooms"
          type="number"
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
          margin="normal"
          inputProps={{ min: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Search</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchModal;
