import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import invitationTemplate from '../assets/template.jpg';


const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('guests');
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMemberRegistrations, setNewMemberRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null); // Keep for local rendering if needed, but we'll use global
    const { showToast } = useToast();
    const navigate = useNavigate();


    // --- MULTI-ADMIN CONFIGURATION ---
    // ✅ THIS WAS MISSING IN YOUR CODE
    const ALLOWED_ADMINS = [
        "nnscahyderabad@gmail.com",
        "hyderabadnagarathar@gmail.com",
        "sramadasu1974@gmail.com",
        "itskishor3@gmail.com",
        "hnsnnscapresident@gmail.com",
        "hnsnnscatreasurer@gmail.com",
        "hnsnnscajointsecretary@gmail.com",
        "hnsnnscavicepresident@gmail.com",
        "hnsnnscamcmember1@gmail.com", // Kumar
        "hnsnnscamcmember2@gmail.com", // Muthuveerappan
        "hnsnnscasecretary@gmail.com",
    ];

    // --- AUTH CHECK ---
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("🔐 Checking Admin Access...");
                console.log("👤 Logged in user email:", user.email);
                console.log("📋 Allowed Admins List:", ALLOWED_ADMINS);

                // Normalize checks (lowercase & trim) to prevent simple errors
                const userEmail = user.email ? user.email.toLowerCase().trim() : '';
                const allowedList = ALLOWED_ADMINS.map(e => e.toLowerCase().trim());

                if (allowedList.includes(userEmail)) {
                    console.log("✅ Access Granted!");
                    return;
                } else {
                    console.warn("❌ Access Denied! Email not found in allowed list.");
                    showToast("Access Denied: You are not authorized to view this dashboard.", "error");
                    await auth.signOut();
                    navigate('/');
                }
            } else {
                // Not logged in
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Event Form State
    const [eventForm, setEventForm] = useState({
        name: '',
        description: '',
        location: '',
        date: '',
        time: '',
        image: '',
        notes: ''
    });

    const years = ['2025', '2026', '2027', '2028', '2029'];

    // Auction State
    // At the top of your component
    const [selectedYear, setSelectedYear] = useState(2025);
    const [auctionForm, setAuctionForm] = useState({
        itemName: '',
        buyerName: '',
        price: ''
    });
    const [auctionItems, setAuctionItems] = useState([]);


    // Voting State
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [pollForm, setPollForm] = useState({
        title: '',
        description: '',
        endDate: '',
        roles: []
    });
    const [roleForm, setRoleForm] = useState({
        roleName: '',
        candidates: []
    });
    const [candidateName, setCandidateName] = useState('');

    // MOMs State
    const [moms, setMoms] = useState([]);
    const [momForm, setMomForm] = useState({
        topic: '',
        date: '',
        time: '',
        venueType: 'online',
        venueLocation: '',
        participants: '',
        summary: '',
        actionable: ''
    });
    const [editingMom, setEditingMom] = useState(null);


    // Caretaker State
    const [caretakers, setCaretakers] = useState([]);
    const [caretakerForm, setCaretakerForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        responsibility: '',
        joiningDate: '',
        salary: ''
    });
    const [editingCaretaker, setEditingCaretaker] = useState(null);

    // Budget State
    const [budgets, setBudgets] = useState([]);
    const [budgetForm, setBudgetForm] = useState({
        eventName: '',
        eventDate: '',
        categories: []
    });
    const [budgetCategory, setBudgetCategory] = useState({
        categoryName: '',
        items: []
    });
    const [budgetItem, setBudgetItem] = useState({
        itemName: '',
        quantity: '',
        unitPrice: '',
        totalPrice: 0
    });

    // Stock State
    const [stocks, setStocks] = useState([]);
    const [stockForm, setStockForm] = useState({
        itemName: '',
        quantity: '',
        unit: '',
        category: '',
        location: ''
    });
    const [editingStock, setEditingStock] = useState(null);





    // --- DATA FETCHING EFFECTS ---
    useEffect(() => { fetchEvents(); }, []);
    useEffect(() => { if (selectedEvent) fetchRegistrations(selectedEvent.id); }, [selectedEvent]);
    useEffect(() => { if (activeTab === 'members') fetchMembers(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'auction') fetchAuctionItems(selectedYear); }, [selectedYear, activeTab]);
    useEffect(() => { if (activeTab === 'voting') fetchPolls(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'moms') fetchMoms(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'caretakers') fetchCaretakers(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'budget') fetchBudgets(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'stock') fetchStocks(); }, [activeTab]);
    // Removed Gallery fetch effect

    useEffect(() => { if (activeTab === 'new_members') fetchNewMemberRegistrations(); }, [activeTab]);

    // --- API CALLS ---
    // --- DELETE MEMBER FUNCTION ---
    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to permanently delete this member?')) return;
        try {
            await deleteDoc(doc(db, 'members', memberId));
            showToast('Member deleted successfully', 'success');
            fetchMembers(); // Refresh the list immediately
        } catch (error) {
            console.error('Error deleting member:', error);
            showToast('Failed to delete member', 'error');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event and all its registrations?')) return;
        try {
            await deleteDoc(doc(db, 'events', eventId));

            // Optionally delete registrations for this event if they are in a separate collection
            // For now, just refreshing the event list
            showToast('Event deleted successfully', 'success');
            fetchEvents();
            if (selectedEvent?.id === eventId) setSelectedEvent(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('Failed to delete event', 'error');
        }
    };

    const handleDeleteAuctionItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this auction item?')) return;
        try {
            await deleteDoc(doc(db, 'auction', itemId));
            showToast('Auction item deleted successfully', 'success');
            fetchAuctionItems(selectedYear);
        } catch (error) {
            console.error('Error deleting auction item:', error);
            showToast('Failed to delete auction item', 'error');
        }
    };

    const handleDeleteNewMemberRegistration = async (regId) => {
        if (!window.confirm('Are you sure you want to delete this registration?')) return;
        try {
            await deleteDoc(doc(db, 'newMembers', regId));
            showToast('Registration deleted successfully', 'success');
            fetchNewMemberRegistrations();
        } catch (error) {
            console.error('Error deleting registration:', error);
            showToast('Failed to delete registration', 'error');
        }
    };

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch events', 'error'); }
    };

    const fetchRegistrations = async (eventId) => {
        try {
            const registrationsRef = collection(db, 'registrations');
            const q = query(registrationsRef, where('eventId', '==', eventId));
            const snapshot = await getDocs(q);
            setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch registrations', 'error'); }
    };

    const fetchMembers = async () => {
        try {
            const membersRef = collection(db, 'members');
            const q = query(membersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setSearchTerm('');
        } catch (error) { console.error(error); showToast('Failed to fetch members', 'error'); }
    };

    const fetchPolls = async () => {
        try {
            const pollsRef = collection(db, 'polls');
            const q = query(pollsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch polls', 'error'); }
    };

    const fetchMoms = async () => {
        try {
            const momsRef = collection(db, 'moms');
            const q = query(momsRef, orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            setMoms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch MOMs', 'error'); }
    };

    const fetchNewMemberRegistrations = async () => {
        try {
            const regsRef = collection(db, 'newMembers');
            const q = query(regsRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            setNewMemberRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error fetching new member registrations:', error);
            showToast('Failed to fetch new member registrations', 'error');
        }
    };

    const fetchCaretakers = async () => {
        try {
            const caretakersRef = collection(db, 'caretakers');
            const q = query(caretakersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setCaretakers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch caretakers', 'error'); }
    };

    const fetchBudgets = async () => {
        try {
            const budgetsRef = collection(db, 'budgets');
            const q = query(budgetsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch budgets', 'error'); }
    };

    const fetchStocks = async () => {
        try {
            const stocksRef = collection(db, 'stocks');
            const q = query(stocksRef, orderBy('itemName', 'asc'));
            const snapshot = await getDocs(q);
            setStocks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error(error); showToast('Failed to fetch stock', 'error'); }
    };

    const fetchAuctionItems = async (year) => {
        try {
            const q = query(
                collection(db, 'auction'),
                where('year', '==', year)  // 👈 CRITICAL FILTER
            );
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAuctionItems(items);  // 👈 Update the filtered list
        } catch (error) {
            console.error('Error fetching auction items:', error);
            showToast('Failed to fetch auction items', 'error');
        }
    };


    const handleEventImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB limit for event images
            showToast('Image too large! Please choose an image under 1MB.', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxWidth = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                setEventForm({ ...eventForm, image: compressedBase64 });
                showToast('Event image uploaded!', 'success');
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const generatePDFInvitation = async (event) => {
        const escapeHtml = (value) => {
            const s = String(value ?? '');
            return s
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        };

        const formatEventDate = (yyyyMmDd) => {
            if (!yyyyMmDd) return '';
            const parts = String(yyyyMmDd).split('-').map((p) => Number(p));
            if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return String(yyyyMmDd);
            const [y, m, d] = parts;
            const dt = new Date(y, m - 1, d);
            return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        };

        const formatEventTime = (hhMm) => {
            if (!hhMm) return '';
            const [hhStr, mmStr] = String(hhMm).split(':');
            const hh = Number(hhStr);
            const mm = Number(mmStr ?? 0);
            if (Number.isNaN(hh) || Number.isNaN(mm)) return String(hhMm);
            const hour12 = ((hh + 11) % 12) + 1;
            const ampm = hh >= 12 ? 'PM' : 'AM';
            return `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`;
        };

        // Load Google Font: Playfair Display (used for premium look)
        const linkId = 'invitation-font-playfair-display';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        const invitationElement = document.createElement('div');
        // A4 Dimensions at 96 DPI: 794px x 1123px (210mm x 297mm)
        // 1mm = 3.7795px
        const mmToPx = 3.7795;
        const widthPx = 210 * mmToPx; // 793.7px
        const heightPx = 297 * mmToPx; // 1122.5px

        invitationElement.style.width = `${widthPx}px`;
        invitationElement.style.height = `${heightPx}px`;
        invitationElement.style.backgroundColor = '#ffffff';
        invitationElement.style.backgroundImage = `url(${invitationTemplate})`;
        invitationElement.style.backgroundSize = 'contain';
        invitationElement.style.backgroundPosition = 'center';
        invitationElement.style.backgroundRepeat = 'no-repeat';
        invitationElement.style.position = 'relative';
        invitationElement.style.display = 'flex';
        invitationElement.style.flexDirection = 'column';
        invitationElement.style.alignItems = 'center';
        invitationElement.style.boxSizing = 'border-box';
        invitationElement.style.fontFamily = "'Playfair Display', serif";

        // Compute a strict "safe box" inside the green patterned area,
        // based on the *actual rendered* background image size (background-size: contain).
        // This prevents text from ever touching blue borders or golden decorations.
        const templateImg = new Image();
        templateImg.src = invitationTemplate;
        await new Promise((resolve) => {
            templateImg.onload = resolve;
            templateImg.onerror = resolve; // fallback to conservative margins below if image fails
        });
        const imgW = templateImg.naturalWidth || 0;
        const imgH = templateImg.naturalHeight || 0;

        const hasImgMetrics = imgW > 0 && imgH > 0;
        const scale = hasImgMetrics ? Math.min(widthPx / imgW, heightPx / imgH) : 1;
        const renderedW = hasImgMetrics ? imgW * scale : widthPx;
        const renderedH = hasImgMetrics ? imgH * scale : heightPx;
        const offsetX = (widthPx - renderedW) / 2;
        const offsetY = (heightPx - renderedH) / 2;

        // Safe box ratios tuned for `src/assets/template.jpg`:
        // - x keeps away from blue side borders and gold lamps
        // - y starts below the logo, ends above lower border/white area
        // Slightly widened (0.16 / 0.68) to give better word spacing
        // while staying fully inside the green patterned area.
        const safeRatios = hasImgMetrics
            ? { x: 0.16, y: 0.345, w: 0.68, h: 0.47 }
            : { x: 0.16, y: 0.31, w: 0.68, h: 0.50 }; // fallback

        const safeLeft = offsetX + renderedW * safeRatios.x;
        const safeTop = offsetY + renderedH * safeRatios.y;
        const safeWidth = renderedW * safeRatios.w;
        const safeHeight = renderedH * safeRatios.h;

        const title = escapeHtml(event?.name || '');
        const description = escapeHtml(event?.description || '');
        const location = escapeHtml(event?.location || '');
        const dateFormatted = escapeHtml(formatEventDate(event?.date || ''));
        const timeFormatted = escapeHtml(formatEventTime(event?.time || ''));
        const notes = escapeHtml(event?.notes || '');
        const eventImageSrc = event?.image || '';

        // Use a rich gold color for all invitation text (to match the vels).
        const inviteTextColor = '#F4B41A';

        invitationElement.innerHTML = `
        <div style="
            position: absolute;
            top: ${safeTop}px;
            left: ${safeLeft}px;
            height: ${safeHeight}px;
            width: ${safeWidth}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
            box-sizing: border-box;
            padding: 18px 10px;
            line-height: 1.35;
            color: ${inviteTextColor};
            overflow: hidden;
        ">
            ${eventImageSrc
                ? `<div style="margin-bottom: 14px;">
                            <img
                                src="${eventImageSrc}"
                                alt="Event"
                                style="
                                    max-width: 260px;
                                    max-height: 260px;
                                    width: auto;
                                    height: auto;
                                    border-radius: 10px;
                                    border: 2px solid rgba(214, 162, 47, 0.95);
                                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                                "
                            />
                       </div>`
                : ''
            }
            <!-- EVENT TITLE -->
            <div style="width: 100%; margin-bottom: 14px;">
                <div style="
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: 4px;
                    word-spacing: 2px;
                    color: ${inviteTextColor} !important;
                    line-height: 1.55;
                    word-break: break-word;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.9);
                ">
                    ${title}
                </div>
            </div>

            <!-- SUBTITLE / DESCRIPTION -->
            <div style="width: 100%; margin-bottom: 16px; padding: 0 10px;">
                <div style="
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    word-spacing: 1px;
                    color: ${inviteTextColor} !important;
                    line-height: 1.55;
                    word-break: break-word;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                ">
                    ${description}
                </div>
            </div>

            <!-- DATE -->
            <div style="width: 100%; margin-bottom: 10px;">
                <div style="
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    word-spacing: 2px;
                    color: ${inviteTextColor} !important;
                    line-height: 1.55;
                    word-break: break-word;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                ">
                    Date: ${dateFormatted}
                </div>
            </div>

            <!-- TIME (emoji only here) -->
            <div style="width: 100%; margin-bottom: 10px;">
                <div style="
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    word-spacing: 2px;
                    color: ${inviteTextColor} !important;
                    line-height: 1.55;
                    word-break: break-word;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                ">
                    ⏰ Time: ${timeFormatted || escapeHtml(event?.time || '')}
                </div>
            </div>

            <!-- LOCATION (emoji only here) -->
            <div style="width: 100%; margin-bottom: 14px; padding: 0 12px;">
                <div style="
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    word-spacing: 2px;
                    color: ${inviteTextColor} !important;
                    line-height: 1.55;
                    word-break: break-word;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                ">
                    📍 Location: ${location}
                </div>
            </div>

            <!-- ADDITIONAL NOTES (optional) -->
            ${notes
                ? `<div style="width: 100%; padding: 0 14px; margin-top: 4px;">
                    <div style="
                        font-size: 14px;
                        font-weight: 600;
                        letter-spacing: 2px;
                        word-spacing: 1px;
                        color: ${inviteTextColor} !important;
                        line-height: 1.55;
                        word-break: break-word;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                    ">
                        ${notes}
                    </div>
                </div>`
                : ''}
        </div>
    `;

        document.body.appendChild(invitationElement);

        try {
            await document.fonts.ready;

            const canvas = await html2canvas(invitationElement, {
                scale: 2, // high-quality PNG without huge size
                useCORS: true,
                logging: false,
                backgroundColor: null,
                windowWidth: 794,
                windowHeight: 1123,
                onclone: (doc) => {
                    const style = doc.createElement('style');
                    style.innerHTML = `
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
                        .invitation-container, .invitation-container * {
                            font-family: 'Arial', 'Helvetica', sans-serif !important;
                            font-weight: bold !important;
                            color: #FFFFFF !important;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.8) !important;
                        }
                    `;
                    doc.head.appendChild(style);
                }
            });

            // Export as PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [794, 1123]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
            pdf.save(`${(event.name || 'Event').replace(/\s+/g, '_')}_Invitation.pdf`);

            showToast('PDF Invitation downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Failed to generate PDF invitation', 'error');
        } finally {
            document.body.removeChild(invitationElement);
        }
    };


    const handleInputChange = (e) => {
        setEventForm({ ...eventForm, [e.target.name]: e.target.value });
    };

    const handleAuctionInputChange = (e) => {
        const { name, value } = e.target;
        setAuctionForm(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'events'), {
                ...eventForm,
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('Event created successfully!', 'success');
            setEventForm({ name: '', description: '', location: '', date: '', time: '', image: '', notes: '' });
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('Failed to create event', 'error');
        }
    };
    const handleCreateMom = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'moms'), {
                ...momForm,
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('MOM created successfully!', 'success');
            setMomForm({
                topic: '',
                date: '',
                time: '',
                venueType: 'online',
                venueLocation: '',
                participants: '',
                summary: '',
                actionable: ''
            });
            fetchMoms();
        } catch (error) {
            console.error('Error creating MOM:', error);
            showToast('Failed to create MOM', 'error');
        }
    };

    const handleUpdateMom = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'moms', editingMom.id), momForm);
            showToast('MOM updated successfully!', 'success');
            setEditingMom(null);
            setMomForm({
                topic: '',
                date: '',
                time: '',
                venueType: 'online',
                venueLocation: '',
                participants: '',
                summary: '',
                actionable: ''
            });
            fetchMoms();
        } catch (error) {
            console.error('Error updating MOM:', error);
            showToast('Failed to update MOM', 'error');
        }
    };

    const handleDeleteMom = async (momId) => {
        if (!window.confirm('Are you sure you want to delete this MOM?')) return;
        try {
            await deleteDoc(doc(db, 'moms', momId));
            showToast('MOM deleted successfully!', 'success');
            fetchMoms();
        } catch (error) {
            console.error('Error deleting MOM:', error);
            showToast('Failed to delete MOM', 'error');
        }
    };

    const handleEditMom = (mom) => {
        setEditingMom(mom);
        setMomForm({
            topic: mom.topic || '',
            date: mom.date || '',
            time: mom.time || '',
            venueType: mom.venueType || 'online',
            venueLocation: mom.venueLocation || '',
            participants: mom.participants || '',
            summary: mom.summary || '',
            actionable: mom.actionable || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    };
    const handleCreateCaretaker = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'caretakers'), {
                ...caretakerForm,
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('Caretaker added successfully!', 'success');
            setCaretakerForm({
                name: '',
                phone: '',
                email: '',
                address: '',
                responsibility: '',
                joiningDate: '',
                salary: ''
            });
            fetchCaretakers();
        } catch (error) {
            console.error('Error adding caretaker:', error);
            showToast('Failed to add caretaker', 'error');
        }
    };

    const handleUpdateCaretaker = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'caretakers', editingCaretaker.id), caretakerForm);
            showToast('Caretaker updated successfully!', 'success');
            setEditingCaretaker(null);
            setCaretakerForm({
                name: '',
                phone: '',
                email: '',
                address: '',
                responsibility: '',
                joiningDate: '',
                salary: ''
            });
            fetchCaretakers();
        } catch (error) {
            console.error('Error updating caretaker:', error);
            showToast('Failed to update caretaker', 'error');
        }
    };

    const handleDeleteCaretaker = async (caretakerId) => {
        if (!window.confirm('Are you sure you want to delete this caretaker?')) return;
        try {
            await deleteDoc(doc(db, 'caretakers', caretakerId));
            showToast('Caretaker deleted successfully!', 'success');
            fetchCaretakers();
        } catch (error) {
            console.error('Error deleting caretaker:', error);
            showToast('Failed to delete caretaker', 'error');
        }
    };

    const handleEditCaretaker = (caretaker) => {
        setEditingCaretaker(caretaker);
        setCaretakerForm({
            name: caretaker.name,
            phone: caretaker.phone,
            email: caretaker.email,
            address: caretaker.address,
            responsibility: caretaker.responsibility,
            joiningDate: caretaker.joiningDate,
            salary: caretaker.salary
        });
    };
    const handleAddBudgetItem = () => {
        if (!budgetItem.itemName || !budgetItem.quantity || !budgetItem.unitPrice) {
            showToast('Please fill all item fields', 'error');
            return;
        }
        const totalPrice = parseFloat(budgetItem.quantity) * parseFloat(budgetItem.unitPrice);
        setBudgetCategory({
            ...budgetCategory,
            items: [...budgetCategory.items, { ...budgetItem, totalPrice }]
        });
        setBudgetItem({ itemName: '', quantity: '', unitPrice: '', totalPrice: 0 });
    };

    const handleAddBudgetCategory = () => {
        if (!budgetCategory.categoryName || budgetCategory.items.length === 0) {
            showToast('Please add category name and at least one item', 'error');
            return;
        }
        setBudgetForm({
            ...budgetForm,
            categories: [...budgetForm.categories, { ...budgetCategory }]
        });
        setBudgetCategory({ categoryName: '', items: [] });
    };

    const handleRemoveBudgetCategory = (index) => {
        setBudgetForm({
            ...budgetForm,
            categories: budgetForm.categories.filter((_, i) => i !== index)
        });
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        if (budgetForm.categories.length === 0) {
            showToast('Please add at least one category', 'error');
            return;
        }
        try {
            await addDoc(collection(db, 'budgets'), {
                ...budgetForm,
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('Budget plan created successfully!', 'success');
            setBudgetForm({ eventName: '', eventDate: '', categories: [] });
            fetchBudgets();
        } catch (error) {
            console.error('Error creating budget:', error);
            showToast('Failed to create budget', 'error');
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm('Are you sure you want to delete this budget plan?')) return;
        try {
            await deleteDoc(doc(db, 'budgets', budgetId));
            showToast('Budget plan deleted successfully!', 'success');
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
            showToast('Failed to delete budget', 'error');
        }
    };

    const calculateBudgetTotal = (budget) => {
        let total = 0;
        budget.categories.forEach(category => {
            category.items.forEach(item => {
                total += item.totalPrice;
            });
        });
        return total;
    };

    const exportBudgetToExcel = (budget) => {
        const data = [];
        data.push({ 'Category': 'Event Details', 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': '' });
        data.push({ 'Category': 'Event Name', 'Item': budget.eventName, 'Quantity': '', 'Unit Price': '', 'Total': '' });
        data.push({ 'Category': 'Event Date', 'Item': budget.eventDate, 'Quantity': '', 'Unit Price': '', 'Total': '' });
        data.push({ 'Category': '', 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': '' });

        budget.categories.forEach(category => {
            data.push({ 'Category': category.categoryName, 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': '' });
            category.items.forEach(item => {
                data.push({
                    'Category': '',
                    'Item': item.itemName,
                    'Quantity': item.quantity,
                    'Unit Price': item.unitPrice,
                    'Total': item.totalPrice
                });
            });
            const categoryTotal = category.items.reduce((sum, item) => sum + item.totalPrice, 0);
            data.push({ 'Category': `${category.categoryName} Total`, 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': categoryTotal });
            data.push({ 'Category': '', 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': '' });
        });

        data.push({ 'Category': 'GRAND TOTAL', 'Item': '', 'Quantity': '', 'Unit Price': '', 'Total': calculateBudgetTotal(budget) });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget');
        XLSX.writeFile(workbook, `Budget_${budget.eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Budget exported successfully!', 'success');
    };
    const handleCreateStock = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'stocks'), {
                ...stockForm,
                usageHistory: [],
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('Stock item added successfully!', 'success');
            setStockForm({ itemName: '', quantity: '', unit: '', category: '', location: '' });
            fetchStocks();
        } catch (error) {
            console.error('Error adding stock:', error);
            showToast('Failed to add stock', 'error');
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        try {
            const stockDoc = doc(db, 'stocks', editingStock.id);
            await updateDoc(stockDoc, stockForm);
            showToast('Stock updated successfully!', 'success');
            setEditingStock(null);
            setStockForm({ itemName: '', quantity: '', unit: '', category: '', location: '' });
            fetchStocks();
        } catch (error) {
            console.error('Error updating stock:', error);
            showToast('Failed to update stock', 'error');
        }
    };

    const handleDeleteStock = async (stockId) => {
        if (!window.confirm('Are you sure you want to delete this stock item?')) return;
        try {
            await deleteDoc(doc(db, 'stocks', stockId));
            showToast('Stock deleted successfully!', 'success');
            fetchStocks();
        } catch (error) {
            console.error('Error deleting stock:', error);
            showToast('Failed to delete stock', 'error');
        }
    };

    const handleEditStock = (stock) => {
        setEditingStock(stock);
        setStockForm({
            itemName: stock.itemName,
            quantity: stock.quantity,
            unit: stock.unit,
            category: stock.category,
            location: stock.location
        });
    };

    const handleStockUsage = async (stock) => {
        const usedQty = prompt('Enter quantity used:');
        const eventName = prompt('Enter event name:');
        if (!usedQty || !eventName) return;

        const usedQuantity = parseFloat(usedQty);
        if (usedQuantity > parseFloat(stock.quantity)) {
            showToast('Used quantity exceeds available stock!', 'error');
            return;
        }

        try {
            const stockDoc = doc(db, 'stocks', stock.id);
            const newQuantity = parseFloat(stock.quantity) - usedQuantity;
            const usageRecord = {
                usedQuantity,
                eventName,
                usageDate: new Date().toISOString(),
                returned: false
            };

            await updateDoc(stockDoc, {
                quantity: newQuantity.toString(),
                usageHistory: [...(stock.usageHistory || []), usageRecord]
            });

            showToast('Stock usage recorded!', 'success');
            fetchStocks();
        } catch (error) {
            console.error('Error recording stock usage:', error);
            showToast('Failed to record stock usage', 'error');
        }
    };

    const handleStockReturn = async (stock, usageIndex) => {
        const returnQty = prompt('Enter quantity returned:');
        if (!returnQty) return;

        const returnedQuantity = parseFloat(returnQty);
        const usage = stock.usageHistory[usageIndex];

        if (returnedQuantity > usage.usedQuantity) {
            showToast('Returned quantity exceeds used quantity!', 'error');
            return;
        }

        try {
            const stockDoc = doc(db, 'stocks', stock.id);
            const newQuantity = parseFloat(stock.quantity) + returnedQuantity;
            const updatedHistory = [...stock.usageHistory];
            updatedHistory[usageIndex] = {
                ...usage,
                returned: true,
                returnedQuantity,
                returnDate: new Date().toISOString()
            };

            await updateDoc(stockDoc, {
                quantity: newQuantity.toString(),
                usageHistory: updatedHistory
            });

            showToast('Stock return recorded!', 'success');
            fetchStocks();
        } catch (error) {
            console.error('Error recording stock return:', error);
            showToast('Failed to record stock return', 'error');
        }
    };

    const exportStocksToExcel = () => {
        if (stocks.length === 0) {
            showToast('No stocks to export', 'info');
            return;
        }

        const data = stocks.map((stock, index) => ({
            'S.No': index + 1,
            'Item Name': stock.itemName,
            'Quantity': `${stock.quantity} ${stock.unit}`,
            'Category': stock.category,
            'Location': stock.location,
            'Times Used': stock.usageHistory?.length || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock List');
        XLSX.writeFile(workbook, `StockList_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Stock list exported successfully!', 'success');
    };
    const fetchVotesForPoll = async (pollId) => {
        try {
            const votesRef = collection(db, 'votes');
            const q = query(votesRef, where('pollId', '==', pollId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching votes:', error);
            return [];
        }
    };

    // Real-time listener for results
    useEffect(() => {
        let unsubscribe = () => { };

        if (selectedPoll && activeTab === 'voting') {
            const votesRef = collection(db, 'votes');
            const q = query(votesRef, where('pollId', '==', selectedPoll.id));

            unsubscribe = onSnapshot(q, (snapshot) => {
                const updatedVotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSelectedPoll(prev => prev ? { ...prev, votes: updatedVotes } : null);
            }, (error) => {
                console.error("Error listening to votes:", error);
            });
        }

        return () => unsubscribe();
    }, [selectedPoll?.id, activeTab]);

    const handleAddCandidate = () => {
        if (!candidateName.trim()) {
            showToast('Please enter candidate name', 'error');
            return;
        }
        setRoleForm({
            ...roleForm,
            candidates: [...roleForm.candidates, { name: candidateName, votes: 0 }]
        });
        setCandidateName('');
    };

    const handleRemoveCandidate = (index) => {
        setRoleForm({
            ...roleForm,
            candidates: roleForm.candidates.filter((_, i) => i !== index)
        });
    };

    const handleAddRole = () => {
        if (!roleForm.roleName.trim()) {
            showToast('Please enter role name', 'error');
            return;
        }
        if (roleForm.candidates.length === 0) {
            showToast('Please add at least one candidate', 'error');
            return;
        }
        setPollForm({
            ...pollForm,
            roles: [...pollForm.roles, { ...roleForm }]
        });
        setRoleForm({ roleName: '', candidates: [] });
    };

    const handleRemoveRole = (index) => {
        setPollForm({
            ...pollForm,
            roles: pollForm.roles.filter((_, i) => i !== index)
        });
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        if (pollForm.roles.length === 0) {
            showToast('Please add at least one role', 'error');
            return;
        }
        try {
            await addDoc(collection(db, 'polls'), {
                ...pollForm,
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            });
            showToast('Poll created successfully!', 'success');
            setPollForm({ title: '', description: '', endDate: '', roles: [] });
            fetchPolls();
        } catch (error) {
            console.error('Error creating poll:', error);
            showToast('Failed to create poll', 'error');
        }
    };

    const handleClosePoll = async (pollId) => {
        try {
            await updateDoc(doc(db, 'polls', pollId), {
                status: 'closed',
                closedAt: new Date().toISOString()
            });
            showToast('Poll closed successfully!', 'success');
            fetchPolls();
        } catch (error) {
            console.error('Error closing poll:', error);
            showToast('Failed to close poll', 'error');
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (!window.confirm('Are you sure you want to permanently delete this poll and all its votes?')) return;
        try {
            // 1. Delete associated votes first
            const votesRef = collection(db, 'votes');
            const q = query(votesRef, where('pollId', '==', pollId));
            const snapshot = await getDocs(q);

            const deletePromises = snapshot.docs.map(voteDoc => deleteDoc(voteDoc.ref));
            await Promise.all(deletePromises);

            // 2. Delete the poll itself
            await deleteDoc(doc(db, 'polls', pollId));

            showToast('Poll and all associated votes deleted successfully!', 'success');
            fetchPolls();
            if (selectedPoll?.id === pollId) setSelectedPoll(null);
        } catch (error) {
            console.error('Error deleting poll:', error);
            showToast('Failed to delete poll', 'error');
        }
    };

    const handleViewResults = async (poll) => {
        // Fetch initial votes and open modal
        const votes = await fetchVotesForPoll(poll.id);
        setSelectedPoll({ ...poll, votes: votes || [] });
    };

    const exportPollResults = async (poll) => {
        const votes = await fetchVotesForPoll(poll.id);
        const data = [];

        poll.roles.forEach(role => {
            data.push({ 'Role': role.roleName, 'Candidate': '', 'Votes': '', 'Percentage': '' });

            const roleCandidates = role.candidates.map(candidate => {
                const candidateVotes = votes.filter(v =>
                    v.votes.some(vote => vote.roleName === role.roleName && vote.candidateName === candidate.name)
                ).length;
                return { ...candidate, actualVotes: candidateVotes };
            });

            const totalRoleVotes = roleCandidates.reduce((sum, c) => sum + c.actualVotes, 0);

            roleCandidates.forEach(candidate => {
                const percentage = totalRoleVotes > 0 ? ((candidate.actualVotes / totalRoleVotes) * 100).toFixed(2) : '0';
                data.push({
                    'Role': '',
                    'Candidate': candidate.name,
                    'Votes': candidate.actualVotes,
                    'Percentage': `${percentage}%`
                });
            });

            data.push({ 'Role': `Total for ${role.roleName}`, 'Candidate': '', 'Votes': totalRoleVotes, 'Percentage': '100%' });
            data.push({ 'Role': '', 'Candidate': '', 'Votes': '', 'Percentage': '' });
        });

        data.push({ 'Role': 'TOTAL VOTERS', 'Candidate': '', 'Votes': votes.length, 'Percentage': '' });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Poll Results');
        XLSX.writeFile(workbook, `Poll_${poll.title.replace(/\s+/g, '_')}_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Results exported successfully!', 'success');
    };
    const handleAddAuctionItem = async (e) => {
        e.preventDefault();

        // Quick validation
        if (!auctionForm.itemName.trim() || !auctionForm.buyerName.trim() || !auctionForm.price || auctionForm.price <= 0) {
            showToast('Please fill all fields correctly', 'error');
            return;
        }

        try {
            const newItem = {
                itemName: auctionForm.itemName.trim(),
                buyerName: auctionForm.buyerName.trim(),
                price: parseFloat(auctionForm.price),
                year: selectedYear,
                isPaid: false,
                paidAt: null,
                createdAt: new Date().toISOString(),
                createdBy: auth.currentUser.uid
            };

            // 🚀 ADD TO FIREBASE
            const docRef = await addDoc(collection(db, 'auction'), newItem);

            // 🚀 OPTIMISTICALLY ADD TO UI FIRST (instant feedback)
            const optimisticItem = {
                ...newItem,
                id: docRef.id  // Use the actual Firestore ID
            };
            setAuctionItems(prev => [...prev, optimisticItem]);  // 👈 INSTANT UI UPDATE

            showToast('Auction item added successfully!', 'success');
            setAuctionForm({ itemName: '', buyerName: '', price: '' });

            // Still fetch to sync any changes
            await fetchAuctionItems(selectedYear);

        } catch (error) {
            console.error('Error adding auction item:', error);
            showToast('Failed to add auction item', 'error');
            // Remove optimistic update if failed
            // setAuctionItems(prev => prev.slice(0, -1));
        }
    };

    const handleTogglePayment = async (itemId, currentStatus) => {
        try {
            const itemRef = doc(db, 'auction', itemId);
            await updateDoc(itemRef, {
                isPaid: !currentStatus,
                paidAt: !currentStatus ? new Date().toISOString() : null
            });
            showToast('Payment status updated!', 'success');
            fetchAuctionItems(selectedYear);
        } catch (error) {
            console.error('Error updating payment:', error);
            showToast('Failed to update payment status', 'error');
        }
    };

    const calculateTotalAmount = () => {
        return auctionItems.reduce((total, item) => total + item.price, 0);
    };

    const exportAuctionToExcel = () => {
        if (auctionItems.length === 0) {
            showToast('No auction items to export', 'info');
            return;
        }

        const data = auctionItems.map((item, index) => ({
            'S.No': index + 1,
            'Item Name': item.itemName || 'N/A',
            'Buyer Name': item.buyerName || 'N/A',
            'Price': Number(item.price) || 0,
            'Payment Status': item.isPaid ? 'Paid' : 'Unpaid',
            'Paid Date': item.isPaid && item.paidAt ? new Date(item.paidAt).toLocaleDateString('en-GB') : '-'
        }));

        const totalPaid = auctionItems.filter(i => i.isPaid).reduce((sum, i) => sum + (Number(i.price) || 0), 0);
        const totalPending = auctionItems.filter(i => !i.isPaid).reduce((sum, i) => sum + (Number(i.price) || 0), 0);
        const grandTotal = auctionItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

        data.push({ 'S.No': '', 'Item Name': '', 'Buyer Name': 'TOTAL AMOUNT', 'Price': grandTotal, 'Payment Status': '', 'Paid Date': '' });
        data.push({ 'S.No': '', 'Item Name': '', 'Buyer Name': 'PAID AMOUNT', 'Price': totalPaid, 'Payment Status': '', 'Paid Date': '' });
        data.push({ 'S.No': '', 'Item Name': '', 'Buyer Name': 'PENDING AMOUNT', 'Price': totalPending, 'Payment Status': '', 'Paid Date': '' });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Auction ${selectedYear}`);
        XLSX.writeFile(workbook, `Auction_${selectedYear}_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Auction data exported successfully!', 'success');
    };
    const calculateTotalHeadcount = () => {
        let total = 0;
        registrations.forEach(reg => {
            total += 1;
            total += reg.familyMembers ? reg.familyMembers.length : 0;
        });
        return total;
    };

    const exportToWord = async () => {
        if (!selectedEvent || registrations.length === 0) {
            showToast('No registrations to export', 'info');
            return;
        }

        try {
            const rows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Member Name', bold: true })], width: { size: 25, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ text: 'Email', bold: true })], width: { size: 25, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ text: 'Phone', bold: true })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ text: 'Family Members', bold: true })], width: { size: 30, type: WidthType.PERCENTAGE } })
                    ]
                })
            ];

            registrations.forEach(reg => {
                const familyMembersList = reg.familyMembers ?
                    reg.familyMembers.map(fm => `${fm.name} (${fm.relation}, ${fm.age} yrs)`).join(', ') :
                    'None';

                rows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(reg.memberName || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(reg.memberEmail || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(reg.memberPhone || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(familyMembersList)] })
                        ]
                    })
                );
            });

            const table = new Table({
                rows: rows,
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({ text: `Event: ${selectedEvent.name}`, heading: 'Heading1' }),
                        new Paragraph({ text: `Date: ${selectedEvent.date} at ${selectedEvent.time}` }),
                        new Paragraph({ text: `Location: ${selectedEvent.location}` }),
                        new Paragraph({ text: `Total Registrations: ${registrations.length}` }),
                        new Paragraph({ text: `Total Headcount: ${calculateTotalHeadcount()}` }),
                        new Paragraph({ text: '' }),
                        table
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${selectedEvent.name}_Registrations.docx`);
            showToast('Registrations exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting to Word:', error);
            showToast('Failed to export registrations', 'error');
        }
    };

    const exportMembersToExcel = () => {
        if (members.length === 0) {
            showToast('No members to export', 'info');
            return;
        }

        const data = members.map((member, index) => ({
            'S.No': index + 1,
            'Name': member.name || 'N/A',
            'Age': member.age || 'N/A',
            'Email': member.email || 'N/A',
            'Phone': member.phone || 'N/A',
            'Area': member.area || member.hyderabadArea || 'N/A',
            'Kovil': member.kovil || 'N/A',
            'Pirivu': member.pirivu || 'N/A',
            'Native Place': member.nativePlace || 'N/A',
            'Patta Per': member.pattaPer || 'N/A',
            'At Hyderabad': member.atHyderabad === 'yes' || member.atHyderabad === true ? 'Yes' : 'No',
            'Family Members': member.familyMembers?.length || 0,
            'Registered At': member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB') : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
        XLSX.writeFile(workbook, `NNSCA_Members_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Members data exported successfully!', 'success');
    };

    const exportMomToWord = async (mom) => {
        try {
            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({ text: `MINUTES OF MEETING`, heading: 'Heading1', alignment: 'center' }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: `Topic: ${mom.topic || 'General Meeting'}`, heading: 'Heading2' }),
                        new Paragraph({ text: `Date: ${mom.date} | Time: ${mom.time}` }),
                        new Paragraph({ text: `Venue: ${mom.venueType === 'online' ? 'Online' : mom.venueLocation}` }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: `Participants:`, bold: true }),
                        new Paragraph({ text: mom.participants }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: `Summary of Discussion:`, bold: true }),
                        new Paragraph({ text: mom.summary }),
                        new Paragraph({ text: '' }),
                        new Paragraph({ text: `Generated by HNNSC Portal`, italic: true, alignment: 'right' })
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `MOM_${mom.date}_${(mom.topic || 'Meeting').replace(/\s+/g, '_')}.docx`);
            showToast('MOM exported to Word successfully!', 'success');
        } catch (error) {
            console.error('Error exporting MOM to Word:', error);
            showToast('Failed to export MOM to Word', 'error');
        }
    };

    const exportMomsToExcel = () => {
        if (moms.length === 0) {
            showToast('No MOMs to export', 'info');
            return;
        }

        const data = moms.map(m => ({
            'Date': m.date,
            'Time': m.time,
            'Topic': m.topic || 'N/A',
            'Venue Type': m.venueType,
            'Venue Location': m.venueLocation || 'Online',
            'Participants': m.participants,
            'Summary': m.summary,
            'Actionable Items': m.actionable || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MOMs");
        XLSX.writeFile(wb, "HNNSC_MOMs_Report.xlsx");
        showToast('MOMs list exported successfully!', 'success');
    };

    const exportActionableToExcel = (mom) => {
        if (!mom.actionable) {
            showToast('No actionable items to export', 'info');
            return;
        }

        const data = [{
            'Meeting Topic': mom.topic || 'N/A',
            'Date': mom.date,
            'Actionable Items': mom.actionable
        }];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Actionables");
        XLSX.writeFile(wb, `Actionables_${(mom.topic || 'Meeting').replace(/\s+/g, '_')}_${mom.date}.xlsx`);
        showToast('Actionable items exported successfully!', 'success');
    };

    const filteredMembers = members.filter(member => {
        const search = searchTerm.toLowerCase();
        return !searchTerm || (
            member.name?.toLowerCase().includes(search) ||
            member.email?.toLowerCase().includes(search) ||
            member.phone?.toLowerCase().includes(search) ||
            member.kovil?.toLowerCase().includes(search) ||
            member.pirivu?.toLowerCase().includes(search) ||
            member.nativePlace?.toLowerCase().includes(search) ||
            member.pattaPer?.toLowerCase().includes(search) ||
            member.area?.toLowerCase().includes(search) ||
            member.hyderabadArea?.toLowerCase().includes(search)
        );
    });
    // Guest Records Component
    // Guest Records Component - FULLY UPDATED FOR NEW GUEST FORM
    const GuestRecordsContent = () => {
        const [guests, setGuests] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedGuest, setSelectedGuest] = useState(null);

        useEffect(() => {
            fetchGuests();
        }, []);

        const fetchGuests = async () => {
            try {
                const guestsSnapshot = await getDocs(collection(db, 'guests'));
                const guestsData = guestsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setGuests(guestsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching guests:', error);
                setLoading(false);
            }
        };

        const updateGuestStatus = async (guestId, newStatus) => {
            try {
                const guestRef = doc(db, 'guests', guestId);
                await updateDoc(guestRef, {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                });

                // ✅ TRIGGER APPROVAL EMAIL IF APPROVED
                if (newStatus === 'approved') {
                    const guest = guests.find(g => g.id === guestId);
                    if (guest && guest.email) {
                        console.log("📧 Sending approval email to:", guest.email);
                        fetch(`${API_BASE_URL}/api/guest/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(guest) // Send the full guest object
                        })
                            .then(res => {
                                if (res.ok) console.log("✅ Approval email request sent successfully");
                                else console.error("❌ Approval email request failed", res.status);
                            })
                            .catch(err => console.error('Error sending approval email:', err));
                    } else {
                        console.warn("⚠️ Cannot send email: Guest email is missing.", guest);
                    }
                }

                showToast(`Guest ${newStatus} successfully!`, 'success');
                fetchGuests();
                setSelectedGuest(null);
            } catch (error) {
                console.error('Error updating guest status:', error);
                showToast('Failed to update guest status', 'error');
            }
        };

        const deleteGuest = async (guestId) => {
            if (!window.confirm('Are you sure you want to delete this guest record?')) return;
            try {
                await deleteDoc(doc(db, 'guests', guestId));
                showToast('Guest record deleted successfully!', 'success');
                fetchGuests();
                setSelectedGuest(null);
            } catch (error) {
                console.error('Error deleting guest:', error);
                showToast('Failed to delete guest record', 'error');
            }
        };

        const exportGuestsToExcel = () => {
            if (guests.length === 0) {
                showToast('No guest records to export', 'info');
                return;
            }

            const data = guests.map((guest, index) => ({
                'S.No': index + 1,
                'Full Name': guest.name || guest.fullName || 'N/A',
                'Age': guest.age || 'N/A',
                'Native Place': guest.nativePlace || 'N/A',
                'Kovil': guest.kovil || 'N/A',
                'Pirivu': guest.pirivu || 'N/A',
                'House Name': guest.houseNamePattaiPeyar || 'N/A',
                'Father Name': guest.fathersName || 'N/A',
                'Email': guest.email || 'N/A',
                'Phone': guest.phoneNumber || guest.phone || 'N/A',
                'Address': guest.permanentAddress || guest.address || 'N/A',
                'Check-in': `${guest.checkInDate || 'N/A'} at ${guest.checkInTime || 'N/A'}`,
                'Check-out': `${guest.expectedCheckOutDate || 'N/A'} at ${guest.expectedCheckOutTime || 'N/A'}`,
                'Total Guests': guest.totalNumberOfGuests || 'N/A',
                'Room/Hall': guest.roomHall || 'N/A',
                'Aadhar': guest.aadharNumber || 'N/A',
                'At Hyderabad': guest.atHyderabad === 'yes' || guest.atHyderabad === true ? 'Yes' : 'No',
                'Area': guest.area || 'N/A',
                'Status': guest.status?.toUpperCase() || 'PENDING',
                'Registered Date': guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('en-GB') : 'N/A'
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Records');
            XLSX.writeFile(workbook, `NNSCA_Guests_${new Date().toISOString().split('T')[0]}.xlsx`);
            showToast('Guest records exported successfully!', 'success');
        };

        if (loading) return <div className="loading">Loading guest records...</div>;

        return (
            <div className="guests-management">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <button
                        onClick={exportGuestsToExcel}
                        className="export-btn"
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📊 Export All Guests to Excel
                    </button>
                </div>
                {/* Stats Cards - UPDATED */}
                <div className="stats-row" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="stat-card" style={{ background: 'rgba(33, 150, 243, 0.2)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{guests.length}</h3>
                        <p style={{ margin: 0, opacity: 0.8 }}>Total Guests</p>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{guests.filter(g => g.status === 'approved').length}</h3>
                        <p style={{ margin: 0, opacity: 0.8 }}>Approved</p>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(255, 152, 0, 0.2)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{guests.filter(g => g.status === 'pending').length}</h3>
                        <p style={{ margin: 0, opacity: 0.8 }}>Pending</p>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(244, 67, 54, 0.2)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{guests.filter(g => g.status === 'rejected').length}</h3>
                        <p style={{ margin: 0, opacity: 0.8 }}>Rejected</p>
                    </div>
                </div>

                {guests.length === 0 ? (
                    <p className="no-data">No guest records found.</p>
                ) : (
                    <div className="guests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {guests.map(guest => (
                            <div key={guest.id} className="guest-card" style={{
                                background: '#1e1e1e',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid #333',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                                onClick={() => setSelectedGuest(guest)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    {/* ✅ FIXED: Handles both old 'fullName' AND new 'name' */}
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{guest.name || guest.fullName || 'N/A'}</h3>
                                    <span className={`status-badge ${guest.status}`} style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: guest.status === 'approved' ? 'rgba(76, 175, 80, 0.3)' :
                                            guest.status === 'rejected' ? 'rgba(244, 67, 54, 0.3)' :
                                                'rgba(255, 152, 0, 0.3)',
                                        color: guest.status === 'approved' ? '#4caf50' :
                                            guest.status === 'rejected' ? '#f44336' : '#ff9800'
                                    }}>
                                        {guest.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    {/* ✅ FIXED: New field names from GuestDashboard */}
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                                        📧 {guest.email || 'No email'}
                                    </p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                                        📱 {guest.phoneNumber || guest.phone || 'No phone'}
                                    </p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                                        📍 {guest.permanentAddress || guest.address || 'No address'}
                                    </p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                                        🎂 Age: {guest.age || 'N/A'}
                                    </p>
                                    {(guest.atHyderabad === 'yes' || guest.atHyderabad === true) && (
                                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.9, color: '#4caf50' }}>
                                            🏙️ Area: {guest.area || 'N/A'}
                                        </p>
                                    )}
                                </div>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.6 }}>
                                    Registered: {new Date(guest.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ✅ DETAILED MODAL - SHOWS ALL 17 NEW FIELDS */}
                {selectedGuest && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '2rem'
                    }} onClick={() => setSelectedGuest(null)}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
                            borderRadius: '16px', maxWidth: '900px', width: '100%',
                            maxHeight: '90vh', overflow: 'auto', padding: '2rem',
                            position: 'relative', border: '1px solid #333'
                        }} onClick={(e) => e.stopPropagation()}>
                            {/* Close Button */}
                            <button onClick={() => setSelectedGuest(null)} style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(255, 0, 0, 0.2)', border: 'none', color: 'white',
                                width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                                fontSize: '1.5rem'
                            }}>×</button>

                            {/* Header */}
                            <h2 style={{ marginTop: 0, color: '#F4B41A', marginBottom: '1.5rem' }}>
                                👤 Guest Details: {selectedGuest.name || selectedGuest.fullName || 'N/A'}
                            </h2>

                            {/* Status & Actions */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                                <div style={{
                                    padding: '0.5rem 1rem', borderRadius: '25px', fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    background: selectedGuest.status === 'approved' ? 'rgba(76, 175, 80, 0.3)' :
                                        selectedGuest.status === 'rejected' ? 'rgba(244, 67, 54, 0.3)' :
                                            'rgba(255, 152, 0, 0.3)',
                                    color: selectedGuest.status === 'approved' ? '#4caf50' :
                                        selectedGuest.status === 'rejected' ? '#f44336' : '#ff9800'
                                }}>
                                    Status: {selectedGuest.status?.toUpperCase() || 'PENDING'}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => updateGuestStatus(selectedGuest.id, 'approved')}
                                        style={{ padding: '0.5rem 1rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        ✅ Approve
                                    </button>
                                    <button onClick={() => updateGuestStatus(selectedGuest.id, 'rejected')}
                                        style={{ padding: '0.5rem 1rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        ❌ Reject
                                    </button>
                                    <button onClick={() => deleteGuest(selectedGuest.id)}
                                        style={{ padding: '0.5rem 1rem', background: '#666', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            {/* ALL 17 FIELDS DISPLAY */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {/* Personal Info */}
                                <div>
                                    <h3 style={{ color: '#F4B41A', marginBottom: '1rem' }}>👤 Personal Information</h3>
                                    <p><strong>Name:</strong> {selectedGuest.name || selectedGuest.fullName || 'N/A'}</p>
                                    <p><strong>Age:</strong> {selectedGuest.age || 'N/A'}</p>
                                    <p><strong>Native Place:</strong> {selectedGuest.nativePlace || 'N/A'}</p>
                                    <p><strong>Kovil:</strong> {selectedGuest.kovil || 'N/A'}</p>
                                    <p><strong>Pirivu:</strong> {selectedGuest.pirivu || 'N/A'}</p>
                                    <p><strong>House Name:</strong> {selectedGuest.houseNamePattaiPeyar || 'N/A'}</p>
                                    <p><strong>Father's Name:</strong> {selectedGuest.fathersName || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedGuest.phoneNumber || selectedGuest.phone || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedGuest.email || 'N/A'}</p>
                                    <p><strong>Address:</strong> {selectedGuest.permanentAddress || selectedGuest.address || 'N/A'}</p>
                                </div>

                                {/* Visit & Accommodation */}
                                <div>
                                    <h3 style={{ color: '#F4B41A', marginBottom: '1rem' }}>📅 Visit Details</h3>
                                    <p><strong>Check-in:</strong> {selectedGuest.checkInDate || 'N/A'} at {selectedGuest.checkInTime || 'N/A'}</p>
                                    <p><strong>Check-out:</strong> {selectedGuest.expectedCheckOutDate || 'N/A'} at {selectedGuest.expectedCheckOutTime || 'N/A'}</p>
                                    <p><strong>Total Guests:</strong> {selectedGuest.totalNumberOfGuests || 'N/A'}</p>
                                    <p><strong>Room/Hall:</strong> {selectedGuest.roomHall || 'N/A'}</p>
                                    <p><strong>Aadhar:</strong> {selectedGuest.aadharNumber || 'N/A'}</p>
                                    <p><strong>At Hyderabad:</strong> {selectedGuest.atHyderabad === 'yes' || selectedGuest.atHyderabad === true ? 'Yes' : 'No'}</p>
                                    {(selectedGuest.atHyderabad === 'yes' || selectedGuest.atHyderabad === true) && (
                                        <p><strong>Area:</strong> {selectedGuest.area || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                                Registered: {new Date(selectedGuest.createdAt).toLocaleDateString()} |
                                User ID: {selectedGuest.userId || 'N/A'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="admin-dashboard">


            <div className="dashboard-header">
                <h1>🎯 Admin Dashboard</h1>
                <button onClick={() => { auth.signOut(); navigate('/'); }} className="logout-btn">
                    Logout
                </button>
            </div>

            <div className="dashboard-tabs">
                <button className={activeTab === 'guests' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('guests')}>
                    🎫 Guest Records
                </button>
                <button className={activeTab === 'new_members' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('new_members')}>
                    🆕 New Member Registered Details
                </button>
                <button className={activeTab === 'members' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('members')}>
                    👥 All Members
                </button>
                <button className={activeTab === 'create' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('create')}>
                    📝 Create Event
                </button>
                <button className={activeTab === 'view' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('view')}>
                    👁️ View Registrations
                </button>
                <button className={activeTab === 'moms' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('moms')}>
                    📋 MOMs
                </button>
                <button className={activeTab === 'voting' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('voting')}>
                    🗳️ Voting
                </button>
                <button className={activeTab === 'auction' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('auction')}>
                    🔨 Auction Records
                </button>
                <button className={activeTab === 'caretakers' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('caretakers')}>
                    👷 Caretakers
                </button>
                <button className={activeTab === 'budget' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('budget')}>
                    💰 Budget
                </button>
                <button className={activeTab === 'stock' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('stock')}>
                    📦 Stock
                </button>
            </div>

            <div className="dashboard-content">
                {/* CREATE EVENT TAB */}
                {activeTab === 'create' && (
                    <div className="create-event-section">
                        <h2>📝 Create New Event</h2>
                        <form onSubmit={handleCreateEvent} className="event-form">
                            <div className="form-group">
                                <label>Event Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={eventForm.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter event name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={eventForm.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter event description"
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={eventForm.location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter event location"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={eventForm.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={eventForm.time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Event Image (Logo/Poster)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEventImageUpload}
                                    className="file-input"
                                />
                                {eventForm.image && (
                                    <div className="image-preview" style={{ marginTop: '10px' }}>
                                        <img src={eventForm.image} alt="Preview" style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', border: '2px solid #F4B41A' }} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Additional Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={eventForm.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any extra note for invite (dress code, RSVP, instructions, etc.)"
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="submit-btn" style={{ flex: 1 }}>Create Event</button>
                                <button
                                    type="button"
                                    className="preview-btn"
                                    style={{ background: '#F4B41A', color: 'black', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold' }}
                                    onClick={() => {
                                        if (!eventForm.name || !eventForm.date) {
                                            showToast('Please fill at least Name and Date for preview', 'error');
                                            return;
                                        }
                                        generatePDFInvitation(eventForm);
                                    }}
                                >
                                    Download PDF Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* VIEW REGISTRATIONS TAB */}
                {activeTab === 'view' && (
                    <div className="view-registrations-section">
                        <h2>👁️ Event Registrations</h2>
                        <div className="events-list">
                            <h3>Select an Event</h3>
                            {events.length === 0 ? (
                                <p>No events created yet.</p>
                            ) : (
                                <div className="events-grid">
                                    {events.map(event => (
                                        <div key={event.id} className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}>
                                            <div onClick={() => setSelectedEvent(event)} style={{ flex: 1, cursor: 'pointer' }}>
                                                {event.image && (
                                                    <img src={event.image} alt={event.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                                                )}
                                                <h4>{event.name}</h4>
                                                <p>📅 {event.date} at {event.time}</p>
                                                <p>📍 {event.location}</p>
                                            </div>
                                            <div className="event-card-actions" style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => generatePDFInvitation(event)}
                                                    className="pdf-btn"
                                                    title="Download PDF Invitation"
                                                    style={{ background: '#F4B41A', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px' }}
                                                >
                                                    📄
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvent(event.id);
                                                    }}
                                                    className="delete-event-btn"
                                                    title="Delete Event"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedEvent && (
                            <div className="registrations-details">
                                <div className="registrations-header">
                                    <div>
                                        <h3>Registrations for {selectedEvent.name}</h3>
                                        <p>Total Registrations: {registrations.length}</p>
                                        <p>Total Headcount: {calculateTotalHeadcount()}</p>
                                    </div>
                                    <button onClick={exportToWord} className="export-btn">
                                        📄 Export to Word
                                    </button>
                                </div>

                                {registrations.length === 0 ? (
                                    <p className="no-registrations">No registrations yet for this event.</p>
                                ) : (
                                    <div className="registrations-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Member Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Family Members</th>
                                                    <th>Total Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {registrations.map(reg => (
                                                    <tr key={reg.id}>
                                                        <td>{reg.memberName}</td>
                                                        <td>{reg.memberEmail}</td>
                                                        <td>{reg.memberPhone}</td>
                                                        <td>
                                                            {reg.familyMembers && reg.familyMembers.length > 0 ? (
                                                                <ul className="family-list">
                                                                    {reg.familyMembers.map((fm, idx) => (
                                                                        <li key={idx}>
                                                                            {fm.name} ({fm.relation}, {fm.age} yrs)
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : 'None'}
                                                        </td>
                                                        <td>{1 + (reg.familyMembers ? reg.familyMembers.length : 0)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <div className="members-section">
                        <div className="members-header">
                            <h2>👥 All Registered Members ({filteredMembers.length})</h2>
                            {members.length > 0 && (
                                <button onClick={exportMembersToExcel} className="export-btn">
                                    📊 Export to Excel
                                </button>
                            )}
                        </div>

                        {members.length > 0 && (
                            <div className="search-bar-container">
                                <input
                                    type="text"
                                    placeholder="🔍 Search by name, email, phone, kovil, pirivu, native place, patta per, hyderabad area..."
                                    className="member-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {filteredMembers.length === 0 ? (
                            <p className="no-data">
                                {searchTerm ? `No members found matching "${searchTerm}"` : 'No members registered yet.'}
                            </p>
                        ) : (
                            <div className="members-grid">
                                {filteredMembers.map(member => (
                                    <div key={member.id} className="member-detail-card">
                                        <div className="member-card-header">
                                            <div className="member-avatar-section">
                                                {member.profileImage ? (
                                                    <img
                                                        src={member.profileImage}
                                                        alt={member.name}
                                                        className="member-avatar-img"
                                                    />
                                                ) : (
                                                    <div className="member-avatar-placeholder">
                                                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="member-name-section">
                                                <h3>{member.name} <span className="age-badge">({member.age} yrs)</span></h3>
                                                <div className="status-container">
                                                    <span className={`status-badge ${member.atHyderabad === 'yes' || member.atHyderabad === true ? 'in-hyd' : 'out-hyd'}`}>
                                                        {member.atHyderabad === 'yes' || member.atHyderabad === true ? '📍 Hyderabad' : '🏠 Other'}
                                                    </span>
                                                    {(member.atHyderabad === 'yes' || member.atHyderabad === true) && (member.area || member.hyderabadArea) && (
                                                        <span className="area-badge">
                                                            🏙️ {member.area || member.hyderabadArea}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* --- DELETE BUTTON --- */}
                                            <button
                                                className="delete-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMember(member.id);
                                                }}
                                                title="Delete Member"
                                                style={{
                                                    background: 'rgba(255, 0, 0, 0.1)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '35px',
                                                    height: '35px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    marginLeft: 'auto',
                                                    fontSize: '1.2rem'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="member-info">
                                            <p><strong>📧 Email:</strong> {member.email}</p>
                                            <p><strong>📱 Phone:</strong> {member.phone}</p>
                                            <p><strong>🛕 Kovil:</strong> {member.kovil}</p>
                                            <p><strong>🔖 Pirivu:</strong> {member.pirivu}</p>
                                            <p><strong>🏘️ Native:</strong> {member.nativePlace}</p>
                                            <p><strong>📋 Patta Per:</strong> {member.pattaPer}</p>
                                        </div>

                                        {/* Family Members Section */}
                                        <div className="family-section">
                                            <h4>👥 Family Members ({member.familyMembers?.length || 0}):</h4>
                                            {member.familyMembers && member.familyMembers.length > 0 ? (
                                                <div className="family-list">
                                                    {member.familyMembers.map((fm, idx) => (
                                                        <div key={idx} className="family-member-tag">
                                                            {fm.name} ({fm.relation}, {fm.age} yrs)
                                                            {fm.phone && ` 📱 ${fm.phone}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="no-family">No family members added</p>
                                            )}
                                        </div>

                                        <div className="member-footer">
                                            <small>Joined: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* GUEST RECORDS TAB - NEW FEATURE */}
                {activeTab === 'guests' && (
                    <div className="guest-records-section">
                        <h2>🎫 Guest Registration Records</h2>
                        <GuestRecordsContent />
                    </div>
                )}
                {/* VOTING TAB */}
                {activeTab === 'voting' && (
                    <div className="voting-section">
                        <h2>🗳️ Voting Management</h2>

                        <div className="create-poll-section">
                            <h3>Create New Poll</h3>
                            <form onSubmit={handleCreatePoll} className="poll-form">
                                <div className="form-group">
                                    <label>Poll Title</label>
                                    <input
                                        type="text"
                                        value={pollForm.title}
                                        onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                                        required
                                        placeholder="e.g., Committee Election 2026"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={pollForm.description}
                                        onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
                                        placeholder="Poll description..."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={pollForm.endDate}
                                        onChange={(e) => setPollForm({ ...pollForm, endDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="role-builder">
                                    <h4>Add Roles & Candidates</h4>
                                    <div className="form-group">
                                        <label>Role Name (e.g., President, Secretary)</label>
                                        <input
                                            type="text"
                                            value={roleForm.roleName}
                                            onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })}
                                            placeholder="Enter role name"
                                        />
                                    </div>

                                    <div className="candidates-builder">
                                        <label>Candidates for {roleForm.roleName || 'this role'}</label>
                                        <div className="candidate-input-row">
                                            <input
                                                type="text"
                                                value={candidateName}
                                                onChange={(e) => setCandidateName(e.target.value)}
                                                placeholder="Candidate name"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCandidate();
                                                    }
                                                }}
                                            />
                                            <button type="button" onClick={handleAddCandidate} className="add-btn">
                                                ➕ Add Candidate
                                            </button>
                                        </div>

                                        {roleForm.candidates.length > 0 && (
                                            <div className="candidates-list">
                                                {roleForm.candidates.map((candidate, idx) => (
                                                    <div key={idx} className="candidate-item">
                                                        <span>{candidate.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCandidate(idx)}
                                                            className="remove-btn-small"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button type="button" onClick={handleAddRole} className="add-role-btn">
                                        ➕ Add Role to Poll
                                    </button>
                                </div>

                                {pollForm.roles.length > 0 && (
                                    <div className="roles-preview">
                                        <h4>Roles in This Poll ({pollForm.roles.length})</h4>
                                        {pollForm.roles.map((role, idx) => (
                                            <div key={idx} className="role-preview-card">
                                                <div className="role-preview-header">
                                                    <strong>{role.roleName}</strong>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRole(idx)}
                                                        className="remove-btn-small"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="candidates-preview">
                                                    {role.candidates.map((c, i) => (
                                                        <span key={i} className="candidate-tag">{c.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button type="submit" className="submit-btn">Create Poll</button>
                            </form>
                        </div>

                        <div className="polls-list-section">
                            <h3>All Polls</h3>
                            {polls.length === 0 ? (
                                <p className="no-data">No polls created yet.</p>
                            ) : (
                                <div className="polls-grid">
                                    {polls.map(poll => (
                                        <div key={poll.id} className={`poll-card ${poll.status}`}>
                                            <div className="poll-card-header">
                                                <h4>{poll.title}</h4>
                                                <span className={`status-badge ${poll.status}`}>
                                                    {poll.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                                                </span>
                                            </div>
                                            <p>{poll.description}</p>
                                            <p><strong>End Date:</strong> {new Date(poll.endDate).toLocaleString()}</p>
                                            <p><strong>Roles:</strong> {poll.roles.length}</p>
                                            <div className="poll-actions">
                                                <button onClick={() => handleViewResults(poll)} className="view-results-btn">
                                                    📊 View Results
                                                </button>
                                                <button onClick={() => exportPollResults(poll)} className="export-btn">
                                                    📥 Export Excel
                                                </button>
                                                {poll.status === 'active' && (
                                                    <button onClick={() => handleClosePoll(poll.id)} className="close-poll-btn">
                                                        🔒 Close Poll
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeletePoll(poll.id)}
                                                    className="delete-poll-btn"
                                                    style={{ backgroundColor: '#dc3545', color: 'white', marginTop: '10px' }}
                                                >
                                                    🗑️ Delete Poll
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedPoll && (
                            <div className="results-modal">
                                <div className="results-modal-content">
                                    <button onClick={() => setSelectedPoll(null)} className="close-modal-btn">✕</button>
                                    <h3>Results: {selectedPoll.title}</h3>
                                    <p>Total Voters: {selectedPoll.votes.length}</p>

                                    {selectedPoll.roles.map((role, idx) => {
                                        const roleCandidates = role.candidates.map(candidate => {
                                            const votes = selectedPoll.votes.filter(v =>
                                                v.votes.some(vote => vote.roleName === role.roleName && vote.candidateName === candidate.name)
                                            ).length;
                                            return { ...candidate, votes };
                                        });

                                        const totalRoleVotes = roleCandidates.reduce((sum, c) => sum + c.votes, 0);

                                        return (
                                            <div key={idx} className="role-results">
                                                <h4>{role.roleName}</h4>
                                                <div className="candidates-results">
                                                    {roleCandidates.map((candidate, i) => {
                                                        const percentage = totalRoleVotes > 0 ? ((candidate.votes / totalRoleVotes) * 100).toFixed(2) : '0';
                                                        return (
                                                            <div key={i} className="candidate-result">
                                                                <div className="candidate-result-header">
                                                                    <span>{candidate.name}</span>
                                                                    <span>{candidate.votes} votes ({percentage}%)</span>
                                                                </div>
                                                                <div className="result-bar">
                                                                    <div className="result-bar-fill" style={{ width: `${percentage}%` }}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* MOMs TAB */}
                {activeTab === 'moms' && (
                    <div className="moms-section">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>📋 Minutes of Meeting (MOMs)</h2>
                            {moms.length > 0 && (
                                <button onClick={exportMomsToExcel} className="export-btn">
                                    📊 Export All to Excel
                                </button>
                            )}
                        </div>

                        <div className="moms-form-section">
                            <h3>{editingMom ? '✏️ Edit MOM' : '➕ Create New MOM'}</h3>
                            <form onSubmit={editingMom ? handleUpdateMom : handleCreateMom} className="mom-form">
                                <div className="form-group">
                                    <label>Meeting Topic</label>
                                    <input
                                        type="text"
                                        value={momForm.topic}
                                        onChange={(e) => setMomForm({ ...momForm, topic: e.target.value })}
                                        required
                                        placeholder="e.g., Monthly Committee Meeting, Budget Discussion"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={momForm.date}
                                            onChange={(e) => setMomForm({ ...momForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={momForm.time}
                                            onChange={(e) => setMomForm({ ...momForm, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Venue Type</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                value="online"
                                                checked={momForm.venueType === 'online'}
                                                onChange={(e) => setMomForm({ ...momForm, venueType: e.target.value, venueLocation: '' })}
                                            />
                                            <span>💻 Online</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                value="offline"
                                                checked={momForm.venueType === 'offline'}
                                                onChange={(e) => setMomForm({ ...momForm, venueType: e.target.value })}
                                            />
                                            <span>🏢 Offline</span>
                                        </label>
                                    </div>
                                </div>

                                {momForm.venueType === 'offline' && (
                                    <div className="form-group">
                                        <label>Venue Location</label>
                                        <input
                                            type="text"
                                            value={momForm.venueLocation}
                                            onChange={(e) => setMomForm({ ...momForm, venueLocation: e.target.value })}
                                            required
                                            placeholder="Enter venue location"
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Participants</label>
                                    <textarea
                                        value={momForm.participants}
                                        onChange={(e) => setMomForm({ ...momForm, participants: e.target.value })}
                                        required
                                        placeholder="Enter participant names (comma separated)"
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Meeting Summary</label>
                                    <textarea
                                        value={momForm.summary}
                                        onChange={(e) => setMomForm({ ...momForm, summary: e.target.value })}
                                        required
                                        placeholder="Enter meeting summary and key points discussed..."
                                        rows="6"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Actionable Items</label>
                                    <textarea
                                        value={momForm.actionable}
                                        onChange={(e) => setMomForm({ ...momForm, actionable: e.target.value })}
                                        placeholder="Enter tasks, decisions, and outcomes that require action..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingMom ? '💾 Update MOM' : '➕ Create MOM'}
                                    </button>
                                    {editingMom && (
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingMom(null);
                                                setMomForm({
                                                    date: '',
                                                    time: '',
                                                    venueType: 'online',
                                                    venueLocation: '',
                                                    participants: '',
                                                    summary: ''
                                                });
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="moms-list-section">
                            <h3>All MOMs</h3>
                            {moms.length === 0 ? (
                                <p className="no-data">No MOMs created yet.</p>
                            ) : (
                                <div className="moms-grid">
                                    {moms.map(mom => (
                                        <div key={mom.id} className="mom-card">
                                            <div className="mom-header">
                                                <div className="mom-title-section">
                                                    <h4>{mom.topic || 'General Meeting'}</h4>
                                                    <small>📅 {mom.date} • ⏰ {mom.time}</small>
                                                </div>
                                                <span className="venue-badge">
                                                    {mom.venueType === 'online' ? '💻 Online' : `🏢 ${mom.venueLocation}`}
                                                </span>
                                            </div>
                                            <div className="mom-content">
                                                <p><strong>👥 Participants:</strong> {mom.participants}</p>
                                                <p><strong>📝 Summary:</strong></p>
                                                <p className="mom-summary">{mom.summary}</p>
                                                {mom.actionable && (
                                                    <>
                                                        <p><strong>✅ Actionable Items:</strong></p>
                                                        <p className="mom-actionable">{mom.actionable}</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mom-actions">
                                                <button onClick={() => exportMomToWord(mom)} className="export-btn-small" style={{ backgroundColor: '#2b5797', color: 'white' }}>
                                                    📄 Export Word
                                                </button>
                                                {mom.actionable && (
                                                    <button onClick={() => exportActionableToExcel(mom)} className="export-btn-small" style={{ backgroundColor: '#1d6f42', color: 'white' }}>
                                                        📊 Export Actionable (Excel)
                                                    </button>
                                                )}
                                                <button onClick={() => handleEditMom(mom)} className="edit-btn">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDeleteMom(mom.id)} className="delete-btn">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* CARETAKERS TAB */}
                {activeTab === 'caretakers' && (
                    <div className="caretakers-section">
                        <h2>👷 Caretakers Management</h2>

                        <div className="caretakers-form-section">
                            <h3>{editingCaretaker ? '✏️ Edit Caretaker' : '➕ Add New Caretaker'}</h3>
                            <form onSubmit={editingCaretaker ? handleUpdateCaretaker : handleCreateCaretaker} className="caretaker-form">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={caretakerForm.name}
                                        onChange={(e) => setCaretakerForm({ ...caretakerForm, name: e.target.value })}
                                        required
                                        placeholder="Enter caretaker name"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={caretakerForm.phone}
                                            onChange={(e) => setCaretakerForm({ ...caretakerForm, phone: e.target.value })}
                                            required
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={caretakerForm.email}
                                            onChange={(e) => setCaretakerForm({ ...caretakerForm, email: e.target.value })}
                                            placeholder="Enter email (optional)"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={caretakerForm.address}
                                        onChange={(e) => setCaretakerForm({ ...caretakerForm, address: e.target.value })}
                                        required
                                        placeholder="Enter address"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Responsibility</label>
                                    <input
                                        type="text"
                                        value={caretakerForm.responsibility}
                                        onChange={(e) => setCaretakerForm({ ...caretakerForm, responsibility: e.target.value })}
                                        required
                                        placeholder="e.g., Temple Cleaning, Security"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Joining Date</label>
                                        <input
                                            type="date"
                                            value={caretakerForm.joiningDate}
                                            onChange={(e) => setCaretakerForm({ ...caretakerForm, joiningDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Salary (₹)</label>
                                        <input
                                            type="number"
                                            value={caretakerForm.salary}
                                            onChange={(e) => setCaretakerForm({ ...caretakerForm, salary: e.target.value })}
                                            required
                                            placeholder="Enter monthly salary"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingCaretaker ? '💾 Update Caretaker' : '➕ Add Caretaker'}
                                    </button>
                                    {editingCaretaker && (
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingCaretaker(null);
                                                setCaretakerForm({
                                                    name: '',
                                                    phone: '',
                                                    email: '',
                                                    address: '',
                                                    responsibility: '',
                                                    joiningDate: '',
                                                    salary: ''
                                                });
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="caretakers-list-section">
                            <h3>All Caretakers</h3>
                            {caretakers.length === 0 ? (
                                <p className="no-data">No caretakers added yet.</p>
                            ) : (
                                <div className="caretakers-grid">
                                    {caretakers.map(caretaker => (
                                        <div key={caretaker.id} className="caretaker-card">
                                            <div className="caretaker-header">
                                                <h4>👤 {caretaker.name}</h4>
                                                <span className="salary-badge">💰 ₹{caretaker.salary}/month</span>
                                            </div>
                                            <div className="caretaker-info">
                                                <p><strong>📱 Phone:</strong> {caretaker.phone}</p>
                                                {caretaker.email && <p><strong>📧 Email:</strong> {caretaker.email}</p>}
                                                <p><strong>📍 Address:</strong> {caretaker.address}</p>
                                                <p><strong>💼 Responsibility:</strong> {caretaker.responsibility}</p>
                                                <p><strong>📅 Joined:</strong> {new Date(caretaker.joiningDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="caretaker-actions">
                                                <button onClick={() => handleEditCaretaker(caretaker)} className="edit-btn">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDeleteCaretaker(caretaker.id)} className="delete-btn">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* BUDGET TAB */}
                {activeTab === 'budget' && (
                    <div className="budget-section">
                        <div className="section-header">
                            <h2 className="section-title">💰 Budget Planning</h2>
                            <p className="section-subtitle">Plan and manage event budgets efficiently</p>
                        </div>

                        <div className="budget-form-section">
                            <div className="form-card">
                                <div className="form-card-header">
                                    <h3>➕ Create New Budget Plan</h3>
                                </div>

                                <form onSubmit={handleCreateBudget} className="budget-form">
                                    <div className="form-section">
                                        <h4 className="form-section-title">Event Details</h4>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Event Name *</label>
                                                <input
                                                    type="text"
                                                    value={budgetForm.eventName}
                                                    onChange={(e) => setBudgetForm({ ...budgetForm, eventName: e.target.value })}
                                                    required
                                                    placeholder="Enter event name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Event Date *</label>
                                                <input
                                                    type="date"
                                                    value={budgetForm.eventDate}
                                                    onChange={(e) => setBudgetForm({ ...budgetForm, eventDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section category-builder">
                                        <h4 className="form-section-title">Add Budget Category</h4>
                                        <div className="form-group">
                                            <label>Category Name</label>
                                            <input
                                                type="text"
                                                value={budgetCategory.categoryName}
                                                onChange={(e) => setBudgetCategory({ ...budgetCategory, categoryName: e.target.value })}
                                                placeholder="e.g., Food, Decoration, Transport"
                                            />
                                        </div>

                                        <div className="items-builder">
                                            <h5 className="items-subtitle">Add Items to Category</h5>
                                            <div className="item-input-grid">
                                                <input
                                                    type="text"
                                                    placeholder="Item name"
                                                    value={budgetItem.itemName}
                                                    onChange={(e) => setBudgetItem({ ...budgetItem, itemName: e.target.value })}
                                                    className="item-input"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Quantity"
                                                    value={budgetItem.quantity}
                                                    onChange={(e) => setBudgetItem({ ...budgetItem, quantity: e.target.value })}
                                                    min="0"
                                                    step="0.01"
                                                    className="item-input"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Unit Price (₹)"
                                                    value={budgetItem.unitPrice}
                                                    onChange={(e) => setBudgetItem({ ...budgetItem, unitPrice: e.target.value })}
                                                    min="0"
                                                    step="0.01"
                                                    className="item-input"
                                                />
                                                <button type="button" onClick={handleAddBudgetItem} className="add-item-btn">
                                                    ➕ Add Item
                                                </button>
                                            </div>

                                            {budgetCategory.items.length > 0 && (
                                                <div className="items-list">
                                                    <table className="items-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Item</th>
                                                                <th>Quantity</th>
                                                                <th>Unit Price</th>
                                                                <th>Total</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {budgetCategory.items.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{item.itemName}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                                                                    <td className="total-cell">₹{parseFloat(item.totalPrice).toFixed(2)}</td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updatedItems = budgetCategory.items.filter((_, i) => i !== idx);
                                                                                setBudgetCategory({ ...budgetCategory, items: updatedItems });
                                                                            }}
                                                                            className="remove-item-btn"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="total-row">
                                                                <td colSpan="3"><strong>Category Total</strong></td>
                                                                <td className="total-cell">
                                                                    <strong>₹{budgetCategory.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</strong>
                                                                </td>
                                                                <td></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddBudgetCategory}
                                            className="add-category-btn"
                                            disabled={!budgetCategory.categoryName || budgetCategory.items.length === 0}
                                        >
                                            ➕ Add Category to Budget
                                        </button>
                                    </div>

                                    {budgetForm.categories.length > 0 && (
                                        <div className="categories-preview">
                                            <h4 className="preview-title">Budget Categories ({budgetForm.categories.length})</h4>
                                            <div className="categories-preview-grid">
                                                {budgetForm.categories.map((cat, idx) => (
                                                    <div key={idx} className="category-preview-card">
                                                        <div className="category-preview-header">
                                                            <h5>{cat.categoryName}</h5>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveBudgetCategory(idx)}
                                                                className="remove-category-btn"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <div className="category-preview-body">
                                                            <p className="items-count">{cat.items.length} items</p>
                                                            <p className="category-total-amount">
                                                                ₹{cat.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grand-total-preview">
                                                <strong>Grand Total:</strong>
                                                <span className="grand-total-amount">
                                                    ₹{budgetForm.categories.reduce((total, cat) =>
                                                        total + cat.items.reduce((sum, item) => sum + item.totalPrice, 0), 0
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="submit-btn budget-submit-btn" disabled={budgetForm.categories.length === 0}>
                                        💾 Create Budget Plan
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="budgets-list-section">
                            <h3 className="list-title">📋 All Budget Plans</h3>
                            {budgets.length === 0 ? (
                                <div className="no-data-card">
                                    <div className="no-data-icon">📊</div>
                                    <p className="no-data-text">No budget plans created yet.</p>
                                    <p className="no-data-subtext">Create your first budget plan above to get started.</p>
                                </div>
                            ) : (
                                <div className="budgets-grid">
                                    {budgets.map(budget => (
                                        <div key={budget.id} className="budget-card">
                                            <div className="budget-card-header">
                                                <div className="budget-title-section">
                                                    <h4>🎯 {budget.eventName}</h4>
                                                    <span className="budget-date">📅 {budget.eventDate}</span>
                                                </div>
                                            </div>

                                            <div className="budget-card-body">
                                                <div className="budget-stats">
                                                    <div className="stat-item">
                                                        <span className="stat-label">Categories</span>
                                                        <span className="stat-value">{budget.categories.length}</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span className="stat-label">Total Items</span>
                                                        <span className="stat-value">
                                                            {budget.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="budget-categories-list">
                                                    {budget.categories.map((cat, idx) => (
                                                        <div key={idx} className="budget-category-row">
                                                            <span className="category-name-badge">{cat.categoryName}</span>
                                                            <span className="category-amount-badge">
                                                                ₹{cat.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="budget-card-footer">
                                                <div className="budget-total-section">
                                                    <span className="total-label">Total Budget</span>
                                                    <span className="total-amount">₹{calculateBudgetTotal(budget).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="budget-actions">
                                                    <button onClick={() => exportBudgetToExcel(budget)} className="action-btn export-btn">
                                                        📊 Export
                                                    </button>
                                                    <button onClick={() => handleDeleteBudget(budget.id)} className="action-btn delete-btn">
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* STOCK TAB */}
                {activeTab === 'stock' && (
                    <div className="stock-section">
                        <h2>📦 Stock Management</h2>

                        <div className="stock-header-actions">
                            {stocks.length > 0 && (
                                <button onClick={exportStocksToExcel} className="export-btn">
                                    📊 Export to Excel
                                </button>
                            )}
                        </div>

                        <div className="stock-form-section">
                            <h3>{editingStock ? '✏️ Edit Stock Item' : '➕ Add New Stock Item'}</h3>
                            <form onSubmit={editingStock ? handleUpdateStock : handleCreateStock} className="stock-form">
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        value={stockForm.itemName}
                                        onChange={(e) => setStockForm({ ...stockForm, itemName: e.target.value })}
                                        required
                                        placeholder="Enter item name"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            value={stockForm.quantity}
                                            onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                                            required
                                            placeholder="Enter quantity"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <input
                                            type="text"
                                            value={stockForm.unit}
                                            onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                                            required
                                            placeholder="e.g., kg, pieces, liters"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <input
                                            type="text"
                                            value={stockForm.category}
                                            onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                                            required
                                            placeholder="e.g., Food, Equipment, Decorations"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Storage Location</label>
                                        <input
                                            type="text"
                                            value={stockForm.location}
                                            onChange={(e) => setStockForm({ ...stockForm, location: e.target.value })}
                                            required
                                            placeholder="Enter storage location"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingStock ? '💾 Update Stock' : '➕ Add Stock'}
                                    </button>
                                    {editingStock && (
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingStock(null);
                                                setStockForm({ itemName: '', quantity: '', unit: '', category: '', location: '' });
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="stocks-list-section">
                            <h3>All Stock Items</h3>
                            {stocks.length === 0 ? (
                                <p className="no-data">No stock items added yet.</p>
                            ) : (
                                <div className="stocks-grid">
                                    {stocks.map(stock => (
                                        <div key={stock.id} className="stock-card">
                                            <div className="stock-header">
                                                <h4>📦 {stock.itemName}</h4>
                                                <span className="stock-quantity">
                                                    {stock.quantity} {stock.unit}
                                                </span>
                                            </div>
                                            <div className="stock-body">
                                                <p><strong>🏷️ Category:</strong> {stock.category}</p>
                                                <p><strong>📍 Location:</strong> {stock.location}</p>
                                                <p><strong>📅 Added:</strong> {new Date(stock.createdAt).toLocaleDateString()}</p>
                                            </div>

                                            {stock.usageHistory && stock.usageHistory.length > 0 && (
                                                <div className="usage-history">
                                                    <strong>📋 Usage History ({stock.usageHistory.length})</strong>
                                                    <ul>
                                                        {stock.usageHistory.map((usage, idx) => (
                                                            <li key={idx} className={usage.returned ? 'returned' : ''}>
                                                                <div>
                                                                    <strong>{usage.eventName}</strong>
                                                                    <span> - {usage.usedQuantity} {stock.unit}</span>
                                                                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                                                        {new Date(usage.usageDate).toLocaleDateString()}
                                                                        {usage.returned && ` • Returned: ${usage.returnedQuantity} ${stock.unit}`}
                                                                    </div>
                                                                </div>
                                                                {!usage.returned && (
                                                                    <button
                                                                        onClick={() => handleStockReturn(stock, idx)}
                                                                        className="return-btn-small"
                                                                    >
                                                                        ↩️ Return
                                                                    </button>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="stock-actions">
                                                <button onClick={() => handleStockUsage(stock)} className="usage-btn">
                                                    📤 Use Stock
                                                </button>
                                                <button onClick={() => handleEditStock(stock)} className="edit-btn">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDeleteStock(stock.id)} className="delete-btn">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* AUCTION TAB */}
                {activeTab === 'auction' && (
                    <div className="auction-section">
                        <h2>🔨 Auction Records</h2>

                        <div className="year-selector-container">
                            <label className="year-selector-label">📅 SELECT YEAR:</label>
                            <div className="year-selector-wrapper">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        const newYear = parseInt(e.target.value);
                                        setSelectedYear(newYear);           // 1️⃣ Change the year
                                        fetchAuctionItems(newYear);         // 2️⃣ Load items for that year
                                    }}
                                    className="year-select-professional"
                                >

                                    {Array.from({ length: 101 }, (_, i) => 2000 + i).map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <div className="year-dropdown-icon">▼</div>
                            </div>
                        </div>


                        <div className="auction-form-section">
                            <h3>➕ Add Auction Item for {selectedYear}</h3>
                            <form onSubmit={handleAddAuctionItem} className="auction-form">
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={auctionForm.itemName}
                                        onChange={handleAuctionInputChange}
                                        required
                                        placeholder="Enter item name"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Buyer Name</label>
                                        <input
                                            type="text"
                                            name="buyerName"
                                            value={auctionForm.buyerName}
                                            onChange={handleAuctionInputChange}
                                            required
                                            placeholder="Enter buyer name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={auctionForm.price}
                                            onChange={handleAuctionInputChange}
                                            required
                                            placeholder="Enter price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn">Add Auction Item</button>
                            </form>
                        </div>

                        <div className="auction-list-section">
                            <div className="auction-header">
                                <h3>Auction Items - {selectedYear}</h3>
                                {auctionItems.length > 0 && (
                                    <button onClick={exportAuctionToExcel} className="export-btn">
                                        📊 Export to Excel
                                    </button>
                                )}
                            </div>

                            {auctionItems.length === 0 ? (
                                <p className="no-data">No auction items for {selectedYear}.</p>
                            ) : (
                                <div className="auction-table-container">
                                    <table className="auction-table">
                                        <thead>
                                            <tr>
                                                <th>S.No</th>
                                                <th>Item Name</th>
                                                <th>Buyer Name</th>
                                                <th>Price (₹)</th>
                                                <th>Payment Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auctionItems.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.itemName}</td>
                                                    <td>{item.buyerName}</td>
                                                    <td>₹{item.price.toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <label className="payment-toggle">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isPaid}
                                                                onChange={() => handleTogglePayment(item.id, item.isPaid)}
                                                            />
                                                            <span className={`payment-status ${item.isPaid ? 'paid' : 'unpaid'}`}>
                                                                {item.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                                                            </span>
                                                        </label>
                                                        {item.isPaid && item.paidAt && (
                                                            <small className="paid-date">
                                                                {new Date(item.paidAt).toLocaleDateString()}
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDeleteAuctionItem(item.id)}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="total-row">
                                                <td colSpan="3"><strong>TOTAL AMOUNT</strong></td>
                                                <td><strong>₹{calculateTotalAmount().toLocaleString('en-IN')}</strong></td>
                                                <td colSpan="2">
                                                    <span className="payment-summary">
                                                        Paid: ₹{auctionItems.filter(i => i.isPaid).reduce((sum, i) => sum + i.price, 0).toLocaleString('en-IN')}
                                                        {' | '}
                                                        Pending: ₹{auctionItems.filter(i => !i.isPaid).reduce((sum, i) => sum + i.price, 0).toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* NEW MEMBER REGISTRATIONS TAB */}
                {activeTab === 'new_members' && (
                    <div className="new-members-section" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, color: '#F4B41A' }}>🆕 New Member Registered Details ({newMemberRegistrations.length})</h2>
                        </div>

                        {newMemberRegistrations.length === 0 ? (
                            <p className="no-data">No new member registrations found.</p>
                        ) : (
                            <div className="registrations-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {newMemberRegistrations.map(reg => (
                                    <div key={reg.id} className="member-detail-card" style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        position: 'relative'
                                    }}>
                                        <button
                                            className="delete-icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNewMemberRegistration(reg.id);
                                            }}
                                            title="Delete Registration"
                                            style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: 'rgba(255, 0, 0, 0.1)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '35px',
                                                height: '35px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'white'
                                            }}
                                        >
                                            🗑️
                                        </button>

                                        <h3 style={{ margin: '0 0 1rem 0', color: '#F4B41A' }}>{reg.name}</h3>

                                        <div className="info-grid" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            <p><strong>🎂 Age:</strong> {reg.age}</p>
                                            <p><strong>📧 Email:</strong> {reg.email}</p>
                                            <p><strong>📱 Phone:</strong> {reg.phone}</p>
                                            <hr style={{ border: '0.5px solid rgba(255, 255, 255, 0.1)', margin: '1rem 0' }} />
                                            <p><strong>🛕 Kovil:</strong> {reg.kovil}</p>
                                            <p><strong>🔖 Pirivu:</strong> {reg.pirivu}</p>
                                            <p><strong>🏘️ Native:</strong> {reg.nativePlace}</p>
                                            <p><strong>📋 Patta Per:</strong> {reg.pattaPer}</p>
                                            <p><strong>📍 In Hyd:</strong> {reg.atHyderabad === 'yes' || reg.atHyderabad === true ? '✅ Yes' : '❌ No'}</p>
                                            {(reg.area || reg.hyderabadArea) && (
                                                <p><strong>🏙️ Area:</strong> {reg.area || reg.hyderabadArea}</p>
                                            )}
                                            <hr style={{ border: '0.5px solid rgba(255, 255, 255, 0.1)', margin: '1rem 0' }} />
                                            <p><strong>🏠 Address:</strong> {reg.address}</p>
                                            <p><strong>🏙️ City:</strong> {reg.city}, {reg.state} - {reg.pincode}</p>

                                            {reg.familyMembers && reg.familyMembers.length > 0 && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <strong>👨‍👩‍👧‍👦 Family ({reg.familyMembers.length}):</strong>
                                                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                                        {reg.familyMembers.map((fm, idx) => (
                                                            <li key={idx} style={{ fontSize: '0.85rem' }}>
                                                                {fm.name} ({fm.relation}, {fm.age}y)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5, textAlign: 'right' }}>
                                            Registered: {reg.timestamp?.toDate ? reg.timestamp.toDate().toLocaleString() : new Date(reg.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Removed LocalAssetBrowser */}
            </div>
        </div>
    );
};

export default AdminDashboard;
