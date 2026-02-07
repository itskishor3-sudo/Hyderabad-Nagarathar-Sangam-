import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './MemberProfileRegistration.css';


const MemberProfileRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: auth.currentUser?.email || '',
        kovil: '',
        pirivu: '',
        nativePlace: '',
        pattaPer: '',
        atHyderabad: '', // Empty string for radio buttons
        familyMembers: []
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();





    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleFamilyChange = (index, field, value) => {
        const newFamily = formData.familyMembers.map((member, i) =>
            i === index ? { ...member, [field]: value } : member
        );
        setFormData(prev => ({ ...prev, familyMembers: newFamily }));
    };


    const addFamilyMember = () => {
        setFormData(prev => ({
            ...prev,
            familyMembers: [...prev.familyMembers, { relation: '', name: '', age: '', phone: '' }]
        }));
    };


    const removeFamilyMember = (index) => {
        const newFamily = formData.familyMembers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, familyMembers: newFamily }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.atHyderabad) {
            showToast('Please select if you are residing in Hyderabad', 'error');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'members'), {
                ...formData,
                userId: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            showToast('Profile created successfully! Redirecting to dashboard...', 'success');
            setTimeout(() => navigate('/member-dashboard'), 1500);
        } catch (error) {
            console.error('Profile creation failed:', error);
            showToast('Failed to create profile', 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="profile-registration">



            <div className="profile-container">
                <h1>Complete Member Profile</h1>
                <p className="subtitle">Fill details to access events & register family</p>


                <form onSubmit={handleSubmit}>
                    {/* Basic Profile */}
                    <section className="form-section">
                        <h2>👤 Personal Details</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Age *</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    required
                                    min="18"
                                    placeholder="Your age"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>
                    </section>


                    {/* Cultural Details */}
                    <section className="form-section">
                        <h2>🏛️ Cultural Details</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Kovil *</label>
                                <input
                                    name="kovil"
                                    value={formData.kovil}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Your Kovil"
                                />
                            </div>
                            <div className="form-group">
                                <label>Pirivu *</label>
                                <input
                                    name="pirivu"
                                    value={formData.pirivu}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Your Pirivu"
                                />
                            </div>
                            <div className="form-group">
                                <label>Native Place *</label>
                                <input
                                    name="nativePlace"
                                    value={formData.nativePlace}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Your native place"
                                />
                            </div>
                            <div className="form-group">
                                <label>Pattai peyar *</label>
                                <input
                                    name="pattaPer"
                                    value={formData.pattaPer}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Your Patta Per"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="form-section">
                        <h3 className="section-title">📍 Location</h3>
                        <div className="form-group">
                            <label className="field-label">Are you currently residing in Hyderabad? *</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="atHyderabad"
                                        value="yes"
                                        checked={formData.atHyderabad === 'yes'}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span className="radio-custom"></span>
                                    Yes
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="atHyderabad"
                                        value="no"
                                        checked={formData.atHyderabad === 'no'}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span className="radio-custom"></span>
                                    No
                                </label>
                            </div>
                        </div>
                    </section>


                    {/* Family */}
                    <section className="form-section">
                        <h2>👨‍👩‍👧‍👦 Family Members (Optional)</h2>
                        {formData.familyMembers.map((member, index) => (
                            <div key={index} className="family-member">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Relation</label>
                                        <input
                                            value={member.relation}
                                            onChange={e => handleFamilyChange(index, 'relation', e.target.value)}
                                            placeholder="e.g., Spouse, Son, Daughter"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            value={member.name}
                                            onChange={e => handleFamilyChange(index, 'name', e.target.value)}
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            value={member.age}
                                            onChange={e => handleFamilyChange(index, 'age', e.target.value)}
                                            min="0"
                                            placeholder="Age"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={member.phone}
                                            onChange={e => handleFamilyChange(index, 'phone', e.target.value)}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                                <button type="button" className="remove-family" onClick={() => removeFamilyMember(index)}>
                                    ✕ Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-family" onClick={addFamilyMember}>
                            ➕ Add Family Member
                        </button>
                    </section>


                    <button type="submit" disabled={loading} className="submit-profile">
                        {loading ? 'Creating...' : 'Create Profile & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};


export default MemberProfileRegistration;
