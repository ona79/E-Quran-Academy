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
    const expediteurNom = process.env.EMAIL_EXPEDITEUR_NOM || 'E-Quran Academy';

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
        <title>Réinitialisation de votre mot de passe - E-Quran Academy</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0D1A14; color: #FFFFFF; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(184, 146, 58, 0.3); border-radius: 16px; padding: 32px; background-color: #12241C; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #B8923A; font-size: 22px; margin-top: 10px; }
          .content { font-size: 15px; line-height: 1.6; color: #E2E8F0; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #0B5E45 0%, #B8923A 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(11, 94, 69, 0.4); }
          .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94A3B8; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📖 E-Quran Academy</h1>
          </div>
          <div class="content">
            <p>Assalamu alaykum ${nomComplet ? nomComplet : ''},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>E-Quran Academy</strong>.</p>
            <p>Veuillez cliquer sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valide pendant <strong>1 heure</strong>.</p>
            <div class="btn-container">
              <a href="${lien}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
            </div>
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} E-Quran Academy. Tous droits réservés.</p>
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
          subject: 'Réinitialisation de votre mot de passe - E-Quran Academy',
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
