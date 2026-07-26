---
name: equran-academy
description: Standards et architecture du projet E-Quran Academy. À utiliser pour toute tâche de développement dans ce projet — créer un module NestJS, un contrôleur, une migration Prisma, un composant Next.js, ou toute fonctionnalité liée aux élèves, professeurs, réservations, paiement ou à la salle de classe virtuelle.
---

# Standards de développement — E-Quran Academy

Plateforme SaaS mettant en relation des professeurs de Coran certifiés et des
élèves/parents, avec salle de classe virtuelle et suivi pédagogique.

## Contexte du projet

- Budget réduit : toujours privilégier une solution gratuite ou low-cost à
  fonctionnalité équivalente (Vercel, Supabase/Neon, Upstash, Daily.co, Resend,
  Cloudflare R2).
- Audience principale : Sénégal, Guinée et diaspora francophone. La lecture
  coranique Warsh doit être supportée en plus du Hafs.
- Le produit doit rester pleinement utilisable sur des connexions internet
  faibles ou instables.
- Modèle de référence pour les mécaniques produit : iTalki (packs de cours,
  réservation instantanée, confirmation post-cours).

## Stack technique imposée

- Frontend : Next.js (React) + TypeScript, déployé sur Vercel.
- Backend : Node.js + TypeScript (NestJS), API sans état (stateless).
- Base de données : PostgreSQL (Supabase ou Neon) + ORM Prisma.
- Cache / files d'attente : Redis (Upstash) + BullMQ pour les tâches
  asynchrones (emails, post-traitement vidéo).
- Visioconférence : Daily.co (architecture SFU, bitrate adaptatif/simulcast).
- Texte coranique : API QuranHub (Hafs + Warsh), importé une fois et mis en
  cache dans une table `quran_text_cache`. Ne jamais appeler l'API tierce
  pendant un cours en direct.
- Stockage vidéo (micro-service séparé) : Cloudflare R2 ou Backblaze B2.
- Emails transactionnels : Resend ou Brevo.
- Paiement : Stripe Connect + agrégateur local (PayDunya ou CinetPay),
  entièrement codés mais désactivés par défaut via `PAYMENTS_ENABLED=false`.
- Déploiement backend : **en MVP, une seule instance avec auto-scaling
  configuré mais non déclenché** (priorité au budget). Le passage à
  plusieurs instances derrière un load balancer ne devient une exigence
  non négociable qu'à partir de la Phase 4 (activation du paiement réel),
  quand la charge et la criticité de service le justifient. Si une tâche
  early-stage demande explicitement du multi-instance day-1, signaler le
  surcoût avant de l'implémenter.

## Architecture & extensibilité — règles à appliquer systématiquement

1. Organiser le backend en **monolithe modulaire** : un module NestJS par
   domaine métier — `utilisateurs`, `reservations`, `classe-virtuelle`,
   `paiement`, `suivi-pedagogique`, `avis`, `messagerie`, `feature-flags`.
2. Aucun module ne doit accéder directement aux données internes d'un autre
   module. Toute communication passe par un service exposé explicitement.
3. Toute nouvelle fonctionnalité doit pouvoir être ajoutée comme un nouveau
   module, sans modifier le code des modules existants.
4. Structurer les dossiers par fonctionnalité (`src/reservations/`,
   `src/paiement/`...), jamais par type technique (pas de `controllers/` ou
   `services/` génériques à la racine).
5. Générer la documentation API automatiquement (Swagger/OpenAPI à partir des
   décorateurs NestJS) pour que toute l'API reste auditable en un coup d'œil.
6. Utiliser la table `feature_flags` (clé, actif, description) pour activer ou
   désactiver n'importe quelle fonctionnalité sans redéploiement.
7. **Synchronisation temps réel multi-instances** : dès que l'application
   tourne sur plus d'une instance (Phase 4+), tous les événements WebSocket
   du module `classe-virtuelle` (surlignage Mushaf, présence, statut de
   reconnexion) doivent être diffusés via un adapter Redis Pub/Sub
   (ex. `@socket.io/redis-adapter` sur l'instance Upstash existante), jamais
   gardés en mémoire locale du process. Ça doit être prévu dans le code dès
   le MVP même si une seule instance tourne, pour éviter une migration
   douloureuse plus tard.

## Convention de nommage — IMPORTANT, non négociable

Tout le vocabulaire métier s'écrit **en français** : variables, noms de
fonctions, colonnes de base de données, endpoints d'API, messages d'erreur.

- ✅ `tarifHoraire`, `prochainCours`, `estDisponible`, `surlignerVerset()`
- ❌ `hourlyRate`, `nextLesson`, `isAvailable`, `highlightVerse()`

Seuls les mots-clés propres au langage/framework restent en anglais (`class`,
`async`, `interface`, `fetch`).

## Rôles et fonctionnalités

1. **Élève / Parent** : tableau de bord, réservation avec conversion de
   fuseau horaire, filtres (langue, tarif, genre du professeur), avis, cours
   d'essai, packs de cours à tarif réduit, confirmation post-cours
   (optionnelle), messagerie asynchrone, accès à la salle de classe.
2. **Professeur** : disponibilités récurrentes, réservation instantanée
   optionnelle, profil public (bio, Ijaza, audio, tarif, qiraat par défaut),
   formulaire de fin de cours (sourate mémorisée/révisée, tajwid), revenus.
3. **Administrateur** : validation des professeurs, modération, finance,
   bascule `PAYMENTS_ENABLED`, gestion des feature flags, KYC.

### Salle de classe virtuelle — points critiques

- Seul le compte **professeur** peut émettre un événement de surlignage du
  Mushaf (sourate, verset, plage). L'élève reçoit toujours en lecture seule.
- Les messages de synchronisation WebSocket ne contiennent que des références
  texte, jamais d'image — payload minimal pour rester léger sur connexion
  faible.
- Diffuser ces événements via Redis Pub/Sub (voir règle d'architecture #7),
  pas uniquement en mémoire locale.
- Prévoir un mode de repli « audio seul + Mushaf » si la bande passante vidéo
  devient insuffisante.
- Gérer la reconnexion automatique sans perte de l'état de synchronisation.
- Enregistrement optionnel, micro-service asynchrone séparé, consentement
  parental obligatoire avant activation, rétention de 30 jours par défaut.

### Paiement (désactivé par défaut)

- Modéliser entièrement le système (table `payments`, statut d'escrow :
  bloqué → libéré) sans jamais déclencher de transaction réelle si
  `PAYMENTS_ENABLED=false`.
- Déclenchement de la libération : passage automatique à « réalisé » 24h
  après la fin du cours, sauf signalement de l'élève, ou confirmation
  manuelle anticipée par l'élève.
- En mode désactivé, fournir un écran admin de confirmation manuelle de
  crédit après paiement hors plateforme.

## Schéma de base de données (tables principales)

Convention commune à toutes les tables sauf mention contraire : `id` (uuid,
clé primaire), `creeLe` (timestamp), `misAJourLe` (timestamp).
