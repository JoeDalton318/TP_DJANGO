# 📦 Guide d'Installation - Trip Explorer

Guide détaillé pour installer et configurer le projet Trip Explorer sur votre machine.

## 🔍 Prérequis

### Logiciels requis

| Logiciel | Version minimale | Commande de vérification |
|----------|------------------|-------------------------|
| Python | 3.13+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.0+ | `git --version` |

### Compte TripAdvisor Developer

1. Créer un compte sur https://www.tripadvisor.com/developers
2. Créer une nouvelle application
3. Copier votre clé API (gratuite)

## 🚀 Installation pas à pas

### Étape 1 : Cloner le repository

```bash
# Cloner le projet
git clone https://github.com/JoeDalton318/TP_DJANGO.git

# Accéder au dossier
cd TP_DJANGO
```

### Étape 2 : Configuration Backend (Django)

#### 2.1 Créer l'environnement virtuel

**Windows (PowerShell) :**
```powershell
python -m venv trip-app-venv
.\trip-app-venv\Scripts\Activate.ps1
```

**Windows (CMD) :**
```cmd
python -m venv trip-app-venv
.\trip-app-venv\Scripts\activate.bat
```

**Linux / macOS :**
```bash
python3 -m venv trip-app-venv
source trip-app-venv/bin/activate
```

#### 2.2 Installer les dépendances Python

```bash
cd Backend
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2.3 Configurer les variables d'environnement

Créer le fichier `Backend/.env` :

```env
# API TripAdvisor (OBLIGATOIRE)
TRIPADVISOR_API_KEY=votre_cle_api_ici

# Django Settings (Optionnel - déjà définis dans settings.py)
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### 2.4 Initialiser la base de données

```bash
# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser
```

#### 2.5 Lancer le serveur Django

```bash
python manage.py runserver
```

Le backend sera accessible sur : **http://127.0.0.1:8000**

✅ **Test** : Ouvrir http://127.0.0.1:8000/api/attractions/popular/ dans votre navigateur

### Étape 3 : Configuration Frontend (React)

#### 3.1 Installer les dépendances Node.js

**Dans un NOUVEAU terminal** (laisser Django tourner) :

```bash
cd Frontend/trip-app
npm install
```

#### 3.2 Configurer les variables d'environnement

Créer le fichier `Frontend/trip-app/.env` :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

#### 3.3 Lancer le serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

✅ **Test** : Ouvrir http://localhost:5173 dans votre navigateur

## ✅ Vérification de l'installation

### Backend (Django)

```bash
# Dans le terminal Backend
python manage.py check
```

Résultat attendu : `System check identified no issues`

### Frontend (React)

```bash
# Dans le terminal Frontend
npm run build
```

Résultat attendu : Build réussi sans erreurs

## 🧪 Tests

### Tests Backend

```bash
cd Backend
pytest
# ou
python manage.py test
```

### Tests Frontend

```bash
cd Frontend/trip-app
npm run test
```

## 🔧 Configuration avancée

### Changer le port du backend

Dans `Backend/trip_app/settings.py`, ajouter :

```python
# settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']
```

Puis lancer :
```bash
python manage.py runserver 0.0.0.0:8080
```

### Changer le port du frontend

Dans `Frontend/trip-app/vite.config.js` :

```javascript
export default defineConfig({
  server: {
    port: 3000, // Au lieu de 5173
  },
});
```

## 🐛 Résolution de problèmes

### Erreur : `Module not found`

**Backend :**
```bash
pip install -r requirements.txt --force-reinstall
```

**Frontend :**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : `CORS policy`

Vérifier dans `Backend/trip_app/settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Erreur : `TripAdvisor API 401`

- Vérifier que `TRIPADVISOR_API_KEY` est défini dans `.env`
- Vérifier que la clé API est valide sur https://www.tripadvisor.com/developers
- Redémarrer le serveur Django après modification du `.env`

### Erreur : `Port already in use`

**Backend (port 8000) :**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

**Frontend (port 5173) :**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5173 | xargs kill -9
```

### Base de données corrompue

```bash
cd Backend
rm db.sqlite3
python manage.py migrate
```

## 📚 Prochaines étapes

1. ✅ Installer et lancer le projet
2. 📝 Créer un compte utilisateur
3. 🎯 Sélectionner un type de profil
4. 🔍 Rechercher des attractions
5. 📋 Créer votre première compilation
6. 🗺️ Visualiser sur la carte interactive

## 💡 Conseils

- Toujours activer l'environnement virtuel avant de travailler sur le backend
- Garder deux terminaux ouverts (un pour Django, un pour React)
- Utiliser `python manage.py check` régulièrement pour détecter les problèmes
- Consulter la console du navigateur (F12) pour les erreurs frontend
- Les logs Django sont affichés dans le terminal du backend

## 🆘 Support

En cas de problème :
1. Vérifier les logs dans les terminaux
2. Consulter le fichier `README.md`
3. Ouvrir une issue sur GitHub
4. Contacter [@JoeDalton318](https://github.com/JoeDalton318)

## 📝 Notes

- Le fichier `db.sqlite3` est ignoré par Git (données locales)
- Les migrations Django sont versionnées
- Les `node_modules` sont ignorés par Git (réinstaller avec `npm install`)
- Le fichier `.env` n'est PAS versionné (sécurité)
