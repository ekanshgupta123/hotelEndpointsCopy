import React from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

require('dotenv').config({ path: "/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/Hotel-Booking-Checkin/src/app/api/backend/.env" });

const containerStyle = {
    width: '50%',
    height: '250px'
  };

type coordinates = {
    lat: number, 
    lng: number
}

const GoogleMapComponent: React.FC<coordinates> = ({ lat, lng }) => {
    return (
        <LoadScript googleMapsApiKey="AIzaSyA9zeSrKXlgbBr0Jfkzz_2XZzg1G6ES5IE">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{
                lat: lat,
                lng: lng
              }}
            zoom={10}
          >
            <Marker position={{
                lat: lat,
                lng: lng
            }} />
          </GoogleMap>
        </LoadScript>
      );
}

export default GoogleMapComponent;