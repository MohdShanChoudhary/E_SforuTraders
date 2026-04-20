import axios from 'axios';

const API = axios.create({
  baseURL: 'https://e-sforutraders.onrender.com', // 🔥 change if your backend runs on another port
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach token ONLY for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // ❗ login request pe token mat bhejo
  if (token && !config.url.includes('/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;