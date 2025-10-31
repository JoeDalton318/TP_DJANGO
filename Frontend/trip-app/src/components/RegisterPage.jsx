// src/components/RegisterPage.jsx
import React, { useState } from 'react';
import { register } from '../api/auth';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const data = await register(username, password, email);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur inscription');
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleRegister}>S’enregistrer</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;
