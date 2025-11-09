import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GeneratePage from './pages/GeneratePage';
import CreditsPage from './pages/CreditsPage';
import MyImagesPage from './pages/MyImagesPage';
import AdminPage from './pages/AdminPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg">
          <Header />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
              <Route path="/credits" element={<ProtectedRoute><CreditsPage /></ProtectedRoute>} />
              <Route path="/images" element={<ProtectedRoute><MyImagesPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></Route>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;