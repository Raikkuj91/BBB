import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import RegistrationForm from "../components/RegistrationForm";

export default function RegistrationPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-dark">
      <div className="mx-auto max-w-xl px-5 py-10 sm:py-16">
        <div className="mb-8 flex justify-end">
          <LanguageToggle />
        </div>

        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-light">
            VM Sport
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t.eventTitle}
          </h1>
          <p className="mt-3 text-neutral/80">{t.eventTagline}</p>

          <div className="mt-8 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-5 text-left text-sm sm:text-base">
            <Row label={t.eventDate} />
            <Row label={`${t.eventTime} · ${t.eventLocation}`} />
            <Row label={t.eventPrice} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {submitted ? (
            <div className="py-6 text-center">
              <h2 className="text-2xl font-bold text-white">{t.successTitle}</h2>
              <p className="mt-3 text-neutral/80">{t.successBody}</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-lg border border-white/15 px-4 py-2 font-medium text-white hover:border-white/30"
              >
                {t.registerAnother}
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-bold text-white">
                {t.formTitle}
              </h2>
              <p className="mb-6 text-sm text-neutral/70">{t.formIntro}</p>
              <RegistrationForm onSuccess={() => setSubmitted(true)} />
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-neutral/40">
          VM Sport · Pavis terrass · 20.7.2026
        </p>
      </div>
    </div>
  );
}

function Row({ label }) {
  return (
    <p className="flex items-center gap-2 text-neutral">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-light" />
      {label}
    </p>
  );
}
