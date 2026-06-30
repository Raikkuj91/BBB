import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  group: "MTB",
  partySize: 1,
  allergies: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistrationForm({ onSuccess }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [serverError, setServerError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = t.errorRequired;
    if (!form.email.trim()) next.email = t.errorRequired;
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t.errorEmail;
    const size = Number(form.partySize);
    if (!size || size < 1 || size > 4) next.partySize = t.errorPartySize;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "request_failed");
      }
      setStatus("idle");
      setForm(initialForm);
      onSuccess?.();
    } catch {
      setStatus("error");
      setServerError(t.errorBody);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-neutral/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <label className={labelClass} htmlFor="name">
          {t.name} <span className="text-primary-light">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={t.namePlaceholder}
          className={inputClass}
          autoComplete="name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          {t.email} <span className="text-primary-light">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder={t.emailPlaceholder}
          className={inputClass}
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          {t.phone}
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder={t.phonePlaceholder}
          className={inputClass}
          autoComplete="tel"
        />
      </div>

      <div>
        <span className={labelClass}>{t.group}</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "MTB", label: t.groupMtb },
            { value: "Landsväg", label: t.groupRoad },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("group", opt.value)}
              className={`rounded-lg border px-4 py-2.5 font-medium transition-colors ${
                form.group === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-white/15 bg-white/5 text-neutral hover:border-white/30"
              }`}
              aria-pressed={form.group === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="partySize">
          {t.partySize} <span className="text-primary-light">*</span>
        </label>
        <select
          id="partySize"
          value={form.partySize}
          onChange={(e) => update("partySize", Number(e.target.value))}
          className={inputClass}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n} className="bg-dark">
              {n}
            </option>
          ))}
        </select>
        {errors.partySize && (
          <p className="mt-1 text-sm text-red-400">{errors.partySize}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="allergies">
          {t.allergies}
        </label>
        <textarea
          id="allergies"
          rows={3}
          value={form.allergies}
          onChange={(e) => update("allergies", e.target.value)}
          placeholder={t.allergiesPlaceholder}
          className={inputClass}
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
