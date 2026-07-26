// Charge utile encodée dans le JWT. API stateless : aucune session serveur,
// tout ce dont on a besoin pour autoriser une requête vit dans le token.
export interface PayloadJwt {
  /// Identifiant (UUID) de l'utilisateur — `sub` côté JWT.
  sub: string;
  email: string;
  role: string;
}
