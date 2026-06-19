import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ContactEditPage } from './pages/ContactEditPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFormatProfileStore } from './store/formatProfileStore';

export default function App() {
  const { loadProfiles } = useFormatProfileStore();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />} />
        <Route path="/add" element={<ContactEditPage />} />
        <Route path="/edit/:id" element={<ContactEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
