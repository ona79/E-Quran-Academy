# E-Quran Academy

> Plateforme SaaS de cours de Coran en ligne — met en relation des **professeurs certifiés** et des **élèves / parents**, avec salle de classe virtuelle interactive et suivi pédagogique complet.

**Audience principale :** Sénégal, Guinée et diaspora francophone  
**Objectif technique :** Fonctionner pleinement sur des connexions internet faibles ou instables

---

## Table des matières

1. [À propos de la plateforme](#-à-propos-de-la-plateforme)
2. [Fonctionnalités](#-fonctionnalités)
3. [Salle de classe virtuelle](#-salle-de-classe-virtuelle)
4. [Stack technique](#-stack-technique)
5. [Structure du projet](#-structure-du-projet)
6. [Installation et démarrage](#-installation-et-démarrage)
7. [Variables d'environnement](#-variables-denvironnement)
8. [Routes de l'application](#-routes-de-lapplication)
9. [API Backend](#-api-backend)
10. [Conventions du projet](#-conventions-du-projet)

---

## 📖 À propos de la plateforme

**E-Quran Academy** est une plateforme éducative islamique qui permet à des professeurs de Coran certifiés (Hafiz, Ijaza) de proposer des cours en ligne à des élèves du monde entier.

La plateforme est conçue pour trois types d'utilisateurs :

| Rôle | Description |
|------|-------------|
| 🎓 **Élève / Parent** | Recherche un professeur, réserve des cours, suit sa progression |
| 👨‍🏫 **Professeur** | Gère ses disponibilités, donne des cours, suit les revenus |
| 🔧 **Administrateur** | Valide les professeurs, modère le contenu, gère les paiements |

---

## ✨ Fonctionnalités

### Pour l'élève / parent
- Tableau de bord personnalisé
- Recherche de professeurs avec filtres (langue, tarif, genre, qiraat)
- Réservation de cours avec conversion automatique de fuseau horaire
- Cours d'essai gratuit
- Packs de cours (5, 10, 20 séances)
- Messagerie avec le professeur
- Accès à la salle de classe virtuelle
- Historique et suivi pédagogique

### Pour le professeur
- Gestion des disponibilités récurrentes (créneaux hebdomadaires)
- Profil public complet (bio, Ijaza, extrait audio de récitation, qiraats maîtrisées)
- Formulaire de fin de cours (sourate mémorisée, notes tajwid, progression)
- Tableau de bord des revenus
- Messagerie avec les élèves
- Accès à la salle de classe virtuelle (avec contrôle du Mushaf)

### Pour l'administrateur
- Validation et vérification des professeurs (KYC)
- Modération des avis et contenus
- Gestion des paiements et feature flags
- Bascule `PAYMENTS_ENABLED` pour activer/désactiver le paiement réel
- Confirmation manuelle de crédit (paiements hors plateforme)

### Système de paiement
Le système de paiement est **entièrement modélisé** (Stripe Connect + PayDunya / CinetPay) mais **désactivé par défaut** (`PAYMENTS_ENABLED=false`). Un écran d'administration permet la confirmation manuelle de crédit pour les paiements hors plateforme.

---

## 🕌 Salle de classe virtuelle

La salle de classe est la fonctionnalité centrale de la plateforme :

- **Visioconférence** via Daily.co (SFU, bitrate adaptatif / simulcast)
- **Mushaf interactif synchronisé** en temps réel via WebSocket (Socket.io + Redis Pub/Sub) — le professeur surligne la sourate, le verset et la plage ; l'élève suit en lecture seule
- **Mode de repli** « audio seul + Mushaf » si la bande passante vidéo est insuffisante
- **Reconnexion automatique** sans perte de l'état de synchronisation
- **Enregistrement optionnel** (micro-service asynchrone, consentement parental requis, rétention 30 jours)
- **Texte coranique** fourni par l'API QuranHub (lectures Hafs & Warsh), mis en cache localement

---

## 🛠 Stack technique

| Couche | Technologie | Hébergement recommandé |
|--------|-------------|------------------------|
| Frontend | Next.js 14 + React 18 + TypeScript | Vercel |
| Backend | NestJS 10 + TypeScript | Instance unique (auto-scaling prêt) |
| Base de données | PostgreSQL + Prisma 5 | Neon / Supabase |
| Cache & Files d'attente | Redis + BullMQ | Upstash |
| Visioconférence | Daily.co (`@daily-co/daily-react`) | Daily.co |
| WebSocket | Socket.io + `@socket.io/redis-adapter` | — |
| Texte coranique | API QuranHub (Hafs & Warsh) | Cache en base |
| Stockage vidéo | Cloudflare R2 / Backblaze B2 | — |
| Emails | Brevo / Resend | — |
| Paiement | Stripe Connect + PayDunya / CinetPay | — |

---

## 📁 Structure du projet

```
equran-academy/
│
├── backend/                      # API NestJS (monolithe modulaire)
│   ├── src/
│   │   ├── main.ts               # Bootstrap, sécurité (Helmet, CORS, Swagger)
│   │   ├── app.module.ts
│   │   ├── utilisateurs/         # Inscription, auth JWT, profils élèves & professeurs
│   │   ├── reservations/         # Créneaux & réservations de cours
│   │   ├── classe-virtuelle/     # Salles Daily.co + Gateway WebSocket Mushaf
│   │   ├── suivi-pedagogique/    # Rapports de fin de cours, historique
│   │   ├── paiement/             # Escrow, Stripe, PayDunya
│   │   ├── messagerie/           # Messages asynchrones professeur ↔ élève
│   │   ├── avis/                 # Notes et commentaires post-cours
│   │   ├── feature-flags/        # Activation/désactivation sans redéploiement
│   │   └── partages/             # Guards, DTOs communs, utilitaires
│   ├── prisma/
│   │   ├── schema.prisma         # Schéma PostgreSQL complet
│   │   ├── seed.ts               # Données initiales (compte admin)
│   │   └── migrations/
│   ├── .env.example              # Modèle de configuration (sans secrets)
│   └── package.json
│
├── frontend/                     # Application Next.js
│   ├── app/
│   │   ├── page.tsx              # Page d'accueil publique
│   │   ├── connexion/            # Authentification
│   │   ├── inscription/          # Création de compte
│   │   ├── professeurs/          # Catalogue public des professeurs
│   │   ├── eleve/                # Espace élève (cours, réservations, messages, classe)
│   │   ├── professeur/           # Espace professeur (disponibilités, suivi, revenus)
│   │   └── admin/                # Tableau de bord administrateur
│   ├── composants/
│   │   ├── classe-virtuelle/     # Salle de classe (vidéo + Mushaf + WebSocket)
│   │   ├── eleve/                # Composants spécifiques à l'élève
│   │   ├── professeur/           # Composants spécifiques au professeur
│   │   ├── auth/                 # Formulaires connexion / inscription
│   │   ├── admin/                # Outils d'administration
│   │   ├── layout/               # Navigation, sidebar, header global
│   │   └── ui/                   # Boutons, modales, composants réutilisables
│   ├── lib/                      # Clients API, hooks, utilitaires
│   ├── .env.example
│   └── package.json
│
└── docs/
    └── architecture.md           # Vue d'ensemble architecturale détaillée
```

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- Une instance **PostgreSQL** (locale ou Neon/Supabase)
- Une instance **Redis** (locale ou Upstash)

### 1. Cloner le projet

```bash
git clone https://github.com/ona79/equran-academy.git
cd equran-academy
```

### 2. Configurer les variables d'environnement

```bash
# Backend
cp backend/.env.example backend/.env
# → Ouvrir backend/.env et remplir les valeurs obligatoires

# Frontend
cp frontend/.env.example frontend/.env.local
# → Remplir NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Installer les dépendances

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Initialiser la base de données

```bash
cd backend
npm run prisma:migrate   # Applique les migrations et crée les tables
npm run prisma:seed      # Crée le compte administrateur (si ADMIN_EMAIL est défini)
```

### 5. Lancer en développement

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

L'application est accessible sur **http://localhost:3000**  
La documentation Swagger de l'API est sur **http://localhost:3001/api**

---

## ⚙️ Variables d'environnement

### Backend — `backend/.env`

| Variable | Obligatoire | Description |
|----------|:-----------:|-------------|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL |
| `REDIS_URL` | ✅ | URL Redis (Upstash ou local) |
| `JWT_SECRET` | ✅ | Clé secrète pour signer les jetons JWT |
| `JWT_EXPIRES_IN` | — | Durée des jetons (défaut : `7d`) |
| `PORT` | — | Port d'écoute (défaut : `3001`) |
| `CORS_ORIGINE` | prod ✅ | Origines autorisées (séparées par `,`) |
| `PAYMENTS_ENABLED` | — | Active le paiement réel (défaut : `false`) |
| `STRIPE_SECRET_KEY` | — | Clé secrète Stripe |
| `PAYDUNYA_API_KEY` | — | Clé PayDunya |
| `DAILY_API_KEY` | — | Clé API Daily.co (visioconférence) |
| `QURANHUB_API_URL` | — | URL de l'API QuranHub |
| `STOCKAGE_R2_BUCKET` | — | Nom du bucket Cloudflare R2 |
| `EMAIL_API_KEY` | — | Clé Brevo ou Resend (emails) |
| `ADMIN_EMAIL` | — | Email du compte admin créé au seed |
| `ADMIN_MOT_DE_PASSE` | — | Mot de passe de l'admin (seed uniquement) |
| `PORT_WS` | — | Port WebSocket (défaut : `3002`) |

### Frontend — `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL du backend (ex. `http://localhost:3001`) |
| `NEXT_PUBLIC_WS_URL` | URL WebSocket (ex. `http://localhost:3002`) |

---

## 🗺 Routes de l'application

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Page d'accueil |
| `/connexion` | Public | Authentification |
| `/inscription` | Public | Création de compte |
| `/professeurs` | Public | Catalogue des professeurs |
| `/eleve` | Élève | Tableau de bord |
| `/eleve/reserver` | Élève | Réservation d'un cours |
| `/eleve/classe` | Élève | Salle de classe virtuelle |
| `/professeur` | Professeur | Tableau de bord |
| `/professeur/disponibilites` | Professeur | Gestion des créneaux |
| `/professeur/suivi/:id` | Professeur | Rapport de fin de cours |
| `/professeur/classe/:id` | Professeur | Salle de classe virtuelle |
| `/admin` | Admin | Tableau de bord administrateur |

---

## 📡 API Backend

| Module | Endpoints principaux |
|--------|----------------------|
| `utilisateurs` | `POST /auth/inscription`, `POST /auth/connexion`, `GET /utilisateurs/moi` |
| `reservations` | `GET /reservations`, `POST /reservations`, `PATCH /reservations/:id/annuler` |
| `classe-virtuelle` | `POST /classe-virtuelle/salle`, `GET /classe-virtuelle/salle/:id/jeton` |
| `suivi-pedagogique` | `POST /suivi/rapport`, `GET /suivi/:eleveId` |
| `paiement` | `POST /paiement/initier`, `POST /paiement/liberer`, `GET /paiement/revenus` |
| `messagerie` | `GET /messages/:conversationId`, `POST /messages` |
| `avis` | `POST /avis`, `GET /avis/professeur/:id` |
| `feature-flags` | `GET /feature-flags`, `PATCH /feature-flags/:cle` |

> Documentation complète et interactive disponible via **Swagger** : `http://localhost:3001/api`

---

## 📐 Conventions du projet

### Nommage en français (obligatoire)

Tout le vocabulaire métier est en **français** — variables, fonctions, colonnes, endpoints :

```ts
// ✅ Correct
const tarifHoraire = professeur.tarifHoraire;
async function surlignerVerset(sourate: number, verset: number) { … }

// ❌ Interdit
const hourlyRate = teacher.hourlyRate;
async function highlightVerse(surah: number, ayah: number) { … }
```

Seuls les mots-clés du langage restent en anglais (`class`, `async`, `interface`, `fetch`…).

### Architecture
- Un **module NestJS par domaine métier** — pas de dossiers génériques `controllers/` ou `services/`
- Les modules communiquent **uniquement via des services exposés explicitement**
- Les **feature flags** permettent d'activer/désactiver toute fonctionnalité sans redéploiement

### Sécurité (appliquée dans `main.ts`)
1. Validation des variables critiques au démarrage (fail-fast)
2. **Helmet** — en-têtes HTTP de sécurité
3. **ValidationPipe** global — whitelist + forbidNonWhitelisted
4. **ThrottlerGuard** — 100 req/min par défaut
5. **CORS** restreint à `CORS_ORIGINE`

---

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique (Semestre 6).
