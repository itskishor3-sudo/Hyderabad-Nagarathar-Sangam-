import React, { useEffect } from 'react';
import './toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✨';
            case 'error': return '🧨';
            case 'info': return '🔔';
            case 'warning': return '⚡';
            default: return '📢';
        }
    };

    return (
        <div className={`toast-item ${type}`} style={{ '--duration': `${duration}ms` }}>
            <div className="toast-glass">
                <div className="toast-icon-wrapper">
                    {getIcon()}
                </div>
                <div className="toast-text-content">
                    <p className="toast-msg">{message}</p>
                </div>
                <button className="toast-dismiss" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                <div className="toast-timer-bar"></div>
            </div>
        </div>
    );
};

export default Toast;
