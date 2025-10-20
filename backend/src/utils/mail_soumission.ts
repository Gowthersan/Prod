// sendMail.js
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { acknowledgmentTemplate } from './templates/acknowledgmentTemplate';
import { internalNotificationTemplate } from './templates/internalNotificationTemplate';

/**
 * Crée un transporter SMTP pour l'envoi d'emails de soumission
 * La création est lazy (à la demande) pour s'assurer que les variables d'environnement sont chargées
 */
function createTransporter(): Transporter {
  return nodemailer.createTransport({
    service: 'gmail',
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
}

export const sendMailSoumissionnaireAdmin = async (to: string, name: string, subject: string, message: string) => {
  const transporter = createTransporter();

  // Premier mail → au client
  const clientMail = {
    from: `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `Accusé de réception - ${subject}`,
    html: acknowledgmentTemplate(name, subject, message)
  };

  // Second mail → à ton équipe interne
  const internalMail = {
    from: `"Support" <${process.env.SMTP_USER}>`,
    to: 'morelmintsa@gmail.com', // ou une variable d’env
    subject: `Nouvelle demande de ${name}`,
    html: internalNotificationTemplate(name, subject, message)
  };

  // Envoi simultané
  await Promise.all([transporter.sendMail(clientMail), transporter.sendMail(internalMail)]);

  console.log('✅ Accusé envoyé au client et notification à l’équipe.');
};
