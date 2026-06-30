import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const STORAGE_KEY = "vmsport_admin_pw";

export default function AdminPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([]);

  async function fetchParticipants(pw) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-participants", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError(t.adminLoginError);
        setAuthed(false);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (!res.ok) throw new Error("request_failed");
      const data = await res.json();
      setParticipants(data.participants || []);
      setAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, pw);
    } catch {
      setError(t.errorBody);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      fetchParticipants(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    fetchParticipants(password);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPassword("");
    setParticipants([]);
  }

  const totalPeople = participants.reduce(
    (sum, p) => sum + (Number(p.partySize) || 0),
    0
  );

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark px-5">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          <h1 className="mb-6 text-center text-2xl font-bold text-white">
            {t.adminTitle}
          </h1>
          <label className="mb-1.5 block text-sm font-medium text-neutral">
            {t.adminPasswordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-light disabled:opacity-60"
          >
            {loading ? t.adminLoading : t.adminLogin}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{t.adminTitle}</h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fetchParticipants(password)}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-white/30"
            >
              {t.adminRefresh}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-white/30"
            >
              {t.adminLogout}
            </button>
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral">
          <span>{t.adminTotal}:</span>
          <span className="font-bold text-white">{totalPeople}</span>
        </div>

        {loading ? (
          <p className="text-neutral/70">{t.adminLoading}</p>
        ) : participants.length === 0 ? (
          <p className="text-neutral/70">{t.adminEmpty}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/5 text-neutral/70">
                <tr>
                  <Th>{t.colName}</Th>
                  <Th>{t.colEmail}</Th>
                  <Th>{t.colPhone}</Th>
                  <Th>{t.colGroup}</Th>
                  <Th>{t.colPartySize}</Th>
                  <Th>{t.colAllergies}</Th>
                  <Th>{t.colTime}</Th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t border-white/10 text-neutral hover:bg-white/[0.03]"
                  >
                    <Td>{p.name}</Td>
                    <Td>{p.email}</Td>
                    <Td>{p.phone}</Td>
                    <Td>{p.group}</Td>
                    <Td>{p.partySize}</Td>
                    <Td>{p.allergies}</Td>
                    <Td>{p.timestamp}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
