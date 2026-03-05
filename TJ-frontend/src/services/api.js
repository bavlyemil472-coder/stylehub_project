import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // تأكد أن هذا هو رابط الباك إيند عندك
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log("الـ Token اللي مبعوث حالياً:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Token expired or invalid. Logging out...");
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      
    }
    
    return Promise.reject(error);
  }
);

export default api;