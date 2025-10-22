# ⚡ Quick Start - Configuration Domaines

## 🎯 Ce que vous devez modifier pour déployer

### 1️⃣ Backend (2 minutes)

Fichier : `backend/.env`

```bash
# Copiez d'abord le fichier exemple
cp backend/.env.example backend/.env

# Puis modifiez UNIQUEMENT ces 3 lignes dans backend/.env :
FRONTEND_URL="https://votre-domaine-frontend.com"
JWT_SECRET="générez_une_clé_forte_avec_node_-e_crypto_randomBytes_64"
NODE_ENV="production"
```

### 2️⃣ Frontend (1 minute)

Fichier : `frontend/src/environments/environment.prod.ts`

```typescript
// Modifiez UNIQUEMENT ces 2 lignes :
const API_DOMAIN = 'api.votre-domaine.com';  // Ligne 10
const FRONTEND_DOMAIN = 'votre-domaine.com'; // Ligne 11
```

## ✅ C'est tout !

Le reste se configure automatiquement.

## 🚀 Démarrage

```bash
# Backend
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm start

# Frontend
cd frontend
npm install
ng build --configuration=production
# Déployez le dossier dist/
```

## 📖 Documentation Complète

- [Guide Complet](DEPLOYMENT_GUIDE.md)
- [Backend Détaillé](backend/DEPLOYMENT.md)
- [Frontend Détaillé](frontend/DEPLOYMENT.md)

## 💡 Exemples de Configuration

### Exemple 1 : Même domaine
```
Frontend: https://fpbg.singcloud.ga
Backend:  https://fpbg.singcloud.ga/api
```

**Backend .env :**
```bash
FRONTEND_URL="https://fpbg.singcloud.ga"
```

**Frontend environment.prod.ts :**
```typescript
const API_DOMAIN = 'fpbg.singcloud.ga';
const FRONTEND_DOMAIN = 'fpbg.singcloud.ga';
```

### Exemple 2 : Sous-domaines séparés
```
Frontend: https://app.fpbg.ga
Backend:  https://api.fpbg.ga
```

**Backend .env :**
```bash
FRONTEND_URL="https://app.fpbg.ga"
```

**Frontend environment.prod.ts :**
```typescript
const API_DOMAIN = 'api.fpbg.ga';
const FRONTEND_DOMAIN = 'app.fpbg.ga';
```

---

**🎉 Voilà ! Vous pouvez maintenant déployer facilement en modifiant juste 2-3 lignes !**
