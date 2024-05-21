"use client";

import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { redirect } from 'next/navigation'
import '../styles/App.css';
import { useRouter } from "next/router"; 


const Details = () => {

    const router = useRouter();

    const dummyHotelProperties = [
        {
            id : 1,
            title: 'Hotel Sunshine',
            price: '$100 per night',
            image: 'https://via.placeholder.com/150'
        },
        {
            id : 2,
            title: 'Grand Palace Hotel',
            price: '$150 per night',
            image: 'https://via.placeholder.com/150'
        },
        {
            id : 3,
            title: 'Oceanview Resort',
            price: '$200 per night',
            image: 'https://via.placeholder.com/150'
        }
    ];

    const handleViewDetails = (id: number) => {
        router.push(`/hotel/details/${id}`);
    };

    return (
        <div className="properties-list">
            <h1> Details Page </h1>
                    <ul>
                        {dummyHotelProperties.map((property, index) => (
                            <li key={index} className="property-item">
                                <h2>{property.title}</h2>
                                <p className="price">{property.price}</p>
                                {property.image && (
                                    <img src={property.image} alt={property.title} className="property-image" />
                                )}
                                <br />
                                <button type = "submit" onClick={() => handleViewDetails(property.id)}>View Details</button>
                            </li>
                        ))}
                    </ul>
                </div>
    )
}

export default Details;
