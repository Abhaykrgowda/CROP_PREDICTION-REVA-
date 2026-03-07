import { useI18n, languageNames, type Language } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const languages: Language[] = ["en", "hi", "kn"];

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="glass rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageNames[lang]}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 glass-strong rounded-lg overflow-hidden min-w-[140px] shadow-lg">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                lang === l
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {languageNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
