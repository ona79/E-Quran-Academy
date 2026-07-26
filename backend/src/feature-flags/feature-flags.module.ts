// Module NestJS : regroupe le contrôleur et le service du domaine "feature-flags".
// Domaine : activation/désactivation de fonctionnalités sans redéploiement.
// Exporté pour que d'autres modules injectent FeatureFlagsService.
import { Module } from '@nestjs/common';
import { FeatureFlagsControleur } from './feature-flags.controleur';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  controllers: [FeatureFlagsControleur],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
