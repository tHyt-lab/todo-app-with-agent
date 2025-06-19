import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ja from "./ja.json";

const resources = {
  ja: {
    translation: ja,
  },
  en: {
    translation: en,
  },
};

// localStorageから言語設定を取得
const getStoredLanguage = (): string => {
  try {
    const storedSettings = localStorage.getItem("todo-app-settings");
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      return settings.language || "ja";
    }
  } catch (error) {
    console.warn("Failed to read language setting from localStorage:", error);
  }
  return "ja";
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(), // 初期言語を設定
    fallbackLng: "ja",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "todo-app-settings",
      caches: [],
    },
  });

export default i18n;
