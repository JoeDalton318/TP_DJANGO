import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';

const TestWrapper = ({ children }) => (
  <AuthProvider>
    <ProfileProvider>
      {children}
    </ProfileProvider>
  </AuthProvider>
);

export default TestWrapper;
