// API Base URL configuration
// In development, the React dev server proxies to the backend
// In production, the API is served from the same origin
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:6001/api';

export default API_BASE_URL;
