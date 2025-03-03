// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files (ensure these paths match your project structure)
import enCommon from "./locales/en/common.json";
import esCommon from "./locales/es/common.json";

i18n.use(initReactI18next).init({
  fallbackLng: "en", // Fallback language
  lng: "en", // Initial language
  resources: {
    en: { common: enCommon },
    es: { common: esCommon },
  },
  interpolation: {
    escapeValue: false, // React already protects from xss
  },
});

export default i18n;
