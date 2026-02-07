import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './GuestForm.css';

const GuestForm = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        age: '',
        nativePlace: '',
        kovil: '',
        pirivu: '',
        houseNamePattaiPeyar: '',
        fathersName: '',
        permanentAddress: '',
        phoneNumber: '',
        checkInDate: '',
        checkInTime: '',
        expectedCheckOutDate: '',
        expectedCheckOutTime: '',
        totalNumberOfGuests: '',
        roomHall: '',
        aadharNumber: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // UPDATED SUBMIT WITH AUTOMATED EMAIL SYSTEM
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.name || !formData.age || !formData.nativePlace ||
            !formData.kovil || !formData.pirivu || !formData.houseNamePattaiPeyar ||
            !formData.fathersName || !formData.permanentAddress || !formData.phoneNumber ||
            !formData.checkInDate || !formData.checkInTime || !formData.expectedCheckOutDate ||
            !formData.expectedCheckOutTime || !formData.totalNumberOfGuests ||
            !formData.roomHall || !formData.aadharNumber) {
            showToast('Please fill all required fields', 'warning');
            return;
        }

        setLoading(true);

        try {
            // 1️⃣ SAVE TO FIREBASE
            await addDoc(collection(db, 'guests'), {
                ...formData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                type: 'walk-in-guest'
            });

            // 2️⃣ TRIGGER AUTOMATED EMAIL SYSTEM
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

            const response = await fetch(`${API_BASE_URL}/api/guest/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send emails.');
            }

            // Success
            setSubmitted(true);
            setFormData({});
            showToast('✅ Registration successful! Emails sent to admins and you.', 'success');

        } catch (error) {
            console.error('Error:', error);
            showToast(`❌ Registration failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // SUCCESS SCREEN (unchanged)
    if (submitted) {
        return (
            <div className="guest-form-page">
                <div className="success-message" style={{
                    textAlign: 'center', padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto'
                }}>
                    <div className="success-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h1 style={{ color: '#4caf50', marginBottom: '1rem' }}>Registration Successful!</h1>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Thank you for registering. Your details have been sent for approval.
                        <br />📧 Confirmation emails sent to admins and you!
                    </p>
                    <button onClick={() => navigate('/')} className="home-btn" style={{
                        padding: '1rem 2rem', background: '#2196f3', color: 'white',
                        border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer'
                    }}>
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // FORM JSX (UNCHANGED - PERFECT)
    return (
        <div className="guest-form-page">
            <div className="form-header">
                <button onClick={() => navigate('/')} className="back-home-btn">
                    ← Back to Home
                </button>
                <h1>GUEST REGISTRATION</h1>
                <p>Hyderabad Nattukottai Nagarathar Sangam</p>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="guest-registration-form">
                    {/* ALL YOUR FORM FIELDS - PERFECT, NO CHANGES */}
                    <div className="form-section">
                        <h3>👤 Personal Information</h3>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                        </div>
                        <div className="form-group">
                            <label>Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" required />
                        </div>
                        <div className="form-group">
                            <label>Age *</label>
                            <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Your age" min="18" required />
                        </div>
                        <div className="form-group">
                            <label>Native place *</label>
                            <input type="text" name="nativePlace" value={formData.nativePlace} onChange={handleInputChange} placeholder="Your native place" required />
                        </div>
                        <div className="form-group">
                            <label>Kovil *</label>
                            <input type="text" name="kovil" value={formData.kovil} onChange={handleInputChange} placeholder="Your Kovil" required />
                        </div>
                        <div className="form-group">
                            <label>Pirivu *</label>
                            <input type="text" name="pirivu" value={formData.pirivu} onChange={handleInputChange} placeholder="Your Pirivu" required />
                        </div>
                        <div className="form-group">
                            <label>House Name / Pattai peyar *</label>
                            <input type="text" name="houseNamePattaiPeyar" value={formData.houseNamePattaiPeyar} onChange={handleInputChange} placeholder="House Name / Pattai peyar" required />
                        </div>
                        <div className="form-group">
                            <label>Father's Name *</label>
                            <input type="text" name="fathersName" value={formData.fathersName} onChange={handleInputChange} placeholder="Father's Name" required />
                        </div>
                        <div className="form-group">
                            <label>Permanent address *</label>
                            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Enter your permanent address" rows="3" required />
                        </div>
                        <div className="form-group">
                            <label>Phone number *</label>
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+91 9876543210" required />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>📅 Visit Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Check in date *</label>
                                <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Check in Time *</label>
                                <input type="time" name="checkInTime" value={formData.checkInTime} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Expected check out date *</label>
                                <input type="date" name="expectedCheckOutDate" value={formData.expectedCheckOutDate} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Expected check out time *</label>
                                <input type="time" name="expectedCheckOutTime" value={formData.expectedCheckOutTime} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>🏨 Accommodation Details</h3>
                        <div className="form-group">
                            <label>Total Number of Guests *</label>
                            <input type="number" name="totalNumberOfGuests" value={formData.totalNumberOfGuests} onChange={handleInputChange} min="1" placeholder="Total number of guests" required />
                        </div>
                        <div className="form-group">
                            <label>Room / Hall *</label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input type="radio" name="roomHall" value="Room" onChange={handleInputChange} required />
                                    <span className="radio-custom"></span> Room
                                </label>
                                <label className="radio-option">
                                    <input type="radio" name="roomHall" value="Hall" onChange={handleInputChange} required />
                                    <span className="radio-custom"></span> Hall
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Aadhar number *</label>
                            <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} placeholder="Enter Aadhar number" maxLength="12" required />
                        </div>
                    </div>

                    {/* ⏰ SERVER WAIT TIME NOTICE */}
                    <div className="form-section" style={{
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 193, 7, 0.15))',
                        border: '2px solid rgba(255, 152, 0, 0.4)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
                        <h3 style={{ color: '#FFC107', marginBottom: '0.8rem', fontSize: '1.2rem' }}>
                            Please Wait for Server Response
                        </h3>
                        <p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                            After clicking submit, please wait <strong>30-40 seconds</strong> for the form to reach our servers and for the admin confirmation email to be sent.
                            <br />
                            <strong>Do not close this page</strong> until you see the success message.
                        </p>
                    </div>

                    <button type="submit" className="submit-btn-guest" disabled={loading}>
                        {loading ? '🚀 SENDING EMAILS...' : '✅ SUBMIT & SEND EMAILS'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuestForm;
