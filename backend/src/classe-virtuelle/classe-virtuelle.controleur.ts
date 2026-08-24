// Points d'entrée API (HTTP) du domaine "classe-virtuelle".
// Domaine : salle de classe virtuelle (visio Daily.co + Mushaf synchronisé).
//
// Endpoints publics (sans authentification) :
//   GET    /classe-virtuelle/mushaf/sourates        — liste 114 sourates
//   GET    /classe-virtuelle/mushaf/versets/:sourate — versets d'une sourate
//
// Endpoints protégés (JWT requis) :
//   POST   /classe-virtuelle/seances              — créer une séance (professeur)
//   GET    /classe-virtuelle/seances/:id          — voir une séance (participant)
//   POST   /classe-virtuelle/seances/:id/consentement-enregistrement
//   PATCH  /classe-virtuelle/seances/:id/enregistrement
//   PATCH  /classe-virtuelle/seances/:id/mode-repli
//   POST   /classe-virtuelle/seances/:id/terminer
//
// La synchronisation temps réel du Mushaf passe par la gateway WebSocket
// (mushaf.gateway.ts), pas par ces routes REST.
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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { Roles } from '../partages/auth/roles.decorateur';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { ClasseVirtuelleService } from './classe-virtuelle.service';
import { QuranHubService } from './quran-hub/quran-hub.service';
import { ConsentementEnregistrementDto } from './dto/consentement-enregistrement.dto';
import { SeanceReponseDto } from './dto/seance.reponse.dto';

@ApiTags('classe-virtuelle')
@Controller('classe-virtuelle')
export class ClasseVirtuelleControleur {
  constructor(
    private readonly service: ClasseVirtuelleService,
    private readonly quranHub: QuranHubService,
  ) {}

  // ─── Mushaf : sourates & versets (public, sans authentification) ──────────

  @Get('mushaf/sourates')
  @ApiOperation({ summary: 'Liste des 114 sourates (cache QuranHub)' })
  async listerSourates() {
    return this.quranHub.listerSourates();
  }

  @Get('mushaf/versets/:sourate')
  @ApiOperation({ summary: "Versets d'une sourate (cache QuranHub)" })
  async listerVersets(
    @Param('sourate') sourate: string,
    @Query('qiraat') qiraat?: string,
  ) {
    return this.quranHub.listerVersets(Number(sourate), qiraat);
  }

  // ─── Endpoints protégés (JWT requis) ─────────────────────────────────────

  @Post('seances')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @Roles(Role.PROFESSEUR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une séance pour une réservation (professeur)' })
  creerSeance(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: { reservationId: string; eleveId: string },
  ): Promise<SeanceReponseDto> {
    // Le professeur connecté est le propriétaire de la séance. L'identité de
    // l'élève vient de la réservation — fournie explicitement, sans que ce
    // module lise la table reservations (découplage).
    return this.service.creerSeance(dto.reservationId, dto.eleveId, utilisateur.sub);
  }

  @Get('seances/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Voir une séance (participant uniquement)' })
  trouverSeance(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<SeanceReponseDto> {
    return this.service.trouverSeance(id, utilisateur.sub);
  }

  @Post('seances/:id/consentement-enregistrement')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Recueillir le consentement parental à l'enregistrement" })
  enregistrerConsentement(
    @Param('id') id: string,
    @Body() dto: ConsentementEnregistrementDto,
  ): Promise<SeanceReponseDto> {
    return this.service.enregistrerConsentement(id, dto.consentementParental);
  }

  @Patch('seances/:id/enregistrement')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: "Activer/désactiver l'enregistrement (professeur)" })
  basculerEnregistrement(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
    @Body() dto: { actif: boolean },
  ): Promise<SeanceReponseDto> {
    return this.service.basculerEnregistrement(id, dto.actif, utilisateur.sub);
  }

  @Patch('seances/:id/mode-repli')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @ApiOperation({ summary: 'Basculer le mode de repli « audio seul »' })
  basculerModeRepli(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
    @Body() dto: { actif: boolean },
  ): Promise<SeanceReponseDto> {
    return this.service.basculerModeRepli(id, dto.actif, utilisateur.sub);
  }

  @Post('seances/:id/terminer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGarde, RolesGarde)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Terminer la séance (professeur)' })
  async terminerSeance(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.terminerSeance(id, utilisateur.sub);
  }
}
