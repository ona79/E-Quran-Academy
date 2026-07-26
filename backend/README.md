# Backend — E-Quran Academy

Monolithe modulaire NestJS. Chaque dossier de `src/` est un domaine métier
autonome (voir section 6.1 du cahier des charges) :

- `utilisateurs/` — comptes et rôles
- `reservations/` — calendrier et créneaux
- `classe-virtuelle/` — visioconférence + Mushaf interactif
- `paiement/` — crédits, packs, escrow (désactivé par défaut)
- `suivi-pedagogique/` — progrès de l'élève
- `avis/` — notation des professeurs
- `messagerie/` — échanges asynchrones
- `feature-flags/` — activation/désactivation de fonctionnalités
- `partages/` — utilitaires communs (rien de métier)

Aucun module n'accède directement aux données d'un autre.
