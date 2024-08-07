import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const GoogleMapComponent = ({ addresses, loading, searchParams }) => {
//   console.log("Addresses: " , addresses);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    const geocodeAddresses = async () => {
      try {
        const geocodedMarkers = await Promise.all(addresses.map(async (address) => {
            // console.log("address: " , address);
          const geocodedData = await geocodeAddress(address);
          return {
            position: geocodedData,
            title: address.statics.name,
            address: address.statics.address, 
            price: address.price, 
            statics: address.statics
          };
        }));

        setMarkers(geocodedMarkers);
      } catch (error) {
        console.error("Error geocoding addresses:", error);
      }
    };

    const geocodeAddress = (address) => {
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: address.address }, (results, status) => {
          if (status === 'OK') {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            reject(`Geocode was not successful for the following reason: ${status}`);
          }
        });
      });
    };

    if (!loading && addresses && addresses.length > 0) {
      geocodeAddresses();
    }
  }, [addresses, loading]);

    const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };


  const handleCardClick = (hotelData, searchParams, price) => {
    console.log("searchparams: ", searchParams);
    console.log("price: ", price);
    localStorage.setItem('currentHotelData', JSON.stringify(hotelData.statics));
    localStorage.setItem('searchParams', JSON.stringify(searchParams));
    localStorage.setItem('priceParams', JSON.stringify(hotelData.price));
    window.open(`/hotel/${hotelData.statics.id}`, '_blank');
}; 

console.log("markers, ", markers);

  return (
    <LoadScript googleMapsApiKey={process.env.googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markers.length > 0 ? markers[0].position : { lat: 0, lng: 0 }}
        zoom={markers.length > 0 ? 10 : 2}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            title={marker.title}
            onMouseOver={() => handleActiveMarker(marker)}
            onClick={() => handleCardClick(marker, searchParams, marker.price)}
          >
            {activeMarker === marker ? (
              <InfoWindow
                position={marker.position}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div>
                <img
                    src={marker.statics.images?.[0] 
                        ? `${marker.statics.images[0].slice(0, 27)}100x100${marker.statics.images[0].slice(33)}` 
                        : 'default-image-url'} 
                    alt={marker.title}
                />
                  <h3>{marker.title}</h3>
                  <p>{marker.address}</p>
                  <p>Price: ${marker.price}</p>
                </div>
              </InfoWindow>
            ) : null}
          </Marker>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
