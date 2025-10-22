# 💻 Configuration VS Code - FPBG

## 🎯 Problème : Erreurs TypeScript croisées

Si vous voyez des erreurs TypeScript comme :
```
Le fichier 'backend/src/...' ne se trouve pas sous 'rootDir' 'frontend/src'
```

Cela signifie que VS Code essaie de compiler les fichiers du backend avec la configuration TypeScript du frontend (ou vice-versa).

## ✅ Solution Recommandée : Utiliser le Workspace

### Méthode 1 : Ouvrir avec le Workspace (RECOMMANDÉ)

Au lieu d'ouvrir le dossier racine `Prod`, ouvrez le fichier workspace :

```bash
code fpbg.code-workspace
```

Ou dans VS Code :
1. **File** → **Open Workspace from File...**
2. Sélectionnez `fpbg.code-workspace`

**Avantages :**
- ✅ Projets frontend et backend complètement isolés
- ✅ Configuration TypeScript séparée pour chaque projet
- ✅ Pas d'erreurs de compilation croisée
- ✅ Meilleure organisation dans l'explorateur de fichiers

### Méthode 2 : Recharger la fenêtre VS Code

Si vous avez déjà ouvert le projet :

1. Appuyez sur `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)
2. Tapez "Reload Window"
3. Appuyez sur Entrée

Ou :
1. **File** → **Close Workspace**
2. Rouvrez avec `code fpbg.code-workspace`

## 🔧 Configuration Actuelle

### Structure du Workspace

Le workspace configure 2 dossiers séparés :

```
FPBG Workspace
├── 🎨 Frontend (frontend/)
│   └── Utilise son propre tsconfig.json
└── ⚙️ Backend (backend/)
    └── Utilise son propre tsconfig.json
```

### Exclusions TypeScript

**Frontend** (`frontend/tsconfig.json`) :
```json
{
  "exclude": [
    "../backend/**/*"  // Ignore tous les fichiers du backend
  ]
}
```

**Backend** (`backend/tsconfig.json`) :
```json
{
  "exclude": [
    "node_modules",
    "dist",
    "../frontend"  // Ignore tous les fichiers du frontend
  ]
}
```

## 🚫 À Éviter

### ❌ N'ouvrez PAS le dossier racine directement

```bash
# ❌ Évitez ceci
cd Prod
code .
```

### ✅ Ouvrez le workspace à la place

```bash
# ✅ Faites ceci
cd Prod
code fpbg.code-workspace
```

## 🆘 Dépannage

### Les erreurs TypeScript persistent

1. **Fermez tous les fichiers ouverts**
2. **Rechargez VS Code** :
   - `Ctrl+Shift+P` → "Reload Window"
3. **Vérifiez que vous utilisez le workspace** :
   - En bas à gauche, vous devriez voir "FPBG (Workspace)"
4. **Redémarrez le serveur TypeScript** :
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### TypeScript ne trouve pas les définitions

1. Vérifiez que `node_modules` existe dans chaque projet :
   ```bash
   cd frontend && npm install
   cd backend && npm install
   ```

2. Régénérez le client Prisma (backend) :
   ```bash
   cd backend
   npx prisma generate
   ```

### VS Code utilise la mauvaise version de TypeScript

1. Ouvrez un fichier `.ts`
2. En bas à droite, cliquez sur la version TypeScript
3. Sélectionnez "Use Workspace Version"

## 📁 Structure Recommandée

```
Prod/
├── fpbg.code-workspace     ← OUVRIR CE FICHIER !
├── .vscode/
│   └── settings.json        (Configuration globale)
├── frontend/
│   ├── tsconfig.json        (Config TS frontend)
│   ├── node_modules/
│   └── src/
└── backend/
    ├── tsconfig.json        (Config TS backend)
    ├── node_modules/
    └── src/
```

## 🎨 Configuration VS Code Additionnelle

### Extensions Recommandées

Le workspace recommande automatiquement ces extensions :
- **Angular Language Service** : Support Angular
- **Prettier** : Formatage du code
- **ESLint** : Linting JavaScript/TypeScript
- **Tailwind CSS IntelliSense** : Autocomplétion Tailwind
- **Prisma** : Support Prisma ORM

### Paramètres du Workspace

Les paramètres suivants sont automatiquement appliqués :

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.angular": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## ✨ Avantages du Workspace

1. **Isolation Complète** : Chaque projet a son propre contexte TypeScript
2. **Performance** : VS Code indexe seulement les fichiers nécessaires
3. **Clarté** : Navigation facilitée entre frontend et backend
4. **Configuration** : Paramètres spécifiques par projet possibles

## 🔄 Workflow Quotidien

### Démarrer une session de développement

```bash
# 1. Ouvrir le workspace
code fpbg.code-workspace

# 2. Ouvrir 2 terminaux (Ctrl+Shift+`)

# Terminal 1 : Backend
cd backend
npm run dev

# Terminal 2 : Frontend
cd frontend
npm start
```

### Passer d'un projet à l'autre

- **Explorateur de fichiers** : Cliquez sur "Frontend" ou "Backend" en haut
- **Commande rapide** : `Ctrl+P` puis tapez le nom du fichier
- **Recherche** : `Ctrl+Shift+F` cherche dans les deux projets

## 📚 Ressources

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [VS Code Multi-root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)
- [Angular tsconfig](https://angular.dev/reference/configs/file-structure#typescript-configuration)

---

## 🎯 En Résumé

**Pour éviter les erreurs TypeScript :**
1. ✅ Toujours ouvrir `fpbg.code-workspace`
2. ✅ Ne jamais ouvrir le dossier racine directement
3. ✅ Recharger VS Code si les erreurs persistent
4. ✅ Utiliser "Use Workspace Version" pour TypeScript

**Si vous voyez encore des erreurs après avoir suivi ces étapes, contactez l'équipe de développement.**
