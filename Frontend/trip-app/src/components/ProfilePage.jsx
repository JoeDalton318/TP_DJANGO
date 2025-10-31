// src/pages/ProfilePage.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchProfile, logoutProfile, selectProfile } from '../api/auth';

export default function ProfilePage() {
  const { token, handleLogout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
        setSelectedProfile(data.profile_type); 
      } catch (err) {
        console.error('Erreur chargement profil :', err);
      }
    };

    if (token) loadProfile();
  }, [token]);

  const handleSelect = async () => {
    try {
      const result = await selectProfile(selectedProfile, token);
      alert('Profil sélectionné !');
    } catch (err) {
      console.error('Erreur de sélection du profil', err);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logoutProfile(token);
      handleLogout();
    } catch (err) {
      console.error('Erreur de déconnexion', err);
    }
  };

  if (!token) return <p>Veuillez vous connecter.</p>;

  return (
    <div>
      <h1>Mon profil</h1>
      {profile && (
        <>
          <p>Nom : {profile.username}</p>
          <p>Email : {profile.email}</p>
          <p>Profil actuel : {profile.profile_type}</p>
          <p>Pays : {profile.country}</p>

          <select value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}>
            <option value="tourist">Tourist</option>
            <option value="admin">Admin</option>
          </select>

          <button onClick={handleSelect}>Valider le profil</button>
        </>
      )}
      <br />
      <button onClick={handleLogoutClick}>Se déconnecter</button>
    </div>
  );
}
