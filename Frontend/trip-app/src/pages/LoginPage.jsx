import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Globe, User, Lock, Mail, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirection après connexion
  const from = location.state?.from?.pathname || '/home';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="display-4 text-primary mb-3">
                <Globe size={60} />
              </div>
              <h1 className="h3 fw-bold text-dark">Connexion</h1>
              <p className="text-muted">
                Connectez-vous à votre compte Trip Explorer
              </p>
            </div>

            {/* Formulaire de connexion */}
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {/* Affichage des erreurs globales */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <AlertCircle size={20} className="me-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Nom d'utilisateur */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <User size={16} className="me-1" />
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                      placeholder="Votre nom d'utilisateur"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    {validationErrors.username && (
                      <div className="invalid-feedback">
                        {validationErrors.username}
                      </div>
                    )}
                  </div>

                  {/* Mot de passe */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <Lock size={16} className="me-1" />
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Votre mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bouton de connexion */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin me-2" size={16} />
                        Connexion en cours...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </button>
                </form>

                {/* Liens */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-primary text-decoration-none">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Powered by TripAdvisor API • Développé avec React + Django
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;