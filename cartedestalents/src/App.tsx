import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProvider } from '@/contexts/StudentContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { TalentsPage } from '@/pages/TalentsPage';
import { AddProfilePage } from '@/pages/AddProfilePage';
import { ProfileDetailsPage } from '@/pages/ProfileDetailsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { EditProfilePage } from '@/pages/EditProfilePage';
import { InboxPage } from '@/pages/InboxPage';

/**
 * Composant principal de l'application
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <StudentProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/talents" element={<TalentsPage />} />
                <Route path="/add" element={<AddProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/profile/:id" element={<ProfileDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </StudentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
