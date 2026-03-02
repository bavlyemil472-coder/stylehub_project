import i18n from "i18next";
import { initReactI18next } from "react-i18next";
i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
});

const resources = {
  en: {
    translation: {
      home: "Home",
      login: "Login",
      signup: "Sign Up",
    },
  },
  ar: {
    translation: {
      home: "الرئيسية",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
