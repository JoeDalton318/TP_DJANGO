import { useState } from 'react';

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Tourist');
  const [country, setCountry] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ username, password, role, country });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="off"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Tourist">Tourist</option>
        <option value="Admin">Admin</option>
      </select>
      <input
        type="text"
        placeholder="Pays"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        autoComplete="off"
      />
      <button type="submit">S'inscrire</button>
    </form>
  );
}
