// src/components/LandingPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ProfileContext } from '../contexts/ProfileContext';

const LandingPage = () => {
  const { handleLogin } = useContext(AuthContext);
  const { profile, handleSelectProfile } = useContext(ProfileContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    await handleLogin(username, password);
  };

  const onSelectProfile = () => {
    const profile_type = document.getElementById('profile_type').value;
    const selected_country = document.getElementById('selected_country').value;
    handleSelectProfile(profile_type, selected_country);
  };

  return (
    <div>
      <h1>Bienvenue</h1>
      <div>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={onLogin}>Se connecter</button>
      </div>

      {profile ? (
        <div>
          <h2>Profil sélectionné : {profile.profile_type} — {profile.selected_country}</h2>
        </div>
      ) : (
        <div>
          <select id="profile_type">
            <option value="tourist">Tourist</option>
            <option value="local">Local</option>
            <option value="professional">Professional</option>
          </select>
          <input id="selected_country" placeholder="Country" />
          <button onClick={onSelectProfile}>Valider profil</button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
