// Module NestJS : regroupe le contrôleur et le service du domaine "utilisateurs".
// Domaine : comptes élève, parent, professeur, admin — authentification et rôles.
// Inclut aussi la gestion des profils professeurs (extension de l'identité).
// Ne dépend d'aucun autre module métier directement : toute la couche
// transverse (Prisma, JWT) est fournie par PartagesModule (Global).
import { Module } from '@nestjs/common';
import { UtilisateursControleur } from './utilisateurs.controleur';
import { UtilisateursService } from './utilisateurs.service';
import { ProfesseursControleur } from './professeurs.controleur';
import { ProfesseursService } from './professeurs.service';

@Module({
  // IMPORTANT: ProfesseursControleur doit être enregistré EN PREMIER.
  // Raison : Express matche les routes dans l'ordre d'enregistrement.
  // Si UtilisateursControleur est en premier, GET /utilisateurs/:id capture
  // "professeurs" comme paramètre (:id = "professeurs") avant que
  // ProfesseursControleur puisse déclarer GET /utilisateurs/professeurs,
  // ce qui retourne 401 (la route /:id est protégée par JwtAuthGarde).
  controllers: [ProfesseursControleur, UtilisateursControleur],
  providers: [UtilisateursService, ProfesseursService],
  exports: [UtilisateursService, ProfesseursService],
})
export class UtilisateursModule {}
