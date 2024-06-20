import React from "react";
import pic from './checkins.png'
import './Navbar.css'
import Image from 'next/image'

const Navbar = () => {
    return (
        <header className="header">
            <Image src={pic} width={200} height={60} alt="Logo Pic"/>
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