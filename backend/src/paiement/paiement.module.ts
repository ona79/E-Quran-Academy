import { Module } from '@nestjs/common';
import { PaiementControleur } from './paiement.controleur';
import { PaiementService } from './paiement.service';

@Module({
  controllers: [PaiementControleur],
  providers: [PaiementService],
  exports: [PaiementService],
})
export class PaiementModule {}
