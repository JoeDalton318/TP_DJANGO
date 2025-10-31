// src/pages/LoginPage.jsx
import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { loginUser } from '../api/auth';

export default function LoginPage() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async ({ username, password }) => {
    try {
      // ✅ Passe les données comme un objet, pas des arguments séparés
      const data = await loginUser({ username, password });

      console.log('✅ Connexion réussie', data);
      setMessage('Connexion réussie !');
      setError(null);

      // Stockage local des tokens JWT
      if (data.access) localStorage.setItem('access', data.access);
      if (data.refresh) localStorage.setItem('refresh', data.refresh);
    } catch (err) {
      console.error('❌ Erreur connexion :', err);
      setError(err.message || 'Erreur de connexion');
      setMessage(null);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <LoginForm onLogin={handleLogin} />
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
