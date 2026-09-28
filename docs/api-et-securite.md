# Spécification API, Sécurité & Traçabilité — E-Quran Academy

> **Version** : 1.0 · **Date** : 2026-09-28
> La documentation Swagger/OpenAPI interactive est disponible à l'URL `/api/docs` une fois le backend lancé.

---

## 1. Vue d'Ensemble des Endpoints REST

### 1.1 Module `utilisateurs`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/utilisateurs/inscription` | Aucun (public) | Créer un compte élève |
| `POST` | `/utilisateurs/connexion` | Aucun (public) | S'authentifier, recevoir un JWT cookie |
| `POST` | `/utilisateurs/deconnexion` | Aucun (public) | Effacer le cookie JWT |
| `POST` | `/utilisateurs/mot-de-passe-oublie` | Aucun (public) | Demander un lien de réinitialisation |
| `POST` | `/utilisateurs/reinitialiser-mot-de-passe` | Aucun (public) | Appliquer le nouveau mot de passe |
| `GET` | `/utilisateurs/moi` | Tout connecté | Profil de l'utilisateur connecté |
| `PATCH` | `/utilisateurs/moi` | Tout connecté | Mettre à jour son profil |
| `GET` | `/utilisateurs/:id` | Tout connecté | Récupérer un utilisateur par ID |
| `GET` | `/utilisateurs` | `ADMIN` | Lister tous les utilisateurs (avec filtre rôle) |
| `PATCH` | `/utilisateurs/:id/role` | `ADMIN` | Changer le rôle d'un utilisateur |
| `PATCH` | `/utilisateurs/:id/valider-professeur` | `ADMIN` | Valider un compte professeur |
| `PATCH` | `/utilisateurs/:id/rejeter-professeur` | `ADMIN` | Rejeter un compte professeur |

### 1.2 Module `professeurs`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/professeurs` | Aucun (public) | Lister les professeurs validés (avec filtres) |
| `GET` | `/professeurs/:id` | Aucun (public) | Profil public complet d'un professeur |
| `PATCH` | `/professeurs/moi` | `PROFESSEUR` | Mettre à jour son profil public (bio, Ijaza, audio, tarif) |

### 1.3 Module `reservations`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/reservations/professeurs/:id/disponibilites` | Aucun (public) | Créneaux disponibles d'un professeur |
| `GET` | `/reservations/professeurs/moi/disponibilites` | `PROFESSEUR` | Mes propres créneaux |
| `POST` | `/reservations/disponibilites` | `PROFESSEUR` | Ajouter un créneau de disponibilité |
| `DELETE` | `/reservations/disponibilites/:id` | `PROFESSEUR` | Supprimer un créneau |
| `POST` | `/reservations` | `ELEVE` | Créer une demande de réservation |
| `GET` | `/reservations/moi` | `ELEVE` | Mes réservations (élève) |
| `GET` | `/reservations/moi-professeur` | `PROFESSEUR` | Demandes reçues (professeur) |
| `GET` | `/reservations/:id` | Participant | Détail d'une réservation |
| `PATCH` | `/reservations/:id/statut` | Participant | Changer le statut d'une réservation |
| `DELETE` | `/reservations/:id` | Participant | Supprimer un cours passé ou annulé |

### 1.4 Module `classe-virtuelle`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/classe-virtuelle/seances/:id` | Participant | Détail d'une séance |
| `GET` | `/classe-virtuelle/seances/:id/token-visio` | Participant | Générer un token Daily.co pour la salle |
| `PATCH` | `/classe-virtuelle/seances/:id/terminer` | `PROFESSEUR` | Terminer manuellement une séance |
| `GET` | `/classe-virtuelle/quran/:sourate/:verset` | Tout connecté | Récupérer un verset (texte coranique depuis le cache) |
| `GET` | `/classe-virtuelle/quran/:sourate` | Tout connecté | Récupérer une sourate complète |

### 1.5 Module `paiement`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/paiement/solde` | Tout connecté | Solde du compte de l'utilisateur |
| `POST` | `/paiement/recharger` | `ELEVE` | Simuler une recharge (mode dev) |
| `POST` | `/paiement/crediter` | `ADMIN` | Créditer manuellement un compte |
| `GET` | `/paiement/transactions` | Tout connecté | Historique des transactions |

### 1.6 Module `avis`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/avis` | `ELEVE` | Laisser un avis sur un professeur |
| `GET` | `/avis/professeur/:id` | Aucun (public) | Avis d'un professeur |

### 1.7 Module `messagerie`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/messagerie` | Tout connecté | Envoyer un message |
| `GET` | `/messagerie/conversation/:userId` | Tout connecté | Conversation avec un utilisateur |
| `PATCH` | `/messagerie/:id/lu` | Destinataire | Marquer un message comme lu |

