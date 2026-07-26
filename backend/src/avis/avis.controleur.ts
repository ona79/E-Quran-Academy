// Points d'entrée API (HTTP) du domaine "avis".
// Domaine : notes et commentaires laissés par les élèves sur les professeurs.
//
// Endpoints publics (sans authentification) :
//   GET  /avis/professeurs/:id          — avis reçus par un professeur (paginé)
//   GET  /avis/professeurs/:id/moyenne  — note moyenne d'un professeur
//
// Endpoints protégés :
//   POST /avis                          — créer/mettre à jour un avis (ELEVE)
//   GET  /avis/:id                      — détail (auteur ou professeur)
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { Roles } from '../partages/auth/roles.decorateur';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import {
  PageReponseDto,
  PaginationDto,
} from '../partages/pagination/pagination.dto';
import { AvisService } from './avis.service';
import { CreerAvisDto } from './dto/creer-avis.dto';
import { AvisReponseDto, AvisRecentReponseDto } from './dto/avis.reponse.dto';

@ApiTags('avis')
@Controller('avis')
export class AvisControleur {
  constructor(private readonly service: AvisService) {}

  // ─────────────────────── Endpoints publics ─────────────────────────

  @Get('recents')
  @ApiOperation({ summary: 'Récupérer les avis les plus récents (Landing Page)' })
  listerAvisRecents(): Promise<AvisRecentReponseDto[]> {
    // Par défaut, on renvoie les 3 derniers avis
    return this.service.listerAvisRecents(3);
  }

  @Get('professeurs/:id')
  @ApiOperation({ summary: 'Avis reçus par un professeur (paginés, public)' })
  listerAvisProfesseur(
    @Param('id') professeurId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<AvisReponseDto>> {
    return this.service.listerAvisProfesseur(professeurId, pagination);
  }

  @Get('professeurs/:id/moyenne')
  @ApiOperation({ summary: 'Note moyenne d\'un professeur (public)' })
  noteMoyenne(
    @Param('id') professeurId: string,
  ): Promise<{ moyenne: number; total: number }> {
    return this.service.calculerNoteMoyenne(professeurId);
  }

  // ─────────────────────── Endpoints protégés ────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ELEVE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer ou mettre à jour un avis sur un professeur (élève)' })
  creerAvis(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: CreerAvisDto,
  ): Promise<AvisReponseDto> {
    return this.service.creerOuMettreAJourAvis(utilisateur.sub, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Détail d\'un avis (auteur ou professeur concerné)' })
  trouverAvis(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<AvisReponseDto> {
    return this.service.trouverAvis(id, utilisateur.sub);
  }
}
