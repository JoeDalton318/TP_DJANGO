import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import NavigationBar from './components/NavigationBar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import CompilationPage from './pages/CompilationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attraction/:id" 
          element={
            <ProtectedRoute>
              <AttractionDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compilation" 
          element={
            <ProtectedRoute>
              <CompilationPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;