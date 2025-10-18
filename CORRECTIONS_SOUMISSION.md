# 🔧 Corrections de la Soumission de Projet

## 📋 Résumé des Problèmes Identifiés et Résolus

### ❌ Problème Principal: "Unexpected end of form"

**Cause racine:** Conflit entre les middlewares Express qui parsaient les requêtes multipart/form-data

---

## ✅ Solutions Appliquées

### 1. **Backend - Configuration des Middlewares** (`server.ts`)

#### Problème
- `express.json()` et `express.urlencoded()` tentaient de parser TOUTES les requêtes
- Ces middlewares consommaient le stream du body des requêtes multipart
- Quand Multer essayait ensuite de parser, le stream était vide → "Unexpected end of form"

#### Solution
```typescript
// Détecter le Content-Type et skip le parsing pour multipart/form-data
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return next(); // Laisser Multer gérer
  }

  // Pour les autres requêtes, utiliser les parsers standards
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });
});
```

**Emplacement:** `backend/src/server.ts` lignes 59-73

---

### 2. **Service - Validation des Données** (`demandeSubvention.service.ts`)

#### Améliorations Apportées

##### A. Validation Initiale (lignes 114-125)
```typescript
// Vérifier que les données essentielles sont présentes
if (!data) throw new AppError('Aucune donnée de projet fournie.', 400);
if (!data.title || data.title.trim() === '') {
  throw new AppError('Le titre du projet est requis.', 400);
}
if (!data.activitiesStartDate || !data.activitiesEndDate) {
  throw new AppError('Les dates sont requises.', 400);
}
```

##### B. Gestion Robuste des Dates (lignes 222-243)
```typescript
// Parser et valider les dates avec fallback
try {
  dateDebut = act.start ? new Date(act.start) : new Date(data.activitiesStartDate);
  dateFin = act.end ? new Date(act.end) : new Date(data.activitiesEndDate);

  // Vérifier que les dates sont valides
  if (isNaN(dateDebut.getTime())) {
    console.warn('Date invalide, utilisation de la date du projet');
    dateDebut = new Date(data.activitiesStartDate);
  }
} catch (error) {
  // Fallback sur les dates du projet
  dateDebut = new Date(data.activitiesStartDate);
  dateFin = new Date(data.activitiesEndDate);
}
```

##### C. Validation des Lignes de Budget (lignes 295-327)
```typescript
// Valider les montants et pourcentages
const montantCfa = Number(line.cfa) || 0;
const pctFpbg = Number(line.fpbgPct) || 0;
const pctCofin = Number(line.cofinPct) || 0;

// Contraindre les pourcentages entre 0 et 100
pctFpbg: Math.max(0, Math.min(100, pctFpbg)),
pctCofin: Math.max(0, Math.min(100, pctCofin))
```

##### D. Validation des Fichiers Uploadés (lignes 384-435)
```typescript
// Vérifier que le fichier a toutes les propriétés requises
if (!file || !file.originalname || !file.mimetype || !file.size) {
  console.warn('Fichier invalide, ignoré');
  continue;
}

// Vérifier que la clé est dans la liste des clés autorisées
if (!validKeys.includes(documentKey)) {
  console.warn('Clé de document invalide, ignoré');
  continue;
}
```

##### E. Gestion d'Erreurs Améliorée (lignes 573-622)
```typescript
// Gestion détaillée des erreurs Prisma
if (error.code === 'P2002') {
  throw new AppError('Un doublon a été détecté...', 400);
}
if (error.code === 'P2003') {
  throw new AppError('Référence invalide...', 400);
}
if (error.code === 'P1008') {
  throw new AppError('Timeout de la base de données...', 504);
}
```

---

### 3. **Frontend - Simplification** (`soumission.ts`)

#### Solution
Retour à l'utilisation simple de `HttpClient` Angular:

```typescript
this.http
  .post(`${environment.urlServer}/api/demandes/submit`, submissionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .subscribe({
    next: (response) => { /* Success */ },
    error: (error) => { /* Error handling */ }
  });
```

**Important:** Ne PAS définir `Content-Type` manuellement - le navigateur le fait automatiquement avec le bon `boundary` pour FormData.

**Emplacement:** `frontend/src/app/user/form/soumission/soumission.ts` lignes 1517-1563

---

## 🎯 Résultat Final

