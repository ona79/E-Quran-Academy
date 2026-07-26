// Réponse de l'endpoint de connexion : le jeton JWT + un aperçu de l'utilisateur.
import { ApiProperty } from '@nestjs/swagger';
import { UtilisateurReponseDto } from './utilisateur.reponse.dto';

export class ConnexionReponseDto {
  @ApiProperty({ description: "Jeton JWT à envoyer dans l'en-tête Authorization: Bearer <jeton>" })
  jeton!: string;

  @ApiProperty({ type: () => UtilisateurReponseDto })
  utilisateur!: UtilisateurReponseDto;
}
