# 🚀 Guide de Déploiement Complet - FPBG

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer et déployer l'application FPBG (frontend + backend) de manière simple et rapide.

## 🎯 Configuration Rapide (5 minutes)

### Étape 1 : Backend

```bash
cd backend

# 1. Copier le fichier de configuration
cp .env.example .env

# 2. Éditer .env et modifier UNIQUEMENT ces lignes :
#    - FRONTEND_URL="https://votre-domaine-frontend.com"
#    - JWT_SECRET="générer_une_clé_forte_ici"
#    - DATABASE_URL="votre_url_postgres"
#    - NODE_ENV="production"

# 3. Installer et démarrer
npm install --production
npx prisma generate
npx prisma migrate deploy
npm start
```

### Étape 2 : Frontend

```bash
cd frontend

# 1. Éditer src/environments/environment.prod.ts
#    Modifier UNIQUEMENT ces 2 lignes :
#    - const API_DOMAIN = 'api.votre-domaine.com';
#    - const FRONTEND_DOMAIN = 'votre-domaine.com';

# 2. Build et déployer
npm install
ng build --configuration=production

# 3. Déployer le contenu du dossier dist/ sur votre serveur web
```

## 📁 Structure du Projet

```
Prod/
├── backend/                    # API Node.js + Express + Prisma
│   ├── .env.example           # Template de configuration
│   ├── DEPLOYMENT.md          # 📖 Guide détaillé backend
│   └── src/
│
├── frontend/                   # Application Angular
│   ├── src/environments/
│   │   ├── environment.ts              # Config dev (localhost)
│   │   ├── environment.development.ts  # Config dev
│   │   └── environment.prod.ts         # 🔧 Config production (À MODIFIER)
│   ├── DEPLOYMENT.md          # 📖 Guide détaillé frontend
│   └── angular.json
│
└── DEPLOYMENT_GUIDE.md        # 📖 Ce fichier
```

## ⚙️ Configuration des Domaines

### Scénario 1 : Un seul domaine (Recommandé pour débuter)

**Architecture :**
```
https://fpbg.singcloud.ga          → Frontend (Angular)
https://fpbg.singcloud.ga/api      → Backend (API)
```

**Configuration :**

**Frontend** (`environment.prod.ts`) :
```typescript
const API_DOMAIN = 'fpbg.singcloud.ga';
const FRONTEND_DOMAIN = 'fpbg.singcloud.ga';
const API_PROTOCOL = 'https';
const API_PORT = '';
```

**Backend** (`.env`) :
```bash
FRONTEND_URL="https://fpbg.singcloud.ga"
PORT=4000
```

### Scénario 2 : Sous-domaines séparés (Recommandé pour production)

**Architecture :**
```
https://app.fpbg.singcloud.ga      → Frontend
https://api.fpbg.singcloud.ga      → Backend
```

**Configuration :**

**Frontend** (`environment.prod.ts`) :
```typescript
const API_DOMAIN = 'api.fpbg.singcloud.ga';
const FRONTEND_DOMAIN = 'app.fpbg.singcloud.ga';
const API_PROTOCOL = 'https';
const API_PORT = '';
```

**Backend** (`.env`) :
```bash
FRONTEND_URL="https://app.fpbg.singcloud.ga"
PORT=4000
```

### Scénario 3 : Développement Local

**Architecture :**
```
http://localhost:4200              → Frontend
http://localhost:4000              → Backend
```

**Configuration :** ✅ Déjà configuré par défaut ! Aucune modification nécessaire.

## 🔧 Variables à Configurer

### Backend (fichier `.env`)

| Variable | Développement | Production | Obligatoire |
|----------|---------------|------------|-------------|
| `FRONTEND_URL` | `http://localhost:4200` | `https://votre-domaine.com` | ✅ Oui |
| `JWT_SECRET` | `test_secret` | Clé forte aléatoire | ✅ Oui |
| `DATABASE_URL` | URL Neon DB | URL Postgres prod | ✅ Oui |
| `NODE_ENV` | `development` | `production` | ✅ Oui |
| `PORT` | `4000` | `4000` | ✅ Oui |
| `SMTP_HOST` | Configuré | Configuré | ⚠️ Pour emails |
| `SMTP_PORT` | `465` | `465` | ⚠️ Pour emails |
| `SMTP_USER` | Email no-reply | Email no-reply | ⚠️ Pour emails |
| `SMTP_PASS` | Mot de passe | Mot de passe | ⚠️ Pour emails |

### Frontend (fichier `environment.prod.ts`)

| Variable | Développement | Production | Description |
|----------|---------------|------------|-------------|
| `API_DOMAIN` | `localhost` | `api.votre-domaine.com` | Domaine de l'API |
| `FRONTEND_DOMAIN` | `localhost` | `votre-domaine.com` | Domaine du frontend |
| `API_PROTOCOL` | `http` | `https` | Protocole (http/https) |
| `API_PORT` | `:4000` | `''` (vide) | Port de l'API |

## 🔒 Sécurité

### Générer un JWT Secret Fort

