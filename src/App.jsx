import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import RegistrationPage from "./pages/RegistrationPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </LanguageProvider>
  );
}
