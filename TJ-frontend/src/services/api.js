import axios from 'axios';

// 1. إنشاء Instance من Axios بإعدادات ثابتة
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // تأكد أن هذا هو رابط الباك إيند عندك
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor للطلبات (Requests)
// وظيفته: سحب التوكن من الـ localStorage وحطه في الـ Headers أوتوماتيكياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log("الـ Token اللي مبعوث حالياً:", token); // ضيف ده للتأكد
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor للاستجابة (Responses)
// وظيفته: لو السيرفر رد بـ 401 (Unauthorized) معناه التوكن انتهى، فيقوم بعمل Logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // إذا انتهت صلاحية التوكن (Status 401) ولم نقم بإعادة المحاولة بالفعل
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Token expired or invalid. Logging out...");
      
      // تنظيف البيانات وتوجيه المستخدم لتسجيل الدخول
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // ملاحظة: لو عندك Refresh Token Logic ممكن تضيفه هنا قبل ما تعمل logout
      // window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

export default api;