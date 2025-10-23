# 🌊 FPBG - Fonds de Préservation de la Biodiversité au Gabon

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20.3-red.svg)
![Node.js](https://img.shields.io/badge/Node.js-TypeScript-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Plateforme web complète de gestion des appels à projets et de subventions pour la conservation marine et littorale au Gabon. Ce système permet aux organisations locales de soumettre leurs demandes de subvention, de suivre leur progression et d'accéder aux ressources de financement pour la préservation de la biodiversité.

---

## 🚀 Guides de Déploiement

**Nouveau !** Configuration simplifiée des domaines pour le déploiement :

- **[📖 Guide Complet de Déploiement](DEPLOYMENT_GUIDE.md)** - Documentation complète avec exemples et checklist
- **[🎨 Frontend Angular](frontend/DEPLOYMENT.md)** - Configuration détaillée du frontend
- **[⚙️ Backend Node.js](backend/DEPLOYMENT.md)** - Configuration détaillée de l'API

💡 **Pour déployer en production**, modifiez seulement **2 fichiers** :
1. `frontend/src/environments/environment.prod.ts` (2 lignes)
2. `backend/.env` (4 lignes principales)

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Structure du projet](#-structure-du-projet)
- [API & Backend](#-api--backend)
- [Base de données](#-base-de-données)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 Vue d'ensemble

Le FPBG (Fonds de Préservation de la Biodiversité au Gabon) est une organisation internationale à but non lucratif dédiée à la conservation marine et littorale. Cette plateforme digitale complète facilite :

- **Gestion des appels à projets** : Publication, configuration et suivi des appels à projets
- **Soumission de demandes de subvention** : Interface intuitive avec wizard multi-étapes
- **Évaluation et validation** : Workflow complet d'évaluation par les administrateurs
- **Gestion des organisations** : Enregistrement et suivi des organisations participantes
- **Communication** : Système de notifications par email et support
- **Reporting** : Tableaux de bord et génération de rapports PDF
- **Sondage d'acquisition** : Collecte de données sur les canaux de découverte

### 🎨 Fonctionnalités Visuelles

La plateforme propose un design moderne avec :

- Page d'accueil attractive avec hero section
- Processus de soumission en plusieurs étapes
- Section partenaires (FPBG & Obligations Bleues)
- FAQ avec support WhatsApp
- Tableaux de bord administrateurs et utilisateurs
- Génération de PDF pour les demandes

## ✨ Fonctionnalités

### 🌐 Espace Public

- **Page d'accueil** : Présentation du programme, statistiques, appels actifs
- **Liste des appels à projets** : Consultation des opportunités de financement en cours
- **Détails des appels** : Critères d'éligibilité, montants, dates limites, thématiques
- **FAQ & Support** : Formulaire de contact et support

### 👤 Espace Utilisateur

#### Authentification Complète
- **Inscription organisation** : Formulaire détaillé avec validation OTP par email
- **Connexion sécurisée** : JWT avec cookies httpOnly
- **Réinitialisation mot de passe** : Système complet forgot/reset password avec tokens
- **Validation OTP** : Code à 6 chiffres envoyé par email (valide 5 minutes)
- **Sondage post-inscription** : Collecte du canal d'acquisition utilisateur

#### Gestion des Demandes de Subvention
- **Dashboard personnalisé** : Vue d'ensemble des demandes soumises avec statuts
- **Formulaire de soumission multi-étapes** :
  - **Informations projet** : Titre, localisation, groupe cible, objectifs, durée
  - **Contexte et justification** : Description détaillée du projet
  - **Activités** : Planning détaillé avec sous-activités
  - **Budget** : Lignes budgétaires avec répartition FPBG/cofinancement
  - **Risques et mitigation** : Identification et gestion des risques
  - **Documents justificatifs** : Upload de pièces jointes requises
- **Types de soumission** : Note conceptuelle ou proposition complète
- **Statuts des demandes** :
  - BROUILLON : En cours de rédaction
  - SOUMIS : Envoyé pour évaluation
  - EN_REVUE : En cours d'évaluation
  - APPROUVE : Demande acceptée
  - REJETE : Demande refusée
- **Récapitulatif et export PDF** : Visualisation complète avant soumission
- **Notifications email** : Accusé de réception et notifications internes

### 🔐 Espace Administrateur

- **Dashboard admin** : Statistiques globales (nombre de demandes par statut)
- **Gestion des demandes** : Liste, filtre et évaluation des demandes de subvention
- **Gestion des appels à projets** :
  - Création d'appels avec dates de début/fin
  - Configuration des types de subvention (montants min/max, durée)
  - Gestion des thématiques par appel
  - Association d'organisations aux appels
- **Gestion des organisations** : CRUD complet des organisations
- **Évaluation de projets** : Système de notation et commentaires
- **Exports & Rapports** : Génération de rapports et exports
- **Récapitulatifs détaillés** : Vue complète de chaque demande avec toutes les données

## 🏗️ Architecture

### Architecture Globale

```
┌─────────────────────────────────────────┐
│      Angular Frontend (Port 4200)      │
│  ┌──────────────────────────────────┐   │
│  │  Components                       │   │
│  │  - User (Dashboard, Forms, OTP)   │   │
│  │  - Admin (Dashboard, Recap)       │   │
│  │  - Public (Home, Liste appels)    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Services                         │   │
│  │  - AuthService                    │   │
│  │  - DemandeSubventionService       │   │
│  │  - AAPService                     │   │
│  │  - OrganisationService            │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Guards & Interceptors            │   │
│  │  - AuthGuard, AdminGuard          │   │
│  │  - Cookie Interceptor             │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↕️ HTTP REST API (JWT)
┌─────────────────────────────────────────┐
│    Backend TypeScript (Port 4000)      │
│  ┌──────────────────────────────────┐   │
│  │  Controllers                      │   │
│  │  - AuthController                 │   │
│  │  - DemandeSubventionController    │   │
│  │  - AAPController                  │   │
│  │  - OrganisationController         │   │
│  │  - SondageController              │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Services (Business Logic)        │   │
│  │  - AuthService                    │   │
│  │  - DemandeSubventionService       │   │
│  │  - EmailService (Nodemailer)      │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Middlewares                      │   │
│  │  - Authentication (JWT)           │   │
│  │  - File Upload (Multer)           │   │
│  │  - Error Handler                  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↕️ Prisma ORM
┌─────────────────────────────────────────┐
│      PostgreSQL Database (Neon)        │
│  - Utilisateurs & Sessions             │
│  - Organisations                        │
│  - AppelProjets & Thématiques           │
│  - DemandeSubvention                    │
│  - Activités & Budget                   │
│  - PièceJointe & Évaluations            │
│  - OTP & SurveyResponse                 │
└─────────────────────────────────────────┘
```

### Flux d'Authentification

```
1. INSCRIPTION
   User → [Register] → Backend generates OTP → Email sent
   User → [OTP Page] → Backend validates → Account created → JWT token → Redirect to Sondage
   User → [Sondage] → Save response → Redirect to Dashboard

2. CONNEXION
   User → [Login] → Backend validates credentials → JWT token → Redirect to Dashboard

3. RESET PASSWORD
   User → [Forgot Password] → Backend generates reset token → Email sent
   User → [Reset Password Page] → Backend validates token → Password updated
```

### Flux de Soumission de Demande

```
1. User authenticated → Access Soumission Form
2. Fill multi-step wizard:
   - Projet info (titre, localisation, durée, etc.)
   - Activités (avec sous-activités et dates)
   - Budget (lignes budgétaires par activité)
   - Risques (description et mitigation)
   - Documents (upload pièces jointes)
3. Review on Recap page
4. Submit → Status: SOUMIS
5. Backend sends confirmation emails
6. Admin evaluates → Change status
7. User receives notification
```

## 🛠️ Technologies

### Frontend

| Technologie          | Version | Usage                       |
| -------------------- | ------- | --------------------------- |
| **Angular**          | 20.3.0  | Framework principal         |
| **TypeScript**       | 5.9.2   | Langage de développement    |
| **Tailwind CSS**     | 3.4.17  | Framework CSS utility-first |
| **Angular Material** | 20.2.5  | Composants UI               |
| **RxJS**             | 7.8.0   | Gestion de la réactivité    |
| **SweetAlert2**      | 11.24.0 | Notifications et modales    |
| **Axios**            | 1.12.2  | Requêtes HTTP               |

### Backend

| Technologie           | Version | Usage                     |
| --------------------- | ------- | ------------------------- |
| **Node.js**           | 18+     | Runtime JavaScript        |
| **TypeScript**        | 5.9.3   | Langage backend           |
| **Express**           | 5.1.0   | Framework web             |
| **Prisma**            | 6.17.1  | ORM pour PostgreSQL       |
| **PostgreSQL**        | Latest  | Base de données (Neon DB) |
| **JWT**               | 9.0.2   | Authentification          |
| **Nodemailer**        | 7.0.9   | Envoi d'emails            |
| **bcryptjs**          | 3.0.2   | Hashing mots de passe     |
| **Multer**            | 2.0.2   | Upload de fichiers        |
| **PDFKit**            | 0.17.2  | Génération de PDF         |
| **CORS**              | 2.8.5   | Cross-Origin Resource Sharing |

### DevOps & Outils

- **Git** : Contrôle de version
- **NPM** : Gestionnaire de paquets
- **Angular CLI** : Outils de développement Angular
- **tsx** : Exécution TypeScript en développement
- **Prettier** : Formatage du code
- **Karma & Jasmine** : Tests unitaires

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Pour le Frontend
- **Node.js** : v18.x ou supérieur
- **NPM** : v9.x ou supérieur
- **Angular CLI** : v20.x

### Pour le Backend
- **Node.js** : v18.x ou supérieur
- **NPM** : v9.x ou supérieur
- **PostgreSQL** : v14.x ou supérieur (ou compte Neon DB)

Vérifiez vos versions :

```bash
node --version
npm --version
ng version    # Pour le frontend
git --version
```

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-org/fpbg.git
cd Prod
```

### 2. Installation du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos configurations
# Voir la section Configuration ci-dessous

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations de base de données
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

Le backend sera accessible sur `http://localhost:4000`

### 3. Installation du Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## ⚙️ Configuration

### Configuration Backend (`.env`)

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Sécurité JWT
JWT_SECRET="votre_cle_secrete_tres_forte_ici"

# Configuration SMTP (envoi d'emails)
SMTP_HOST="mail.votre-serveur.com"
SMTP_PORT="465"
SMTP_USER="no-reply@votredomaine.com"
SMTP_PASS="votre_mot_de_passe_smtp"

# URLs et Domaines
FRONTEND_URL="http://localhost:4200"
FRONT_URL="http://localhost:4200"

# Serveur
PORT=4000
NODE_ENV="development"
```

**⚠️ Important** :
- Changez `JWT_SECRET` avec une clé forte (64+ caractères aléatoires)
- Configurez vos paramètres SMTP pour l'envoi d'emails
- Utilisez une vraie base de données PostgreSQL (recommandé : Neon DB)

### Configuration Frontend

#### Développement Local (`environment.ts`)

Fichier : `frontend/src/environments/environment.ts`

```typescript
const API_DOMAIN = 'localhost';
const FRONTEND_DOMAIN = 'localhost';
const API_PROTOCOL = 'http';
const API_PORT = ':4000';
const API_BASE_URL = `${API_PROTOCOL}://${API_DOMAIN}${API_PORT}`;

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  urlServer: API_BASE_URL,
  apiBaseUrl: `${API_BASE_URL}/api`,
  domains: {
    api: API_DOMAIN,
    frontend: FRONTEND_DOMAIN,
  },
  activerSondagePostOtp: true,
  cleQuestionnaireSondage: 'acquisition_channel_v1',
  liens: {
    siteOfficiel: 'https://fpbg.org/',
    whatsappChannel: 'https://whatsapp.com/channel/...',
    // ... autres liens
  },
};
```

#### Production (`environment.prod.ts`)

Modifiez uniquement ces lignes pour la production :

```typescript
const API_DOMAIN = 'api.votre-domaine.com';
const FRONTEND_DOMAIN = 'votre-domaine.com';
const API_PROTOCOL = 'https';
const API_PORT = '';
```

## 💻 Développement

### Démarrer l'environnement de développement complet

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm start
```

L'application sera accessible sur `http://localhost:4200/`

### Commandes utiles

#### Backend

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Générer le client Prisma après modification du schema
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique de la DB)
npx prisma studio

# Exécuter un script
npm run script:nom-du-script
```

#### Frontend

```bash
# Démarrer le serveur de développement
npm start
# ou
ng serve

# Build de production
npm run build
# ou
ng build --configuration production

# Mode watch (recompilation automatique)
npm run watch

# Générer un composant
ng generate component components/nom-composant
# ou raccourci
ng g c components/nom-composant

# Générer un service
ng g s services/nom-service

# Générer un guard
ng g guard guards/nom-guard

# Générer un module
ng g module modules/nom-module

# Tests unitaires
npm test

# Tests avec couverture
ng test --code-coverage
```

## 📁 Structure du projet

```
Prod/
├── backend/                           # API Node.js + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma              # Schéma de base de données Prisma
│   │   └── migrations/                # Migrations de la base de données
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                  # Configuration base de données
│   │   │   ├── env.ts                 # Variables d'environnement
│   │   │   └── environment.ts         # Configuration environnement
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts     # Authentification
│   │   │   ├── aap.controller.ts      # Appels à projets
│   │   │   ├── organisation.controller.ts
│   │   │   ├── demandeSubvention.controller.ts
│   │   │   └── sondage.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Logique authentification
│   │   │   ├── aap.service.ts         # Logique appels à projets
│   │   │   ├── organisation.service.ts
│   │   │   ├── demandeSubvention.service.ts
│   │   │   └── sondage.service.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts     # Validation JWT
│   │   │   ├── error.middleware.ts    # Gestion d'erreurs
│   │   │   └── validation.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── aap.routes.ts
│   │   │   ├── organisation.routes.ts
│   │   │   ├── demandeSubvention.routes.ts
│   │   │   ├── sondage.routes.ts
│   │   │   └── support.routes.ts
│   │   ├── types/
│   │   │   ├── index.ts               # Types TypeScript partagés
│   │   │   └── sondage.ts
│   │   ├── utils/
│   │   │   ├── sendEmail.ts           # Envoi d'emails
│   │   │   ├── mailer.ts              # Configuration Nodemailer
│   │   │   ├── generateOtp.ts         # Génération codes OTP
│   │   │   ├── mail_soumission.ts     # Templates emails
│   │   │   ├── mail_password_reset.ts
│   │   │   ├── mail_support.ts
│   │   │   └── templates/
│   │   │       ├── acknowledgmentTemplate.ts
│   │   │       └── internalNotificationTemplate.ts
│   │   ├── middleware/
│   │   │   └── upload.ts              # Configuration Multer
│   │   └── server.ts                  # Point d'entrée serveur
│   ├── uploads/                       # Fichiers uploadés
│   ├── .env.example                   # Template de configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                          # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                 # Modules administrateur
│   │   │   │   ├── dashboard/         # Dashboard admin
│   │   │   │   ├── login/             # Connexion admin
│   │   │   │   ├── recap/             # Récapitulatif demandes
│   │   │   │   └── admin.route.ts     # Routes admin
│   │   │   ├── user/                  # Modules utilisateur
│   │   │   │   ├── api/
│   │   │   │   │   ├── account.ts     # API compte utilisateur
│   │   │   │   │   └── sondage.api.ts # API sondage
│   │   │   │   ├── core/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── user-auth.guard.ts
│   │   │   │   │   ├── toast.service.ts
│   │   │   │   │   └── constants.ts
│   │   │   │   ├── dashboard/         # Dashboard utilisateur
│   │   │   │   ├── form/
│   │   │   │   │   ├── soumission/    # Wizard de soumission
│   │   │   │   │   └── recap/         # Récapitulatif avant soumission
│   │   │   │   ├── home/              # Page d'accueil
│   │   │   │   ├── login/             # Connexion utilisateur
│   │   │   │   ├── registration/      # Inscription
│   │   │   │   ├── otp/               # Validation OTP
│   │   │   │   ├── forgot-password/   # Mot de passe oublié
│   │   │   │   ├── reset-password/    # Réinitialisation mot de passe
│   │   │   │   ├── ui/
│   │   │   │   │   ├── toast-host/    # Système de notifications
│   │   │   │   │   └── fenetre-sondage/ # Fenêtre sondage
│   │   │   │   └── user.routes.ts     # Routes utilisateur
│   │   │   ├── services/
│   │   │   │   ├── api/
│   │   │   │   │   ├── axios-instance.ts
│   │   │   │   │   ├── aap.service.ts
│   │   │   │   │   ├── organisation.service.ts
│   │   │   │   │   ├── projet.service.ts
│   │   │   │   │   └── demande-subvention.service.ts
│   │   │   │   ├── auth/
│   │   │   │   │   └── authentifcationservice.ts
│   │   │   │   ├── organisme/
│   │   │   │   │   └── organismeservice.ts
│   │   │   │   ├── support/
│   │   │   │   │   └── support.service.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── cookie-interceptor.ts
│   │   │   │   ├── pdf.service.ts
│   │   │   │   └── aprojetv1.ts
│   │   │   ├── model/                 # Modèles TypeScript (DTOs)
│   │   │   │   ├── fpbgusersdto.ts
│   │   │   │   ├── organisationdto.ts
│   │   │   │   ├── projetFormdto.ts
│   │   │   │   └── loginvm.ts
│   │   │   ├── types/
│   │   │   │   └── models.ts
│   │   │   ├── core/                  # Guards globaux
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── admin.guard.ts
│   │   │   │   └── redirect-if-logged-in.guard.ts
│   │   │   ├── liste-appels/          # Liste appels publics
│   │   │   ├── appelaprojet/          # Détails appel
│   │   │   ├── page404/               # Page 404
│   │   │   ├── app.routes.ts          # Configuration routes
│   │   │   ├── app.config.ts          # Configuration Angular
│   │   │   └── app.ts                 # Composant racine
│   │   ├── assets/                    # Ressources statiques
│   │   ├── environments/
│   │   │   ├── environment.ts         # Config développement
│   │   │   ├── environment.development.ts
│   │   │   └── environment.prod.ts    # Config production
│   │   ├── styles.scss                # Styles globaux
│   │   └── main.ts                    # Point d'entrée
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── DEPLOYMENT_GUIDE.md               # Guide de déploiement complet
└── README.md                         # Ce fichier
```

## 🔌 API & Backend

### Routes API

#### Authentification (`/api/auth`)

| Méthode | Route                    | Description                        | Auth    |
| ------- | ------------------------ | ---------------------------------- | ------- |
| POST    | `/register/organisation` | Inscription d'une organisation (Étape 1 : génère OTP) | Public  |
| POST    | `/register/agent`        | Inscription d'un agent FPBG (génère OTP) | Public  |
| POST    | `/verify-otp`            | Vérification OTP et création du compte (Étape 2) | Public  |
| POST    | `/resend-otp`            | Renvoyer un code OTP               | Public  |
| POST    | `/login`                 | Connexion utilisateur              | Public  |
| POST    | `/forgot-password`       | Demande de réinitialisation        | Public  |
| POST    | `/reset-password`        | Réinitialisation mot de passe      | Public  |
| GET     | `/me`                    | Informations utilisateur connecté  | Privé   |
| POST    | `/logout`                | Déconnexion                        | Privé   |
| POST    | `/refresh-token`         | Rafraîchir le token JWT            | Privé   |

#### Demandes de Subvention (`/api/demandes`)

| Méthode | Route           | Description                        | Auth           |
| ------- | --------------- | ---------------------------------- | -------------- |
| POST    | `/submit`       | Soumettre une demande complète     | Privé (User)   |
| GET     | `/my-project`   | Récupérer la demande de l'utilisateur | Privé (User) |
| GET     | `/`             | Liste toutes les demandes (pagination) | Privé       |
| GET     | `/:id`          | Détails d'une demande              | Privé          |
| PUT     | `/:id`          | Mettre à jour une demande          | Privé (Owner)  |
| PATCH   | `/:id`          | Changer le statut d'une demande    | Privé (Owner/Admin) |
| DELETE  | `/:id`          | Supprimer une demande              | Privé (Owner/Admin) |

#### Appels à Projets (`/api/aap`)

| Méthode | Route           | Description                        | Auth           |
| ------- | --------------- | ---------------------------------- | -------------- |
| GET     | `/`             | Liste des appels à projets         | Public         |
| GET     | `/:id`          | Détails d'un appel                 | Public         |
| POST    | `/`             | Créer un appel                     | Privé (Admin)  |
| PUT     | `/:id`          | Mettre à jour un appel             | Privé (Admin)  |
| DELETE  | `/:id`          | Supprimer un appel                 | Privé (Admin)  |

#### Organisations (`/api/organisations`)

| Méthode | Route           | Description                        | Auth           |
| ------- | --------------- | ---------------------------------- | -------------- |
| GET     | `/`             | Liste des organisations            | Privé          |
| GET     | `/:id`          | Détails d'une organisation         | Privé          |
| POST    | `/`             | Créer une organisation             | Privé (Admin)  |
| PUT     | `/:id`          | Mettre à jour une organisation     | Privé (Admin)  |
| DELETE  | `/:id`          | Supprimer une organisation         | Privé (Admin)  |

#### Sondage (`/api/sondage`)

| Méthode | Route           | Description                        | Auth           |
| ------- | --------------- | ---------------------------------- | -------------- |
| POST    | `/repondre`     | Enregistrer une réponse de sondage | Privé (User)   |
| GET     | `/ma-reponse`   | Récupérer la réponse de l'utilisateur | Privé (User) |

#### Support (`/api/support`)

| Méthode | Route           | Description                        | Auth           |
| ------- | --------------- | ---------------------------------- | -------------- |
| POST    | `/contact`      | Envoyer un message de support      | Public         |

### Modèles de Données (Prisma)

#### Utilisateur

```prisma
model Utilisateur {
  id                    String              @id @default(uuid())
  email                 String              @unique
  hashMotPasse          String
  prenom                String?
  nom                   String?
  telephone             String?
  role                  Role                @default(UTILISATEUR)
  actif                 Boolean             @default(true)
  idOrganisation        String?
  resetToken            String?
  resetTokenExpiry      DateTime?
  creeLe                DateTime            @default(now())
  misAJourLe            DateTime            @updatedAt

  soumissions           DemandeSubvention[]
  evaluations           Evaluation[]
  piecesJointesValidees PieceJointe[]
  sessions              Session[]
  surveyResponses       SurveyResponse[]
  organisation          Organisation?       @relation(fields: [idOrganisation], references: [id])
}

enum Role {
  UTILISATEUR
  ADMINISTRATEUR
}
```

#### Organisation

```prisma
model Organisation {
  id               String                  @id @default(cuid())
  nom              String
  type             TypeOrganisation
  email            String?
  telephone        String?
  idTypeSubvention Int?
  creeLe           DateTime                @default(now())
  misAJourLe       DateTime                @updatedAt

  projets          DemandeSubvention[]
  liensAppel       LienAppelOrganisation[]
  typeSubvention   TypeSubvention?
  utilisateurs     Utilisateur[]
}

enum TypeOrganisation {
  ASSOCIATION
  ONG
  COMMUNAUTE
  COOPERATIVE
  PME
  PMI
  STARTUP
  SECTEUR_PUBLIC
  RECHERCHE
  PRIVE
  AUTRE
}
```

#### Demande de Subvention

```prisma
model DemandeSubvention {
  id                    String           @id @default(cuid())
  code                  String?          @unique
  statut                StatutSoumission @default(SOUMIS)
  typeSoumission        TypeSoumission   @default(NOTE_CONCEPTUELLE)
  idAppelProjets        String?
  idOrganisation        String?
  idSoumisPar           String?

  titre                 String
  localisation          String
  groupeCible           String
  justificationContexte String
  objectifs             String
  resultatsAttendus     String
  dureeMois             Int
  dateDebutActivites    DateTime
  dateFinActivites      DateTime
  resumeActivites       String
  tauxUsd               Int              @default(655)
  fraisIndirectsCfa     Decimal          @default(0)
  stadeProjet           StadeProjet      @default(DEMARRAGE)
  aFinancement          Boolean          @default(false)
  detailsFinancement    String?
  honneurAccepte        Boolean          @default(false)
  texteDurabilite       String
  texteReplication      String?
  domaines              String[]         @default([])

  creeLe                DateTime         @default(now())
  misAJourLe            DateTime         @updatedAt

  activites             Activite[]
  appelProjets          AppelProjets?
  organisation          Organisation?
  soumisPar             Utilisateur?
  evaluations           Evaluation[]
  piecesJointes         PieceJointe[]
  rapports              Rapport[]
  risques               Risque[]
}

enum StatutSoumission {
  BROUILLON
  SOUMIS
  EN_REVUE
  APPROUVE
  REJETE
}

enum TypeSoumission {
  NOTE_CONCEPTUELLE
  PROPOSITION_COMPLETE
}

enum StadeProjet {
  CONCEPTION
  DEMARRAGE
  AVANCE
  PHASE_FINALE
}
```

#### Appel à Projets

```prisma
model AppelProjets {
  id               String                  @id @default(cuid())
  code             String                  @unique
  titre            String
  description      String?
  dateDebut        DateTime
  dateFin          DateTime
  etapes           Json?
  idTypeSubvention Int?
  creeLe           DateTime                @default(now())
  misAJourLe       DateTime                @updatedAt

  typeSubvention   TypeSubvention?
  soumissions      DemandeSubvention[]
  organisations    LienAppelOrganisation[]
  thematiques      Thematique[]
}
```

### Authentification JWT

Le backend utilise JWT (JSON Web Tokens) pour l'authentification :

- **Génération** : Lors de la connexion ou validation OTP
- **Stockage** : Cookie httpOnly (sécurisé contre XSS)
- **Durée de vie** : 7 jours
- **Validation** : Middleware `auth.middleware.ts`
- **Refresh** : Endpoint `/api/auth/refresh-token`

**Structure du payload JWT :**

```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: 'UTILISATEUR' | 'ADMINISTRATEUR';
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### Gestion des Emails

Le backend envoie des emails via Nodemailer pour :

- **OTP** : Code de vérification lors de l'inscription
- **Reset Password** : Lien de réinitialisation du mot de passe
- **Soumission** : Accusé de réception de demande
- **Notification interne** : Alerte aux administrateurs

**Configuration SMTP** (dans `.env`) :

```env
SMTP_HOST="mail.starget.tech"
SMTP_PORT="465"
SMTP_USER="no-reply-fpbg@singcloud.ga"
SMTP_PASS="votre_mot_de_passe"
```

### Upload de Fichiers

Upload de documents justificatifs via Multer :

- **Dossier** : `backend/uploads/projets/`
- **Types acceptés** : PDF, DOCX, JPG, PNG
- **Taille max** : 50 MB
- **Documents requis** :
  - Lettre de motivation
  - CV des responsables
  - Certificat d'enregistrement
  - Statuts et règlement
  - Rapports financiers
  - Budget détaillé
  - Chronogramme
  - Et autres selon le type de subvention

## 💾 Base de Données

### Schema Prisma

Le projet utilise Prisma ORM avec PostgreSQL. Schema complet disponible dans `backend/prisma/schema.prisma`.

**Tables principales :**

- `Utilisateur` : Comptes utilisateurs et administrateurs
- `Session` : Sessions de connexion JWT
- `Organisation` : Organisations participantes
- `TypeSubvention` : Types de subventions disponibles
- `AppelProjets` : Appels à projets publiés
- `Thematique` : Thématiques par appel
- `DemandeSubvention` : Demandes de subvention soumises
- `Activite` : Activités du projet avec sous-activités
- `LigneBudget` : Lignes budgétaires par activité
- `Risque` : Risques identifiés et mitigation
- `PieceJointe` : Documents justificatifs uploadés
- `Evaluation` : Évaluations par les administrateurs
- `Otp` : Codes OTP pour validation email
- `SurveyResponse` : Réponses au sondage d'acquisition

### Migrations

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (⚠️ SUPPRIME TOUTES LES DONNÉES)
npx prisma migrate reset

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

### Base de Données Recommandée

**Neon DB** (PostgreSQL serverless) :
- ✅ Gratuit pour commencer
- ✅ Hébergement cloud
- ✅ SSL automatique
- ✅ Backups automatiques
- ✅ Scaling automatique

Configuration dans `.env` :
```env
DATABASE_URL="postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

## 🌐 Déploiement

Pour déployer l'application complète en production, consultez le guide détaillé :

📖 **[Guide Complet de Déploiement](DEPLOYMENT_GUIDE.md)**

### Déploiement Rapide

#### Backend

```bash
cd backend

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres de production

# Installation et build
npm install --production
npx prisma generate
npx prisma migrate deploy

# Démarrage
npm start
```

#### Frontend

```bash
cd frontend

# Configuration
# Éditer src/environments/environment.prod.ts

# Build
npm install
ng build --configuration=production

# Déployer le dossier dist/fpbg/browser/ sur votre serveur web
```

### Plateformes de Déploiement Recommandées

#### Backend
- **Railway** : Déploiement Node.js simplifié
- **Heroku** : Platform as a Service
- **DigitalOcean App Platform** : Conteneurs gérés
- **VPS** : Serveur dédié (Ubuntu + Nginx + PM2)

#### Frontend
- **Vercel** : Déploiement Angular optimisé
- **Netlify** : Hosting statique avec CDN
- **AWS S3 + CloudFront** : Solution scalable
- **Nginx** : Serveur web traditionnel

#### Base de Données
- **Neon DB** : PostgreSQL serverless (recommandé)
- **Railway PostgreSQL** : PostgreSQL géré
- **AWS RDS** : PostgreSQL enterprise

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

#### Authentification et Autorisation
- **JWT avec httpOnly cookies** : Protection contre XSS
- **Hashing bcryptjs** : Mots de passe hashés avec salt
- **OTP email** : Validation en 2 étapes pour l'inscription
- **Reset tokens** : Tokens uniques avec expiration pour reset password
- **Guards Angular** : Protection des routes frontend
- **Middlewares Express** : Validation des requêtes backend

#### Protection des Données
- **CORS configuré** : Origines autorisées définies
- **Validation des inputs** : Validation côté backend avec middlewares
- **Sanitization** : Nettoyage des données utilisateur
- **HTTPS** : SSL/TLS requis en production
- **Rate limiting** : Protection contre les abus (à implémenter)
- **SQL Injection** : Prévention via Prisma ORM

#### Fichiers et Uploads
- **Validation des types** : Seuls certains types de fichiers acceptés
- **Limite de taille** : 50 MB maximum
- **Storage sécurisé** : Fichiers stockés hors de webroot
- **Scan antivirus** : Recommandé en production

### Checklist Sécurité pour la Production

- [ ] `JWT_SECRET` différent et fort (64+ caractères)
- [ ] Fichier `.env` dans `.gitignore`
- [ ] HTTPS activé avec certificat SSL valide
- [ ] CORS configuré avec origines exactes
- [ ] Mots de passe SMTP sécurisés
- [ ] Base de données avec SSL/TLS activé
- [ ] Rate limiting implémenté
- [ ] Logs d'erreurs sécurisés (pas de données sensibles)
- [ ] Backups automatiques de la base de données
- [ ] Variables d'environnement sécurisées
- [ ] Scan de sécurité des dépendances NPM (`npm audit`)

### Générer un JWT Secret Fort

```bash
# Méthode 1 : Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Méthode 2 : OpenSSL
openssl rand -hex 64

# Méthode 3 : Python
python -c "import secrets; print(secrets.token_hex(64))"
```

## 🧪 Tests

### Tests Unitaires

```bash
# Frontend
cd frontend
npm test

# Backend (à implémenter)
cd backend
npm test
```

### Tests avec Couverture

```bash
cd frontend
ng test --code-coverage
```

Rapport généré dans `frontend/coverage/`

### Tests E2E (à implémenter)

```bash
npm run e2e
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### 1. Fork le projet

```bash
git clone https://github.com/votre-username/fpbg.git
cd fpbg
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Faire vos modifications

Assurez-vous de :
- Suivre les conventions de code TypeScript
- Utiliser Prettier pour le formatage
- Commenter le code complexe
- Ajouter des tests si possible
- Mettre à jour la documentation

### 4. Commit

```bash
git add .
git commit -m "feat: ajout de la fonctionnalité X"
```

**Convention de commit (Conventional Commits) :**

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Ajout de tests
- `chore:` Maintenance, config

### 5. Push et Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Ouvrez ensuite une Pull Request sur GitHub avec une description détaillée.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2025 FPBG - Fonds de Préservation de la Biodiversité au Gabon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 📞 Support & Contact

- **Email** : contact@fpbg.org
- **Téléphone** : (+241) 76 53 34 62
- **Adresse** : Baie des Rois, Immeuble FGIS, 2ème étage, Libreville, Gabon
- **Site web** : https://fpbg.org
- **Réseaux sociaux** :
  - [Facebook](https://www.facebook.com/profile.php?id=61572016092621)
  - [Twitter/X](https://x.com/FPBG_Gabon)
  - [LinkedIn](https://www.linkedin.com/company/106050434/)
  - [Instagram](https://instagram.com/fpbg.gabon)
  - [YouTube](https://youtube.com/@fpbg-gabon)
  - [WhatsApp Channel](https://whatsapp.com/channel/0029Vb6tduQK0IBibg4ui80B)

## 🔮 Roadmap

### Version 1.0 (Actuelle) ✅

- ✅ Authentification complète (inscription, OTP, login, reset password)
- ✅ Système de sondage post-inscription
- ✅ Gestion des organisations
- ✅ Gestion des appels à projets avec thématiques
- ✅ Formulaire de soumission multi-étapes complet
- ✅ Upload de documents justificatifs
- ✅ Dashboard utilisateur avec statuts
- ✅ Dashboard administrateur
- ✅ Évaluation de demandes
- ✅ Génération de PDF
- ✅ Notifications email automatiques
- ✅ API REST complète avec Prisma + PostgreSQL

### Version 1.1 (Prochaine) 🔄

- [ ] Amélioration du système d'évaluation
- [ ] Exports CSV/Excel des demandes
- [ ] Recherche et filtres avancés
- [ ] Notifications en temps réel (WebSockets)
- [ ] Module de reporting avancé
- [ ] Suivi des versions de demandes
- [ ] Commentaires sur les demandes

### Version 2.0 (Futur) 📅

- [ ] Application mobile iOS/Android (React Native)
- [ ] Mode hors ligne pour l'app mobile
- [ ] Notifications push mobiles
- [ ] Intégration paiements en ligne
- [ ] Workflow d'approbation multi-niveaux
- [ ] API publique pour partenaires
- [ ] Multi-langue (FR/EN)
- [ ] Module de formation en ligne
- [ ] Système de chat en temps réel

## 🙏 Remerciements

Merci à toutes les organisations et personnes qui contribuent à la conservation de la biodiversité au Gabon :

- **FPBG** - Pour le financement et le support du projet
- **Obligations Bleues** - Partenaire stratégique dans le financement
- **Communauté Open Source** - Pour les frameworks et outils (Angular, Express, Prisma, etc.)
- **Neon DB** - Pour l'hébergement de la base de données
- **Contributeurs** - Pour leur travail et dévouement au projet

## 🌟 Statistiques du Projet

- **200M+ FCFA** de budget disponible
- **4 étapes** de soumission simplifiées
- **1ère édition** lancée en 2025
- **Architecture full-stack TypeScript** moderne
- **Base de données PostgreSQL** avec Prisma ORM
- **Sécurité avancée** avec JWT, OTP, HTTPS
- **Responsive design** avec Tailwind CSS
- **Email automatisé** avec Nodemailer

---

**Développé avec ❤️ pour la conservation de la biodiversité au Gabon** 🇬🇦

_Pour toute question, suggestion ou contribution, n'hésitez pas à ouvrir une issue sur GitHub ou à nous contacter directement._

---

## 📚 Documentation Complémentaire

- [Guide de Déploiement Complet](DEPLOYMENT_GUIDE.md)
- [Configuration Backend](backend/DEPLOYMENT.md)
- [Configuration Frontend](frontend/DEPLOYMENT.md)
- [Schema Prisma](backend/prisma/schema.prisma)
- [Variables d'Environnement](backend/.env.example)
