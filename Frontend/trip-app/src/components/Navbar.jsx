import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/">Accueil</Link> | <Link to="/login">Connexion</Link> | <Link to="/register">Inscription</Link> | <Link to="/profile">Mon profil</Link>
    </nav>
  );
}
