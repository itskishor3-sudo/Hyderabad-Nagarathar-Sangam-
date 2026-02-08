import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import './AdminMembersList.css';

const AdminMembersList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMembers(membersData);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading members...</div>;

    return (
        <div className="admin-members">
            <h1>All Members ({members.length})</h1>
            <div className="members-grid">
                {members.map(member => (
                    <div key={member.id} className="member-card">
                        <h3>{member.name} ({member.age} yrs)</h3>
                        <p>📧 {member.email}</p>
                        <p>🏛️ Kovil: {member.kovil} | Pirivu: {member.pirivu}</p>
                        <p>🏘️ Native: {member.nativePlace} | Patta Per: {member.pattaPer}</p>
                        <p>📍 Hyderabad: {member.atHyderabad === 'yes' || member.atHyderabad === true ? 'Yes' : 'No'}</p>
                        {(member.area || member.hyderabadArea) && (
                            <p>🏙️ Area: {member.area || member.hyderabadArea}</p>
                        )}
                        {member.familyMembers && member.familyMembers.length > 0 && (
                            <div className="family-list">
                                <strong>Family ({member.familyMembers.length}):</strong>
                                {member.familyMembers.map((fm, i) => (
                                    <span key={i}>{fm.name} ({fm.relation}, {fm.age}){fm.phone && ` | ${fm.phone}`}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMembersList;
