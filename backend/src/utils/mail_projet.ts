import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Configuration SMTP pour l'envoi d'emails de projet
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.singcloud.ga',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'no-reply-fpbg@singcloud.ga',
    pass: process.env.SMTP_PASS || ''
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  authMethod: 'LOGIN',
  debug: false,
  logger: false
});

/**
 * Interface pour les données de la demande (correspond à FrontendProjectData)
 */
export interface DemandeData {
  // Informations de base
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

  // Étape 1 - Proposition
  domaines: string[];
  localisation: string;
  groupeCible: string;
  contextJustification: string;

  // Étape 2 - Objectifs
  objectifs: string;
  expectedResults: string;
  dureeMois: number;

  // Étape 3 - Activités
  dateDebutActivites: Date;
  dateFinActivites: Date;
  activitiesSummary: string;
  activites?: Array<{
    titre: string;
    start: string;
    end: string;
    resume: string;
    subs?: Array<{
      label: string;
      summary?: string;
    }>;
    lignesBudget?: Array<{
      libelle: string;
      cfa: any;
      fpbgPct: number;
      cofinPct: number;
    }>;
  }>;

  // Étape 4 - Risques
  risques?: Array<{
    description: string;
    mitigation: string;
  }>;

  // Étape 5 - Budget
  usdRate: number;
  montantTotal: number;
  indirectOverheads: number;

  // Étape 6 - État
  projectStage: 'CONCEPTION' | 'DEMARRAGE' | 'AVANCE' | 'PHASE_FINALE';
  hasFunding: boolean;
  fundingDetails?: string;

  // Étape 7 - Durabilité
  sustainability: string;
  replicability?: string;

  // Collaborateurs
  collaborateurs?: Array<{
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role?: string;
  }>;
}

/**
 * Genere un PDF professionnel de la demande
 */