### 1.8 Module `suivi-pedagogique`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `/suivi-pedagogique/notes` | `PROFESSEUR` | Créer une note de fin de cours |
| `GET` | `/suivi-pedagogique/notes/eleve/:id` | Participant / Admin | Historique des notes d'un élève |

### 1.9 Module `feature-flags`

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/feature-flags` | `ADMIN` | Lister tous les feature flags |
| `PATCH` | `/feature-flags/:cle` | `ADMIN` | Activer/désactiver un flag |

### 1.10 Health Check

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/health` | Aucun (public) | Status de l'application (uptime, DB, Redis) |

---

## 2. Contrat WebSocket — Namespace `/classe-virtuelle`

### 2.1 Authentification

La connexion WebSocket doit fournir un jeton JWT valide via **l'une** de ces trois méthodes (par ordre de priorité) :

1. `socket.auth.token` (méthode recommandée pour les clients modernes)
2. Cookie `httpOnly` `jwt_access` (envoyé automatiquement par le navigateur)
3. Query param `?jeton=<token>` (réservé aux tests ou clients mobiles)

**En cas de jeton invalide**, le serveur déconnecte immédiatement le client et émet :
```json
{ "message": "Authentification requise" }
```

### 2.2 Événements Émis par le Client

| Événement | Payload | Rôle | Description |
|---|---|---|---|
| `rejoindreSeance` | `{ seanceId: string }` | Élève ou Professeur | Rejoindre la room WebSocket d'une séance |
| `surlignerMushaf` | `{ seanceId: string, numeroSourate: number, numeroVerset: number, plageSurlignage?: string }` | **Professeur uniquement** | Surligner un verset du Mushaf |
| `signalerBandePassante` | `{ niveau: "FAIBLE" \| "NORMAL" \| "ELEVE" }` | Élève ou Professeur | Signaler la qualité de la connexion |

### 2.3 Événements Émis par le Serveur

| Événement | Payload | Description |
|---|---|---|
| `roleConfirme` | `{ estProfesseur: boolean }` | Confirmation du rôle dans la séance |
| `mushafMisAJour` | `{ numeroSourate: number, numeroVerset: number, plageSurlignage: string \| null }` | Nouvel état du Mushaf (broadcast room) |
| `modeRepliMisAJour` | `{ modeRepliActif: boolean }` | Activation/désactivation du mode audio seul |
| `erreur` | `{ message: string }` | Erreur (accès refusé, séance introuvable, etc.) |

### 2.4 Réponse à `rejoindreSeance`

```json
{
  "etatMushaf": {
    "id": "uuid",
    "seanceId": "uuid",
    "numeroSourate": 2,
    "numeroVerset": 255,
    "plageSurlignage": "1-5",
    "misAJourLe": "2026-09-28T10:00:00Z"
  }
}
```
> Si aucun état n'existe encore, `etatMushaf` est `null`.

---

## 3. Stratégie d'Authentification et Sécurité

### 3.1 Architecture JWT

```
┌─────────────────────────────────────────────────┐
│              Cookie httpOnly (jwt_access)        │
│         • Secure=true (production)               │
│         • SameSite=Lax                           │
│         • maxAge: 24h (standard) / 30j (remember)│
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              JwtAuthGarde (NestJS)               │
│   1. Extrait le jeton du cookie jwt_access       │
│   2. Fallback : Header Authorization: Bearer...  │
│   3. jwt.verify(token, JWT_SECRET)               │
│   4. Attache PayloadJwt à request.user           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              RolesGarde (NestJS)                 │
│   Vérifie que payload.role ∈ @Roles(...)        │
│   Exemples : @Roles(Role.ADMIN)                  │
│              @Roles(Role.PROFESSEUR)             │
└─────────────────────────────────────────────────┘
```

### 3.2 Structure du Payload JWT

```typescript
interface PayloadJwt {
  sub: string;          // UUID de l'utilisateur
  email: string;        // E-mail (pour les logs)
  role: 'ELEVE' | 'PROFESSEUR' | 'ADMIN';
  iat: number;          // Issued At (timestamp UNIX)
  exp: number;          // Expiration (timestamp UNIX)
}
```

> **Règle de sécurité** : Le payload JWT ne contient jamais le mot de passe, le solde, ou toute autre donnée sensible.

### 3.3 Protection Brute-Force (Rate Limiting)

