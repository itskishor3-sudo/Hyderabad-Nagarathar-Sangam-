import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/photo.jpg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <img src={logo} alt="NNSCA Logo" className="nav-logo-img" />
                    <div className="nav-logo-text">
                        <span className="nav-title">HYDERABAD NAGARATHAR SANGAM</span>
                        <span className="nav-subtitle"></span>
                    </div>
                </Link>

                <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    <span className={isOpen ? 'menu-line open' : 'menu-line'}></span>
                    <span className={isOpen ? 'menu-line open' : 'menu-line'}></span>
                    <span className={isOpen ? 'menu-line open' : 'menu-line'}></span>
                </div>

                <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
                            About Us
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/sub-committee" className="nav-link" onClick={() => setIsOpen(false)}>
                            NNSCA Sub Committee
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/gallery" className="nav-link" onClick={() => setIsOpen(false)}>
                            Gallery
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>
                            Contact
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
