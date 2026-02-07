import React from 'react';
import './SubCommittee.css';

const SubCommittee = () => {
    return (
        <div className="subcommittee-page">
            <div className="subcommittee-container">

                {/* Header Section */}
                <section className="subcommittee-header-section">
                    <div className="section-header">
                        <h2>NNSC Sub Committee</h2>
                        <div className="header-line"></div>
                    </div>
                </section>

                {/* Committee Info Section */}
                <section className="committee-info-section">
                    <div className="info-card main-card">
                        <div className="card-icon">📚</div>
                        <h3>Ettu Kalvi Class Committee</h3>
                        <p className="committee-subtitle">Educational Excellence Initiative</p>
                    </div>
                </section>

                {/* Purpose Section */}
                <section className="purpose-section">
                    <div className="section-header">
                        <h2>Purpose & Objective</h2>
                        <div className="header-line"></div>
                    </div>
                    <div className="content-card">
                        <p>
                            The Ettu Kalvi Class Committee is dedicated to preserving and promoting
                            traditional Tamil education and cultural knowledge among community members.
                            This committee focuses on organizing educational programs, cultural workshops,
                            and learning initiatives that connect our heritage with modern educational practices.
                        </p>
                        <p>
                            Our mission is to ensure that the younger generation stays connected to their
                            roots while excelling in contemporary education, creating a bridge between
                            traditional wisdom and modern knowledge.
                        </p>
                    </div>
                </section>

                {/* Members Section */}
                <section className="members-section">
                    <div className="section-header">
                        <h2>Committee Members</h2>
                        <div className="header-line"></div>
                    </div>
                    <div className="members-grid">
                        <div className="member-info-card">
                            <div className="member-icon">👤</div>
                            <h4>Committee Coordinator</h4>
                            <p>Oversees all educational initiatives and programs</p>
                        </div>
                        <div className="member-info-card">
                            <div className="member-icon">👥</div>
                            <h4>Program Organizers</h4>
                            <p>Plan and execute cultural and educational events</p>
                        </div>
                        <div className="member-info-card">
                            <div className="member-icon">📖</div>
                            <h4>Educational Advisors</h4>
                            <p>Provide guidance on curriculum and teaching methods</p>
                        </div>
                    </div>
                </section>

                {/* Activities Section */}
                <section className="activities-section">
                    <div className="section-header">
                        <h2>Activities & Responsibilities</h2>
                        <div className="header-line"></div>
                    </div>
                    <div className="activities-grid">
                        <div className="activity-card">
                            <div className="activity-icon">🎓</div>
                            <h4>Tamil Language Classes</h4>
                            <p>Regular classes to teach Tamil language, literature, and grammar to children and adults</p>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">🎭</div>
                            <h4>Cultural Workshops</h4>
                            <p>Workshops on traditional arts, music, dance, and cultural practices</p>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">📚</div>
                            <h4>Educational Programs</h4>
                            <p>Organizing seminars, lectures, and educational events for community enrichment</p>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">🏆</div>
                            <h4>Competitions & Events</h4>
                            <p>Hosting cultural competitions, quiz programs, and talent shows for students</p>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">📖</div>
                            <h4>Library Management</h4>
                            <p>Maintaining a collection of Tamil books, literature, and educational resources</p>
                        </div>
                        <div className="activity-card">
                            <div className="activity-icon">🤝</div>
                            <h4>Community Outreach</h4>
                            <p>Collaborating with other organizations to promote Tamil education and culture</p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="contact-section">
                    <div className="content-card contact-card">
                        <h3>Get Involved</h3>
                        <p>
                            If you're interested in participating in our educational programs or would like
                            to contribute to the Ettu Kalvi Class Committee, please reach out to us through
                            the main association contact details.
                        </p>
                        <div className="contact-info-box">
                            <p>
                                <span className="icon">📧</span>{' '}
                                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=nnscahyderabad@gmail.com&su=${encodeURIComponent('Inquiry about Ettu Kalvi Class Committee')}&body=${encodeURIComponent(`Dear NNSC Team,

I hope this message finds you well. I am writing to express my interest in the Ettu Kalvi Class Committee and its educational programs.

I would like to learn more about:
- Upcoming educational programs and workshops
- How I can participate or contribute
- Schedule and registration details

Thank you for your time and I look forward to hearing from you.

Best regards`)}`} target="_blank" rel="noopener noreferrer">
                                    nnscahyderabad@gmail.com
                                </a>
                            </p>
                            <p>
                                <span className="icon">📞</span>{' '}
                                <a href="tel:+917396762293" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    +91 7396762293
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SubCommittee;
