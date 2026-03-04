import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. استيراد المزود من المكتبة
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. تغليف التطبيق بالكامل وتمرير الـ Client ID */}
    <GoogleOAuthProvider clientId="314513224847-altt2kms7f2q6e01fdjjqqi3s9al3cf2.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)