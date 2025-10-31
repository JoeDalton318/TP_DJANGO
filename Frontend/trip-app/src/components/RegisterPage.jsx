// src/pages/RegisterPage.jsx
import { useState } from 'react';
import RegisterForm from './RegisterForm';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    try {
      const result = await registerUser(formData);
      console.log('✅ Inscription réussie', result);
      setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setError(null);
    } catch (err) {
      console.error('❌ Erreur inscription :', err);
      setError(err.message);
      setMessage(null);
    }
  };

  return (
    <div>
      <h1>Créer un compte</h1>
      <RegisterForm onRegister={handleRegister} />
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
