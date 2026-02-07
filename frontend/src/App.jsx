import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import SubCommittee from './pages/SubCommittee';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Register from './pages/Register';
import MemberProfileRegistration from './pages/MemberProfileRegistration';
import AdminMembersList from './pages/admin/AdminMembersList';
import GuestDashboard from './pages/GuestDashboard';
import GuestLogin from './pages/GuestLogin';
import GuestForm from './pages/GuestForm';
import './App.css';
import GuestRegistration from './pages/GuestRegistration';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
    const location = useLocation();
    const hideNavbarFooter = location.pathname === '/guest-login' ||
        location.pathname === '/guest-dashboard';

    console.log('Current path:', location.pathname);
    console.log('Hide navbar/footer:', hideNavbarFooter);

    return (
        <div className="App">
            {!hideNavbarFooter && <Navbar />}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/sub-committee" element={<SubCommittee />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/member-dashboard" element={<MemberDashboard />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/member-profile-registration" element={<MemberProfileRegistration />} />
                    <Route path="/admin-members" element={<AdminMembersList />} />
                    <Route path="/guest-login" element={<GuestLogin />} />
                    <Route path="/guest-dashboard" element={<GuestDashboard />} />
                    <Route path="/guest-form" element={<GuestForm />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/guest-registration" element={<GuestRegistration />} />
                </Routes>

            </main>
            {!hideNavbarFooter && <Footer />}
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state:', currentUser ? currentUser.email : 'No user');
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2851A3, #6AAA9A)',
                color: '#00FFF9',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <ToastProvider>
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <AppContent />
            </Router>
        </ToastProvider>
    );
}

export default App;