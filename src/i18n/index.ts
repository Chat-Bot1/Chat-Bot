import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import common_es from "./locales/es/common.json";
import common_en from "./locales/en/common.json";
import login_es from "./locales/es/login.json";
import login_en from "./locales/en/login.json";
import chat_es from "./locales/es/chat.json";
import chat_en from "./locales/en/chat.json";

i18n
  .use(LanguageDetector) // detecta localStorage, navegador.
  .use(initReactI18next)
  .init({
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    ns: ["common", "login", "chat"],
    defaultNS: "common",
    resources: {
      es: { common: common_es, login: login_es, chat: chat_es },
      en: { common: common_en, login: login_en, chat: chat_en },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "lang", // clave para usar selector
    },
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;