import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const base =
    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors";
  const active = "bg-primary text-white";
  const inactive = "text-neutral/70 hover:text-white";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => setLang("sv")}
        className={`${base} ${lang === "sv" ? active : inactive}`}
        aria-pressed={lang === "sv"}
      >
        SV
      </button>
      <button
        type="button"
        onClick={() => setLang("fi")}
        className={`${base} ${lang === "fi" ? active : inactive}`}
        aria-pressed={lang === "fi"}
      >
        FI
      </button>
    </div>
  );
}
