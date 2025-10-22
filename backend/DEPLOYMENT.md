# Guide de Déploiement Backend - Configuration

## 📋 Vue d'ensemble

Ce backend utilise des variables d'environnement (fichier `.env`) pour la configuration. Cela permet de changer facilement entre développement et production.

## 🔧 Configuration Initiale

### 1. Créer le fichier .env

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

### 2. Configuration pour le Développement Local

Le fichier `.env.example` est déjà configuré pour le développement local. Vérifiez simplement ces valeurs :

```bash
# Backend écoute sur le port 4000
PORT=4000

# Frontend sur le port 4200 (Angular par défaut)
FRONTEND_URL="http://localhost:4200"

# Environnement de développement
NODE_ENV="development"
```

### 3. Configuration pour la Production

Pour déployer en production, modifiez votre fichier `.env` :

```bash
# ==========================
# DOMAINES PRODUCTION
# ==========================
# ⚠️ À MODIFIER avec votre domaine réel
FRONTEND_URL="https://fpbg.singcloud.ga"

# Port (souvent 4000, ou 80/443 si vous utilisez un reverse proxy)
PORT=4000

# Environnement
NODE_ENV="production"

# ==========================
# SÉCURITÉ - TRÈS IMPORTANT !
# ==========================
# ⚠️ Générez une clé JWT forte et unique pour la production
JWT_SECRET="votre_cle_secrete_tres_longue_et_aleatoire_ici_123456"

# ==========================
# BASE DE DONNÉES
# ==========================
# Utilisez votre URL de base de données de production
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# ==========================
# SMTP (Envoi d'emails)
# ==========================
SMTP_HOST="mail.starget.tech"
SMTP_PORT="465"
SMTP_USER="no-reply-fpbg@singcloud.ga"
SMTP_PASS="votre_mot_de_passe_smtp_production"
```

## 🔐 Génération d'un JWT Secret Fort

Pour générer une clé JWT sécurisée :

### Option 1 : Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Option 2 : OpenSSL
```bash
openssl rand -hex 64
```

### Option 3 : En ligne
Utilisez un générateur comme : https://www.random.org/strings/

⚠️ **IMPORTANT** : Ne partagez JAMAIS votre `JWT_SECRET` de production !

## 🌐 Configuration CORS

Le backend doit autoriser les requêtes depuis votre frontend. Vérifiez dans votre fichier de configuration CORS (généralement `src/index.ts` ou `src/app.ts`) :

```typescript
app.use(cors({
  origin: [
    'http://localhost:4200',              // Développement
    'https://fpbg.singcloud.ga',          // Production
    'https://www.fpbg.singcloud.ga',      // Production avec www
    // Ajoutez d'autres domaines si nécessaire
  ],
  credentials: true
}));
```

## 📁 Structure des Variables d'Environnement

| Variable | Description | Exemple (dev) | Exemple (prod) |
|----------|-------------|---------------|----------------|
| `DATABASE_URL` | URL de connexion PostgreSQL | Neon DB | Votre DB prod |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `test_secret` | Clé forte aléatoire |
| `SMTP_HOST` | Serveur SMTP pour les emails | `mail.starget.tech` | Votre serveur SMTP |
| `SMTP_PORT` | Port SMTP | `465` | `465` ou `587` |
| `SMTP_USER` | Utilisateur SMTP | `no-reply@...` | Votre email |
| `SMTP_PASS` | Mot de passe SMTP | - | Votre mot de passe |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:4200` | `https://fpbg.singcloud.ga` |
| `PORT` | Port du serveur backend | `4000` | `4000` |
| `NODE_ENV` | Environnement d'exécution | `development` | `production` |

## 🚀 Démarrage

### Développement

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (si nécessaire)
npx prisma migrate deploy

# Démarrer en mode développement
npm run dev
```

### Production

```bash
# Installer les dépendances (sans dev dependencies)
npm install --production

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Build du projet TypeScript (si applicable)
npm run build

# Démarrer le serveur
npm start
```

## 🔄 Synchronisation Frontend ↔ Backend

### Configuration Complète

#### 1. Frontend (environment.prod.ts)
```typescript
const API_DOMAIN = 'api.fpbg.singcloud.ga';  // Domaine de votre API
const API_PROTOCOL = 'https';
const API_PORT = '';
// Résultat: https://api.fpbg.singcloud.ga/api
```

#### 2. Backend (.env)
```bash
# Le frontend qui fera les requêtes
FRONTEND_URL="https://fpbg.singcloud.ga"

