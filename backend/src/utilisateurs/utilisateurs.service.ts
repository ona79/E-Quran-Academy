// Logique métier du domaine "utilisateurs".
// Domaine : comptes élève, parent, professeur, admin — authentification et rôles.
// Règle d'architecture : ce service n'accède qu'à la table `users`. Il ne lit
// jamais les données internes d'un autre module.
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../partages/prisma/prisma.service';
import { JwtService } from '../partages/auth/jwt.service';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { InscriptionDto } from './dto/inscription.dto';
import { ConnexionDto } from './dto/connexion.dto';
import { UtilisateurReponseDto } from './dto/utilisateur.reponse.dto';
import { MettreAJourUtilisateurDto } from './dto/mettre-a-jour-utilisateur.dto';

import { AuditService } from '../partages/audit/audit.service';

const COUT_HACHAGE = 12;

@Injectable()
export class UtilisateursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Crée un compte avec le rôle demandé (ELEVE par défaut, ou PROFESSEUR).
   * Un compte PROFESSEUR est créé avec valide=false sur son profil :
   * il ne peut pas accéder à son espace tant que l'admin n'a pas validé.
   */
  async inscrire(donnees: InscriptionDto): Promise<UtilisateurReponseDto> {
    const existant = await this.prisma.user.findUnique({
      where: { email: donnees.email },
    });
    if (existant) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail');
    }

    const motDePasseHache = await bcrypt.hash(donnees.motDePasse, COUT_HACHAGE);
    const role = donnees.role ?? Role.ELEVE;

    const prefixe = role === Role.PROFESSEUR ? 'PROF' : 'ELV';
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `${prefixe}-${code}`;

    const cree = await this.prisma.user.create({
      data: {
        email: donnees.email,
        motDePasse: motDePasseHache,
        nomComplet: donnees.nomComplet,
        reference,
        role,
        langue: donnees.langue ?? 'fr',
        fuseauHoraire: donnees.fuseauHoraire ?? 'Africa/Dakar',
      },
    });

    // Si le compte est un professeur, on crée d'emblée un profil avec valide=false.
    if (role === Role.PROFESSEUR) {
      await this.prisma.teacherProfile.create({
        data: { userId: cree.id },
      });
    }

    return this.sanitiser(cree);
  }

  /** Met à jour les informations de profil de l'utilisateur connecté */
  async mettreAJour(id: string, donnees: MettreAJourUtilisateurDto): Promise<UtilisateurReponseDto> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id } });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const modifie = await this.prisma.user.update({
      where: { id },
      data: {
        nomComplet: donnees.nomComplet ?? utilisateur.nomComplet,
        langue: donnees.langue ?? utilisateur.langue,
        fuseauHoraire: donnees.fuseauHoraire ?? utilisateur.fuseauHoraire,
      },
    });

    return this.sanitiser(modifie);
  }

  /**
   * Authentifie un utilisateur et renvoie un jeton JWT.
   * Même erreur générique si l'e-mail ou le mot de passe est erroné.
   */
  async connecter(donnees: ConnexionDto): Promise<{ jeton: string; utilisateur: UtilisateurReponseDto }> {
    const utilisateur = await this.prisma.user.findUnique({
      where: { email: donnees.email },
    });

    const motDePasseValide =
      utilisateur !== null &&
      (await bcrypt.compare(donnees.motDePasse, utilisateur.motDePasse));

    if (!motDePasseValide) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }

    const payload: PayloadJwt = {
      sub: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    // Journal d'audit : Connexion réussie
    await this.audit.enregistrer(utilisateur.id, null, 'CONNEXION', { email: utilisateur.email });

    return {
      jeton: this.jwt.genererJetons(payload),
      utilisateur: this.sanitiser(utilisateur),
    };
  }

  /**
   * Modifie le rôle d'un utilisateur. Réservé à un administrateur
   * (appliqué au niveau du contrôleur via @Roles(ADMIN)).
   */
  async changerRole(id: string, nouveauRole: Role, acteurId?: string): Promise<UtilisateurReponseDto> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id } });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const modifie = await this.prisma.user.update({
      where: { id },
      data: { role: nouveauRole },
    });

    // Journal d'audit : Changement de rôle
    await this.audit.enregistrer(acteurId ?? null, id, 'CHANGEMENT_ROLE', {
      ancienRole: utilisateur.role,
      nouveauRole,
    });

    return this.sanitiser(modifie);
  }

  /** Récupère un utilisateur par son identifiant. */
  async trouverParId(id: string): Promise<UtilisateurReponseDto> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id } });
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return this.sanitiser(utilisateur);
  }

  /** Liste paginée de tous les utilisateurs (admin). */
  async listerTous(filtreRole?: Role): Promise<UtilisateurReponseDto[]> {
    const utilisateurs = await this.prisma.user.findMany({
      where: filtreRole ? { role: filtreRole } : undefined,
      orderBy: { creeLe: 'desc' },
    });
    return utilisateurs.map((u) => this.sanitiser(u));
  }

  /**
   * Valide un profil professeur (admin) : le flag valide passe à true,
   * ce qui déverrouille l'espace professeur.
   */
  async validerProfesseur(userId: string, acteurId?: string): Promise<UtilisateurReponseDto> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!utilisateur || utilisateur.role !== Role.PROFESSEUR) {
      throw new NotFoundException('Professeur introuvable');
    }
    await this.prisma.teacherProfile.upsert({
      where: { userId },
      update: { valide: true },
      create: { userId, valide: true },
    });

    // Journal d'audit : Validation de professeur
    await this.audit.enregistrer(acteurId ?? null, userId, 'VALIDATION_PROF');

    return this.sanitiser(utilisateur);
  }

  /**
   * Rejette un profil professeur (admin) : repasse le compte en ELEVE
   * pour empêcher tout accès à l'espace professeur.
   */
  async rejeterProfesseur(userId: string, acteurId?: string): Promise<UtilisateurReponseDto> {
    const utilisateur = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!utilisateur || utilisateur.role !== Role.PROFESSEUR) {
      throw new NotFoundException('Professeur introuvable');
    }
    const modifie = await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.ELEVE },
    });

    // Journal d'audit : Rejet de professeur (retour au rôle ELEVE)
    await this.audit.enregistrer(acteurId ?? null, userId, 'REJET_PROF');

    return this.sanitiser(modifie);
  }

  /**
   * Retire le mot de passe avant toute exposition. Utilitaire interne.
   */
  private sanitiser(u: User): UtilisateurReponseDto {
    return {
      id: u.id,
      email: u.email,
      nomComplet: u.nomComplet,
      role: u.role,
      langue: u.langue,
      fuseauHoraire: u.fuseauHoraire,
      creeLe: u.creeLe,
    };
  }
}
