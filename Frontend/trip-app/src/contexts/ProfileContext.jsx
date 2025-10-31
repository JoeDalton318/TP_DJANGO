// src/contexts/ProfileContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile, selectProfile } from '../api/profile';
import { AuthContext } from './AuthContext';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    if (token) {
      const data = await getProfile(token);
      setProfile(data);
    }
  };

  const handleSelectProfile = async (profile_type, selected_country) => {
    if (token) {
      const data = await selectProfile(token, profile_type, selected_country);
      setProfile(data.data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  return (
    <ProfileContext.Provider value={{ profile, handleSelectProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
