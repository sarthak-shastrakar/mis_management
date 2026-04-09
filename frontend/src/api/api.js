import axios from 'axios';

// Get base URL from environment or fallback to Localhost
// Get base URL from environment or fallback to relative path
const API_URL = '/api/v1';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
