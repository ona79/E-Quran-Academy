// Points d'entrée API (HTTP) du domaine "suivi-pédagogique".
// Domaine : formulaire de fin de cours, sourates mémorisées/révisées, tajwid.
//
// Endpoints :
//   POST /suivi-pedagogique/notes              — créer une note (PROFESSEUR)
//   GET  /suivi-pedagogique/notes/moi          — mes notes en tant qu'élève
//   GET  /suivi-pedagogique/notes/moi-professeur — notes rédigées (PROFESSEUR)
//   GET  /suivi-pedagogique/notes/:id          — détail (auteur ou élève)
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
import { SuiviPedagogiqueService } from './suivi-pedagogique.service';
import { CreerNoteSessionDto } from './dto/creer-note-session.dto';
import { NoteSessionReponseDto } from './dto/note-session.reponse.dto';

@ApiTags('suivi-pedagogique')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde, RolesGarde)
@Controller('suivi-pedagogique')
export class SuiviPedagogiqueControleur {
  constructor(private readonly service: SuiviPedagogiqueService) {}

  @Post('notes')
  @Roles(Role.PROFESSEUR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer la note pédagogique d’une séance (professeur)' })
  creerNote(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: CreerNoteSessionDto,
  ): Promise<NoteSessionReponseDto> {
    return this.service.creerNote(utilisateur.sub, dto);
  }

  @Get('notes/moi')
  @ApiOperation({ summary: 'Mes notes pédagogiques (élève), paginées' })
  listerMesNotes(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<NoteSessionReponseDto>> {
    return this.service.listerNotes(utilisateur.sub, pagination, false);
  }

  @Get('notes/moi-professeur')
  @Roles(Role.PROFESSEUR)
  @ApiOperation({ summary: 'Notes pédagogiques rédigées (professeur), paginées' })
  listerNotesProfesseur(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<NoteSessionReponseDto>> {
    return this.service.listerNotes(utilisateur.sub, pagination, true);
  }

  @Get('notes/:id')
  @ApiOperation({ summary: 'Détail d’une note (auteur ou élève concerné)' })
  trouverNote(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<NoteSessionReponseDto> {
    return this.service.trouverNote(id, utilisateur.sub);
  }
}
