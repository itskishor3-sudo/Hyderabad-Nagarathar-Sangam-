import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Register.css';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: '',
        password: '',
        kovil: '',
        pirivu: '',
        nativePlace: '',
        pattaPer: '',
        atHyderabad: '',
        area: '',
        familyMembers: []
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();



    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFamilyChange = (index, field, value) => {
        const newFamily = formData.familyMembers.map((m, i) => i === index ? { ...m, [field]: value } : m);
        setFormData(prev => ({ ...prev, familyMembers: newFamily }));
    };

    const addFamilyMember = () => {
        setFormData(prev => ({ ...prev, familyMembers: [...prev.familyMembers, { relation: '', name: '', age: '', phone: '' }] }));
    };

    const removeFamilyMember = (index) => {
        const newFamily = formData.familyMembers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, familyMembers: newFamily }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const { password, ...memberData } = formData;
            await addDoc(collection(db, 'members'), {
                ...memberData,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                status: 'active'
            });

            showToast('Account created! Redirecting to dashboard...', 'success');
            setTimeout(() => navigate('/member-dashboard'), 1500);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">


            <form onSubmit={handleSubmit} className="register-form">
                <h1>Member Registration</h1>

                <section className="form-section">
                    <h2>👤 Personal DetailsS</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name *</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Age *</label>
                            <input type="number" name="age" value={formData.age} onChange={handleInputChange} required min="18" />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group password-input-wrapper">
                            <label>Password *</label>
                            <div className="password-field">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>🏛️ Cultural Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Kovil *</label>
                            <input name="kovil" value={formData.kovil} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Pirivu *</label>
                            <input name="pirivu" value={formData.pirivu} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Native Place *</label>
                            <input name="nativePlace" value={formData.nativePlace} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Pattai peyar*</label>
                            <input name="pattaPer" value={formData.pattaPer} onChange={handleInputChange} required />
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
                                />
                                <span className="radio-custom"></span>
                                No
                            </label>
                        </div>
                    </div>
                    {formData.atHyderabad === 'yes' && (
                        <div className="form-group">
                            <label className="field-label">Area / Location (e.g., Kukatpally, Madhapur) *</label>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your area"
                            />
                        </div>
                    )}
                </section>


                <section className="form-section">
                    <h2>👨‍👩‍👧‍👦 Family Members</h2>
                    {formData.familyMembers.map((member, index) => (
                        <div key={index} className="family-member-row">
                            <input placeholder="Relation" value={member.relation} onChange={e => handleFamilyChange(index, 'relation', e.target.value)} />
                            <input placeholder="Name" value={member.name} onChange={e => handleFamilyChange(index, 'name', e.target.value)} />
                            <input type="number" placeholder="Age" value={member.age} onChange={e => handleFamilyChange(index, 'age', e.target.value)} min="0" />
                            <input type="tel" placeholder="Phone" value={member.phone} onChange={e => handleFamilyChange(index, 'phone', e.target.value)} />
                            <button type="button" onClick={() => removeFamilyMember(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addFamilyMember}>+ Add Family Member</button>
                </section>

                <button type="submit" disabled={loading} className="register-btn">
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
};

export default Register;
