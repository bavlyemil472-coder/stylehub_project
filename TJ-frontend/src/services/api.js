import axios from 'axios';
const api = axios.create({
  baseURL: 'https://tresjolie-shop.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ مهم للـ Guest session
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
      originalRequest._retry = true;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // ✅ نعيد إرسال نفس الريكوست بس من غير التوكن القديم (عشان الـ endpoints العامة تشتغل للزوار)
      delete originalRequest.headers.Authorization;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
export default api;
