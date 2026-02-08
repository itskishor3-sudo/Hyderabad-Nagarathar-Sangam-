import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useToast } from '../context/ToastContext';
import Hero from '../components/Hero';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [selectedType, setSelectedType] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [isNewMember, setIsNewMember] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [memberAge, setMemberAge] = useState('');
    const [memberKovil, setMemberKovil] = useState('');
    const [memberPirivu, setMemberPirivu] = useState('');
    const [memberNativePlace, setMemberNativePlace] = useState('');
    const [memberPattaPer, setMemberPattaPer] = useState('');
    const [memberAtHyderabad, setMemberAtHyderabad] = useState('');
    const [memberHyderabadArea, setMemberHyderabadArea] = useState(''); // New State for Area
    const [memberPhone, setMemberPhone] = useState('');
    const [familyMembers, setFamilyMembers] = useState([]);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setIsNewMember(false);
    };

    const addFamilyMember = () => {
        setFamilyMembers([
            ...familyMembers,
            { relation: '', name: '', age: '', phone: '' },
        ]);
    };

    const removeFamilyMember = (index) => {
        const newFamily = familyMembers.filter((_, i) => i !== index);
        setFamilyMembers(newFamily);
    };

    const handleFamilyChange = (index, field, value) => {
        const updated = familyMembers.map((member, i) =>
            i === index ? { ...member, [field]: value } : member
        );
        setFamilyMembers(updated);
    };

    const handleMemberRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters!', 'warning');
            setLoading(false);
            return;
        }

        // Validate Hyderabad Area if Resident is Yes
        if (memberAtHyderabad === 'yes' && !memberHyderabadArea.trim()) {
            showToast('Please enter your area in Hyderabad', 'warning');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: memberName,
                email: email,
                phone: memberPhone,
                role: 'member',
                createdAt: new Date().toISOString(),
            });

            await addDoc(collection(db, 'members'), {
                userId: userCredential.user.uid,
                name: memberName,
                age: memberAge,
                email: email,
                phone: memberPhone,
                kovil: memberKovil,
                pirivu: memberPirivu,
                nativePlace: memberNativePlace,
                pattaPer: memberPattaPer,
                atHyderabad: memberAtHyderabad === 'yes', // Store boolean or string consistent with your logic
                hyderabadArea: memberAtHyderabad === 'yes' ? memberHyderabadArea : '', // Store Area
                familyMembers: familyMembers,
                createdAt: new Date().toISOString(),
                status: 'active',
            });

            showToast('Registration successful! Welcome ' + memberName, 'success');
            navigate('/member-dashboard');

            setSelectedType('');
            setEmail('');
            setPassword('');
            setMemberName('');
            setMemberAge('');
            setMemberKovil('');
            setMemberPirivu('');
            setMemberNativePlace('');
            setMemberPattaPer('');
            setMemberAtHyderabad('');
            setMemberHyderabadArea('');
            setMemberPhone('');
            setFamilyMembers([]);
            setConfirmPassword('');
            setIsNewMember(false);
            setLoading(false);
        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = 'Registration failed. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage =
                    'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
            }

            showToast(errorMessage, 'error');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                showToast('User data not found. Please contact administrator.', 'error');
                await auth.signOut();
                setLoading(false);
                return;
            }

            const userData = userDoc.data();

            if (selectedType === 'admin' && userData.role !== 'admin') {
                showToast('You do not have admin privileges!', 'error');
                await auth.signOut();
                setLoading(false);
                return;
            }

            if (selectedType === 'member' && userData.role !== 'member') {
                showToast('Please login with member credentials!', 'warning');
                await auth.signOut();
                setLoading(false);
                return;
            }

            showToast('Login successful! Welcome ' + userData.name, 'success');

            if (userData.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (userData.role === 'member') {
                navigate('/member-dashboard');
            } else {
                navigate('/');
            }

            setSelectedType('');
            setEmail('');
            setPassword('');
            setLoading(false);
        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = 'Login failed. Please try again.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage =
                    'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            }

            showToast(errorMessage, 'error');
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            showToast('Please enter your email address first.', 'error');
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            showToast('Password reset email sent! Check your inbox.', 'success');
            setLoading(false);
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset email. Please try again.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            }

            showToast(errorMessage, 'error');
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedType('');
        setEmail('');
        setPassword('');
        setMemberName('');
        setMemberAge('');
        setMemberKovil('');
        setMemberPirivu('');
        setMemberNativePlace('');
        setMemberPattaPer('');
        setMemberAtHyderabad('');
        setMemberHyderabadArea('');
        setMemberPhone('');
        setFamilyMembers([]);
        setConfirmPassword('');
        setIsNewMember(false);
    };

    return (
        <div className="home">
            <Hero />

            <div className="home-main-panel">
                {/* LOGIN CREDENTIALS */}
                <section className="section login-section-home">
                    <div className="container">
                        <h2 className="section-title">Login Credentials</h2>

                        {!selectedType ? (
                            <div className="login-types-detailed">
                                <div
                                    className="login-detail-card"
                                    onClick={() => handleTypeSelect('admin')}
                                >
                                    <div className="login-photo">👨‍💼</div>
                                    <h3>Admin Login</h3>
                                    <p className="login-position">For administrators</p>
                                    <div className="login-details">
                                        <p></p>
                                        <p></p>
                                    </div>
                                </div>

                                <div
                                    className="login-detail-card"
                                    onClick={() => handleTypeSelect('member')}
                                >
                                    <div className="login-photo">👤</div>
                                    <h3>Member Login</h3>
                                    <p className="login-position">For registered members </p>
                                    <div className="login-details">
                                        <p></p>
                                        <p></p>
                                    </div>
                                </div>

                                <div
                                    className="login-detail-card"
                                    onClick={() => navigate('/guest-form')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="login-photo">👋</div>
                                    <h3>Guest Registration</h3>
                                    <p className="login-position">For visitors</p>
                                    <div className="login-details">
                                        <p>Click here to fill guest details</p>
                                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No login required</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="login-form-container">
                                <button className="back-btn" onClick={handleBack}>
                                    ← Back
                                </button>

                                {/* MEMBER LOGIN */}
                                {selectedType === 'member' && !isNewMember && (
                                    <div>
                                        <h3>Member Login</h3>
                                        <form
                                            className="login-form-home"
                                            onSubmit={handleSubmit}
                                        >
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="Enter your email"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Password</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    placeholder="Enter your password"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="submit-button"
                                                disabled={loading}
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
                                        </form>
                                        <div className="forgot-password">
                                            <span
                                                onClick={handleForgotPassword}
                                                className="forgot-link"
                                            >
                                                Forgot Password?
                                            </span>
                                        </div>
                                        <div className="toggle-form">
                                            <p>
                                                New member?{' '}
                                                <span
                                                    onClick={() => setIsNewMember(true)}
                                                    className="toggle-link"
                                                >
                                                    Create an account
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* MEMBER REGISTRATION */}
                                {selectedType === 'member' && isNewMember && (
                                    <div>
                                        <h3>Member Registration</h3>
                                        <form
                                            className="login-form-home registration-expanded"
                                            onSubmit={handleMemberRegistration}
                                        >
                                            <div className="form-section-title">👤 Personal Details</div>

                                            <div className="form-group">
                                                <label htmlFor="memberName">Full Name *</label>
                                                <input
                                                    type="text"
                                                    id="memberName"
                                                    value={memberName}
                                                    onChange={(e) => setMemberName(e.target.value)}
                                                    required
                                                    placeholder="Enter your full name"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="memberAge">Age *</label>
                                                <input
                                                    type="number"
                                                    id="memberAge"
                                                    value={memberAge}
                                                    onChange={(e) => setMemberAge(e.target.value)}
                                                    required
                                                    min="18"
                                                    placeholder="Your age"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="email">Email Address *</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="Enter your email"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="memberPhone">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    id="memberPhone"
                                                    value={memberPhone}
                                                    onChange={(e) => setMemberPhone(e.target.value)}
                                                    required
                                                    placeholder="+91 9876543210"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-section-title">🏛️ Cultural Details</div>

                                            <div className="form-group">
                                                <label htmlFor="memberKovil">Kovil *</label>
                                                <input
                                                    type="text"
                                                    id="memberKovil"
                                                    value={memberKovil}
                                                    onChange={(e) => setMemberKovil(e.target.value)}
                                                    required
                                                    placeholder="Your Kovil"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="memberPirivu">Pirivu *</label>
                                                <input
                                                    type="text"
                                                    id="memberPirivu"
                                                    value={memberPirivu}
                                                    onChange={(e) => setMemberPirivu(e.target.value)}
                                                    required
                                                    placeholder="Your Pirivu"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="memberNativePlace">Native Place *</label>
                                                <input
                                                    type="text"
                                                    id="memberNativePlace"
                                                    value={memberNativePlace}
                                                    onChange={(e) => setMemberNativePlace(e.target.value)}
                                                    required
                                                    placeholder="Your native place"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="memberPattaPer">Pattai peyar *</label>
                                                <input
                                                    type="text"
                                                    id="memberPattaPer"
                                                    value={memberPattaPer}
                                                    onChange={(e) => setMemberPattaPer(e.target.value)}
                                                    required
                                                    placeholder="Your Patta Per"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group radio-group-section">
                                                <label className="field-label">Are you currently residing in Hyderabad? *</label>
                                                <div className="radio-group-home">
                                                    <label className="radio-label-home">
                                                        <input
                                                            type="radio"
                                                            name="atHyderabad"
                                                            value="yes"
                                                            checked={memberAtHyderabad === 'yes'}
                                                            onChange={(e) => setMemberAtHyderabad(e.target.value)}
                                                            disabled={loading}
                                                            required
                                                        />
                                                        <span className="radio-custom-home"></span>
                                                        YES
                                                    </label>
                                                    <label className="radio-label-home">
                                                        <input
                                                            type="radio"
                                                            name="atHyderabad"
                                                            value="no"
                                                            checked={memberAtHyderabad === 'no'}
                                                            onChange={(e) => setMemberAtHyderabad(e.target.value)}
                                                            disabled={loading}
                                                            required
                                                        />
                                                        <span className="radio-custom-home"></span>
                                                        NO
                                                    </label>
                                                </div>
                                            </div>

                                            {/* CONDITIONAL HYDERABAD AREA FIELD */}
                                            {memberAtHyderabad === 'yes' && (
                                                <div className="form-group">
                                                    <label htmlFor="memberHyderabadArea">Area in Hyderabad *</label>
                                                    <input
                                                        type="text"
                                                        id="memberHyderabadArea"
                                                        value={memberHyderabadArea}
                                                        onChange={(e) => setMemberHyderabadArea(e.target.value)}
                                                        required
                                                        placeholder="e.g. Kukatpally, Banjara Hills"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            )}

                                            <div className="form-section-title">👨‍👩‍👧‍👦 Family Members (Optional)</div>

                                            {familyMembers.map((member, index) => (
                                                <div key={index} className="family-member-group">
                                                    <div className="family-member-inputs">
                                                        <input
                                                            type="text"
                                                            placeholder="Relation"
                                                            value={member.relation}
                                                            onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)}
                                                            disabled={loading}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Name"
                                                            value={member.name}
                                                            onChange={(e) => handleFamilyChange(index, 'name', e.target.value)}
                                                            disabled={loading}
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Age"
                                                            value={member.age}
                                                            onChange={(e) => handleFamilyChange(index, 'age', e.target.value)}
                                                            disabled={loading}
                                                            min="0"
                                                        />
                                                        <input
                                                            type="tel"
                                                            placeholder="Phone"
                                                            value={member.phone}
                                                            onChange={(e) => handleFamilyChange(index, 'phone', e.target.value)}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFamilyMember(index)}
                                                        className="remove-family-btn"
                                                        disabled={loading}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={addFamilyMember}
                                                className="add-family-btn"
                                                disabled={loading}
                                            >
                                                + Add Family Member
                                            </button>

                                            <div className="form-section-title">🔒 Security</div>

                                            <div className="form-group">
                                                <label htmlFor="password">Password *</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    placeholder="At least 6 characters"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="Re-enter password"
                                                    disabled={loading}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="submit-button"
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating Account...' : 'Create Account'}
                                            </button>
                                        </form>
                                        <div className="toggle-form">
                                            <p>
                                                Already have an account?{' '}
                                                <span
                                                    onClick={() => setIsNewMember(false)}
                                                    className="toggle-link"
                                                >
                                                    Login here
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ADMIN LOGIN */}
                                {selectedType === 'admin' && (
                                    <div>
                                        <h3>Admin Login</h3>
                                        <form
                                            className="login-form-home"
                                            onSubmit={handleSubmit}
                                        >
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    placeholder="Enter your email"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Password</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    placeholder="Enter your password"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="submit-button"
                                                disabled={loading}
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* LOCATION & CONTACT */}
                <section className="section contact-location-section">
                    <div className="container">
                        <h2 className="section-title">Location & Contact Details</h2>
                        <div className="contact-grid">
                            <a
                                href="https://maps.app.goo.gl/a2Go8iqnC9k21EnDA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-card"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="contact-photo">📍</div>
                                <h3>Location</h3>
                                <p className="contact-position">Our Address</p>
                                <div className="contact-details">
                                    <p>East Marredpally</p>
                                    <p>Hyderabad, Telangana</p>
                                    <p>India</p>
                                </div>
                            </a>
                            <div className="contact-card">
                                <div className="contact-photo">📧</div>
                                <h3>Email</h3>
                                <p className="contact-position">Get in Touch</p>
                                <div className="contact-details">
                                    <p>
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=nnscahyderabad@gmail.com&su=${encodeURIComponent('Inquiry - NNSCA')}&body=${encodeURIComponent(`Dear NNSCA Team,

I hope this message finds you well. I am reaching out to inquire about [your topic].

I would appreciate your assistance and guidance.

Thank you for your time.

Best regards`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'none' }}
                                        >
                                            nnscahyderabad@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <div className="contact-card">
                                <div className="contact-photo">📞</div>
                                <h3>Phone</h3>
                                <p className="contact-position">Call Us</p>
                                <div className="contact-details">
                                    <p>
                                        <a href="tel:+917396762293" style={{ color: 'inherit', textDecoration: 'none' }}>
                                            +91 7396762293
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
