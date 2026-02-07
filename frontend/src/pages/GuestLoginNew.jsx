import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestLoginNew = () => {
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2851A3, #6AAA9A)', padding: '2rem' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(30,60,100,0.5)', padding: '2rem', borderRadius: '20px' }}>
                <h1 style={{ color: '#00FFF9', textAlign: 'center' }}>
                    {isSignup ? 'CREATE ACCOUNT' : 'GUEST LOGIN'}
                </h1>

                <form style={{ marginTop: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#00FFF9', display: 'block', marginBottom: '0.5rem' }}>EMAIL</label>
                        <input type="email" style={{ width: '100%', padding: '1rem', borderRadius: '10px' }} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#00FFF9', display: 'block', marginBottom: '0.5rem' }}>PASSWORD</label>
                        <input type="password" style={{ width: '100%', padding: '1rem', borderRadius: '10px' }} />
                    </div>

                    {isSignup && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#00FFF9', display: 'block', marginBottom: '0.5rem' }}>CONFIRM PASSWORD</label>
                            <input type="password" style={{ width: '100%', padding: '1rem', borderRadius: '10px' }} />
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', padding: '1rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
                        {isSignup ? 'CREATE ACCOUNT' : 'LOGIN'}
                    </button>
                </form>

                {/* TOGGLE BUTTON - THIS IS THE IMPORTANT PART */}
                <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', borderTop: '2px solid rgba(255,255,255,0.2)' }}>
                    <p style={{ color: '#00FFF9', marginBottom: '1rem' }}>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        type="button"
                        style={{
                            background: '#F4B41A',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {isSignup ? 'BACK TO LOGIN' : 'CREATE NEW ACCOUNT'}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#00FFF9', border: '2px solid #00FFF9', padding: '0.8rem 2rem', borderRadius: '50px', cursor: 'pointer' }}>
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestLoginNew;
