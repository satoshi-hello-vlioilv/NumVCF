import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ContactEditPage } from './pages/ContactEditPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFormatProfileStore } from './store/formatProfileStore';
import { useContactStore } from './store/contactStore';
import { useUIStore } from './store/uiStore';

export default function App() {
  const loadProfiles = useFormatProfileStore(s => s.loadProfiles);
  const loadContacts = useContactStore(s => s.loadContacts);
  const isDarkMode = useUIStore(s => s.isDarkMode);

  useEffect(() => {
    loadProfiles();
    loadContacts();
  }, [loadProfiles, loadContacts]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

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
