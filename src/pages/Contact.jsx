import React, { useState } from 'react';
import './Contact.css';
import { useToast } from '../context/ToastContext';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - show success message
                showToast('✅ ' + data.message, 'success');

                // Clear form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                // Server returned an error
                showToast('❌ ' + (data.message || 'Failed to send message. Please try again.'), 'error');
            }
        } catch (error) {
            // Network or other error
            console.error('Error submitting form:', error);
            showToast('❌ Unable to send message. Please check if the backend server is running or try again later.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Correct Google Maps Link for the Button
    const mapLink = "https://www.google.com/maps/place/Hyderabad+Nagarathar+Sangam/@17.4473403,78.512149,15z/data=!4m6!3m5!1s0x3bcb9b673285afe5:0x254cdf5e90a104db!8m2!3d17.4473403!4d78.512149";

    return (
        <div className="contact-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Contact Us</h1>
                    <p className="header-subtitle">We'd love to hear from you. Reach out to our community</p>
                </div>
            </div>

            {/* Contact Content */}
            <section className="contact-section">
                <div className="container">
                    <div className="contact-wrapper">
                        {/* Contact Information Cards */}
                        <div className="contact-info-grid">
                            <div className="info-card">
                                <div className="info-icon">📍</div>
                                <h3>Location</h3>
                                <div className="contact-text-block">
                                    <p>Flat No. 401, Pushpakalyan Apartments</p>
                                    <p>Street Number 10, Nehrunagar Society</p>
                                    <p>Mamidpalli, East Marredpally</p>
                                    <p>Secunderabad, Telangana 500026</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">📧</div>
                                <h3>Email</h3>
                                <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=nnscahyderabad@gmail.com&su=${encodeURIComponent('Contact Request - NNSC Association')}&body=${encodeURIComponent(`Dear NNSC Team,

I hope this message finds you well. I am reaching out to you regarding [your inquiry topic].

I would appreciate your assistance and guidance in this matter.

Thank you for your time and consideration.

Best regards`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-link"
                                >
                                    nnscahyderabad@gmail.com
                                    <p className="email-hint">✉️ Click to send email</p>
                                </a>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">📞</div>
                                <h3>Phone</h3>
                                <a href="tel:+917396762293" className="contact-link">
                                    +91 7396762293
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <div className="form-header">
                                <h2>Send us a Message</h2>
                                <p>Have a question or want to get involved? Fill out the form below and we'll get back to you as soon as possible.</p>
                            </div>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">Subject *</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="What is this regarding?"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="map-container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.059881848521!2d78.51214900000001!3d17.4473403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9b673285afe5%3A0x254cdf5e90a104db!2sHyderabad%20Nagarathar%20Sangam!5e0!3m2!1sen!2sin!4v1706456000000!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="NNSC Association Location"
                    ></iframe>

                    <div className="map-overlay">
                        <div className="map-info">
                            <h3>📍 Visit Us</h3>

                            <div className="address-text">
                                <p>Flat No. 401, Pushpakalyan Apartments,</p>
                                <p>Street Number 10, Nehrunagar Society,</p>
                                <p>Mamidpalli, East Marredpally,</p>
                                <p>Secunderabad, Telangana 500026</p>
                            </div>

                            <div className="map-actions">
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="get-directions-btn"
                                >
                                    <span className="btn-icon">🧭</span>
                                    <span className="btn-text">Get Directions</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
