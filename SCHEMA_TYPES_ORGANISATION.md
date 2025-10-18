# 📊 Schéma des Types d'Organisation - Système FPBG

## Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME DE GESTION FPBG                       │
│                                                                  │
│  Backend (PostgreSQL) ←→ API ←→ Frontend (Angular)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Définition Backend (Prisma Schema)

### Enum `TypeOrganisation`
**Fichier:** `backend/prisma/schema.prisma` (lignes 30-43)

```prisma
enum TypeOrganisation {
  ASSOCIATION         // ONG/Associations
  ONG                 // Organisations Non Gouvernementales
  COMMUNAUTE         // Communautés organisées
  COOPERATIVE        // Coopératives
  PME                // Petites et Moyennes Entreprises
  PMI                // Petites et Moyennes Industries
  STARTUP            // Startups
  SECTEUR_PUBLIC     // Entités gouvernementales
  RECHERCHE          // Organismes de recherche
  PRIVE              // Secteur privé
  AUTRE              // Autres types
}
```

### Utilisation dans le modèle `Organisation`
**Fichier:** `backend/prisma/schema.prisma` (lignes 172-193)

```prisma
model Organisation {
  id        String           @id @default(cuid())
  nom       String
  type      TypeOrganisation  // ← Type obligatoire
  email     String?
  telephone String?

  // Relation avec TypeSubvention (PETITE/MOYENNE)
  typeSubvention   TypeSubvention? @relation(...)
  idTypeSubvention Int?

  utilisateurs Utilisateur[]
  projets      DemandeSubvention[]
  // ...
}
```

---

## 2️⃣ Flux de données : Backend → Frontend

```
┌──────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   PostgreSQL     │  ────→  │   Backend API   │  ────→  │   LocalStorage   │
│   (Prisma)       │         │   (Express)     │         │   'user' key     │
└──────────────────┘         └─────────────────┘         └──────────────────┘
        ↓                            ↓                            ↓
  TypeOrganisation         JSON Response           {
    (enum)                   avec                    organisation: {
                             organisation              type: "PME",
                             complète                  typeSubvention: {...}
                                                     }
                                                   }
```

### Stockage Frontend (LocalStorage)
**Clé:** `user`

```json
{
  "id": "...",
  "email": "user@example.com",
  "organisation": {
    "id": "...",
    "nom": "Mon Organisation",
    "type": "PME",              // ← TypeOrganisation
    "typeSubvention": {
      "code": "PETITE",         // ou "MOYENNE"
      "libelle": "Petite subvention",
      "montantMinCfa": 5000000,
      "montantMaxCfa": 50000000,
      "dureeMaxMois": 12
    }
  }
}
```

---

## 3️⃣ Utilisation Frontend (Angular)

### Récupération du type d'organisation
**Fichier:** `frontend/src/app/user/form/soumission/soumission.ts` (lignes 1317-1361)

```typescript
export class SubmissionWizard {
  usertype: string = '';  // Stocke le type d'organisation normalisé

  private loadUserInfo(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const org = user?.organisation;

      // Récupère le type d'organisation
      this.usertype = org?.type || '';  // Ex: "PME", "ONG", etc.
    }
  }
}
```

---

## 4️⃣ Mapping Types d'Organisation → Documents Requis

### Groupes logiques selon le tableau DocumentsFPBG.png

```
┌────────────────────────────────────────────────────────────────┐
│                     TYPES D'ORGANISATION                        │
└────────────────────────────────────────────────────────────────┘

🏢 ONG/Associations Coopératives
   ├─ ASSOCIATION
   ├─ ONG
   └─ COOPERATIVE

💼 PME/PMI/Startups
   ├─ PME
   ├─ PMI
   └─ STARTUP

🏛️ Entités gouvernementales
   └─ SECTEUR_PUBLIC

🔬 Organismes de recherche
   └─ RECHERCHE

👥 Communautés organisées
   └─ COMMUNAUTE

⚪ Autres
   ├─ PRIVE
   └─ AUTRE
```

### Logique de filtrage des documents
**Fichier:** `frontend/src/app/user/form/soumission/soumission.ts` (lignes 1243-1305)

