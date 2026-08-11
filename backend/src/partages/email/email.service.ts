// Service transverse d'envoi d'e-mails transactionnels (Brevo REST API v3).
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Envoie un e-mail de réinitialisation de mot de passe via l'API Brevo v3.
   */
  async envoyerEmailReinitialisation(
    destinataire: string,
    nomComplet: string,
    lien: string,
  ): Promise<boolean> {
    const apiKey = process.env.EMAIL_API_KEY || process.env.BREVO_API_KEY;
    const expediteurEmail = process.env.EMAIL_EXPEDITEUR_EMAIL || 'no-reply@equran-academy.com';
    const expediteurNom = process.env.EMAIL_EXPEDITEUR_NOM || 'Quran-Academy';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const logoUrl = `${frontendUrl}/mascotte/logo_equran_accademy.png`;
    const estLocalhost = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
    
    // En dev local (localhost), Gmail ne peut pas télécharger l'image depuis l'ordi local.
    // On utilise un badge icône propre en HTML qui s'affiche partout instantanément.
    // En production, l'image PNG officielle s'affichera parfaitement depuis le domaine HTTPS.
    const logoHeaderHtml = !estLocalhost
      ? `<img src="${logoUrl}" alt="Logo" class="brand-logo" />`
      : `<span style="display: inline-block; width: 40px; height: 40px; line-height: 40px; background: linear-gradient(135deg, #0B5E45 0%, #064E3B 100%); border-radius: 10px; font-size: 20px; text-align: center; vertical-align: middle; margin-right: 10px;">📖</span>`;

    if (!apiKey) {
      this.logger.warn(`[BREVO] Aucune clé EMAIL_API_KEY trouvée dans l'environnement. Mode simulation.`);
      this.logger.log(`[SIMULATION EMAIL] Lien pour ${destinataire} : ${lien}`);
      return false;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Réinitialisation de votre mot de passe - Quran-Academy</title>
        <style>
          body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 40px 15px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; padding: 40px 32px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #F1F5F9; }
          .brand-logo { max-width: 48px; height: auto; display: inline-block; vertical-align: middle; margin-right: 8px; }
          .brand-title { color: #0B5E45; font-size: 24px; font-weight: 800; display: inline-block; vertical-align: middle; margin: 0; }
          .brand-subtitle { color: #B8923A; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px; }
          .content { font-size: 15px; line-height: 1.6; color: #334155; }
          .greeting { font-size: 16px; font-weight: 600; color: #0F172A; margin-bottom: 16px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #0B5E45 0%, #08402F 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(11, 94, 69, 0.3); }
          .notice-box { background-color: #FEF3C7; border-left: 4px solid #B8923A; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #78350F; margin: 24px 0; }
          .footer { text-align: center; margin-top: 36px; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              ${logoHeaderHtml}
              <h1 class="brand-title">Quran-Academy</h1>
            </div>
            <div class="brand-subtitle">Plateforme d'Enseignement Coranique</div>
          </div>
          <div class="content">
            <p class="greeting">Assalamu alaykum ${nomComplet ? nomComplet : ''},</p>
            <p>Vous avez demandé la réinitialisation du mot de passe de votre compte <strong>Quran-Academy</strong>.</p>
            <div class="btn-container">
              <a href="${lien}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
            </div>
            <div class="notice-box">
              ⏱️ Ce lien est valide pendant <strong>15 minutes</strong>.
            </div>
            <p style="font-size: 13px; color: #64748B;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Quran-Academy. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: expediteurNom,
            email: expediteurEmail,
          },
          to: [
            {
              email: destinataire,
              name: nomComplet || destinataire,
            },
          ],
          subject: 'Réinitialisation de votre mot de passe - Quran-Academy',
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`[BREVO ERROR] Échec d'envoi (${response.status}) : ${JSON.stringify(errorData)}`);
        return false;
      }

      const result = await response.json();
      this.logger.log(`[BREVO SUCCESS] Email envoyé avec succès à ${destinataire} (MessageId: ${result.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(`[BREVO ERREUR RESEAU] ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }
}
