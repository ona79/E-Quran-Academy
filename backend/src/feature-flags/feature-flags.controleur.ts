// Points d'entrée API (HTTP) du domaine "feature-flags".
// Domaine : activation/désactivation de fonctionnalités sans redéploiement.
//
// Endpoints :
//   GET    /feature-flags                — liste (paginée), tout authentifié
//   GET    /feature-flags/:cle           — état d'un flag, tout authentifié
//   POST   /feature-flags                — créer (ADMIN)
//   PATCH  /feature-flags/:cle           — modifier (ADMIN)
//   DELETE /feature-flags/:cle           — supprimer (ADMIN)
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
import {
  PageReponseDto,
  PaginationDto,
} from '../partages/pagination/pagination.dto';
import { FeatureFlagsService } from './feature-flags.service';
import { CreerFeatureFlagDto } from './dto/creer-feature-flag.dto';
import { ModifierFeatureFlagDto } from './dto/modifier-feature-flag.dto';
import { FeatureFlagReponseDto } from './dto/feature-flag.reponse.dto';

@ApiTags('feature-flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde, RolesGarde)
@Controller('feature-flags')
export class FeatureFlagsControleur {
  constructor(private readonly service: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste paginée des feature flags' })
  lister(@Query() pagination: PaginationDto): Promise<PageReponseDto<FeatureFlagReponseDto>> {
    return this.service.lister(pagination);
  }

  @Get(':cle')
  @ApiOperation({ summary: "État d'un feature flag" })
  trouver(@Param('cle') cle: string): { cle: string; actif: boolean } {
    return { cle, actif: this.service.estActif(cle) };
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un feature flag (administrateur)' })
  creer(@Body() dto: CreerFeatureFlagDto): Promise<FeatureFlagReponseDto> {
    return this.service.creer(dto);
  }

  @Patch(':cle')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un feature flag (administrateur)' })
  modifier(
    @Param('cle') cle: string,
    @Body() dto: ModifierFeatureFlagDto,
  ): Promise<FeatureFlagReponseDto> {
    return this.service.modifier(cle, dto);
  }

  @Delete(':cle')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un feature flag (administrateur)' })
  async supprimer(@Param('cle') cle: string): Promise<void> {
    await this.service.supprimer(cle);
  }
}
