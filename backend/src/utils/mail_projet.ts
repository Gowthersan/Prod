import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

/**
 * Crée un transporter Gmail pour tous les emails
 * ✅ Configuration simplifiée qui fonctionne (même config que pour les OTP)
 */
function createEmailTransporter(): Transporter {
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465');

  if (!emailUser || !emailPass) {
    throw new Error("SMTP_USER et SMTP_PASS doivent être définis dans les variables d'environnement");
  }

  // Si c'est un email Gmail, utiliser service: 'gmail'
  if (emailUser.endsWith('@gmail.com')) {
    console.log('[SMTP] Création du transporter Gmail...');
    console.log(`[SMTP] Service: Gmail`);
    console.log(`[SMTP] User: ${emailUser}\n`);

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Sinon, utiliser le serveur SMTP personnalisé (singcloud.ga)
  console.log('[SMTP] Création du transporter SMTP personnalisé...');
  console.log(`[SMTP] Host: ${smtpHost}`);
  console.log(`[SMTP] Port: ${smtpPort}`);
  console.log(`[SMTP] User: ${emailUser}\n`);

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true pour 465, false pour les autres ports
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Interface pour les données du projet
 */
export interface DemandeData {
  titre: string;
  organisation: {
    nom: string;
    email: string | null;
    telephone: string | null;
  };
  soumisPar: {
    nom: string | null;
    prenom: string | null;
    email: string;
  };
  domaines: string[];
  localisation: string;
  montantTotal: number;
  objectifs?: string;
  dureeMois?: number;
  activites?: any[];
  contextJustification?: string;
  expectedResults?: string;
  dateDebutActivites?: Date;
  dateFinActivites?: Date;
  activitiesSummary?: string;
  groupeCible: string;
  usdRate: number;
  indirectOverheads?: number;
  hasFunding: boolean;
  fundingDetails?: string;
  sustainability: string;
  replicability?: string;
  projectStage?: string;
  risques?: any[];
  attachments?: Array<{
    label: string;
    fileName: string;
    base64?: string;
    url?: string;
  }>;
}

/**
 * Template HTML pour l'utilisateur - Confirmation de soumission
 */
function generateUserConfirmationTemplate(data: DemandeData): string {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const montantFormate = data.montantTotal.toLocaleString('fr-FR');
  const nomComplet = `${data.soumisPar.prenom || ''} ${data.soumisPar.nom || ''}`.trim();

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de soumission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f6f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Projet Soumis avec Succès !
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Votre demande de subvention a bien été enregistrée
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Bonjour <strong>${nomComplet || 'Cher partenaire'}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Nous avons bien reçu votre demande de subvention. Votre projet est maintenant <strong style="color: #16a34a;">en attente de validation</strong> par notre équipe.
              </p>

              <!-- Résumé du projet -->
              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">
                      📋 Résumé de votre projet
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Titre:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.titre}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Organisation:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.organisation.nom}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Localisation:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.localisation}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Montant total:
                        </td>
                        <td style="color: #16a34a; font-size: 16px; font-weight: 700;">
                          ${montantFormate} FCFA
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Durée:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.dureeMois} mois
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Pièces jointes PDF -->
              ${
                data.attachments && data.attachments.length > 0
                  ? `
              <table role="presentation" style="width: 100%; background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                      📎 Documents soumis
                    </h2>
                  </td>
                </tr>
                ${data.attachments
                  .map(
                    (attachment) => `
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" style="width: 100%; background-color: white; border-radius: 8px; padding: 15px; border: 1px solid #dbeafe;">
                      <tr>
                        <td style="width: 50px; vertical-align: middle;">
                          <div style="width: 40px; height: 40px; background-color: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            📄
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 15px;">
                          <div style="color: #1e293b; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                            ${attachment.label || 'Document'}
                          </div>
                          <div style="color: #64748b; font-size: 12px;">
                            ${attachment.fileName}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                  )
                  .join('')}
              </table>
              `
                  : ''
              }

              <!-- Prochaines étapes -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                  🔄 Prochaines étapes
                </h3>
                <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
                  <li>Notre équipe va examiner votre demande</li>
                  <li>Vous recevrez un email de confirmation dans les prochains jours</li>
                  <li>En cas de questions, nous vous recontacterons directement</li>
                </ol>
              </div>

              <p style="margin: 20px 0 0 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Merci de votre confiance et à très bientôt !
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                Soumis le ${currentDate}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FPBG - Fonds pour la Promotion de la Biodiversité au Gabon
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template HTML pour le support - Nouvelle demande
 */
function generateSupportNotificationTemplate(data: DemandeData, demandeId: string): string {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const montantFormate = data.montantTotal.toLocaleString('fr-FR');
  const nomComplet = `${data.soumisPar.prenom || ''} ${data.soumisPar.nom || ''}`.trim();

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de subvention</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f6f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 700px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H13V16H11V12H7V10H11V6H13V10H17V12Z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Nouvelle Demande de Subvention
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Un nouveau projet a été soumis et nécessite votre attention
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Informations contact -->
              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">
                      👤 Contact
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Nom:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${nomComplet || 'Non renseigné'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Email:
                        </td>
                        <td style="color: #0f766e; font-size: 14px; font-weight: 600;">
                          <a href="mailto:${data.soumisPar.email}" style="color: #0f766e; text-decoration: none;">${
    data.soumisPar.email
  }</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #64748b; font-size: 14px; font-weight: 500;">
                          Organisation:
                        </td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.organisation.nom}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Détails du projet -->
              <table role="presentation" style="width: 100%; background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #78350f; font-size: 18px; font-weight: 600;">
                      📊 Détails du Projet
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Titre:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 700;">
                          ${data.titre}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Localisation:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 600;">
                          ${data.localisation}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Domaines:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 600;">
                          ${data.domaines.join(', ')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Montant demandé:
                        </td>
                        <td style="color: #16a34a; font-size: 18px; font-weight: 700;">
                          ${montantFormate} FCFA
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Durée:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 600;">
                          ${data.dureeMois} mois
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${
                  data.activites && data.activites.length > 0
                    ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Activités:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 600;">
                          ${data.activites.length} activité(s)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                    : ''
                }
                ${
                  data.attachments && data.attachments.length > 0
                    ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 140px; color: #92400e; font-size: 14px; font-weight: 500;">
                          Documents:
                        </td>
                        <td style="color: #78350f; font-size: 14px; font-weight: 600;">
                          ${data.attachments.length} document(s) fourni(s)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                    : ''
                }
              </table>

              <!-- Liste des documents PDF (noms uniquement - sans pièces jointes) -->
              ${
                data.attachments && data.attachments.length > 0
                  ? `
              <table role="presentation" style="width: 100%; background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                      📎 Documents soumis (${data.attachments.length})
                    </h2>
                    <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px;">
                      Consultez les documents directement sur la plateforme en cliquant sur le bouton ci-dessous
                    </p>
                  </td>
                </tr>
                ${data.attachments
                  .map(
                    (attachment, index) => `
                <tr>
                  <td style="padding: 6px 0;">
                    <div style="display: flex; align-items: center; background-color: white; border-radius: 6px; padding: 10px 15px; border: 1px solid #dbeafe;">
                      <span style="color: #3b82f6; font-weight: 700; font-size: 14px; margin-right: 12px;">${index + 1}.</span>
                      <div style="flex: 1;">
                        <div style="color: #1e293b; font-weight: 600; font-size: 13px;">
                          ${attachment.label || 'Document'}
                        </div>
                        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
                          ${attachment.fileName}
                        </div>
                      </div>
                      <span style="color: #10b981; font-size: 18px;">✓</span>
                    </div>
                  </td>
                </tr>
                `
                  )
                  .join('')}
              </table>
              `
                  : ''
              }

              <!-- Bouton d'action -->
              <table role="presentation" style="width: 100%; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://guichetnumerique.fpbg.ga/admin/form/recap/${demandeId}"
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3); transition: all 0.3s;">
                      🔍 Consulter la demande et les documents
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      Cliquez pour accéder à tous les détails et télécharger les documents
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                Reçu le ${currentDate}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FPBG - Système de gestion des demandes
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envoie les emails de confirmation de soumission
 */
export async function sendProjectSubmissionEmails(data: DemandeData, demandeId: string): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('[PROJECT EMAILS] ENVOI EN COURS');
  console.log('='.repeat(80));
  console.log(`Projet: ${data.titre}`);
  console.log(`Organisation: ${data.organisation.nom}`);
  console.log(`Utilisateur: ${data.soumisPar.email}`);
  console.log(`ID Demande: ${demandeId}`);
  console.log('='.repeat(80) + '\n');

  const supportEmail = 'gauthier.mintsa.02@gmail.com';

  // Prepare PDF attachments from base64
  const emailAttachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];

  if (data.attachments && data.attachments.length > 0) {
    console.log(`[ATTACHMENTS] Préparation de ${data.attachments.length} pièce(s) jointe(s)`);

    for (const attachment of data.attachments) {
      if (attachment.base64) {
        try {
          // Convert base64 to Buffer
          const buffer = Buffer.from(attachment.base64, 'base64');
          emailAttachments.push({
            filename: attachment.fileName || 'document.pdf',
            content: buffer,
            contentType: 'application/pdf'
          });
          console.log(`[ATTACHMENTS] ✓ ${attachment.fileName} ajouté (${(buffer.length / 1024).toFixed(2)} KB)`);
        } catch (error) {
          console.error(`[ATTACHMENTS] ✗ Erreur conversion ${attachment.fileName}:`, error);
        }
      }
    }

    console.log(`[ATTACHMENTS] ${emailAttachments.length} document(s) prêt(s) pour envoi\n`);
  }

  try {
    // ✅ Utiliser la même configuration simplifiée qui fonctionne pour les OTP
    const transporter = createEmailTransporter();

    // 1. Email à l'utilisateur
    console.log(`[SENDING] Envoi email de confirmation à l'utilisateur...`);
    console.log(`[DEBUG] De: ${process.env.SMTP_USER}`);
    console.log(`[DEBUG] Vers: ${data.soumisPar.email}`);
    const userHtml = generateUserConfirmationTemplate(data);

    const userResult = await transporter.sendMail({
      from: `"FPBG - Fonds pour la Biodiversité" <${process.env.SMTP_USER}>`,
      to: data.soumisPar.email,
      subject: `✅ Confirmation de soumission - ${data.titre}`,
      html: userHtml,
      attachments: emailAttachments
    });
    console.log("[SUCCESS] Email de confirmation envoyé à l'utilisateur");
    console.log(`[DEBUG] MessageId: ${userResult.messageId}`);
    console.log(`[DEBUG] Response: ${userResult.response}\n`);

    // 2. Email au support (SANS pièces jointes pour éviter l'antivirus)
    console.log(`[SENDING] Envoi notification au support (sans pièces jointes)...`);
    console.log(`[DEBUG] De: ${process.env.SMTP_USER}`);
    console.log(`[DEBUG] Vers: ${supportEmail}`);
    console.log(`[DEBUG] ReplyTo: ${data.soumisPar.email}`);
    console.log(`[DEBUG] Lien vers recap: https://guichetnumerique.fpbg.ga/admin/form/recap/${demandeId}`);
    const supportHtml = generateSupportNotificationTemplate(data, demandeId);

    const supportResult = await transporter.sendMail({
      from: `"FPBG - Notification" <${process.env.SMTP_USER}>`,
      to: supportEmail,
      replyTo: data.soumisPar.email,
      subject: `🆕 Nouvelle demande: ${data.titre} - ${data.organisation.nom}`,
      html: supportHtml
      // ✅ SANS pièces jointes pour éviter le blocage antivirus
    });
    console.log('[SUCCESS] Email de notification envoyé au support (sans PDF)');
    console.log(`[DEBUG] MessageId: ${supportResult.messageId}`);
    console.log(`[DEBUG] Response: ${supportResult.response}\n`);
  } catch (error: any) {
    console.error("[ERROR] Erreur d'envoi d'email:", error.message);
    console.error('[ERROR] Stack:', error.stack);
    throw new Error("Impossible d'envoyer les emails de confirmation");
  }
}