| Route | Limite | Fenêtre |
|---|---|---|
| Toutes les routes (global) | 100 requêtes | 1 minute |
| `POST /utilisateurs/inscription` | 5 requêtes | 1 minute |
| `POST /utilisateurs/connexion` | 10 requêtes | 1 minute |
| `POST /utilisateurs/mot-de-passe-oublie` | 3 requêtes | 1 heure |
| `POST /utilisateurs/reinitialiser-mot-de-passe` | 5 requêtes | 1 heure |

---

## 4. Système de Feature Flags

Les Feature Flags permettent d'activer ou désactiver des fonctionnalités sans redéploiement. Ils sont stockés dans la table `feature_flags` (clé unique + booléen `actif`).

### 4.1 Flags Actuels du Système

| Clé | Valeur par défaut | Description |
|---|---|---|
| `paiement.actif` | `false` | Active les transactions réelles (Stripe/PayDunya). En `false`, toutes les opérations financières sont simulées et loggées. |
| `reservation.instantanee` | `true` | Autorise les professeurs à activer la réservation instantanée sur leur profil (bypass de la validation manuelle). |
| `enregistrement.actif` | `false` | Active le module d'enregistrement des séances. Le consentement parental reste obligatoire même si activé. |

### 4.2 Usage dans le Code

```typescript
// Vérification côté service (PaiementService)
async isPaiementActif(): Promise<boolean> {
  const flag = await this.prisma.featureFlag.findUnique({
    where: { cle: 'paiement.actif' },
  });
  return flag?.actif ?? false;
}
```

> **Bonne pratique** : Chaque nouvelle fonctionnalité à risque (monétisation, enregistrement, KYC) **doit** être protégée par un Feature Flag avant sa mise en production.

---

## 5. Journal d'Audit (`JournalAudit`)

Le journal d'audit trace toutes les actions sensibles sans jamais stocker de données confidentielles (pas de mots de passe, pas de JWT, pas de données bancaires brutes).

### 5.1 Événements Tracés

| Code Événement | Déclencheur | Détails typiques |
|---|---|---|
| `CONNEXION` | POST /connexion (succès) | `{ ip_masquee: "82.64.xxx.xxx", user_agent }` |
| `INSCRIPTION` | POST /inscription (succès) | `{ email }` |
| `CHANGEMENT_ROLE` | PATCH /:id/role | `{ ancienRole: "ELEVE", nouveauRole: "PROFESSEUR" }` |
| `VALIDATION_PROF` | PATCH /:id/valider-professeur | `{ professeurId, adminId }` |
| `REJET_PROF` | PATCH /:id/rejeter-professeur | `{ professeurId, adminId }` |
| `CREDIT_MANUEL` | POST /paiement/crediter | `{ email, montant }` |
| `LIBERATION_ESCROW` | Cron libération automatique | `{ reservationId, montant }` |
| `REMBOURSEMENT_ESCROW` | Annulation réservation | `{ reservationId, montant }` |

### 5.2 Structure d'une Entrée Journal

```json
{
  "id": "uuid",
  "acteurId": "uuid-admin",
  "cibleId": "uuid-professeur",
  "evenement": "VALIDATION_PROF",
  "details": {
    "professeurId": "uuid-professeur",
    "adminId": "uuid-admin"
  },
  "creeLe": "2026-09-28T14:32:00Z"
}
```

---

## 6. Gestion du Texte Coranique (QuranHub + Cache)

### 6.1 Stratégie de Cache

Pour respecter la contrainte de disponibilité sur connexions faibles et éviter tout appel externe pendant un cours en direct, le texte coranique est importé **une seule fois** depuis l'API QuranHub et stocké dans la table `quran_text_cache`.

```
[Importation initiale — tâche admin one-shot]
         ↓
QuranHub API (Hafs + Warsh)
         ↓
INSERT INTO quran_text_cache (qiraat, sourate, verset, texte)
         ↓
✅ Base locale PostgreSQL — disponible OFFLINE

[Pendant le cours en direct]
GET /classe-virtuelle/quran/:sourate/:verset?qiraat=HAFS
         ↓
SELECT FROM quran_text_cache (0 appels API externes)
         ↓
✅ Verset retourné immédiatement (<5ms)
```

### 6.2 Index de Performance

La table `quran_text_cache` possède un index composite `(qiraat, sourate)` pour des requêtes rapides :

```sql
-- Index automatiquement créé par Prisma
CREATE UNIQUE INDEX ON quran_text_cache (qiraat, sourate, verset);
CREATE INDEX ON quran_text_cache (qiraat, sourate);
```

### 6.3 Support Hafs & Warsh

Les deux qira'at (lectures coraniques) sont entièrement supportées :

| Qiraat | Région principale | Usage |
|---|---|---|
| **Hafs** (رواية حفص) | Moyen-Orient, Afrique de l'Est, Global | Par défaut mondial |
| **Warsh** (رواية ورش) | Maghreb, Afrique de l'Ouest (Sénégal, Guinée, Mali) | Marché cible prioritaire |

