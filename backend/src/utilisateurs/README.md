# Module : utilisateurs

**Rôle :** comptes élève, parent, professeur, admin — authentification et rôles

**Règle d'or :** ce module ne lit ni n'écrit jamais directement dans les
données d'un autre module. Toute communication avec un autre domaine passe
par une interface explicite (appel de service exposé, ou événement).

## Étendue

Gère l'identité (table `users`) et l'authentification :

- Inscription (toujours au rôle `ELEVE` — pas d'auto-élévation).
- Connexion → jeton JWT (API stateless).
- Consultation de son propre profil (`/moi`).
- Promotion de rôle par un administrateur uniquement.

La couche JWT, les gardes et les décorateurs de rôle vivent dans
`src/partages/auth/` (infrastructure transverse, non métier).

## API

| Méthode | Route                      | Auth.        | Rôle requis | Description                              |
|---------|----------------------------|--------------|-------------|------------------------------------------|
| POST    | `/utilisateurs/inscription`| publique     | —           | Crée un compte élève                     |
| POST    | `/utilisateurs/connexion`  | publique     | —           | Authentifie et renvoie un jeton JWT      |
| GET     | `/utilisateurs/moi`        | Bearer JWT   | tout rôle   | Profil de l'utilisateur connecté         |
| PATCH   | `/utilisateurs/:id/role`   | Bearer JWT   | `ADMIN`     | Change le rôle d'un utilisateur          |

Documentation interactive : `/api` (Swagger auto-généré).

## Modèle de données

Voir `prisma/schema.prisma` — modèle `User`, énumération `Role`.

## À faire plus tard

- Refresh tokens (rotation), révocation.
- Réinitialisation de mot de passe par e-mail (Resend).
- Profil professeur (`teacherProfiles`) — module dédié ou extension de celui-ci.
