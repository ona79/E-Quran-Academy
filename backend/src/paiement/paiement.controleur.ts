import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { Roles } from '../partages/auth/roles.decorateur';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import { PaiementService } from './paiement.service';

@ApiTags('paiement')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde, RolesGarde)
@Controller('paiement')
export class PaiementControleur {
  constructor(private readonly service: PaiementService) {}

  @Get('solde')
  @ApiOperation({ summary: 'Obtenir le solde actuel de l’utilisateur connecté' })
  async chargerSolde(@UtilisateurCourant() utilisateur: PayloadJwt): Promise<{ solde: number }> {
    const solde = await this.service.chargerSolde(utilisateur.sub);
    return { solde };
  }

  @Get('historique')
  @ApiOperation({ summary: 'Obtenir l’historique des transactions de l’utilisateur' })
  async listerTransactions(@UtilisateurCourant() utilisateur: PayloadJwt) {
    return this.service.listerTransactions(utilisateur.sub);
  }

  @Post('recharge-simulee')
  @Roles(Role.ELEVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recharger son solde en mode simulation (élève uniquement)' })
  async simulerRecharge(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: { montant: number },
  ) {
    return this.service.simulerRecharge(utilisateur.sub, dto.montant);
  }

  @Post('admin/crediter')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créditer manuellement un compte utilisateur (Administrateur uniquement)' })
  async crediterManuellement(@Body() dto: { email: string; montant: number }) {
    return this.service.crediterManuellement(dto.email, dto.montant);
  }

  @Post('sequestre/:reservationId/liberer')
  @Roles(Role.ELEVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Libérer manuellement les fonds séquestrés (élève uniquement)' })
  async libererFonds(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('reservationId') reservationId: string,
  ) {
    // Vérification de sécurité : l'élève connecté doit être celui qui a fait la réservation
    const paiement = await this.service.listerTransactions(utilisateur.sub);
    const appartient = paiement.some((p: any) => p.reservationId === reservationId && p.eleveId === utilisateur.sub);
    if (!appartient) {
      throw new NotFoundException('Séquestre introuvable');
    }

    await this.service.libererFonds(reservationId);
    return { message: 'Fonds libérés avec succès' };
  }
}

// Importation locale pour éviter les erreurs d'importation circulaires
import { NotFoundException } from '@nestjs/common';
