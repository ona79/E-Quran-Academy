// Logique métier du domaine "classe-virtuelle".
// Domaine : salle de classe virtuelle (visio + Mushaf synchronisé).
//
// Contraintes non négociables (cahier des charges) :
// - Seul le professeur émet un surlignage ; l'élève est en lecture seule.
// - L'enregistrement exige le consentement parental PRÉALABLE.
// - L'état du Mushaf est persisté → reconnexion sans perte.
//
// Architecture : ce service n'accède qu'à ses tables (seances_cours,
// etats_mushaf). L'identité (eleveId, professeurId) est fournie par l'appelant,
// jamais récupérée en lisant la table reservations.
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SeanceCours, StatutSession } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import { DailyCoService } from './daily-co/daily-co.service';
import { EtatMushafDto } from './dto/etat-mushaf.dto';
import { SeanceReponseDto } from './dto/seance.reponse.dto';

@Injectable()
export class ClasseVirtuelleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyCo: DailyCoService,
  ) {}

  /**
   * Crée une séance pour une réservation confirmée. Les identifiants élève et
   * professeur sont fournis par l'appelant (découplage vis-à-vis de reservations).
   */
  async creerSeance(
    reservationId: string,
    eleveId: string,
    professeurId: string,
  ): Promise<SeanceReponseDto> {
    const existante = await this.prisma.seanceCours.findUnique({
      where: { reservationId },
    });
    if (existante) {
      throw new ConflictException('Une séance existe déjà pour cette réservation');
    }

    const salle = await this.dailyCo.creerSalle(reservationId);
    const token = await this.dailyCo.genererToken(salle.nomSalle, professeurId, true);

    const seance = await this.prisma.seanceCours.create({
      data: {
        reservationId,
        eleveId,
        professeurId,
        statut: StatutSession.PLANIFIEE,
        lienVisio: salle.url,
      },
    });

    // État initial du Mushaf : Al-Fatiha, verset 1, aucun surlignage.
    await this.prisma.etatMushaf.create({
      data: {
        seanceId: seance.id,
        numeroSourate: 1,
        numeroVerset: 1,
        plageSurlignage: null,
      },
    });

    return this.sanitiser(seance, token);
  }

  /** Récupère une séance par son identifiant. */
  async trouverSeance(
    seanceId: string,
    demandeurId: string,
  ): Promise<SeanceReponseDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    this.verifierAppartenance(seance, demandeurId);

    const token = await this.dailyCo.genererToken(
      this.extraireNomSalle(seance.lienVisio),
      demandeurId,
      demandeurId === seance.professeurId,
    );

    return this.sanitiser(seance, token);
  }

  /**
   * Récupère l'état courant du Mushaf. Sert à la reconnexion : un client qui
   * rejoint (ou rejoint après déconnexion) récupère immédiatement le dernier
   * état sans rien manquer.
   */
  async obtenirEtatMushaf(
    seanceId: string,
    demandeurId: string,
  ): Promise<EtatMushafDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    this.verifierAppartenance(seance, demandeurId);

    const etat = await this.prisma.etatMushaf.findUnique({
      where: { seanceId },
    });
    if (!etat) {
      // Ne devrait pas arriver (créé avec la séance), par sécurité :
      throw new NotFoundException('État du Mushaf introuvable');
    }

    return {
      numeroSourate: etat.numeroSourate,
      numeroVerset: etat.numeroVerset,
      plageSurlignage: etat.plageSurlignage,
    };
  }

  /**
   * Applique un événement de surlignage émis par le PROFESSEUR et persiste le
   * nouvel état. Le broadcast aux élèves est assuré par la gateway WebSocket.
   *
   * Vérification d'autorisation : seul le professeur de la séance peut appeler.
   */
  async appliquerSurlignage(
    seanceId: string,
    professeurId: string,
    etat: EtatMushafDto,
  ): Promise<EtatMushafDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    if (seance.professeurId !== professeurId) {
      // 403 → on renvoie un message clair : seul le professeur surligne.
      throw new BadRequestException('Seul le professeur peut surligner le Mushaf');
    }

    const maj = await this.prisma.etatMushaf.update({
      where: { seanceId },
      data: {
        numeroSourate: etat.numeroSourate,
        numeroVerset: etat.numeroVerset,
        plageSurlignage: etat.plageSurlignage ?? null,
      },
    });

    return {
      numeroSourate: maj.numeroSourate,
      numeroVerset: maj.numeroVerset,
      plageSurlignage: maj.plageSurlignage,
    };
  }

  /**
   * Recueille le consentement parental pour l'enregistrement. Prérequis à toute
   * activation de l'enregistrement.
   */
  async enregistrerConsentement(
    seanceId: string,
    consentementParental: boolean,
  ): Promise<SeanceReponseDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    if (!consentementParental) {
      throw new BadRequestException(
        'Le consentement parental à l’enregistrement est requis',
      );
    }

    const maj = await this.prisma.seanceCours.update({
      where: { id: seanceId },
      data: { enregistrementConsente: true },
    });
    return this.sanitiser(maj);
  }

  /**
   * Active ou désactive l'enregistrement de la séance.
   * CONTRAINTE : impossible d'activer sans consentement parental au préalable.
   * Le traitement réel (stockage R2) est un micro-service asynchrone séparé :
   * ici on ne fait que basculer le drapeau.
   */
  async basculerEnregistrement(
    seanceId: string,
    actif: boolean,
    demandeurId: string,
  ): Promise<SeanceReponseDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    if (seance.professeurId !== demandeurId) {
      throw new BadRequestException(
        'Seul le professeur peut activer l’enregistrement',
      );
    }

    if (actif && !seance.enregistrementConsente) {
      throw new BadRequestException(
        'Consentement parental requis avant l’activation de l’enregistrement',
      );
    }

    const maj = await this.prisma.seanceCours.update({
      where: { id: seanceId },
      data: { enregistrementActif: actif },
    });
    return this.sanitiser(maj);
  }

  /**
   * Active ou désactive le mode de repli « audio seul ». Piloté par le client
   * (signalement de bande passante) ou automatiquement par le serveur.
   */
  async basculerModeRepli(
    seanceId: string,
    actif: boolean,
    demandeurId: string,
  ): Promise<SeanceReponseDto> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    this.verifierAppartenance(seance, demandeurId);

    const maj = await this.prisma.seanceCours.update({
      where: { id: seanceId },
      data: { modeRepliActif: actif },
    });
    return this.sanitiser(maj);
  }

  /** Marque la séance comme en cours (première connexion d'un participant). */
  async marquerEnCours(seanceId: string): Promise<void> {
    await this.prisma.seanceCours.updateMany({
      where: { id: seanceId, statut: StatutSession.PLANIFIEE },
      data: { statut: StatutSession.EN_COURS },
    });
  }

  /** Termine la séance. */
  async terminerSeance(seanceId: string, demandeurId: string): Promise<void> {
    const seance = await this.chargerSeanceOuErreur(seanceId);
    if (seance.professeurId !== demandeurId) {
      throw new BadRequestException('Seul le professeur peut terminer la séance');
    }
    await this.prisma.seanceCours.update({
      where: { id: seanceId },
      data: { statut: StatutSession.TERMINEE },
    });
  }

  // ─────────────────────────── Utilitaires ───────────────────────────

  private async chargerSeanceOuErreur(idOuReservationId: string): Promise<SeanceCours> {
    const estUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOuReservationId);
    if (!estUuid) {
      throw new NotFoundException('Séance introuvable');
    }

    let seance = await this.prisma.seanceCours.findUnique({
      where: { id: idOuReservationId },
    });
    if (!seance) {
      seance = await this.prisma.seanceCours.findUnique({
        where: { reservationId: idOuReservationId },
      });
    }
    if (!seance) {
      throw new NotFoundException('Séance introuvable');
    }
    return seance;
  }

  /** Vérifie que le demandeur est participant de la séance. */
  private verifierAppartenance(seance: SeanceCours, demandeurId: string): void {
    if (seance.eleveId !== demandeurId && seance.professeurId !== demandeurId) {
      throw new NotFoundException('Séance introuvable');
    }
  }

  /**
   * Extrait le nom de salle Daily.co depuis l'URL stockée. En mode placeholder
   * (développement), l'URL est "placeholder://seance-<id>".
   */
  private extraireNomSalle(lienVisio: string | null): string {
    if (!lienVisio) return '';
    try {
      const url = new URL(lienVisio);
      return url.pathname.slice(1) || url.hostname;
    } catch {
      // Format placeholder:// — on récupère la partie après "://".
      return lienVisio.split('://')[1] ?? lienVisio;
    }
  }

  private sanitiser(s: SeanceCours, tokenVisio?: string): SeanceReponseDto {
    return {
      id: s.id,
      reservationId: s.reservationId,
      eleveId: s.eleveId,
      professeurId: s.professeurId,
      statut: s.statut,
      lienVisio: s.lienVisio,
      tokenVisio,
      modeRepliActif: s.modeRepliActif,
      enregistrementConsente: s.enregistrementConsente,
      enregistrementActif: s.enregistrementActif,
      enregistrementUrl: s.enregistrementUrl,
    };
  }
}
