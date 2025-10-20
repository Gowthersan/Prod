# Guide d'implémentation PDF avec Base64

## Résumé des modifications effectuées

### ✅ 1. Service PDF (frontend/src/app/services/pdf.service.ts)
Service créé avec:
- Validation PDF (type + taille max 10MB)
- Conversion PDF vers Base64
- Utilitaires pour formater la taille et créer des liens de téléchargement

### ✅ 2. Formulaire de soumission (frontend/src/app/user/form/soumission/soumission.ts)
Modifications:
- Import du PdfService
- ALLOWED_MIME réduit à `['application/pdf']` uniquement
- documentsState enrichi avec `base64`, `fileName`, `fileSize`
- Méthode `uploadDocument()` modifiée pour convertir en Base64
- Méthode `removeDocument()` met à jour pour nettoyer le base64
- Méthode `submit()` envoie le Base64 dans les attachments

### ✅ 3. Backend - Les données Base64 sont reçues
Le backend reçoit maintenant les PDF en Base64 dans `projectData.attachments[].base64`

## 🔧 Modifications restantes à faire

### 4. Modifier les pages de récapitulatif pour afficher les PDF

#### A. Page récap utilisateur (frontend/src/app/user/form/recap/recap.ts)

**Ajouter dans les imports:**
```typescript
import { PdfService } from '../../../services/pdf.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
```

**Injecter les services:**
```typescript
private pdfService = inject(PdfService);
private sanitizer = inject(DomSanitizer);
```

**Ajouter des propriétés pour gérer l'affichage PDF:**
```typescript
// Signal pour le PDF sélectionné
selectedPdfKey = signal<string | null>(null);
selectedPdfUrl = signal<SafeResourceUrl | null>(null);
selectedPdfFileName = signal<string>('');

// Méthode pour afficher un PDF
showPdf(key: string) {
  const attachment = this.submission()?.attachments?.find((att: any) => att.key === key);
  if (attachment && attachment.base64) {
    const dataUrl = this.pdfService.getDataUrl(attachment.base64);
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);

    this.selectedPdfKey.set(key);
    this.selectedPdfUrl.set(safeUrl);
    this.selectedPdfFileName.set(attachment.fileName || 'document.pdf');
  }
}

// Méthode pour télécharger un PDF
downloadPdf(key: string) {
  const attachment = this.submission()?.attachments?.find((att: any) => att.key === key);
  if (attachment && attachment.base64) {
    const link = document.createElement('a');
    link.href = this.pdfService.getDataUrl(attachment.base64);
    link.download = attachment.fileName || 'document.pdf';
    link.click();
  }
}

// Méthode pour fermer le visualiseur
closePdfViewer() {
  this.selectedPdfKey.set(null);
  this.selectedPdfUrl.set(null);
  this.selectedPdfFileName.set('');
}
```

#### B. Modifier le HTML de recap (frontend/src/app/user/form/recap/recap.html)

**Remplacer la section Étape 9 (Annexes) par:**
```html
<!-- Étape 9 -->
<article *ngIf="stepIndex() === 8" class="card">
  <h2 class="card-title">9. Annexes</h2>

  <div *ngIf="submission()?.attachments?.length; else noAttachments" class="annexes-grid">
    <div *ngFor="let attachment of submission()?.attachments" class="annexe-card">
      <div class="annexe-icon">📄</div>
      <div class="annexe-info">
        <h4 class="annexe-label">{{ attachment.label }}</h4>
        <p class="annexe-filename">{{ attachment.fileName }}</p>
        <p class="annexe-size muted">{{ formatFileSize(attachment.fileSize) }}</p>
      </div>
      <div class="annexe-actions">
        <button class="btn btn-ghost btn-sm" (click)="showPdf(attachment.key)">
          👁️ Visualiser
        </button>
        <button class="btn btn-brand btn-sm" (click)="downloadPdf(attachment.key)">
          📥 Télécharger
        </button>
      </div>
    </div>
  </div>

  <ng-template #noAttachments>
    <p class="muted">Aucune pièce jointe</p>
  </ng-template>
</article>

<!-- Visualiseur PDF Modal -->
<div *ngIf="selectedPdfUrl()" class="pdf-modal">
  <div class="pdf-modal-backdrop" (click)="closePdfViewer()"></div>
  <div class="pdf-modal-content">
    <div class="pdf-modal-header">
      <h3>{{ selected PdfFileName() }}</h3>
      <button class="btn btn-ghost" (click)="closePdfViewer()">✕ Fermer</button>
    </div>
    <iframe [src]="selectedPdfUrl()" class="pdf-iframe"></iframe>
  </div>
</div>
```

