import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, isProfileSet } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isAuthenticated() && isProfileSet()) {
      navigate('/home');
    } else if (isAuthenticated()) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={handleHomeClick}>
          🌍 TripExplorer
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated() && isProfileSet() && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`} 
                    to="/home"
                  >
                    🏠 Accueil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`} 
                    to="/search"
                  >
                    🔍 Recherche
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/compilation' ? 'active' : ''}`} 
                    to="/compilation"
                  >
                    ⭐ Ma Compilation
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated() ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="navbarDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  👤 {user?.username || 'Utilisateur'}
                  {profile && (
                    <small className="ms-2 badge bg-light text-dark">
                      {profile.name}
                    </small>
                  )}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/">
                      👤 Profil
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      🚪 Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} 
                    to="/login"
                  >
                    🔑 Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} 
                    to="/register"
                  >
                    📝 Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;