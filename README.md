# 🌍 Trip Explorer

Application web complète de planification de voyages avec intégration de l'API TripAdvisor. Permet aux utilisateurs de rechercher, sauvegarder et organiser des attractions touristiques dans une compilation personnalisée avec carte interactive.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Système de profils](#-système-de-profils)
- [Contributeurs](#-contributeurs)

## ✨ Fonctionnalités

### Authentification & Profils
- 🔐 Inscription et connexion avec JWT
- 👤 Gestion de profil (modification email, nom d'utilisateur, mot de passe)
- 🎯 Trois types de profils : Touriste, Local, Professionnel
- 🏆 Système de badges selon le type de profil

### Recherche d'attractions
- 🔍 Recherche multi-critères (pays, ville, catégorie, note, prix)
- 🌟 Affichage d'attractions populaires
- 📱 Interface responsive avec filtres avancés
- 🖼️ Galerie photos pour chaque attraction
- ⭐ Avis et notes TripAdvisor

### Compilation personnalisée
- 📋 Sauvegarde d'attractions favorites
- 🗺️ Carte interactive avec React-Leaflet
- 📍 Itinéraire visuel avec marqueurs numérotés
- 💰 Calcul automatique du budget total
- 📏 Estimation de la distance du parcours
- 🚫 Limites selon le type de profil (30/50/100 attractions)

### Système multi-tier
- **🎒 Touriste** : 30 attractions max
- **🏡 Local** : 50 attractions max  
- **💼 Professionnel** : 100 attractions max

## 🛠️ Technologies

### Backend
- **Django 5.2.7** - Framework web Python
- **Django REST Framework 3.15.2** - API REST
- **SimpleJWT 5.5.1** - Authentification JWT
- **django-cors-headers 4.6.0** - Gestion CORS
- **requests 2.32.4** - Appels API externes
- **python-dotenv 1.1.1** - Variables d'environnement

### Frontend
- **React 19.1.1** - Interface utilisateur
- **React Router DOM 7.9.5** - Navigation
- **Bootstrap 5.3.8** - Framework CSS
- **React-Leaflet 5.0.0** - Cartes interactives
- **Leaflet 1.9.4** - Bibliothèque de cartographie
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes
- **Vite** - Build tool

### API Externe
- **TripAdvisor Content API v1** - Données d'attractions, photos, avis

## 🏗️ Architecture

```
TP_DJANGO/
├── Backend/                    # API Django
│   ├── attractions/           # App attractions (recherche, détails)
│   ├── compilation/           # App compilation (sauvegarde)
│   ├── users/                 # App utilisateurs (auth, profils)
│   ├── services/              # Services externes (TripAdvisor)
│   ├── trip_app/              # Configuration Django
│   ├── manage.py
│   └── requirements.txt
│
├── Frontend/trip-app/         # Application React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages principales
│   │   ├── services/         # API client
│   │   ├── contexts/         # Contextes React
│   │   └── styles/           # Styles CSS
│   ├── package.json
│   └── vite.config.js
│
└── trip-app-venv/            # Environnement virtuel Python

```

## 📦 Installation

### Prérequis
- Python 3.13+
- Node.js 18+
- npm ou yarn
- Clé API TripAdvisor (gratuite sur https://www.tripadvisor.com/developers)

### 1. Cloner le projet

```bash
git clone https://github.com/JoeDalton318/TP_DJANGO.git
cd TP_DJANGO
```

### 2. Configuration Backend

```bash
# Créer et activer l'environnement virtuel
python -m venv trip-app-venv
.\trip-app-venv\Scripts\activate  # Windows
# source trip-app-venv/bin/activate  # Linux/Mac

# Installer les dépendances
cd Backend
pip install -r requirements.txt

# Créer le fichier .env
echo "TRIPADVISOR_API_KEY=your_api_key_here" > .env

# Créer la base de données
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 3. Configuration Frontend

```bash
# Dans un nouveau terminal
cd Frontend/trip-app

# Installer les dépendances
npm install

# Créer le fichier .env
echo "VITE_API_BASE_URL=http://127.0.0.1:8000/api" > .env

# Lancer le serveur de développement
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement Backend (.env)

```env
# API TripAdvisor
TRIPADVISOR_API_KEY=your_api_key_here

# Django (optionnel)
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Variables d'environnement Frontend (.env)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## 🚀 Utilisation

1. **Accéder à l'application** : http://localhost:5173
2. **S'inscrire** avec un compte
3. **Sélectionner un type de profil** (Touriste/Local/Professionnel)
4. **Rechercher des attractions** par pays, ville ou critères
5. **Ajouter à la compilation** via le bouton ❤️
6. **Voir la carte interactive** dans "Ma Compilation"
7. **Gérer son profil** dans la page Profil

## 📁 Structure du projet

### Backend - Apps Django

#### `attractions/`
- **Modèles** : Attraction, Award, Photo, Suggestion
- **Views** : SearchView, DetailView, PopularView, PhotosView, ReviewsView
- **Services** : TripAdvisorService (recherche multi-villes)
- **URLs** : `/api/attractions/*`

#### `compilation/`
- **Modèles** : Compilation (M2M avec Attraction)
- **Views** : CompilationViewSet (CRUD)
- **Utils** : Calcul budget, distance
- **URLs** : `/api/compilation/*`

#### `users/`
- **Modèles** : User, UserProfile
- **Views** : RegisterView, LoginView, ProfileViewSet
- **Serializers** : UserSerializer avec limites de compilation
- **Logic** : profile_logic.py (tiered system)
- **URLs** : `/api/users/*`

### Frontend - Composants React

#### Pages principales
- `LandingPage.jsx` - Page d'accueil publique
- `LoginPage.jsx` - Connexion
- `RegisterPage.jsx` - Inscription
- `HomePage.jsx` - Tableau de bord
- `SearchPage.jsx` - Recherche avancée
- `AttractionDetailPage.jsx` - Détails d'une attraction
- `CompilationPage.jsx` - Ma compilation + carte
- `ProfilePage.jsx` - Gestion du profil

#### Composants
- `NavigationBar.jsx` - Menu de navigation
- `AttractionCard.jsx` - Carte d'attraction
- `ReviewCard.jsx` - Carte d'avis
- `CompilationMap.jsx` - Carte Leaflet interactive
- `Pagination.jsx` - Pagination

## 🌐 API Endpoints

### Authentification
```
POST   /api/users/register/           # Inscription
POST   /api/users/login/              # Connexion
POST   /api/users/logout/             # Déconnexion
POST   /api/users/token/refresh/      # Refresh token
```

### Profil
```
GET    /api/users/profile/me/         # Profil actuel
POST   /api/users/profile/select_profile/  # Changer type
PUT    /api/users/profile/update_info/     # Modifier infos
POST   /api/users/profile/change_password/ # Changer mot de passe
```

### Attractions
```
GET    /api/attractions/search/       # Recherche
GET    /api/attractions/popular/      # Attractions populaires
GET    /api/attractions/nearby/       # À proximité
GET    /api/attractions/{id}/         # Détails
GET    /api/attractions/{id}/photos/  # Photos
GET    /api/attractions/{id}/reviews/ # Avis
GET    /api/attractions/categories/   # Liste catégories
GET    /api/attractions/countries/    # Liste pays
```

### Compilation
```
GET    /api/compilation/              # Ma compilation
POST   /api/compilation/add/          # Ajouter attraction
DELETE /api/compilation/{id}/remove/  # Retirer attraction
```

## 👥 Système de profils

### 🎒 Touriste
- **Limite** : 30 attractions
- **Badge** : Bleu
- **Icône** : 🎒
- **Usage** : Voyageurs occasionnels

### 🏡 Local
- **Limite** : 50 attractions
- **Badge** : Vert
- **Icône** : 🏡
- **Usage** : Résidents locaux, guides amateurs

### 💼 Professionnel
- **Limite** : 100 attractions
- **Badge** : Or
- **Icône** : 💼
- **Usage** : Agences de voyage, tour opérateurs

## 🧪 Tests

### Backend
```bash
cd Backend
pytest
```

### Frontend
```bash
cd Frontend/trip-app
npm run test
```

## 📝 Notes de développement

### Stratégie multi-villes
L'API TripAdvisor limite les résultats à ~10 par recherche. Pour contourner cette limite, le système effectue des recherches sur 4 villes majeures par pays et déduplique les résultats par `location_id`.

### Caching
- Attractions populaires : 12h
- Détails d'attraction : 6h
- Photos : 24h
- Avis : 1h

### Sécurité
- JWT avec refresh token
- Validation côté serveur de toutes les entrées
- CORS configuré pour le frontend
- Limites de profil appliquées côté backend

## 👨‍💻 Contributeurs

- **Joe Dalton** - Développeur principal
- GitHub: [@JoeDalton318](https://github.com/JoeDalton318)

## 📄 Licence

Ce projet est un travail académique. Tous droits réservés.

## 🙏 Remerciements

- API TripAdvisor pour les données d'attractions
- Django & React communities
- Bootstrap & Leaflet pour les composants UI