**Ajouter les styles CSS dans recap.html (dans la balise `<style>`):**
```css
/* Grille d'annexes */
.annexes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.annexe-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.annexe-card:hover {
  border-color: var(--brand-teal);
  box-shadow: 0 4px 12px rgba(11, 31, 44, 0.1);
  transform: translateY(-2px);
}

.annexe-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.annexe-info {
  flex: 1;
  margin-bottom: 16px;
}

.annexe-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-900);
  margin-bottom: 8px;
}

.annexe-filename {
  font-size: 13px;
  color: var(--ink-700);
  word-break: break-word;
  margin-bottom: 4px;
}

.annexe-size {
  font-size: 12px;
}

.annexe-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  flex: 1;
}

/* Modal PDF */
.pdf-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.pdf-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.pdf-modal-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: modalSlideUp 0.3s ease;
}

.pdf-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
}

.pdf-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--ink-900);
}

.pdf-iframe {
  flex: 1;
  width: 100%;
  border: none;
  border-radius: 0 0 16px 16px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Ajouter la méthode formatFileSize dans le TypeScript:**
```typescript
formatFileSize(bytes: number): string {
  return this.pdfService.formatFileSize(bytes);
}
```

#### C. Page récap admin (frontend/src/app/admin/recap/recap.html & recap.ts)

Appliquer les mêmes modifications que pour la page utilisateur.

### 5. Backend - Modifier mail_projet.ts pour inclure les PDF

**Dans backend/src/utils/mail_projet.ts**, modifier la fonction pour:
1. Accepter les attachments avec base64
2. Générer des liens de téléchargement dans l'email HTML
3. Ajouter les PDF comme pièces jointes dans l'email nodemailer

**Exemple de modification:**
```typescript
export interface Attachment {
  key: string;
  label: string;
  fileName: string;
  fileSize: number;
  base64: string;
}

export interface DemandeData {
  // ... existing fields
  attachments?: Attachment[];
}

// Dans la fonction sendProjectSubmissionEmails:
const attachments = data.attachments?.map(att => ({
  filename: att.fileName,
  content: Buffer.from(att.base64, 'base64'),
  contentType: 'application/pdf'
})) || [];

// Dans le HTML de l'email, ajouter:
<h3>📎 Pièces jointes</h3>
<ul>
  ${data.attachments?.map(att => `
    <li>
      <strong>${att.label}</strong>: ${att.fileName} (${formatBytes(att.fileSize)})
    </li>
  `).join('') || '<li>Aucune pièce jointe</li>'}
</ul>

// Puis dans l'appel nodemailer:
await transporter.sendMail({
  from: emailUser,
  to: recipientEmail,
  subject: subject,
  html: emailHtml,
  attachments: attachments // Ajouter les PDF en pièces jointes
});
```

## 📝 Notes importantes

1. **Taille des emails**: Les PDF en Base64 augmentent la taille de ~33%. Pour de gros fichiers, considérez un stockage cloud (AWS S3, etc.) avec des liens.

2. **Limite des emails**: La plupart des serveurs email ont une limite de 25-50MB par email.

3. **Base de données**: Si vous stockez le Base64 en BDD, utilisez un type `TEXT` ou `LONGTEXT` (MySQL) / `TEXT` (PostgreSQL).

4. **Performance**: Pour l'affichage dans le récap, utilisez `SafeResourceUrl` d'Angular pour éviter les problèmes de sécurité.

5. **Compatibilité navigateur**: Les iframes avec data URLs fonctionnent sur tous les navigateurs modernes.

## ✅ Tests à effectuer

1. Upload d'un PDF < 10MB → devrait fonctionner
2. Upload d'un fichier > 10MB → devrait être rejeté
3. Upload d'un fichier non-PDF → devrait être rejeté
4. Soumission du formulaire → vérifier que les PDF sont dans le JSON
5. Affichage dans le récap → visualiser et télécharger les PDF
6. Email reçu → vérifier que les PDF sont en pièces jointes

## 🔄 Prochaines étapes recommandées

1. Implémenter le stockage cloud pour les gros fichiers
2. Ajouter une prévisualisation lors de l'upload
3. Ajouter un indicateur de progression pour l'upload
4. Compresser les PDF avant conversion si possible