```typescript
getRequiredDocuments(): Array<{ key: string; label: string; required: boolean }> {
  // DOCUMENTS UNIVERSELS (tous les types)
  const universalRequired = [
    { key: 'NOTE_CONCEPTUELLE', label: '...', required: true },
    { key: 'LETTRE_MOTIVATION', label: '...', required: true },
    { key: 'BUDGET_DETAILLE', label: '...', required: true },
    { key: 'CHRONOGRAMME', label: '...', required: true },
    { key: 'CV_RESPONSABLES', label: '...', required: true },
    { key: 'RIB', label: '...', required: true },
  ];

  const type = this.usertype?.toLowerCase().trim() || '';
  let specificDocuments = [];

  // DOCUMENTS SPÉCIFIQUES selon le type
  if (type.includes('ong') || type.includes('association') || ...) {
    specificDocuments = [
      { key: 'STATUTS_REGLEMENT', label: '...', required: true },
      { key: 'AGREMENT', label: '...', required: true },
      // ...
    ];
  }
  // ... autres types

  return [...universalRequired, ...specificDocuments, ...optionalDocuments];
}
```

---

## 5️⃣ Tableau récapitulatif des documents par type

| Document | Obligatoire pour tous | ONG/Assoc/Coop | PME/PMI/Startup | Entités gouv. | Organismes recherche | Communautés |
|----------|:--------------------:|:--------------:|:---------------:|:-------------:|:-------------------:|:-----------:|
| **Note Conceptuelle** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lettre motivation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Budget détaillé** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Chronogramme** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CV responsables** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RIB** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Statuts & règlement** | ⚪ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fiche circuit** | ⚪ | ⚪ | ✅ | ⚪ | ⚪ | ⚪ |
| **Agrément/récépissé** | ⚪ | ✅ | ✅ | ⚪ | ✅ | ✅ |
| **Cartographie** | ⚪ (facultatif) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Lettres soutien** | ⚪ (facultatif) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Légende:** ✅ Obligatoire | ⚪ Non requis ou facultatif

---

## 6️⃣ Processus complet d'utilisation

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. INSCRIPTION / CONNEXION                                       │
└─────────────────────────────────────────────────────────────────┘
   L'utilisateur se connecte
   └→ Backend retourne les données avec organisation.type
      └→ Frontend stocke dans localStorage('user')

┌─────────────────────────────────────────────────────────────────┐
│ 2. CHARGEMENT DU FORMULAIRE DE SOUMISSION                       │
└─────────────────────────────────────────────────────────────────┘
   constructor() → loadUserInfo()
   └→ Lecture de localStorage('user')
      └→ Extraction de organisation.type (ex: "PME")
         └→ Stockage dans this.usertype

┌─────────────────────────────────────────────────────────────────┐
│ 3. ÉTAPE ANNEXES (Étape 8)                                      │
└─────────────────────────────────────────────────────────────────┘
   Affichage des documents
   └→ Appel de getRequiredDocuments()
      └→ Normalisation: this.usertype.toLowerCase().trim()
         └→ Comparaison avec conditions (includes('pme'), etc.)
            └→ Retour de la liste filtrée de documents
               └→ Affichage uniquement des documents pertinents

┌─────────────────────────────────────────────────────────────────┐
│ 4. VALIDATION AVANT SOUMISSION                                   │
└─────────────────────────────────────────────────────────────────┘
   Vérification des documents manquants
   └→ getMissingRequiredDocuments()
      └→ Compare documents uploadés vs documents requis
         └→ Bloque la soumission si documents obligatoires manquants
```

---

## 7️⃣ Normalisation des types pour la comparaison

### Transformation appliquée

```typescript
const type = this.usertype?.toLowerCase().trim() || '';
// "PME" → "pme"
// "SECTEUR_PUBLIC" → "secteur_public"
```

### Conditions de filtrage (fichier soumission.ts)

```typescript
// 🏢 ONG/Associations/Coopératives
if (type.includes('ong') || type.includes('association') || type.includes('coopérative'))

