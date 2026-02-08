import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from '../assets/photo.jpg';

const Footer = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Email mailto link with pre-filled content
    const emailSubject = 'General Inquiry - NNSCA';
    const emailBody = `Dear NNSCA Team,

I hope this message finds you well. I am writing to inquire about [your topic].

I would appreciate any information or guidance you can provide.

Thank you for your time and assistance.

Best regards`;

    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=nnscahyderabad@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return (
        <footer className="footer">
            <div className="footer-content">
                {/* LOGO & DESCRIPTION */}
                <div className="footer-section footer-about">
                    <div className="footer-logo-section">
                        <img src={logo} alt="NNSCA Logo" className="footer-logo" />
                        <h3 className="footer-title">NNSCA</h3>
                    </div>
                    <p className="footer-description">
                        Preserving Tamil culture and heritage in Hyderabad, devoted to Lord Murugan
                    </p>
                </div>

                {/* QUICK LINKS */}
                <div className="footer-section footer-links-section">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li>
                            <button onClick={() => handleNavigation('/')} className="footer-link-btn">
                                Home
                            </button>
                        </li>
                        <li>
                            <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/gallery" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                Gallery
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                Contact
                            </Link>
                        </li>
                        <li>
                            <button onClick={() => handleNavigation('/')} className="footer-link-btn">
                                Login
                            </button>
                        </li>
                    </ul>
                </div>

                {/* CONTACT US */}
                <div className="footer-section footer-contact-section">
                    <h4>Contact Us</h4>
                    <div className="contact-info">
                        <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="contact-link">
                                nnscahyderabad@gmail.com
                            </a>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <a href="tel:+917396762293" className="contact-link">
                                +91 7396762293
                            </a>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <a
                                href="https://maps.app.goo.gl/a2Go8iqnC9k21EnDA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                East Marredpally, Hyderabad, Telangana, India
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="copyright">&copy; 2026 Nattukkottai Nagarathar Social and Cultural Association. All rights reserved.</p>
                <p className="blessing">|| Om Saravana Bhava ||</p>
            </div>
        </footer>
    );
};

export default Footer;
