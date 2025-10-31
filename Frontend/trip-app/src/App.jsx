import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProfileProvider, useUserProfile } from './contexts/UserProfileContext';
import { CompilationProvider } from './contexts/CompilationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import CompilationPage from './pages/CompilationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Composant pour protéger les routes qui nécessitent une authentification
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Composant pour protéger les routes qui nécessitent un profil utilisateur
const ProfileProtectedRoute = ({ children }) => {
  const { isProfileSet } = useUserProfile();
  
  if (!isProfileSet()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Composant pour rediriger les utilisateurs connectés depuis les pages publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Composant principal de l'application
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques (pour utilisateurs non connectés) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        
        {/* Page d'atterrissage (accessible aux utilisateurs connectés pour la sélection de profil) */}
        <Route 
          path="/" 
          element={
            <AuthenticatedRoute>
              <LandingPage />
            </AuthenticatedRoute>
          } 
        />
        
        {/* Routes protégées (nécessitent authentification + profil) */}
        <Route 
          path="/home" 
          element={
            <AuthenticatedRoute>
              <ProfileProtectedRoute>
                <HomePage />
              </ProfileProtectedRoute>
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <AuthenticatedRoute>
              <ProfileProtectedRoute>
                <SearchPage />
              </ProfileProtectedRoute>
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/attraction/:id" 
          element={
            <AuthenticatedRoute>
              <ProfileProtectedRoute>
                <AttractionDetailPage />
              </ProfileProtectedRoute>
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/compilation" 
          element={
            <AuthenticatedRoute>
              <ProfileProtectedRoute>
                <CompilationPage />
              </ProfileProtectedRoute>
            </AuthenticatedRoute>
          } 
        />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// App principal avec providers
function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <CompilationProvider>
          <AppRoutes />
        </CompilationProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}

export default App;