// 💼 PME/PMI/Startups
else if (type.includes('pme') || type.includes('pmi') || type.includes('startup'))

// 🏛️ Entités gouvernementales
else if (type.includes('entités gouvernementales') || type.includes('gouvernement'))

// 🔬 Organismes de recherche
else if (type.includes('organismes de recherche') || type.includes('recherche'))

// 👥 Communautés organisées
else if (type.includes('communautés organisées') || type.includes('communaut'))
```

---

## 8️⃣ Points clés du système

### ✅ Avantages de l'architecture actuelle

1. **Typage fort** : `TypeOrganisation` enum garantit la cohérence des données
2. **Flexibilité** : Utilisation de `includes()` permet de gérer les variations de nommage
3. **Séparation des préoccupations** :
   - Backend : Définition stricte des types (enum)
   - Frontend : Logique d'affichage conditionnelle
4. **Documents universels** : Toujours affichés quel que soit le type
5. **Documents spécifiques** : Filtrés selon le type d'organisation

### ⚠️ Points d'attention

1. **Correspondance enum ↔ conditions** : Les valeurs de l'enum doivent correspondre aux conditions `includes()`
2. **Normalisation** : Utilisation de `.toLowerCase()` pour gérer les variations de casse
3. **Fallback** : Si aucun type ne correspond, seuls les documents universels sont affichés
4. **Maintenance** : Toute modification du tableau des documents doit être répercutée dans `getRequiredDocuments()`

---

## 9️⃣ Exemple concret : Flux pour une PME

```
1. Utilisateur PME se connecte
   └→ Backend retourne:
      {
        organisation: {
          type: "PME",
          typeSubvention: { code: "PETITE", ... }
        }
      }

2. Frontend stocke dans localStorage('user')

3. Chargement formulaire
   └→ loadUserInfo()
      └→ this.usertype = "PME"

4. Étape Annexes
   └→ getRequiredDocuments()
      └→ type.includes('pme') → TRUE
         └→ Retourne:
            - 6 documents universels (obligatoires)
            - 3 documents spécifiques PME:
              • Statuts et règlement (obligatoire)
              • Fiche circuit (obligatoire)
              • Agrément (obligatoire)
            - 2 documents facultatifs

5. Validation
   └→ Vérifie que les 9 documents obligatoires sont uploadés
      └→ Bloque si manquants
```

---

## 🔟 Diagramme de classes simplifié

```
┌──────────────────────┐
│  TypeOrganisation    │  (Enum Backend)
│  ──────────────────  │
│  • ASSOCIATION       │
│  • ONG               │
│  • COMMUNAUTE        │
│  • COOPERATIVE       │
│  • PME               │
│  • PMI               │
│  • STARTUP           │
│  • SECTEUR_PUBLIC    │
│  • RECHERCHE         │
│  • PRIVE             │
│  • AUTRE             │
└──────────────────────┘
         ↓ utilisé par
┌──────────────────────┐
│   Organisation       │  (Model Backend)
│  ──────────────────  │
│  + id: String        │
│  + nom: String       │
│  + type: TypeOrg     │ ←── Référence l'enum
│  + typeSubvention    │
└──────────────────────┘
         ↓ récupéré par
┌──────────────────────┐
│  SubmissionWizard    │  (Component Frontend)
│  ──────────────────  │
│  + usertype: string  │ ←── Stocke le type normalisé
│  + loadUserInfo()    │
│  + getRequiredDocs() │ ←── Filtre selon usertype
└──────────────────────┘
```

---

## 📝 Notes de mise à jour

**Date:** 2025-10-18
**Version:** 1.0
**Auteur:** Claude Code Assistant

**Historique des modifications:**
- Création du schéma complet des types d'organisation
- Documentation du flux Backend → Frontend
- Mapping des documents requis selon le tableau DocumentsFPBG.png
- Ajout d'exemples concrets et diagrammes

**Fichiers concernés:**
- `backend/prisma/schema.prisma` (définition TypeOrganisation)
- `frontend/src/app/user/form/soumission/soumission.ts` (logique de filtrage)
- `frontend/src/assets/documents/DocumentsFPBG.png` (tableau de référence)
