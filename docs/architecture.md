# Architecture du projet — vue d'ensemble

backend/   -> monolithe modulaire NestJS (1 dossier = 1 domaine métier)
frontend/  -> Next.js, 1 dossier par espace utilisateur
prisma/    -> schéma de base de données (backend/prisma/schema.prisma)

Principes directeurs (cahier des charges, section 6) :
1. Extensibilité  : ajouter une fonctionnalité = ajouter un module, sans
   toucher à l'existant.
2. Load balancing dès le lancement : au moins 2 instances du backend.
3. Conventions en français : tout le vocabulaire métier (variables,
   colonnes, endpoints) s'écrit en français.