```bash
# Méthode 1 : Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Méthode 2 : OpenSSL
openssl rand -hex 64

# Méthode 3 : Python
python -c "import secrets; print(secrets.token_hex(64))"
```

### Checklist Sécurité

- [ ] `JWT_SECRET` différent entre dev et prod
- [ ] Fichier `.env` dans `.gitignore`
- [ ] HTTPS activé en production
- [ ] CORS configuré correctement
- [ ] Mots de passe SMTP sécurisés
- [ ] Base de données avec SSL activé

## 📝 Checklist Complète de Déploiement

### Préparation

- [ ] Vous avez un domaine configuré (ex: `fpbg.singcloud.ga`)
- [ ] Vous avez un serveur/VPS accessible
- [ ] Vous avez une base de données PostgreSQL
- [ ] Vous avez un serveur SMTP pour les emails

### Backend

- [ ] Copier `.env.example` en `.env`
- [ ] Configurer `FRONTEND_URL`
- [ ] Générer et configurer `JWT_SECRET`
- [ ] Configurer `DATABASE_URL`
- [ ] Configurer SMTP (host, port, user, pass)
- [ ] Mettre `NODE_ENV="production"`
- [ ] Installer : `npm install --production`
- [ ] Générer Prisma : `npx prisma generate`
- [ ] Migrations : `npx prisma migrate deploy`
- [ ] Vérifier CORS dans le code
- [ ] Démarrer : `npm start`
- [ ] Vérifier que l'API répond : `curl http://localhost:4000/api/health`

### Frontend

- [ ] Modifier `environment.prod.ts`
- [ ] Configurer `API_DOMAIN`
- [ ] Configurer `FRONTEND_DOMAIN`
- [ ] Vérifier `API_PROTOCOL` (https en prod)
- [ ] Laisser `API_PORT` vide en prod
- [ ] Installer : `npm install`
- [ ] Build : `ng build --configuration=production`
- [ ] Déployer le dossier `dist/FPBG/browser/` sur votre serveur web
- [ ] Configurer le serveur web (Nginx/Apache)

### Tests Post-Déploiement

- [ ] Frontend accessible via le navigateur
- [ ] API accessible (vérifier dans Network tab)
- [ ] Inscription fonctionne
- [ ] Email OTP reçu
- [ ] Connexion fonctionne
- [ ] Sondage s'affiche et sauvegarde
- [ ] Formulaire de soumission fonctionne
- [ ] Pas d'erreurs CORS dans la console
- [ ] HTTPS fonctionne (certificat valide)

## 🌐 Configuration Serveur Web

### Nginx (Recommandé)

```nginx
# Frontend
server {
    listen 80;
    server_name fpbg.singcloud.ga;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fpbg.singcloud.ga;

    # Certificat SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend Angular
    root /var/www/fpbg/frontend/dist/FPBG/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers l'API backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName fpbg.singcloud.ga
    Redirect permanent / https://fpbg.singcloud.ga/
</VirtualHost>

<VirtualHost *:443>
    ServerName fpbg.singcloud.ga

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    DocumentRoot /var/www/fpbg/frontend/dist/FPBG/browser

    <Directory /var/www/fpbg/frontend/dist/FPBG/browser>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Angular routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API
    ProxyPass /api http://localhost:4000/api
    ProxyPassReverse /api http://localhost:4000/api
</VirtualHost>
```

## 🔄 Processus de Mise à Jour

### Backend

```bash
cd backend
git pull
npm install --production
npx prisma generate
npx prisma migrate deploy
npm restart  # ou pm2 restart backend
```

### Frontend

```bash
cd frontend
git pull
npm install
ng build --configuration=production
# Copier dist/FPBG/browser/* vers votre serveur web
```

## 🆘 Dépannage Rapide

### Frontend ne se connecte pas au backend

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet "Network"
3. Vérifiez que les URLs sont correctes
4. Vérifiez les erreurs CORS

**Solution :** Vérifiez que `FRONTEND_URL` dans backend `.env` correspond exactement au domaine frontend

### Erreur 401 Unauthorized

1. Effacez le localStorage du navigateur
2. Déconnectez-vous et reconnectez-vous
3. Vérifiez que `JWT_SECRET` est correct dans `.env`

### Emails non reçus

1. Vérifiez les paramètres SMTP dans `.env`
2. Consultez les logs du backend
3. Testez avec un autre email

### Page blanche après déploiement

1. Vérifiez que vous avez bien build avec `--configuration=production`
2. Vérifiez que le serveur web pointe vers `dist/FPBG/browser/`
3. Vérifiez la configuration du serveur web (rewrites Angular)

## 📚 Documentation Détaillée

Pour plus de détails, consultez :

- **Backend** : [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)
- **Frontend** : [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md)

## 🎉 C'est terminé !

Une fois tout configuré, votre application sera accessible via :
- **Frontend** : https://votre-domaine.com
- **API** : https://votre-domaine.com/api (ou https://api.votre-domaine.com)

---

**💡 Astuce :** Gardez une copie de votre configuration (sans les secrets) dans un document séparé pour faciliter les futurs déploiements !
