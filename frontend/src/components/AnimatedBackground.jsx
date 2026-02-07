import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = ({ children }) => {
    return (
        <div className="animated-bg-wrapper">
            <div className="animated-bg-pattern"></div>
            <div className="content-wrapper">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;
