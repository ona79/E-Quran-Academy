// Points d'entrée API (HTTP) du domaine "reservations".
// Domaine : disponibilités des professeurs + réservations de cours.
//
// Endpoints publics (sans authentification) :
//   GET    /reservations/professeurs/:id/disponibilites
//
// Endpoints protégés :
//   POST   /reservations/disponibilites
//   DELETE /reservations/disponibilites/:id
//   POST   /reservations              — élève crée une demande
//   GET    /reservations/moi          — liste des réservations de l'élève connecté
//   GET    /reservations/moi-professeur — liste des réservations du prof connecté
//   GET    /reservations/:id          — détail (participants uniquement)
//   PATCH  /reservations/:id/statut   — changement de statut
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { ReservationsService } from './reservations.service';
import { CreerDisponibiliteDto } from './dto/creer-disponibilite.dto';
import { CreerReservationDto } from './dto/creer-reservation.dto';
import { ChangerStatutDto } from './dto/changer-statut.dto';
import { DisponibiliteReponseDto } from './dto/disponibilite.reponse.dto';
import { ReservationReponseDto } from './dto/reservation.reponse.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsControleur {
  constructor(private readonly service: ReservationsService) {}

  // ───────────────────────── Endpoints publics ──────────────────────────

  // ⚠ Route fixe "moi" AVANT route paramètrée ":id" (ordre NestJS).
  @Get('professeurs/moi/disponibilites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @ApiOperation({ summary: 'Mes disponibilités (professeur connecté)' })
  mesDiponibilites(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<DisponibiliteReponseDto>> {
    return this.service.listerDisponibilites(utilisateur.sub, pagination);
  }

  @Get('professeurs/:id/disponibilites')
  @ApiOperation({ summary: 'Liste (paginée) des disponibilités d\'un professeur (public)' })
  listerDisponibilites(
    @Param('id') professeurId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<DisponibiliteReponseDto>> {
    return this.service.listerDisponibilites(professeurId, pagination);
  }

  // ───────────────────────── Endpoints protégés ────────────────────────

  @Post('disponibilites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un créneau de disponibilité (professeur)' })
  creerDisponibilite(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: CreerDisponibiliteDto,
  ): Promise<DisponibiliteReponseDto> {
    return this.service.creerDisponibilite(utilisateur.sub, dto);
  }

  @Delete('disponibilites/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un créneau de disponibilité (professeur)' })
  async supprimerDisponibilite(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.supprimerDisponibilite(utilisateur.sub, id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.ELEVE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une demande de réservation (élève)' })
  creerReservation(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: CreerReservationDto,
  ): Promise<ReservationReponseDto> {
    return this.service.creerReservation(utilisateur.sub, dto);
  }

  @Get('moi')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Mes réservations (élève), paginées' })
  listerMesReservations(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<ReservationReponseDto>> {
    return this.service.listerReservations(utilisateur.sub, pagination, false);
  }

  @Get('moi-professeur')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @ApiOperation({ summary: 'Réservations reçues (professeur), paginées' })
  listerReservationsProfesseur(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<ReservationReponseDto>> {
    return this.service.listerReservations(utilisateur.sub, pagination, true);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Détail d\'une réservation (participants uniquement)' })
  trouverReservation(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<ReservationReponseDto> {
    return this.service.trouverReservation(id, utilisateur.sub);
  }

  @Patch(':id/statut')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Changer le statut d\'une réservation' })
  changerStatut(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
    @Body() dto: ChangerStatutDto,
  ): Promise<ReservationReponseDto> {
    return this.service.changerStatut(id, dto.nouveauStatut, utilisateur.sub);
  }
}
