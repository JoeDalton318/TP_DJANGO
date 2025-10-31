// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LandingPage from '../components/LandingPage';
import AttractionPage from '../components/AttractionPage';
import RegisterPage from '../components/RegisterPage';
import LoginPage from '../components/LoginPage';

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {token && (
          <>
            <Route path="/attractions/:id" element={<AttractionPage />} />
          </>
        )}
        {!token && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