async function generateDemandePDF(data: DemandeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Couleurs
    const primaryColor = '#16a34a';
    const secondaryColor = '#15803d';
    const textColor = '#1e293b';
    const lightGray = '#f1f5f9';

    // Header avec degrade
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

    // Logo/Titre
    doc.fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('FPBG', 50, 40)
      .fontSize(14)
      .font('Helvetica')
      .text('Fonds de Preservation de la Biodiversite du Gabon', 50, 75);

    // Titre du document
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('DEMANDE DE SUBVENTION', 50, 140, { align: 'center' });

    let yPosition = 200;

    // Section 1: Informations generales
    doc.fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('1. INFORMATIONS GENERALES', 50, yPosition);

    yPosition += 30;

    // Box pour les infos
    doc.rect(50, yPosition, doc.page.width - 100, 150).fill(lightGray);

    yPosition += 15;

    doc.fontSize(12)
      .fillColor(textColor)
      .font('Helvetica-Bold')
      .text('Titre du projet:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.titre, 180, yPosition, { width: doc.page.width - 240 });

    yPosition += 25;

    doc.font('Helvetica-Bold')
      .text('Organisation:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.organisation.nom, 180, yPosition);

    yPosition += 20;

    doc.font('Helvetica-Bold')
      .text('Porteur:', 60, yPosition);
    doc.font('Helvetica')
      .text(`${data.soumisPar.prenom || ''} ${data.soumisPar.nom || ''}`, 180, yPosition);

    yPosition += 20;

    doc.font('Helvetica-Bold')
      .text('Email:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.soumisPar.email, 180, yPosition);

    yPosition += 20;

    doc.font('Helvetica-Bold')
      .text('Localisation:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.localisation, 180, yPosition);

    yPosition += 40;

    // Section 2: Details du projet
    doc.fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('2. DETAILS DU PROJET', 50, yPosition);

    yPosition += 30;

    doc.fontSize(12)
      .fillColor(textColor)
      .font('Helvetica-Bold')
      .text('Domaines:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.domaines.join(', '), 180, yPosition, { width: doc.page.width - 240 });

    yPosition += 25;

    doc.font('Helvetica-Bold')
      .text('Groupe cible:', 60, yPosition);
    doc.font('Helvetica')
      .text(data.groupeCible, 180, yPosition, { width: doc.page.width - 240 });

    yPosition += 25;

    doc.font('Helvetica-Bold')
      .text('Duree:', 60, yPosition);
    doc.font('Helvetica')
      .text(`${data.dureeMois} mois`, 180, yPosition);

    yPosition += 25;

    doc.font('Helvetica-Bold')
      .text('Periode:', 60, yPosition);
    doc.font('Helvetica')
      .text(
        `${data.dateDebutActivites.toLocaleDateString('fr-FR')} - ${data.dateFinActivites.toLocaleDateString('fr-FR')}`,
        180,
        yPosition
      );

    yPosition += 35;

    // Section 3: Budget
    doc.fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('3. BUDGET', 50, yPosition);

    yPosition += 30;

    // Box pour le budget total
    doc.rect(50, yPosition, doc.page.width - 100, 50).fill(secondaryColor);

    yPosition += 15;

    doc.fontSize(14)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('MONTANT TOTAL DEMANDE:', 60, yPosition);
    doc.fontSize(18)
      .text(`${data.montantTotal.toLocaleString('fr-FR')} FCFA`, 300, yPosition);

    yPosition += 50;

    // Section 4: Objectifs
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('4. OBJECTIFS', 50, yPosition);

    yPosition += 25;

    doc.fontSize(11)
      .fillColor(textColor)
      .font('Helvetica')
      .text(data.objectifs, 60, yPosition, {
        width: doc.page.width - 120,
        align: 'justify'
      });

    yPosition += Math.min(doc.heightOfString(data.objectifs, { width: doc.page.width - 120 }), 200) + 30;

    // Section 5: Activites
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(16)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('5. ACTIVITES PRINCIPALES', 50, yPosition);

    yPosition += 25;

    if (data.activites && data.activites.length > 0) {
      data.activites.forEach((activite, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(12)
          .fillColor(secondaryColor)
          .font('Helvetica-Bold')
          .text(`Activite ${index + 1}: ${activite.titre}`, 60, yPosition);

        yPosition += 20;

        doc.fontSize(10)
          .fillColor(textColor)
          .font('Helvetica')
          .text(activite.resume, 70, yPosition, {
            width: doc.page.width - 140,
            align: 'justify'
          });

        yPosition += Math.min(doc.heightOfString(activite.resume, { width: doc.page.width - 140 }), 100) + 15;

        // Budget de l'activite
        if (activite.lignesBudget && activite.lignesBudget.length > 0) {
          let totalActivite = 0;
          activite.lignesBudget.forEach((ligne) => {
            totalActivite += Number(ligne.cfa) || 0;
          });

          doc.fontSize(10)
            .fillColor(secondaryColor)
            .font('Helvetica-Bold')
            .text(`Budget: ${totalActivite.toLocaleString('fr-FR')} FCFA`, 70, yPosition);

          yPosition += 20;
        }

        yPosition += 10;
      });
    }

    // Section 6: Risques
    if (data.risques && data.risques.length > 0) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(16)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('6. GESTION DES RISQUES', 50, yPosition);

      yPosition += 25;

      data.risques.slice(0, 3).forEach((risque, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(11)
          .fillColor(secondaryColor)
          .font('Helvetica-Bold')
          .text(`Risque ${index + 1}:`, 60, yPosition);

        yPosition += 15;

        doc.fontSize(10)
          .fillColor(textColor)
          .font('Helvetica')
          .text(risque.description, 70, yPosition, { width: doc.page.width - 140 });

        yPosition += Math.min(doc.heightOfString(risque.description, { width: doc.page.width - 140 }), 60) + 10;

        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('Mitigation:', 70, yPosition);

        yPosition += 15;

        doc.font('Helvetica')
          .text(risque.mitigation, 70, yPosition, { width: doc.page.width - 140 });

        yPosition += Math.min(doc.heightOfString(risque.mitigation, { width: doc.page.width - 140 }), 60) + 20;
      });
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      doc.fontSize(9)
        .fillColor('#94a3b8')
        .text(
          `Page ${i + 1} sur ${pageCount} - Document genere le ${new Date().toLocaleDateString('fr-FR')}`,
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );
    }

    doc.end();
  });
}

/**
 * Template HTML pour l'email de confirmation a l'utilisateur
 */
function generateConfirmationEmailTemplate(data: DemandeData): string {
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
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Demande bien recue !
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Votre projet a ete soumis avec succes
              </p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Bonjour <strong>${data.soumisPar.prenom} ${data.soumisPar.nom}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Nous avons bien recu votre demande de subvention pour le projet :
              </p>

              <!-- Project Info Box -->
              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #16a34a; font-size: 18px; font-weight: 600;">
                      ${data.titre}
                    </h2>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13px; width: 120px;">
                          <strong>Organisation:</strong>
                        </td>
                        <td style="padding: 5px 0; color: #1e293b; font-size: 13px;">
                          ${data.organisation.nom}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13px;">
                          <strong>Montant:</strong>
                        </td>
                        <td style="padding: 5px 0; color: #1e293b; font-size: 13px;">
                          ${data.montantTotal.toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-size: 13px;">
                          <strong>Duree:</strong>
                        </td>
                        <td style="padding: 5px 0; color: #1e293b; font-size: 13px;">
                          ${data.dureeMois} mois
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                <strong>Prochaines etapes:</strong>
              </p>

              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="display: flex; align-items: start;">
                      <div style="background-color: #16a34a; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px;">1</div>
                      <div>
                        <p style="margin: 0; color: #334155; font-size: 14px;">
                          Notre equipe va examiner votre demande
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="display: flex; align-items: start;">
                      <div style="background-color: #16a34a; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px;">2</div>
                      <div>
                        <p style="margin: 0; color: #334155; font-size: 14px;">
                          Vous recevrez un email de notre part dans les prochains jours
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="display: flex; align-items: start;">
                      <div style="background-color: #16a34a; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px;">3</div>
                      <div>
                        <p style="margin: 0; color: #334155; font-size: 14px;">
                          Nous vous tiendrons informes de l'avancement de votre dossier
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-left: 4px solid #16a34a; border-radius: 8px;">
                <p style="margin: 0; color: #15803d; font-size: 14px; line-height: 1.6;">
                  <strong>Important:</strong> Conservez cet email comme preuve de soumission. Un numero de reference vous sera attribue prochainement.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Merci de votre confiance,<br>
                <strong>L'equipe FPBG</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                Soumis le ${new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FPBG - Fonds de Preservation de la Biodiversite du Gabon
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
 * Template HTML pour l'email de notification au support
 */
function generateSupportNotificationTemplate(data: DemandeData): string {
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
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Nouvelle Demande de Subvention
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Un nouveau projet vient d'etre soumis
              </p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Alert Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  Action requise: Veuillez examiner cette nouvelle demande
                </p>
              </div>

              <!-- Project Details -->
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">
                Details du projet
              </h2>

              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px 0; color: #16a34a; font-size: 20px; font-weight: 700;">
                      ${data.titre}
                    </h3>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 150px; vertical-align: top;">
                          <strong>Organisation:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                          ${data.organisation.nom}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">
                          <strong>Porteur:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                          ${data.soumisPar.prenom} ${data.soumisPar.nom}<br>
                          <a href="mailto:${data.soumisPar.email}" style="color: #16a34a; text-decoration: none;">${data.soumisPar.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">
                          <strong>Localisation:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                          ${data.localisation}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">
                          <strong>Domaines:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                          ${data.domaines.join(', ')}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">
                          <strong>Duree:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">
                          ${data.dureeMois} mois (${data.dateDebutActivites.toLocaleDateString('fr-FR')} - ${data.dateFinActivites.toLocaleDateString('fr-FR')})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Budget Box -->
              <div style="background-color: #15803d; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Montant total demande
                </p>
                <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                  ${data.montantTotal.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <!-- Objectifs -->
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                Objectifs du projet
              </h3>
              <div style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
                  ${data.objectifs.substring(0, 300)}${data.objectifs.length > 300 ? '...' : ''}
                </p>
              </div>

              <!-- Activites -->
              ${data.activites && data.activites.length > 0 ? `
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                Activites principales (${data.activites.length})
              </h3>
              <ul style="margin: 0 0 30px 0; padding-left: 20px;">
                ${data.activites.slice(0, 5).map(act => `
                  <li style="margin: 8px 0; color: #334155; font-size: 14px;">
                    <strong>${act.titre}</strong>
                  </li>
                `).join('')}
                ${data.activites.length > 5 ? `<li style="color: #64748b; font-size: 13px;">... et ${data.activites.length - 5} autre(s)</li>` : ''}
              </ul>
              ` : ''}

              <!-- PDF Attachment Note -->
              <div style="background-color: #ecfdf5; border: 2px dashed #16a34a; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">
                  Le dossier complet est disponible en piece jointe (PDF)
                </p>
              </div>

              <p style="margin: 20px 0 0 0; color: #334155; font-size: 14px;">
                Cordialement,<br>
                <strong>Systeme automatise FPBG</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                Recu le ${new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FPBG - Systeme de gestion des demandes
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
 * Envoie les emails de confirmation et notification pour une soumission de projet
 */
export async function sendProjectSubmissionEmails(
  demandeData: DemandeData,
  supportEmail: string = process.env.SUPPORT_EMAIL || 'support@fpbg.ga'
): Promise<void> {
  console.log('\n' + '='.repeat(100));
  console.log('[PROJECT SUBMISSION] ENVOI DES EMAILS EN COURS');
  console.log('='.repeat(100));
  console.log(`[INFO] Projet: "${demandeData.titre}"`);
  console.log(`[INFO] Organisation: ${demandeData.organisation.nom}`);
  console.log(`[INFO] Porteur: ${demandeData.soumisPar.email}`);
  console.log(`[INFO] Support: ${supportEmail}`);
  console.log(`[INFO] Montant: ${demandeData.montantTotal.toLocaleString('fr-FR')} FCFA`);
  console.log('='.repeat(100) + '\n');

  try {
    // 1. Generer le PDF
    console.log('[PDF] Generation du PDF en cours...');
    const pdfBuffer = await generateDemandePDF(demandeData);
    console.log(`[PDF] PDF genere avec succes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

    // 2. Envoyer l'email de confirmation a l'utilisateur
    console.log(`\n[EMAIL 1/2] Envoi de la confirmation a l'utilisateur: ${demandeData.soumisPar.email}`);
    const confirmationHTML = generateConfirmationEmailTemplate(demandeData);

    const infoConfirmation = await transporter.sendMail({
      from: `"FPBG - Ne pas repondre" <${process.env.SMTP_USER || 'no-reply-fpbg@singcloud.ga'}>`,
      to: demandeData.soumisPar.email,
      subject: `Confirmation de reception - ${demandeData.titre}`,
      html: confirmationHTML
    });

    console.log(`[EMAIL 1/2] Email de confirmation envoye avec succes`);
    console.log(`[EMAIL 1/2] Message ID: ${infoConfirmation.messageId}`);

    // 3. Envoyer l'email de notification au support avec le PDF
    console.log(`\n[EMAIL 2/2] Envoi de la notification au support: ${supportEmail}`);
    const notificationHTML = generateSupportNotificationTemplate(demandeData);

    const infoNotification = await transporter.sendMail({
      from: `"FPBG - Systeme" <${process.env.SMTP_USER || 'no-reply-fpbg@singcloud.ga'}>`,
      to: supportEmail,
      replyTo: demandeData.soumisPar.email,
      subject: `[NOUVEAU PROJET] ${demandeData.titre} - ${demandeData.organisation.nom}`,
      html: notificationHTML,
      attachments: [
        {
          filename: `demande-${demandeData.titre.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`[EMAIL 2/2] Email de notification envoye avec succes`);
    console.log(`[EMAIL 2/2] Message ID: ${infoNotification.messageId}`);
    console.log(`[EMAIL 2/2] PDF attache: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    console.log('\n' + '='.repeat(100));
    console.log('[SUCCESS] TOUS LES EMAILS ONT ETE ENVOYES AVEC SUCCES');
    console.log('='.repeat(100));
    console.log(`[RESUME] 2 emails envoyes (confirmation + notification avec PDF)`);
    console.log(`[RESUME] Destinataires: ${demandeData.soumisPar.email}, ${supportEmail}`);
    console.log('='.repeat(100) + '\n');

  } catch (error: any) {
    console.error('\n' + '='.repeat(100));
    console.error('[ERROR] ERREUR LORS DE L\'ENVOI DES EMAILS');
    console.error('='.repeat(100));
    console.error('[ERROR] Message:', error.message);
    console.error('[ERROR] Code:', error.code);
    console.error('[ERROR] Command:', error.command);
    console.error('[ERROR] Details complets:', error);
    console.error('='.repeat(100) + '\n');
    throw new Error(`Impossible d'envoyer les emails de soumission: ${error.message}`);
  }
}
