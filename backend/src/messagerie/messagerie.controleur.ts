// Points d'entrée API (HTTP) du domaine "messagerie".
// Domaine : messagerie asynchrone entre élèves et professeurs.
//
// Endpoints :
//   POST   /messagerie/messages              — envoyer un message
//   GET    /messagerie/messages/recus        — boîte de réception (paginé)
//   GET    /messagerie/conversations/:interlocuteurId — conversation (paginé)
//   PATCH  /messagerie/messages/:id/lu       — marquer comme lu
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
import { JwtAuthGarde } from '../partages/auth/jwt-auth.garde';
import { RolesGarde } from '../partages/auth/roles.garde';
import { UtilisateurCourant } from '../partages/auth/utilisateur-courant.decorateur';
import { PayloadJwt } from '../partages/auth/payload-jwt.interface';
import {
  PageReponseDto,
  PaginationDto,
} from '../partages/pagination/pagination.dto';
import { MessagerieService } from './messagerie.service';
import { EnvoyerMessageDto } from './dto/envoyer-message.dto';
import { MessageReponseDto } from './dto/message.reponse.dto';

@ApiTags('messagerie')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde, RolesGarde)
@Controller('messagerie')
export class MessagerieControleur {
  constructor(private readonly service: MessagerieService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envoyer un message asynchrone' })
  envoyer(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Body() dto: EnvoyerMessageDto,
  ): Promise<MessageReponseDto> {
    return this.service.envoyer(utilisateur.sub, dto);
  }

  @Get('messages/recus')
  @ApiOperation({ summary: 'Boîte de réception (paginée)' })
  boiteReception(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<MessageReponseDto>> {
    return this.service.listerBoiteReception(utilisateur.sub, pagination);
  }

  @Get('conversations/:interlocuteurId')
  @ApiOperation({ summary: 'Conversation avec un interlocuteur (paginée)' })
  conversation(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('interlocuteurId') interlocuteurId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PageReponseDto<MessageReponseDto>> {
    return this.service.listerConversation(utilisateur.sub, interlocuteurId, pagination);
  }

  @Patch('messages/:id/lu')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  marquerCommeLu(
    @UtilisateurCourant() utilisateur: PayloadJwt,
    @Param('id') id: string,
  ): Promise<MessageReponseDto> {
    return this.service.marquerCommeLu(id, utilisateur.sub);
  }
}
