import { createContext, useContext, useState, useCallback } from "react";
import { translations, defaultLang } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return defaultLang;
    return localStorage.getItem("vmsport_lang") || defaultLang;
  });

  const changeLang = useCallback((next) => {
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("vmsport_lang", next);
    }
  }, []);

  const t = translations[lang] || translations[defaultLang];

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
