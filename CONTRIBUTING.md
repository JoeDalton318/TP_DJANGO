# 🤝 Guide de Contribution - Trip Explorer

Merci de votre intérêt pour contribuer à Trip Explorer ! Ce document vous guide pour contribuer efficacement au projet.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Structure du projet](#structure-du-projet)
- [Standards de code](#standards-de-code)
- [Processus de développement](#processus-de-développement)
- [Tests](#tests)
- [Documentation](#documentation)

## 🤝 Code de conduite

Ce projet suit les principes de respect, d'inclusion et de collaboration. Nous attendons de tous les contributeurs qu'ils :

- Soient respectueux et constructifs
- Acceptent les critiques constructives
- Se concentrent sur ce qui est le mieux pour la communauté
- Fassent preuve d'empathie envers les autres

## 🚀 Comment contribuer

### Signaler un bug

1. Vérifier que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/JoeDalton318/TP_DJANGO/issues)
2. Créer une nouvelle issue avec le label `bug`
3. Inclure :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs comportement actuel
   - Captures d'écran si applicable
   - Environnement (OS, navigateur, versions)

### Proposer une fonctionnalité

1. Créer une issue avec le label `enhancement`
2. Décrire :
   - Le problème que cela résout
   - La solution proposée
   - Les alternatives considérées
   - Exemples d'utilisation

### Soumettre un Pull Request

1. **Fork** le repository
2. **Créer une branche** depuis `main` :
   ```bash
   git checkout -b feature/nom-fonctionnalite
   # ou
   git checkout -b fix/nom-bug
   ```
3. **Développer** votre contribution
4. **Tester** vos modifications
5. **Commit** avec des messages clairs
6. **Push** vers votre fork
7. Ouvrir un **Pull Request** vers `main`

## 🏗️ Structure du projet

```
TP_DJANGO/
├── Backend/                 # Django REST API
│   ├── attractions/        # App attractions
│   ├── compilation/        # App compilation
│   ├── users/             # App utilisateurs
│   └── trip_app/          # Config Django
│
├── Frontend/trip-app/      # React Application
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages complètes
│   │   ├── services/      # API client
│   │   └── contexts/      # Contextes React
│   └── public/            # Assets statiques
│
└── docs/                   # Documentation
```

## 📝 Standards de code

### Backend (Python/Django)

- **Style** : PEP 8
- **Linter** : Flake8 ou Black
- **Docstrings** : Google style
- **Type hints** : Recommandés pour les fonctions publiques

**Exemple :**
```python
def get_popular_attractions(country: str, limit: int = 10) -> list[dict]:
    """
    Récupère les attractions populaires d'un pays.
    
    Args:
        country: Nom du pays
        limit: Nombre maximum de résultats
        
    Returns:
        Liste de dictionnaires contenant les attractions
        
    Raises:
        ValueError: Si le pays n'est pas trouvé
    """
    pass
```

### Frontend (JavaScript/React)

- **Style** : ESLint + Prettier
- **Composants** : Functional components avec hooks
- **Props** : PropTypes ou TypeScript
- **Nommage** : 
  - Composants : PascalCase
  - Fichiers : PascalCase pour composants
  - Variables/fonctions : camelCase

**Exemple :**
```javascript
/**
 * Composant pour afficher une carte d'attraction
 * @param {Object} props
 * @param {Object} props.attraction - Données de l'attraction
 * @param {Function} props.onClick - Callback au clic
 */
export default function AttractionCard({ attraction, onClick }) {
  // Logique du composant
}
```

### Git Commits

Format : `<type>(<scope>): <description>`

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

**Exemples :**
```
feat(attractions): add filter by price range
fix(compilation): correct distance calculation
docs(readme): update installation instructions
refactor(api): simplify TripAdvisor service
```

## 🔧 Processus de développement

### Configuration de l'environnement

1. Cloner votre fork :
```bash
git clone https://github.com/VOTRE_USERNAME/TP_DJANGO.git
cd TP_DJANGO
```

2. Ajouter le remote upstream :
```bash
git remote add upstream https://github.com/JoeDalton318/TP_DJANGO.git
```

3. Installer les dépendances (voir `INSTALLATION.md`)

### Workflow de développement

1. **Sync avec upstream** :
```bash
git checkout main
git pull upstream main
```

2. **Créer une branche** :
```bash
git checkout -b feature/ma-fonctionnalite
```

3. **Développer et tester** :
```bash
# Backend
python manage.py test
pytest

# Frontend
npm run test
npm run build
```

4. **Commit et push** :
```bash
git add .
git commit -m "feat(scope): description"
git push origin feature/ma-fonctionnalite
```

5. **Ouvrir un Pull Request** sur GitHub

### Checklist avant PR

- [ ] Code testé localement
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Documentation mise à jour
- [ ] Commits clairs et descriptifs
- [ ] Code conforme aux standards
- [ ] Pas de conflits avec `main`
- [ ] Screenshot/GIF si changement UI

## 🧪 Tests

### Backend

```bash
cd Backend

# Tous les tests
python manage.py test

# Tests spécifiques
python manage.py test attractions.tests
python manage.py test users.tests.test_auth

# Avec coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend

```bash
cd Frontend/trip-app

# Tous les tests
npm run test

# Mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Tests d'intégration

```bash
# Lancer backend ET frontend
# Tester manuellement les flows utilisateur :
# - Inscription/Connexion
# - Recherche d'attractions
# - Ajout à la compilation
# - Visualisation carte
# - Gestion profil
```

## 📚 Documentation

### Code

- Commenter le "pourquoi", pas le "comment"
- Docstrings pour toutes les fonctions publiques
- JSDoc pour les composants React
- README dans chaque app Django

### API

- Documenter les endpoints dans `README.md`
- Exemples de requêtes/réponses
- Codes d'erreur possibles

### UI/UX

- Screenshots des nouvelles fonctionnalités
- GIFs animés pour les interactions
- Descriptions des flows utilisateur

## 🎨 Conventions UI

### Design System

- **Framework** : Bootstrap 5.3.8
- **Icônes** : Lucide React
- **Couleurs** :
  - Primary : Bleu (`#0d6efd`)
  - Success : Vert (`#198754`)
  - Warning : Orange (`#ffc107`)
  - Danger : Rouge (`#dc3545`)

### Composants

- Utiliser React Bootstrap quand possible
- Custom components dans `src/components/`
- Styles dans fichiers `.css` séparés ou styled-components

### Responsive

- Mobile-first approach
- Breakpoints Bootstrap (xs, sm, md, lg, xl)
- Tester sur différents devices

## 🔒 Sécurité

### Signaler une vulnérabilité

**NE PAS** créer d'issue publique. Envoyer un email à :
- **Email** : joedolton318@gmail.com (à remplacer)
- **Sujet** : [SECURITY] Description brève

Inclure :
- Description de la vulnérabilité
- Étapes pour reproduire
- Impact potentiel
- Suggestions de correction

### Best Practices

- Pas de secrets dans le code (utiliser `.env`)
- Valider toutes les entrées utilisateur
- Échapper les données avant affichage
- HTTPS en production
- Tokens JWT sécurisés

## 📞 Contact

### Mainteneur

- **GitHub** : [@JoeDalton318](https://github.com/JoeDalton318)
- **Email** : (votre email)

### Communication

- **Issues** : Questions techniques, bugs
- **Discussions** : Idées, suggestions générales
- **Pull Requests** : Contributions de code

## 🎉 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible !

### Comment être listé

Contribuez au projet et vous serez automatiquement ajouté à la liste des contributeurs sur GitHub.

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

---

**Merci de contribuer à Trip Explorer ! 🌍✈️**
