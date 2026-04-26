import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profiles from './pages/Profiles';
import MyProfile from './pages/MyProfile';
import Membership from './pages/Membership';
import SuccessStories from './pages/SuccessStories';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  return user && isAdmin ? <>{children}</> : <Navigate to="/admin-portal/login" />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public App Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="stories" element={<SuccessStories />} />
              
              {/* Authenticated Routes */}
              <Route path="profiles" element={<PrivateRoute><Profiles /></PrivateRoute>} />
              <Route path="my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
              <Route path="membership" element={<PrivateRoute><Membership /></PrivateRoute>} />
              <Route path="kundali-milan" element={<PrivateRoute><Matches /></PrivateRoute>} />
              <Route path="chats/:partnerId" element={<PrivateRoute><Chat /></PrivateRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin-portal/login" element={<AdminLogin />} />
            <Route path="/admin-portal" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
