# Instructions Copilot pour le projet FPBG

## Architecture Globale

Ce projet est une plateforme de gestion des appels à projets et subventions pour la préservation de la biodiversité au Gabon, avec :

- **Frontend Angular** (port 4200)

  - Architecture modulaire avec lazy loading
  - Guards pour la sécurité des routes
  - Intercepteurs pour la gestion des cookies JWT
  - Tailwind CSS pour le style

- **Backend TypeScript/Node.js** (port 4000)
  - API REST sécurisée avec JWT
  - ORM Prisma pour PostgreSQL
  - Nodemailer pour les emails

## Points d'Intégration Clés

1. **Authentification**

   ```typescript
   // Le backend génère des JWT stockés dans des cookies httpOnly
   // Les requêtes du frontend incluent automatiquement les cookies via l'intercepteur
   // Voir: frontend/src/app/services/interceptors/cookie-interceptor.ts
   ```

2. **Upload de Fichiers**

   ```typescript
   // Les fichiers sont uploadés via Multer vers backend/uploads/projets/
   // Types acceptés: PDF, DOCX, JPG, PNG (max 50MB)
   // Les URLs sont stockées dans la table PieceJointe
   ```

3. **Formats de Dates**
   ```typescript
   // Toutes les dates sont en UTC dans la base de données
   // Le frontend convertit en heure locale pour l'affichage
   // Format ISO 8601 pour les échanges API
   ```

## Conventions de Code

### Frontend

- Components en PascalCase: `MonComposant.ts`
- Services en camelCase: `monService.ts`
- Un service par domaine fonctionnel (auth, aap, etc.)
- Interfaces préfixées par I: `IOrganisation`
- Observables suffixés par $: `data$`

### Backend

- Controllers en PascalCase: `AuthController.ts`
- Services en PascalCase: `AuthService.ts`
- Middlewares en camelCase: `authMiddleware.ts`
- Types préfixés par T: `TAppelProjet`

## Modèles de Données Critiques

### DemandeSubvention

```prisma
model DemandeSubvention {
  id                    String   @id @default(cuid())
  code                  String?  @unique
  statut                StatutSoumission @default(SOUMIS)
  typeSoumission        TypeSoumission @default(NOTE_CONCEPTUELLE)
  // ... autres champs
}
```

### AppelProjets

```prisma
model AppelProjets {
  id               String   @id @default(cuid())
  code             String   @unique
  titre            String
  dateDebut        DateTime
  dateFin          DateTime
  // ... autres champs
}
```

## Workflows Clés

### Soumission Demande

1. Création en brouillon
2. Upload documents
3. Validation par admin
4. Changement statut
5. Notifications email

### Évaluation

1. Attribution aux évaluateurs
2. Grille de notation
3. Consolidation des scores
4. Décision finale

## Commandes Importantes

### Backend

```bash
# Démarrage développement
npm run dev

# Migrations Prisma
npx prisma generate
npx prisma migrate dev
```

### Frontend

```bash
# Démarrage développement
npm start

# Build production
ng build --configuration production
```

## Tests et Validation

### Points à Vérifier

- Validation JWT dans les cookies
- Upload limité à 50MB
- Validation des dates (début < fin)
- Formats de fichiers autorisés
- Rôles et permissions

## Messages d'Erreur Standards

```typescript
// Format d'erreur API
{
  error: string;
  code?: string;
  details?: any;
}

// Codes d'erreur courants
AUTH_REQUIRED      // Non authentifié
FORBIDDEN          // Non autorisé
VALIDATION_ERROR   // Données invalides
NOT_FOUND         // Ressource non trouvée
```

## Points de Vigilance

1. **Sécurité**

   - Toujours utiliser l'authentification JWT
   - Valider les permissions par rôle
   - Sanitizer les uploads de fichiers

2. **Performance**

   - Paginer les listes > 50 items
   - Utiliser les index Prisma définis
   - Eager loading des relations

3. **Validation**

   - Dates cohérentes
   - Montants dans les limites
   - Types de fichiers autorisés

4. **Maintenance**
   - Logs structurés
   - Transactions Prisma
   - Tests unitaires

## Documentation Additionnelle

- [Guide de Déploiement](DEPLOYMENT_GUIDE.md)
- [Documentation API](backend/API.md)
- [Guide Frontend](frontend/README.md)
