import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendMail } from "./mailer.js";

// Configuration ESM pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Envoie les identifiants de connexion par email
 * @param {CredentialsEmailData} data - Les données de l'email
 * @returns {Promise<void>}
 * @throws {Error} Si l'envoi échoue
 */
interface CredentialsEmailData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
}

export async function sendCredentialsEmail({
  email,
  password,
  prenom,
  nom,
}: CredentialsEmailData): Promise<void> {
  try {
    // Charger le template
    const templatePath = path.join(__dirname, "../../templates/email-credentials.html");
    let template = "";

    try {
      template = readFileSync(templatePath, "utf-8");
      console.log("✅ Template email-credentials.html chargé depuis:", templatePath);
    } catch (err) {
      console.error("❌ Erreur lors de la lecture du template:", err);
      console.error("Chemin testé:", templatePath);
      // Template de secours en cas d'erreur
      template = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Vos identifiants de connexion FPBG</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #333; margin-bottom: 20px;">Vos identifiants de connexion</h1>
                <p>Bonjour ${prenom} ${nom},</p>
                <p>Votre compte évaluateur a été créé. Voici vos identifiants :</p>
                <div style="background: #f8f8f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email :</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Mot de passe :</strong> ${password}</p>
                </div>
                <p><strong>Important :</strong> Veuillez changer votre mot de passe lors de votre première connexion.</p>
                <p>Cordialement,<br>L'équipe FPBG</p>
            </div>
        </body>
        </html>
      `;
    }

    // Remplacer les variables
    const variables: Record<string, string> = {
      prenom,
      nom,
      email,
      password,
      year: new Date().getFullYear().toString(),
      login_url: process.env.FRONTEND_URL || "http://localhost:4200/admin/login",
      support_link: process.env.SUPPORT_URL || "http://localhost:4200/support",
    };

    const htmlContent = template.replace(
      /{{[\s]*([^}]+)[\s]*}}/g,
      (match, key) => variables[key.trim()] || match
    );

    // Envoyer l'email
    await sendMail(email, "Vos identifiants de connexion FPBG", htmlContent);

    console.log(`✅ Email d'identifiants envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des identifiants:", error);
    throw new Error("Impossible d'envoyer les identifiants par email");
  }
}
