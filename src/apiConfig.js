// frontend/src/apiConfig.js
// Centralized API configuration for SecureKit.

// In development, we use relative paths paired with the "proxy" field in package.json.
// In production, we fallback to the environment variable or the production backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://securekit-backend-1fs6.onrender.com';

export default API_BASE_URL;