---

## 7. Structure des Dossiers du Projet

```
equran-academy/
├── backend/                          # API NestJS
│   ├── prisma/
│   │   └── schema.prisma             # Modèle de données complet
│   └── src/
│       ├── app.module.ts             # Point d'entrée — composition des modules
│       ├── main.ts                   # Bootstrap NestJS, Swagger, CORS
│       ├── partages/                 # Couche transverse (PrismaService, JWT, Guards)
│       │   ├── auth/                 # JwtAuthGarde, RolesGarde, decorateurs
│       │   ├── prisma/               # PrismaService (singleton)
│       │   ├── redis/                # redis.usine.ts (Pub/Sub adapter)
│       │   ├── health/               # HealthController (/health)
│       │   └── pagination/           # PaginationDto, PageReponseDto
│       ├── utilisateurs/             # Domaine : comptes, auth, profils
│       │   ├── utilisateurs.module.ts
│       │   ├── utilisateurs.controleur.ts
│       │   ├── utilisateurs.service.ts
│       │   ├── professeurs.controleur.ts
│       │   ├── professeurs.service.ts
│       │   └── dto/
│       ├── reservations/             # Domaine : disponibilités, réservations
│       │   ├── reservations.module.ts
│       │   ├── reservations.controleur.ts
│       │   ├── reservations.service.ts
│       │   ├── reservations.cron.ts  # Tâche cron REALISE/ABSENT
│       │   └── dto/
│       ├── classe-virtuelle/         # Domaine : salle virtuelle, Mushaf, Daily.co
│       │   ├── classe-virtuelle.module.ts
│       │   ├── classe-virtuelle.controleur.ts
│       │   ├── classe-virtuelle.service.ts
│       │   ├── mushaf.gateway.ts     # WebSocket Gateway
│       │   ├── daily-co/             # Intégration API Daily.co
│       │   ├── quran-hub/            # Import QuranHub → cache
│       │   └── dto/
│       ├── paiement/                 # Domaine : escrow, solde, transactions
│       ├── suivi-pedagogique/        # Domaine : notes de session
│       ├── avis/                     # Domaine : avis et notations
│       ├── messagerie/               # Domaine : messages asynchrones
│       └── feature-flags/            # Domaine : gestion des flags
│
├── frontend/                         # Application Next.js
│   ├── app/
│   │   ├── (admin)/                  # Routes groupe admin
│   │   ├── (eleve)/                  # Routes groupe élève
│   │   ├── (professeur)/             # Routes groupe professeur
│   │   ├── connexion/                # Page de connexion
│   │   ├── inscription/              # Page d'inscription
│   │   ├── professeurs/              # Liste publique des professeurs
│   │   ├── eleve/                    # Espace élève
│   │   ├── professeur/               # Espace professeur
│   │   └── admin/                    # Panneau d'administration
│   ├── composants/                   # Composants réutilisables par domaine
│   │   ├── classe-virtuelle/         # Salle de classe + hook useSalleClasse
│   │   ├── professeur/               # Tableaux de bord, revenus
│   │   └── landing/                  # Page d'accueil (header, hero, etc.)
│   └── lib/                          # Utilitaires, API client, types TS
│
└── docs/                             # 📚 Documentation professionnelle
    ├── README.md                     # Portail d'accueil et sommaire
    ├── cahier-des-charges-et-besoins.md
    ├── cas-d-utilisation.md
    ├── diagrammes-de-classes.md
    ├── architecture-technique.md
    └── api-et-securite.md            # Ce fichier
```

---

## 8. Variables d'Environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL (Supabase/Neon) |
| `JWT_SECRET` | ✅ | Clé secrète pour signer les JWT (≥ 32 caractères) |
| `REDIS_URL` | ⚠️ Recommandé | URL Upstash Redis (cache, BullMQ, Socket.IO Pub/Sub) |
| `CORS_ORIGINE` | ✅ Production | Origines CORS autorisées (séparées par virgule) |
| `DAILY_CO_API_KEY` | ✅ | Clé API Daily.co pour créer les salles vidéo |
| `RESEND_API_KEY` | ⚠️ Recommandé | Clé API Resend pour les e-mails transactionnels |
| `PORT_WS` | ❌ Optionnel | Port distinct pour le WebSocket (défaut : même que API) |
| `NODE_ENV` | ⚠️ Recommandé | `development` ou `production` (contrôle la rigueur des vérifications) |
| `PAYMENTS_ENABLED` | ❌ Optionnel | `false` par défaut (contrôle via Feature Flag en base) |