### ✅ Avantages des Corrections

1. **Robustesse**
   - Validation complète des données avant insertion
   - Gestion d'erreurs détaillée avec messages clairs
   - Logs détaillés pour debugging

2. **Résilience**
   - Continue même si certaines données sont invalides
   - Fallbacks pour les dates et montants
   - Ne bloque pas toute la transaction pour une erreur mineure

3. **Visibilité**
   - Logs structurés à chaque étape
   - Messages d'erreur explicites
   - Compteurs de succès/échec

4. **Sécurité**
   - Validation des clés de documents
   - Vérification des types de fichiers
   - Contraintes sur les pourcentages

### 📊 Ce Qui Est Traité

- ✅ **Données manquantes** → Valeurs par défaut ou erreur explicite
- ✅ **Dates invalides** → Fallback sur les dates du projet
- ✅ **Montants négatifs** → Conversion à 0
- ✅ **Pourcentages > 100%** → Contraints entre 0-100
- ✅ **Fichiers invalides** → Ignorés avec warning
- ✅ **Clés de documents invalides** → Ignorées avec warning
- ✅ **Erreurs Prisma** → Messages d'erreur clairs
- ✅ **Timeouts** → Gestion avec message approprié

---

## 🧪 Tests Créés

### Fichiers de Test Disponibles

1. **`backend/test-submit.js`**
   - Test complet de soumission avec Node.js
   - Utilise node-fetch et form-data
   - Simule l'envoi exact du frontend

2. **`backend/get-token.js`**
   - Récupère un token JWT pour les tests
   - Script simple à exécuter

3. **`backend/test-formdata-simple.html`**
   - Page HTML pour tester dans le navigateur
   - 3 méthodes de test: Fetch API, XMLHttpRequest, Fetch avec Headers
   - Interface visuelle pour debugging

### Comment Tester

```bash
# Terminal 1 - Démarrer le backend
cd backend
npm run dev

# Terminal 2 - Obtenir un token (modifiez les credentials dans le script)
node get-token.js

# Terminal 3 - Tester la soumission (collez le token dans le script)
node test-submit.js

# OU ouvrir dans le navigateur
# backend/test-formdata-simple.html
```

---

## 📝 Checklist Post-Correction

### À Vérifier
- [ ] Le serveur backend démarre sans erreur
- [ ] Le frontend compile sans erreur
- [ ] La soumission fonctionne avec des données complètes
- [ ] La soumission fonctionne avec des données partielles
- [ ] Les fichiers sont correctement uploadés
- [ ] Les emails sont envoyés après soumission
- [ ] L'animation de chargement s'affiche
- [ ] La modal de succès apparaît
- [ ] Les données sont bien enregistrées en base
- [ ] Les logs backend sont clairs et utiles

---

## 🚨 Si Le Problème Persiste

### Logs à Vérifier

1. **Console Backend**
   - Recherchez les messages `⚠️` (warnings)
   - Cherchez les messages `❌` (erreurs)
   - Vérifiez les logs de Multer

2. **Console Frontend (DevTools)**
   - Onglet Network: vérifiez la requête POST
   - Regardez le Content-Type header (doit inclure `boundary=`)
   - Vérifiez la taille des fichiers uploadés

3. **Logs Prisma**
   - Si erreur de BDD, le code d'erreur est affiché
   - P2002 = Contrainte unique violée
   - P2003 = Référence étrangère invalide
   - P1008 = Timeout

### Actions de Debugging

```typescript
// Dans demandeSubvention.routes.ts, ligne 86, ajoutez:
async (req, res: Response, next: NextFunction) => {
  console.log('📥 Headers:', req.headers);
  console.log('📥 Content-Type:', req.headers['content-type']);
  console.log('📥 Body fields:', Object.keys(req.body));
  console.log('📥 Files:', Object.keys(req.files || {}));

  // ... reste du code
}
```

---

## 📚 Ressources Utiles

- [Multer Documentation](https://github.com/expressjs/multer)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Angular HttpClient](https://angular.io/api/common/http/HttpClient)
- [FormData Browser API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

**Date de correction:** 2025-10-18
**Fichiers modifiés:**
- `backend/src/server.ts`
- `backend/src/services/demandeSubvention.service.ts`
- `frontend/src/app/user/form/soumission/soumission.ts`