# Port du backend (si derrière un reverse proxy, peut être différent)
PORT=4000
```

#### 3. CORS Backend (src/index.ts)
```typescript
app.use(cors({
  origin: [
    'https://fpbg.singcloud.ga',    // Doit correspondre à FRONTEND_URL
  ],
  credentials: true
}));
```

### Exemples de Configurations Typiques

#### Configuration 1 : Même domaine, chemins différents
```
Frontend: https://fpbg.singcloud.ga
Backend:  https://fpbg.singcloud.ga/api
```

**Frontend (environment.prod.ts):**
```typescript
const API_DOMAIN = 'fpbg.singcloud.ga';
const API_PROTOCOL = 'https';
```

**Backend (.env):**
```bash
FRONTEND_URL="https://fpbg.singcloud.ga"
```

#### Configuration 2 : Sous-domaines séparés
```
Frontend: https://app.fpbg.singcloud.ga
Backend:  https://api.fpbg.singcloud.ga
```

**Frontend (environment.prod.ts):**
```typescript
const API_DOMAIN = 'api.fpbg.singcloud.ga';
const API_PROTOCOL = 'https';
```

**Backend (.env):**
```bash
FRONTEND_URL="https://app.fpbg.singcloud.ga"
```

#### Configuration 3 : Domaines complètement différents
```
Frontend: https://guichetnumerique.fpbg.ga
Backend:  https://api.fpbg.ga
```

**Frontend (environment.prod.ts):**
```typescript
const API_DOMAIN = 'api.fpbg.ga';
const API_PROTOCOL = 'https';
```

**Backend (.env):**
```bash
FRONTEND_URL="https://guichetnumerique.fpbg.ga"
```

## 📝 Checklist de Déploiement

### Backend
- [ ] Créer le fichier `.env` depuis `.env.example`
- [ ] Modifier `FRONTEND_URL` avec le domaine du frontend
- [ ] Générer et définir un `JWT_SECRET` fort
- [ ] Configurer `DATABASE_URL` pour la production
- [ ] Configurer les identifiants SMTP
- [ ] Définir `NODE_ENV="production"`
- [ ] Vérifier la configuration CORS dans le code
- [ ] Installer les dépendances : `npm install --production`
- [ ] Générer Prisma client : `npx prisma generate`
- [ ] Appliquer les migrations : `npx prisma migrate deploy`
- [ ] Démarrer le serveur : `npm start`

### Frontend
- [ ] Modifier `environment.prod.ts` avec le domaine API
- [ ] Build production : `ng build --configuration=production`
- [ ] Déployer les fichiers du dossier `dist/`

### Vérifications
- [ ] Le frontend peut se connecter à l'API
- [ ] Les CORS fonctionnent correctement
- [ ] L'authentification JWT fonctionne
- [ ] Les emails sont envoyés correctement
- [ ] La base de données est accessible
- [ ] Les logs ne montrent pas d'erreurs CORS

## 🆘 Dépannage

### Erreur CORS
**Symptôme :** "Access-Control-Allow-Origin" error dans la console

**Solution :**
1. Vérifiez que `FRONTEND_URL` dans `.env` correspond exactement au domaine frontend
2. Vérifiez la configuration CORS dans le code backend
3. Assurez-vous que `credentials: true` est activé

### Erreur JWT
**Symptôme :** "Invalid token" ou "jwt malformed"

**Solution :**
1. Vérifiez que `JWT_SECRET` est identique entre le code qui génère et vérifie les tokens
2. Effacez le localStorage du navigateur
3. Générez un nouveau token de test

### Base de données inaccessible
**Symptôme :** "Can't reach database server"

**Solution :**
1. Vérifiez que `DATABASE_URL` est correct
2. Vérifiez que la base de données accepte les connexions depuis votre serveur
3. Vérifiez les règles de pare-feu

### Emails non envoyés
**Symptôme :** Les OTP ne sont pas reçus

**Solution :**
1. Vérifiez tous les paramètres SMTP
2. Testez les identifiants SMTP séparément
3. Vérifiez les logs du serveur pour voir les erreurs SMTP

---

## 📞 Support

Pour toute question ou problème, consultez :
- La documentation de Prisma : https://www.prisma.io/docs
- La documentation Node.js : https://nodejs.org/docs
- Les logs du serveur pour identifier les erreurs

**🎯 Rappel :** Ne commitez JAMAIS le fichier `.env` dans Git ! Il doit rester local et confidentiel.
