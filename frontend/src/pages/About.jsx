import React from 'react';
import './About.css';

// Import Images
import groupPhoto from '../assets/committee-group.jpg';
import kumarImg from '../assets/kumar.jpg';
import sreenivasImg from '../assets/sreenivas.jpg';
import shanmugamImg from '../assets/shanmugam.jpg';
import kuppuImg from '../assets/kuppu.jpg';

// Placeholders for missing images
import ramanathanImg from '../assets/ramanathan.jpg';
import saikumarImg from '../assets/saikumar.jpg';
import muthuImg from '../assets/muthu.jpg';

const About = () => {

    // Helper function to create Gmail compose URL with subject and body
    const createGmailLink = (email, subject, body) => {
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}&body=${encodedBody}`;
    };

    // Committee Members - Reordered as requested
    const committeeMembers = [
        {
            name: "Sreenivas Ramaswamy",
            role: "President",
            place: "Karaikudi",
            email: "hnsnnscapresident@gmail.com",
            phone: "+91 98844 01655",
            photo: sreenivasImg
        },
        {
            name: "Kuppu Kulandayan",
            role: "Vice President",
            place: "Rayavaram",
            email: "hnsnnscavicepresident@gmail.com",
            phone: "+91 99894 99460",
            photo: kuppuImg
        },
        {
            name: "S.Shanmugam",
            role: "Secretary",
            place: "Pon. Pudupatti",
            email: "hnsnnscasecretary@gmail.com",
            phone: "+91 9618334424",
            photo: shanmugamImg
        },
        {
            name: "Saikumar Chidambaram",
            role: "Joint Secretary",
            place: "K. Lakshmipuram",
            email: "hnsnnscajointsecretary@gmail.com",
            phone: "+91 90326 52375",
            photo: saikumarImg
        },
        {
            name: "N.G. Ramanathan",
            role: "Treasurer",
            place: "Nachandupatti",
            email: "hnsnnscatreasurer@gmail.com",
            phone: "+91 92836 69216",
            photo: ramanathanImg
        },
        {
            name: "S. Kumar",
            role: "Management Committee Member",
            place: "K. Lakshmipuram",
            email: "hnsnnscamcmember1@gmail.com",
            phone: "+91 97100 59443",
            photo: kumarImg
        },
        {
            name: "Muthuveerappan Periyakaruppan",
            role: "Management Committee Member",
            place: "",
            email: "hnsnnscamcmember2@gmail.com",
            phone: "+91 91777 71224",
            photo: muthuImg
        }
    ];

    return (
        <div className="about-page">
            <div className="about-container">

                {/* About Us Section */}
                <section className="about-section">
                    <div className="section-header">
                        <h2>About NNSCA</h2>
                        <div className="header-line"></div>
                    </div>
                    <div className="about-content">
                        <p>
                            The Hyderabad Nattukkottai Nagarathar Social and Cultural Association (NNSCA)
                            is dedicated to preserving and promoting the rich Tamil culture and heritage
                            of the Nattukkottai Nagarathar community in Hyderabad.
                        </p>
                        <p>
                            We bring together community members through cultural events, festivals, and
                            social gatherings, fostering a strong bond among our members while maintaining
                            our traditional values and customs.
                        </p>
                    </div>
                </section>



                {/* Committee Members Grid */}
                <section className="committee-section">
                    <div className="section-header">
                        <h2>Committee Members</h2>
                        <div className="header-line"></div>
                    </div>

                    <div className="committee-grid">
                        {committeeMembers.map((member, index) => {
                            // Create personalized email subject and body for each member
                            const emailSubject = `Inquiry for ${member.name} - ${member.role}`;
                            const emailBody = `Dear ${member.role} ${member.name},

I hope this message finds you well. I am reaching out to you regarding [your inquiry topic].

I would appreciate your guidance and assistance in this matter.

Thank you for your time and consideration.

Best regards`;

                            return (
                                <div className="member-card" key={index}>
                                    <div className="profile-image-container">
                                        <img src={member.photo} alt={member.name} className="profile-img" />
                                    </div>

                                    <h3>{member.name}</h3>
                                    <p className="position">{member.role}</p>

                                    {member.place && (
                                        <p className="native-place">
                                            <span className="icon">📍</span> {member.place}
                                        </p>
                                    )}

                                    <div className="contact-details">
                                        {member.phone && (
                                            <p className="contact-info">
                                                <span className="icon">📞</span>
                                                <a href={`tel:${member.phone.replace(/\s+/g, '')}`}>
                                                    {member.phone}
                                                </a>
                                            </p>
                                        )}
                                        {member.email && (
                                            <p className="contact-info">
                                                <span className="icon">✉️</span>
                                                <a href={createGmailLink(member.email, emailSubject, emailBody)} target="_blank" rel="noopener noreferrer">
                                                    {member.email}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Location Section */}
                <section className="location-section">
                    <div className="section-header">
                        <h2>Location & Contact Details</h2>
                        <div className="header-line"></div>
                    </div>

                    <div className="location-grid">
                        <a
                            href="https://maps.app.goo.gl/a2Go8iqnC9k21EnDA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="location-card"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="location-icon">📍</div>
                            <h3>Location</h3>
                            <p className="location-subtitle">Our Address</p>
                            <div className="location-details">
                                <p>East Marredpally</p>
                                <p>Hyderabad, Telangana</p>
                                <p>India - 500026</p>
                            </div>
                        </a>

                        <div className="location-card">
                            <div className="location-icon">📧</div>
                            <h3>Email</h3>
                            <p className="location-subtitle">Get in Touch</p>
                            <div className="location-details">
                                <p>
                                    <a
                                        href={createGmailLink(
                                            'nnscahyderabad@gmail.com',
                                            'General Inquiry - NNSCA',
                                            `Dear NNSCA Team,

I hope this message finds you well. I am writing to inquire about [your topic].

I would appreciate any information or guidance you can provide.

Thank you for your time and assistance.

Best regards`
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'inherit', textDecoration: 'none' }}
                                    >
                                        nnscahyderabad@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="location-card">
                            <div className="location-icon">📞</div>
                            <h3>Phone</h3>
                            <p className="location-subtitle">Call Us</p>
                            <div className="location-details">
                                <p>
                                    <a href="tel:+917396762293" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        +91 7396762293
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
