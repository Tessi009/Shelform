"use client";

import { useLanguage } from "@/contexts/language-context";

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 shadow-sm">
      <button
        onClick={() => setLang("en")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          lang === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => setLang("al")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          lang === "al"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🇦🇱 AL
      </button>
    </div>
  );
}
