const getApiBaseUrl = () => {
    // Priority: 1. Environment Variable, 2. Production URL Fallback
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    const prodUrl = 'https://hyderabad-nagarathar-sangam-backend.onrender.com';

    // Check if we are in local development (usually localhost)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (envUrl) {
        console.log(`[Config] Using Environment API URL: ${envUrl}`);
        return envUrl;
    }

    if (isLocal) {
        console.warn('[Config] No VITE_API_BASE_URL set. Defaulting to localhost:5000');
        return 'http://localhost:5000';
    }

    console.log(`[Config] Using Production API URL: ${prodUrl}`);
    return prodUrl;
};

export const API_BASE_URL = getApiBaseUrl();
