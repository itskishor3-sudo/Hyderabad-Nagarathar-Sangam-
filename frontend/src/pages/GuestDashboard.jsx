import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './GuestDashboard.css';

const GuestDashboard = () => {
    const [guestData, setGuestData] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: '',
        email: auth.currentUser?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        purposeOfVisit: '',
        visitDate: '',
        visitTime: '',
        numberOfPeople: '1',
        accompanied: [],
        relationshipToAssociation: '',
        howDidYouHear: '',
        additionalComments: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        preferredLanguage: 'English',
        atHyderabad: '',
        area: ''
    });
    const EMAILJS_CONFIG = {
        publicKey: "  SSydBGKHWDqrlDTiw",
        serviceId: "service_5xheh38",
        adminTemplateId: " template_d3jkl9l",
        guestTemplateId: "template_ljhnftm",
    };
    const [accompaniedPerson, setAccompaniedPerson] = useState({
        name: '',
        age: '',
        relation: ''
    });

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/guest-login');
            return;
        }
        fetchGuestData();
    }, [navigate]);

    const fetchGuestData = async () => {
        try {
            const guestRef = collection(db, 'guests');
            const q = query(guestRef, where('email', '==', auth.currentUser.email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setGuestData({ id: snapshot.docs[0].id, ...data });
                setFormData(data);
                setHasSubmitted(true);
            }
        } catch (error) {
            console.error('Error fetching guest data:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddAccompanied = () => {
        if (!accompaniedPerson.name || !accompaniedPerson.age || !accompaniedPerson.relation) {
            showToast('Please fill all accompanied person details', 'warning');
            return;
        }
        setFormData({
            ...formData,
            accompanied: [...formData.accompanied, accompaniedPerson]
        });
        setAccompaniedPerson({ name: '', age: '', relation: '' });
    };

    const handleRemoveAccompanied = (index) => {
        setFormData({
            ...formData,
            accompanied: formData.accompanied.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.purposeOfVisit) {
            showToast('Please fill all required fields', 'warning');
            return;
        }

        setLoading(true);

        try {
            if (hasSubmitted && guestData) {
                await updateDoc(doc(db, 'guests', guestData.id), {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
                showToast('Guest information updated successfully! Thank you.', 'success');
            } else {
                await addDoc(collection(db, 'guests'), {
                    ...formData,
                    userId: auth.currentUser.uid,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
                showToast('Registration submitted successfully! We will contact you soon.', 'success');
                setHasSubmitted(true);
            }
            fetchGuestData();
            setLoading(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Failed to submit form. Please try again.', 'error');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    if (!auth.currentUser) {
        return null;
    }

    return (
        <div className="guest-dashboard">
            <div className="dashboard-header">
                <h1>GUEST REGISTRATION</h1>
                <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
            </div>

            <div className="dashboard-content">
                <div className="guest-form-section">
                    {hasSubmitted && (
                        <div style={{
                            background: 'rgba(76, 175, 80, 0.3)',
                            border: '2px solid rgba(76, 175, 80, 0.6)',
                            color: '#00FFF9',
                            padding: '1.5rem',
                            borderRadius: '15px',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}>
                            ✅ Your registration is submitted! Status: <strong>PENDING APPROVAL</strong>
                            <br />
                            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>You can update your information below if needed.</span>
                        </div>
                    )}

                    <h2>{hasSubmitted ? 'UPDATE YOUR INFORMATION' : 'FILL YOUR DETAILS'}</h2>

                    <form onSubmit={handleSubmit} className="guest-form">
                        <div className="form-section">
                            <h3>👤 Personal Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Age *</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        placeholder="Enter your age"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 9876543210"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>📍 Address Details</h3>
                            <div className="form-group">
                                <label>Full Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your complete address"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Enter state"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="Enter country"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label>Are you currently residing in Hyderabad? *</label>
                                <div className="radio-group" style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                    <label className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="atHyderabad" value="yes" checked={formData.atHyderabad === 'yes'} onChange={handleInputChange} required />
                                        <span style={{ color: '#fff' }}>YES</span>
                                    </label>
                                    <label className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="atHyderabad" value="no" checked={formData.atHyderabad === 'no'} onChange={handleInputChange} required />
                                        <span style={{ color: '#fff' }}>NO</span>
                                    </label>
                                </div>
                            </div>

                            {formData.atHyderabad === 'yes' && (
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Area / Location in Hyderabad *</label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Kukatpally, Madhapur"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>🏛️ Visit Information</h3>
                            <div className="form-group">
                                <label>Purpose of Visit *</label>
                                <select
                                    name="purposeOfVisit"
                                    value={formData.purposeOfVisit}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Purpose</option>
                                    <option value="Temple Visit">Temple Visit</option>
                                    <option value="Cultural Event">Cultural Event</option>
                                    <option value="Religious Ceremony">Religious Ceremony</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Festival">Festival</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preferred Visit Date *</label>
                                    <input
                                        type="date"
                                        name="visitDate"
                                        value={formData.visitDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Visit Time *</label>
                                    <input
                                        type="time"
                                        name="visitTime"
                                        value={formData.visitTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Number of People *</label>
                                <input
                                    type="number"
                                    name="numberOfPeople"
                                    value={formData.numberOfPeople}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>👨‍👩‍👧‍👦 Accompanied Persons (Optional)</h3>
                            <div className="accompanied-builder">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={accompaniedPerson.name}
                                            onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, name: e.target.value })}
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            value={accompaniedPerson.age}
                                            onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, age: e.target.value })}
                                            placeholder="Enter age"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Relation</label>
                                        <input
                                            type="text"
                                            value={accompaniedPerson.relation}
                                            onChange={(e) => setAccompaniedPerson({ ...accompaniedPerson, relation: e.target.value })}
                                            placeholder="Enter relation"
                                        />
                                    </div>
                                </div>
                                <button type="button" className="add-btn" onClick={handleAddAccompanied}>
                                    + Add Person
                                </button>
                            </div>

                            {formData.accompanied.length > 0 && (
                                <div className="accompanied-list">
                                    <h4>Accompanied Persons:</h4>
                                    {formData.accompanied.map((person, index) => (
                                        <div key={index} className="accompanied-item">
                                            <span>{person.name} ({person.age} years, {person.relation})</span>
                                            <button type="button" className="remove-btn-small" onClick={() => handleRemoveAccompanied(index)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>🚨 Emergency Contact</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Emergency Contact Name *</label>
                                    <input
                                        type="text"
                                        name="emergencyContactName"
                                        value={formData.emergencyContactName}
                                        onChange={handleInputChange}
                                        placeholder="Enter emergency contact name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Emergency Contact Phone *</label>
                                    <input
                                        type="tel"
                                        name="emergencyContactPhone"
                                        value={formData.emergencyContactPhone}
                                        onChange={handleInputChange}
                                        placeholder="Enter emergency contact phone"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>💬 Additional Information (Optional)</h3>
                            <div className="form-group">
                                <label>Any Special Requirements or Comments?</label>
                                <textarea
                                    name="additionalComments"
                                    value={formData.additionalComments}
                                    onChange={handleInputChange}
                                    placeholder="Enter any additional information, dietary restrictions, accessibility needs, etc."
                                    rows="4"
                                ></textarea>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'SUBMITTING...' : (hasSubmitted ? '✏️ UPDATE INFORMATION' : '✅ SUBMIT REGISTRATION')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestDashboard;
