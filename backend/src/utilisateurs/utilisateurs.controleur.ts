// Points d'entrée API (HTTP) du domaine "utilisateurs".
// Domaine : comptes élève, parent, professeur, admin — authentification et rôles.
//
// Convention de nommage (règle #4.1) : endpoints en français.
//   POST /utilisateurs/inscription   — créer un compte (toujours ELEVE)
//   POST /utilisateurs/connexion     — s'authentifier, recevoir un jeton JWT
//   GET  /utilisateurs/moi           — profil de l'utilisateur connecté
//   PATCH /utilisateurs/:id/role     — changer le rôle (ADMIN uniquement)
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { Roles } from '../partages/auth/roles.decorateur';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { UtilisateursService } from './utilisateurs.service';
import { InscriptionDto } from './dto/inscription.dto';
import { ConnexionDto } from './dto/connexion.dto';
import { DemandeReinitialisationDto } from './dto/demande-reinitialisation.dto';
import { ReinitialiserMotDePasseDto } from './dto/reinitialiser-mot-de-passe.dto';
import { ChangerRoleDto } from './dto/changer-role.dto';
import { UtilisateurReponseDto } from './dto/utilisateur.reponse.dto';
import { MettreAJourUtilisateurDto } from './dto/mettre-a-jour-utilisateur.dto';

@ApiTags('utilisateurs')
@Controller('utilisateurs')
export class UtilisateursControleur {
  constructor(private readonly service: UtilisateursService) {}

  // 5 tentatives / 60 secondes — protection brute-force mot de passe.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('inscription')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un compte élève (rôle ELEVE imposé)' })
  inscrire(@Body() dto: InscriptionDto): Promise<UtilisateurReponseDto> {
    return this.service.inscrire(dto);
  }

  // 10 tentatives / 60 secondes — connexion utilisateur.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "S'authentifier et obtenir un jeton JWT" })
  async connecter(
    @Body() dto: ConnexionDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ utilisateur: UtilisateurReponseDto, jeton: string }> {
    const { jeton, utilisateur } = await this.service.connecter(dto);

    // 30 jours si "Se souvenir de moi" est coché, 1 jour sinon
    const maxAge = dto.seSouvenirDeMoi ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000;

    res.cookie('jwt_access', jeton, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return { utilisateur, jeton };
  }

  @Throttle({ default: { limit: 3, ttl: 3600_000 } })
  @Post('mot-de-passe-oublie')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander un lien de réinitialisation de mot de passe' })
  demanderReinitialisation(
    @Body() dto: DemandeReinitialisationDto,
  ): Promise<{ message: string; tokenTest?: string }> {
    return this.service.demanderReinitialisation(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @Post('reinitialiser-mot-de-passe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Appliquer le nouveau mot de passe avec le jeton éphémère' })
  reinitialiserMotDePasse(
    @Body() dto: ReinitialiserMotDePasseDto,
  ): Promise<{ message: string }> {
    return this.service.reinitialiserMotDePasse(dto.token, dto.nouveauMotDePasse);
  }

  @Post('deconnexion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se déconnecter (effacer le cookie JWT)' })
  deconnecter(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt_access', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { succes: true };
  }

  @Get('moi')
  @UseGuards(JwtAuthGarde)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil de l’utilisateur connecté' })
  moi(@UtilisateurCourant() utilisateur: PayloadJwt): Promise<UtilisateurReponseDto> {
    return this.service.trouverParId(utilisateur.sub);
  }

  @Patch('moi')
  @UseGuards(JwtAuthGarde)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour mon profil utilisateur' })
  mettreAJour(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: MettreAJourUtilisateurDto,
  ): Promise<UtilisateurReponseDto> {
    return this.service.mettreAJour(utilisateur.sub, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGarde)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID (pour les connectés)' })
  trouverParId(
    @Param('id') id: string,
  ): Promise<UtilisateurReponseDto> {
    return this.service.trouverParId(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier le rôle d’un utilisateur (administrateur)' })
  changerRole(
    @Param('id') id: string,
    @Body() dto: ChangerRoleDto,
    @UtilisateurCourant() admin: PayloadJwt,
  ): Promise<UtilisateurReponseDto> {
    return this.service.changerRole(id, dto.nouveauRole, admin.sub);
  }

  @Get()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste de tous les utilisateurs (administrateur)' })
  listerTous(@Query('role') role?: string): Promise<UtilisateurReponseDto[]> {
    const filtreRole = role as Role | undefined;
    return this.service.listerTous(filtreRole);
  }

  @Patch(':id/valider-professeur')
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider un compte professeur (administrateur)' })
  validerProfesseur(
    @Param('id') id: string,
    @UtilisateurCourant() admin: PayloadJwt,
  ): Promise<UtilisateurReponseDto> {
    return this.service.validerProfesseur(id, admin.sub);
  }

  @Patch(':id/rejeter-professeur')
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeter un compte professeur — le repasse en ELEVE (administrateur)' })
  rejeterProfesseur(
    @Param('id') id: string,
    @UtilisateurCourant() admin: PayloadJwt,
  ): Promise<UtilisateurReponseDto> {
    return this.service.rejeterProfesseur(id, admin.sub);
  }
}
