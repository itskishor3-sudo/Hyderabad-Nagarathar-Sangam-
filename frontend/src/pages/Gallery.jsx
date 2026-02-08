import React, { useState } from 'react';
import './Gallery.css';

// Import images
import sangamamImg from '../assets/sangamam.jpg';
import nonbu1 from '../assets/nonbu1.jpg';
import nonbu2 from '../assets/nonbu2.jpg';
import nonbu3 from '../assets/nonbu3.jpg';
import nonbu4 from '../assets/nonbu4.jpg';
import nonbu5 from '../assets/nonbu5.jpg';
import nonbu6 from '../assets/nonbu6.jpg';
import kavadi1 from '../assets/kavadi1.jpg';
import kavadi2 from '../assets/kavadi2.jpg';
import kavadi3 from '../assets/kavadi3.jpg';

const Gallery = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const events = [
        {
            id: 1,
            title: "Sangamam 2025",
            description: "Grand community gathering at Sri Vidyadhari Kshetram.",
            tag: "EVENTS",
            tagClass: "events",
            images: [sangamamImg]
        },
        {
            id: 2,
            title: "Pillayar Nonbu 2025",
            description: "Nagarathar unique festival celebration featuring traditional attire and performances.",
            tag: "RELIGIOUS",
            tagClass: "religious",
            images: [nonbu1, nonbu2, nonbu3, nonbu4, nonbu5, nonbu6]
        },
        {
            id: 3,
            title: "Murugan Kaavadi Poojai",
            description: "Murugan Kaavadi Poojai Jan 2026.",
            tag: "RELIGIOUS",
            tagClass: "religious",
            images: [kavadi1, kavadi2, kavadi3]
        }
    ];

    const openLightbox = (event, index = 0) => {
        setSelectedEvent(event);
        setCurrentImageIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedEvent(null);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === selectedEvent.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedEvent.images.length - 1 : prev - 1
        );
    };

    return (
        <div className="gallery-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Our Gallery</h1>
                    <p className="header-subtitle">Capturing memories from our community</p>
                </div>
            </div>

            <section className="gallery-section">
                <div className="container">
                    <div className="gallery-grid">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="gallery-item"
                                onClick={() => openLightbox(event)}
                            >
                                <div className="gallery-image-wrapper">
                                    <img src={event.images[0]} alt={event.title} className="gallery-img" />
                                    {event.images.length > 1 && (
                                        <div className="multi-photo-badge">
                                            <span>📷</span>
                                            <span>{event.images.length} Photos</span>
                                        </div>
                                    )}
                                </div>
                                <div className="gallery-info">
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                    <span className={`category-tag ${event.tagClass}`}>
                                        {event.tag}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedEvent && (
                <div className="fullscreen-modal" onClick={closeLightbox}>
                    <button className="close-modal" onClick={closeLightbox}>&times;</button>

                    {selectedEvent.images.length > 1 && (
                        <>
                            <div className="slide-counter">
                                {currentImageIndex + 1} / {selectedEvent.images.length}
                            </div>
                            <button className="nav-btn prev" onClick={prevImage}>&#10094;</button>
                            <button className="nav-btn next" onClick={nextImage}>&#10095;</button>
                        </>
                    )}

                    <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedEvent.images[currentImageIndex]}
                            alt={`${selectedEvent.title} ${currentImageIndex + 1}`}
                            className="fullscreen-img"
                        />
                        <div className="fullscreen-caption">
                            <h2>{selectedEvent.title}</h2>
                            <p>{selectedEvent.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;