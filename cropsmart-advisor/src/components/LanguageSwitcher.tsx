import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

/**
 * Detect the current Google Translate language from the cookie
 * that Google Translate sets: googtrans=/en/xx
 */
const getGoogleTranslateLanguage = (): string => {
  const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
  return match?.[1] ?? "en";
};

/** Persist the farmer's language choice to the backend */
const syncLanguageToBackend = (lang: string) => {
  try {
    const farmerRaw = localStorage.getItem("farmer");
    if (!farmerRaw) return;
    const farmer = JSON.parse(farmerRaw);
    const phone = farmer?.phone;
    if (!phone) return;

    localStorage.setItem("preferredLanguage", lang);

    fetch("http://127.0.0.1:5000/farmer/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, language: lang }),
    }).catch(() => {});
  } catch {
    // ignore
  }
};

const LanguageSwitcher = () => {
  const [showTranslator, setShowTranslator] = useState(false);

  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      const googleWindow = (window as any).google;
      if (!googleWindow?.translate?.TranslateElement) {
        return;
      }

      const translatorRoot = document.getElementById("google_translate_element");
      if (!translatorRoot || translatorRoot.childElementCount > 0) {
        return;
      }

      new googleWindow.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element",
      );
    };

    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).google?.translate?.TranslateElement) {
      (window as any).googleTranslateElementInit();
    }
  }, []);

  useEffect(() => {
    if (!showTranslator) return;
    const initFn = (window as any).googleTranslateElementInit;
    if (typeof initFn === "function") {
      setTimeout(() => initFn(), 0);
    }
  }, [showTranslator]);

  /**
   * Poll for language changes — Google Translate sets a cookie when the
   * user picks a language. We detect changes and sync to backend.
   */
  const onLanguageChange = useCallback(() => {
    const lang = getGoogleTranslateLanguage();
    const prev = localStorage.getItem("preferredLanguage") ?? "en";
    if (lang !== prev) {
      syncLanguageToBackend(lang);
    }
  }, []);

  useEffect(() => {
    // Check on an interval since Google Translate doesn't fire custom events
    const id = setInterval(onLanguageChange, 2000);
    // Also check whenever the dropdown closes
    return () => clearInterval(id);
  }, [onLanguageChange]);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTranslator((prev) => !prev)}
      >
        🌐 Language
      </Button>
      <div
        className={`rounded-md border bg-card p-2 shadow-card ${showTranslator ? "block" : "hidden"}`}
      >
        <div id="google_translate_element" />
      </div>
    </div>
  );
};

export default LanguageSwitcher;
