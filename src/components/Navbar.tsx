import React from "react";
import pic from './checkins.png'
import './Navbar.css'
import Image from 'next/image'

const Navbar = () => {
    return (
        <header className="header">
            <a href="/search"><Image src={pic} width={200} height={60} alt="Logo Pic" /></a>
            <nav className="navbar">
                <a href='/search'>Find Hotel</a>
                <a href='/reservation/list'>My Trips</a>
                <a href="/">Support</a>
            </nav>
        </header>
    );
};

export default Navbar;