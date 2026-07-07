"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { en, al } from "@/i18n";
import type { TranslationKeys } from "@/i18n";

type Lang = "en" | "al";

interface LanguageContextType {
  lang: Lang;
  t: TranslationKeys;
  setLang: (lang: Lang) => void;
}

const translations: Record<Lang, TranslationKeys> = { en, al };

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("shelform-lang") as Lang | null;
  if (stored === "en" || stored === "al") return stored;
  return "en";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("shelform-lang", newLang);
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
