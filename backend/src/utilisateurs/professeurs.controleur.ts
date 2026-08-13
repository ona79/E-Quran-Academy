// Contrôleur des profils professeurs. Étend le module utilisateurs.
//
// ORDRE CRITIQUE : les routes fixes ("moi") DOIVENT être déclarées AVANT les
// routes paramétrées (":id") sinon NestJS résout "moi" comme un ID → 403.
//
// Endpoints publics (sans authentification) :
//   GET    /utilisateurs/professeurs                — liste filtrée des profs validés
//   GET    /utilisateurs/professeurs/:id            — profil public (lecture)
//
// Endpoints protégés (PROFESSEUR uniquement) :
//   GET    /utilisateurs/professeurs/moi            — mon profil prof
//   PATCH  /utilisateurs/professeurs/moi            — mettre à jour mon profil
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { Roles } from '../partages/auth/roles.decorateur';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { ProfesseursService } from './professeurs.service';
import {
  MettreAJourProfilProfesseurDto,
  ProfilProfesseurReponseDto,
} from './dto/profil-professeur.dto';

@ApiTags('professeurs')
@Controller('utilisateurs/professeurs')
export class ProfesseursControleur {
  constructor(private readonly service: ProfesseursService) {}

  // ───────────────── Endpoints protégés AVANT ":id" ──────────────────────
  // ⚠ NestJS matche dans l'ordre de déclaration : "moi" doit précéder ":id".

  @Get('moi')
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mon profil professeur' })
  async monProfil(@UtilisateurCourant() u: PayloadJwt): Promise<ProfilProfesseurReponseDto> {
    return this.sanitiser(await this.service.obtenirOuCreer(u.sub));
  }

  @Patch('moi')
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour mon profil professeur' })
  async mettreAJourProfil(
    @UtilisateurCourant() u: PayloadJwt,
    @Body() dto: MettreAJourProfilProfesseurDto,
  ): Promise<ProfilProfesseurReponseDto> {
    return this.sanitiser(await this.service.mettreAJour(u.sub, dto));
  }

  // ───────────────── Endpoints publics ───────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Liste publique des professeurs validés (avec filtres)' })
  @ApiQuery({ name: 'qiraat', required: false, enum: ['HAFS', 'WARSH'] })
  @ApiQuery({ name: 'tarifMax', required: false, type: Number })
  @ApiQuery({ name: 'langue', required: false, type: String })
  @ApiQuery({ name: 'genre', required: false, enum: ['HOMME', 'FEMME'] })
  listerPublic(
    @Query('qiraat') qiraat?: string,
    @Query('tarifMax') tarifMaxStr?: string,
    @Query('langue') langue?: string,
    @Query('genre') genre?: string,
  ): Promise<any[]> {
    const tarifMax = tarifMaxStr ? parseInt(tarifMaxStr, 10) : undefined;
    return this.service.listerPublic({ qiraat, tarifMax, langue, genre });
  }

  @Get(':id')
  @ApiOperation({ summary: "Profil public d'un professeur" })
  profilPublic(@Param('id') id: string): Promise<any> {
    return this.service.profilPublic(id);
  }

  // ───────────────── Méthode utilitaire ──────────────────────────────────

  private sanitiser(p: import('@prisma/client').TeacherProfile): ProfilProfesseurReponseDto {
    return {
      id: p.id,
      userId: p.userId,
      bio: p.bio,
      photoUrl: p.photoUrl,
      ijazaUrl: p.ijazaUrl,
      audioUrl: p.audioUrl,
      tarifHoraire: p.tarifHoraire,
      qiraatParDefaut: p.qiraatParDefaut,
      reservationInstantanee: p.reservationInstantanee,
      valide: p.valide,
    };
  }
}
