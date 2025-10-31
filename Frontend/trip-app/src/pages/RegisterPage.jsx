import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Globe, User, Lock, Mail, Eye, EyeOff, Loader, AlertCircle, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
    } else if (formData.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'adresse email est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!formData.password_confirm) {
      errors.password_confirm = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Les mots de passe ne correspondent pas';
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
      await register(formData);
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="display-4 text-primary mb-3">
                <Globe size={60} />
              </div>
              <h1 className="h3 fw-bold text-dark">Créer un compte</h1>
              <p className="text-muted">
                Rejoignez Trip Explorer pour découvrir les meilleures attractions
              </p>
            </div>

            {/* Formulaire d'inscription */}
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
                  <div className="row">
                    {/* Prénom */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label">
                        <User size={16} className="me-1" />
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        className={`form-control ${validationErrors.first_name ? 'is-invalid' : ''}`}
                        placeholder="Votre prénom"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                      {validationErrors.first_name && (
                        <div className="invalid-feedback">
                          {validationErrors.first_name}
                        </div>
                      )}
                    </div>

                    {/* Nom */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label">
                        <User size={16} className="me-1" />
                        Nom
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        className={`form-control ${validationErrors.last_name ? 'is-invalid' : ''}`}
                        placeholder="Votre nom"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                      {validationErrors.last_name && (
                        <div className="invalid-feedback">
                          {validationErrors.last_name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nom d'utilisateur */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <UserPlus size={16} className="me-1" />
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                      placeholder="Choisissez un nom d'utilisateur"
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

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <Mail size={16} className="me-1" />
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                      placeholder="votre.email@exemple.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    {/* Mot de passe */}
                    <div className="col-md-6 mb-3">
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

                    {/* Confirmation mot de passe */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password_confirm" className="form-label">
                        <Lock size={16} className="me-1" />
                        Confirmer
                      </label>
                      <div className="input-group">
                        <input
                          type={showPasswordConfirm ? 'text' : 'password'}
                          id="password_confirm"
                          name="password_confirm"
                          className={`form-control ${validationErrors.password_confirm ? 'is-invalid' : ''}`}
                          placeholder="Confirmez le mot de passe"
                          value={formData.password_confirm}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                          {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {validationErrors.password_confirm && (
                          <div className="invalid-feedback">
                            {validationErrors.password_confirm}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bouton d'inscription */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin me-2" size={16} />
                        Création du compte...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                </form>

                {/* Liens */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Se connecter
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

export default RegisterPage;