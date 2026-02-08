import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useToast } from '../context/ToastContext';
import './GuestRegistration.css';

const EMAILJS_CONFIG = {
    publicKey: 'WYFZJYuqC',
    serviceId: 'service_5xh3b8',
    adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID',  // ← Replace
    guestTemplateId: 'YOUR_GUEST_TEMPLATE_ID'   // ← Replace
};

const GuestRegistration = () => {
    const [formData, setFormData] = useState({
        name: '', age: '', email: '', phone: '',
        kovil: '', pirivu: '', nativePlace: '', pattaPer: '',
        address: '', city: '', state: '', pincode: '',  // ✅ NEW ADDRESS
        atHyderabad: '', // Changed to empty string for radio (yes/no)
        area: '',
        familyMembers: []
    });

    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addFamilyMember = () => {
        setFormData({
            ...formData,
            familyMembers: [
                ...formData.familyMembers,
                { relation: '', name: '', age: '', phone: '' }
            ]
        });
    };

    const removeFamilyMember = (index) => {
        const updatedFamily = formData.familyMembers.filter((_, i) => i !== index);
        setFormData({ ...formData, familyMembers: updatedFamily });
    };

    const handleFamilyChange = (index, field, value) => {
        const updatedFamily = formData.familyMembers.map((member, i) =>
            i === index ? { ...member, [field]: value } : member
        );
        setFormData({ ...formData, familyMembers: updatedFamily });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ 1. Save ALL data to Firebase "newMembers" collection
            const memberData = {
                ...formData,
                timestamp: new Date(),
                status: 'pending'
            };
            await addDoc(collection(db, 'newMembers'), memberData);

            // ✅ 2. Send Admin Email (if EmailJS configured)
            try {
                const adminParams = {
                    guest_name: formData.name,
                    guest_email: formData.email,
                    guest_phone: formData.phone,
                    hall_number: formData.kovil,
                    at_hyderabad: formData.atHyderabad ? 'Yes' : 'No'
                };
                await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, adminParams, EMAILJS_CONFIG.publicKey);
            } catch (emailError) {
                console.log('EmailJS failed (normal if not configured):', emailError);
            }

            showToast('✅ form is submitted successfully', 'success');
            console.log('✅ Saved:', memberData);

        } catch (error) {
            console.error('Firebase Error:', error);
            showToast('Error saving. Check console.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="guest-registration-page">
            <div className="registration-container">
                <div className="registration-header">
                    <h1>🎯 Member Registration</h1>
                    <p className="registration-subtitle">Join the NNSCA Family</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* ✅ PERSONAL DETAILS (UNCHANGED) */}
                    <div className="form-section">
                        <h2 className="section-title">👤 Personal Details</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input type="text" id="name" name="name" value={formData.name}
                                    onChange={handleChange} required placeholder="Enter your full name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <input type="number" id="age" name="age" value={formData.age}
                                    onChange={handleChange} required min="18" placeholder="Your age" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input type="email" id="email" name="email" value={formData.email}
                                    onChange={handleChange} required placeholder="your.email@example.com" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone}
                                    onChange={handleChange} required placeholder="+91 9876543210" />
                            </div>
                        </div>
                    </div>

                    {/* ✅ CULTURAL DETAILS (UNCHANGED) */}
                    <div className="form-section">
                        <h2 className="section-title">🏛️ Cultural Details</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="kovil">Kovil *</label>
                                <input type="text" id="kovil" name="kovil" value={formData.kovil}
                                    onChange={handleChange} required placeholder="Your Kovil" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pirivu">Pirivu *</label>
                                <input type="text" id="pirivu" name="pirivu" value={formData.pirivu}
                                    onChange={handleChange} required placeholder="Your Pirivu" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nativePlace">Native Place *</label>
                                <input type="text" id="nativePlace" name="nativePlace"
                                    value={formData.nativePlace} onChange={handleChange} required
                                    placeholder="Your native place" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pattaPer">Pattai peyar *</label>
                                <input type="text" id="pattaPer" name="pattaPer" value={formData.pattaPer}
                                    onChange={handleChange} required placeholder="Your Patta Per" />
                            </div>
                        </div>
                        <div className="form-group radio-group-section">
                            <label className="field-label" style={{ color: 'white', fontWeight: 'bold' }}>Are you currently residing in Hyderabad? *</label>
                            <div className="radio-group-guest">
                                <label className="radio-label-guest">
                                    <input
                                        type="radio"
                                        name="atHyderabad"
                                        value="yes"
                                        checked={formData.atHyderabad === 'yes'}
                                        onChange={(e) => setFormData({ ...formData, atHyderabad: e.target.value })}
                                        required
                                    />
                                    <span className="radio-custom-guest"></span>
                                    <span>YES</span>
                                </label>
                                <label className="radio-label-guest">
                                    <input
                                        type="radio"
                                        name="atHyderabad"
                                        value="no"
                                        checked={formData.atHyderabad === 'no'}
                                        onChange={(e) => setFormData({ ...formData, atHyderabad: e.target.value })}
                                        required
                                    />
                                    <span className="radio-custom-guest"></span>
                                    <span>NO</span>
                                </label>
                            </div>
                        </div>
                        {formData.at_hyderabad === 'yes' && (
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label htmlFor="area" style={{ color: 'white', fontWeight: 'bold' }}>Area / Location (e.g., Kukatpally, Madhapur) *</label>
                                <input
                                    type="text"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your area"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        marginTop: '0.5rem'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* ✅ NEW ADDRESS SECTION */}
                    <div className="form-section">
                        <h2 className="section-title">📍 Address Details *</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="address">Full Address</label>
                                <textarea id="address" name="address" value={formData.address}
                                    onChange={handleChange} required rows="2"
                                    placeholder="House number, street, landmark" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input type="text" id="city" name="city" value={formData.city}
                                    onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="state">State</label>
                                <input type="text" id="state" name="state" value={formData.state}
                                    onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pincode">Pincode</label>
                                <input type="text" id="pincode" name="pincode" value={formData.pincode}
                                    onChange={handleChange} required maxLength="6" />
                            </div>
                        </div>
                    </div>

                    {/* ✅ FAMILY MEMBERS (UNCHANGED) */}
                    <div className="form-section">
                        <h2 className="section-title">👨‍👩‍👧‍👦 Family Members (Optional)</h2>
                        {formData.familyMembers.map((member, index) => (
                            <div key={index} className="family-member-card">
                                <div className="family-member-header">
                                    <h4>Family Member {index + 1}</h4>
                                    <button type="button" onClick={() => removeFamilyMember(index)}
                                        className="remove-family-btn">✕ Remove</button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Relation</label>
                                        <input type="text" placeholder="e.g., Spouse, Son, Daughter"
                                            value={member.relation}
                                            onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" placeholder="Full name"
                                            value={member.name}
                                            onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input type="number" placeholder="Age" min="0"
                                            value={member.age}
                                            onChange={(e) => handleFamilyChange(index, 'age', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" placeholder="+91 9876543210"
                                            value={member.phone}
                                            onChange={(e) => handleFamilyChange(index, 'phone', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addFamilyMember} className="add-family-btn">
                            ➕ Add Family Member
                        </button>
                    </div>

                    {/* ✅ PAYMENT (UNDER DEVELOPMENT) */}
                    <div className="form-section payment-section">
                        <h2 className="section-title">💳 Membership Payment</h2>
                        <div className="payment-info-box" style={{ textAlign: 'center', padding: '2rem' }}>
                            <p className="payment-notice" style={{ fontSize: '1.4rem', color: '#F4B41A', fontWeight: 'bold', marginBottom: '1rem' }}>
                                ⚠️ Electronic Payment Under Development
                            </p>
                            <p className="payment-description" style={{ fontSize: '1.1rem', color: 'white' }}>
                                Online payment processing is not yet enabled.
                                <br />
                                Please submit the form to register your details. Our team will contact you regarding the membership fee and payment methods.
                            </p>
                            <div className="payment-methods" style={{ justifyContent: 'center', marginTop: '1.5rem', opacity: 0.6 }}>
                                <span className="payment-badge">💳 Credit/Debit Card (Coming Soon)</span>
                                <span className="payment-badge">🏦 Net Banking (Coming Soon)</span>
                                <span className="payment-badge">📱 UPI (Coming Soon)</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-registration-btn" disabled={loading}>
                        {loading ? 'Processing...' : '💾 Submit Registration Details'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuestRegistration;
