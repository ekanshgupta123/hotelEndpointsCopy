import React from "react";
import './Navbar.css'
import Image from 'next/image'

const Navbar = () => {
    return (
        <header className="header">
            <a href="/" className="logo">Hotel Checkins</a>
            <nav className="navbar">
                <a href="/booking">Find Hotel</a>
                <a href="/reservation">My Trips</a>
                <a href="/">Support</a>
            </nav>
            <button className="userButton">User</button>
        </header>
    )
}

export default Navbar;