// src/components/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { login } from '../api/auth';
import { AuthContext } from '../contexts/AuthContext';

const LoginPage = () => {
  const { handleLogin } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await login(username, password);
      await handleLogin(username, password);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erreur connexion');
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSubmit}>Se connecter</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginPage;
