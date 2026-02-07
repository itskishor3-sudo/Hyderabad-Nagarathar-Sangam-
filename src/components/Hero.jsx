import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import logo from '../assets/photo.jpg';
import hyderabadImage from '../assets/hyderabad-landmarks.jpg';
import slide2 from '../assets/slide.jpg'; // Import the new slide image
import sangamam from '../assets/sangamam.jpg'; // Import sangamam slide image

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Use imported image
    const slides = [
        hyderabadImage,
        slide2,
        sangamam
    ];

    // Auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <section className="hero">
            {/* Background Image Carousel */}
            <div className="hero-background-carousel">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`hero-bg-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide})` }}
                    />
                ))}
            </div>

            {/* Overlay */}
            <div className="hero-overlay"></div>

            {/* Existing Content */}
            <div className="hero-content-wrapper">
                <img src={logo} alt="NNSC Logo" className="hero-logo" />
                <h1 className="hero-title">NATTUKKOTTAI NAGARATHAR</h1>
                <p className="hero-subtitle">SOCIAL AND CULTURAL ASSOCIATION</p>
                <p className="hero-blessing">|| வேல் வேல் முருகா வெற்றிவேல் முருகா ||</p>
                <div className="hero-buttons">
                    <Link to="/about" className="hero-btn primary-btn">Learn More</Link>
                    <Link to="/guest-registration" className="hero-btn secondary-btn">Join As a Member</Link>

                </div>
            </div>

            {/* Carousel Indicators */}
            <div className="carousel-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
