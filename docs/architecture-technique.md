# Architecture Technique & Diagrammes Dynamiques — E-Quran Academy

> **Version** : 1.0 · **Date** : 2026-09-28 · **Convention** : UML 2.5 — Notation Mermaid

---

## 1. Architecture Globale du Système

```mermaid
graph TB
    subgraph "Client (Navigateur)"
        FE["🖥️ Frontend Next.js\n(Vercel Edge)"]
        WS_CLIENT["🔌 Socket.IO Client\n(WebSocket Mushaf)"]
    end

    subgraph "Backend (NestJS — Monolithe Modulaire)"
        API["🚀 API REST\n(Express + NestJS)"]
        WS_SERVER["⚡ WebSocket Gateway\n(MushafGateway)\nNamespace: /classe-virtuelle"]
        CRON["⏰ Tâches Cron\n(BullMQ + @nestjs/schedule)\n• Libération escrow automatique\n• Marquage REALISE/ABSENT"]

        subgraph "Modules Métier"
            MOD_USR["👤 UtilisateursModule"]
            MOD_RES["📅 ReservationsModule"]
            MOD_CV["🎓 ClasseVirtuelleModule"]
            MOD_PAI["💰 PaiementModule"]
            MOD_AVI["⭐ AvisModule"]
            MOD_MSG["💬 MessagerieModule"]
            MOD_SUI["📊 SuiviPedagogiqueModule"]
            MOD_FF["🚩 FeatureFlagsModule"]
        end

        subgraph "Couche Transverse (PartagesModule)"
            PRISMA["🗄️ PrismaService\n(ORM PostgreSQL)"]
            JWT_GUARD["🔒 JwtAuthGarde\nRolesGarde"]
            HEALTH["💚 HealthController\n/health"]
        end
    end

    subgraph "Services Externes"
        DB[("🐘 PostgreSQL\n(Supabase / Neon)")]
        REDIS[("⚡ Redis\n(Upstash)\n• Cache\n• BullMQ\n• Socket.IO Pub/Sub")]
        DAILY["📹 Daily.co\n(SFU Vidéoconférence\nSimulcast + Bitrate adaptatif)"]
        QURAN["📖 QuranHub API\n(Hafs + Warsh)\nImport one-shot → Cache local"]
        R2["☁️ Cloudflare R2\n(Ijaza, Audio, Enregistrements)"]
        EMAIL["✉️ Resend / Brevo\n(E-mails transactionnels)"]
        STRIPE["💳 Stripe Connect\n(Désactivé par défaut)"]
        PAYDUNYA["💳 PayDunya / CinetPay\n(Afrique de l'Ouest)"]
    end

    FE <-->|HTTPS / REST| API
    WS_CLIENT <-->|WSS| WS_SERVER
    API --> MOD_USR
    API --> MOD_RES
    API --> MOD_CV
    API --> MOD_PAI
    API --> MOD_AVI
    API --> MOD_MSG
    API --> MOD_SUI
    API --> MOD_FF

    MOD_USR --> PRISMA
    MOD_RES --> PRISMA
    MOD_CV --> PRISMA
    MOD_PAI --> PRISMA
    MOD_AVI --> PRISMA
    MOD_MSG --> PRISMA
    MOD_SUI --> PRISMA
    MOD_FF --> PRISMA

    PRISMA --> DB
    WS_SERVER <-->|Pub/Sub Multi-instances| REDIS
    CRON --> REDIS
    MOD_CV <-->|Créer salle / Générer token| DAILY
    MOD_CV -->|Lire texte coranique| QURAN
    MOD_USR -->|Stocker Ijaza & Audio| R2
    MOD_USR -->|Envoyer lien de réinitialisation| EMAIL
    MOD_RES -->|Confirmation de cours| EMAIL
    MOD_PAI -->|Paiement réel si activé| STRIPE
    MOD_PAI -->|Paiement Afrique| PAYDUNYA
```

---

## 2. Diagramme Entité-Association (ERD)

```mermaid
erDiagram
    users {
        uuid id PK
        string reference UK
        string email UK
        string motDePasse
        string nomComplet
        enum role "ELEVE|PROFESSEUR|ADMIN"
        string genre
        string langue
        string fuseauHoraire
        int solde
        string tokenReinitialisation UK
        timestamp tokenReinitialisationExpireLe
        timestamp creeLe
        timestamp misAJourLe
    }

    teacher_profiles {
        uuid id PK
        uuid userId UK,FK
        text bio
        string photoUrl
        string ijazaUrl
        string audioUrl
        int tarifHoraire
        enum qiraatParDefaut "HAFS|WARSH"
        boolean reservationInstantanee
        boolean valide
        timestamp creeLe
        timestamp misAJourLe
    }

    disponibilites {
        uuid id PK
        uuid professeurId FK
        enum jour "LUNDI|MARDI|..."
        string heureDebut
        string heureFin
        enum recurrence "PONCTUELLE|HEBDOMADAIRE"
        timestamp creeLe
    }

    reservations {
        uuid id PK
        string reference UK
        uuid eleveId FK
        uuid professeurId FK
        timestamp creneauDebut
        timestamp creneauFin
        enum statut "EN_ATTENTE|CONFIRME|ANNULE|REALISE|ABSENT"
        text noteEleve
        boolean masquePourEleve
        boolean masquePourProfesseur
        timestamp creeLe
        timestamp misAJourLe
    }

    seances_cours {
        uuid id PK
        uuid reservationId UK,FK
        uuid eleveId FK
        uuid professeurId FK
        enum statut "PLANIFIEE|EN_COURS|TERMINEE"
        string lienVisio
        boolean enregistrementConsente
        boolean enregistrementActif
        string enregistrementUrl
        boolean modeRepliActif
        timestamp creeLe
        timestamp misAJourLe
    }

    etats_mushaf {
        uuid id PK
        uuid seanceId UK,FK
        int numeroSourate
        int numeroVerset
        string plageSurlignage
        timestamp misAJourLe
    }

    notes_session {
        uuid id PK
        uuid seanceId UK
        uuid eleveId
        uuid professeurId FK
        string sourateMemorisee
        string sourateRevisee
        string pointsTajwid
        text commentaire
        timestamp creeLe
    }

    avis {
        uuid id PK
        uuid professeurId FK
        uuid eleveId FK
        int note
        text commentaire
        timestamp creeLe
        timestamp misAJourLe
    }

    paiements {
        uuid id PK
        uuid eleveId FK
        uuid reservationId UK,FK
        int montant
        enum statutEscrow "BLOQUE|LIBERE|REMBOURSE"
        enum methode "STRIPE|PAYDUNYA|CINETPAY|MANUEL"
        timestamp creeLe
        timestamp misAJourLe
    }

    messages {
        uuid id PK
        uuid expediteurId FK
        uuid destinataireId FK
        text contenu
        boolean lu
        timestamp horodatage
    }

    feature_flags {
        uuid id PK
        string cle UK
        boolean actif
        string description
        timestamp misAJourLe
    }

    journal_audit {
        uuid id PK
        uuid acteurId
        uuid cibleId
        string evenement
        json details
        timestamp creeLe
    }

    quran_text_cache {
        uuid id PK
        enum qiraat "HAFS|WARSH"
        int sourate
        int verset
        text texte
        timestamp creeLe
    }

    users ||--o| teacher_profiles : "profilProfesseur"
    users ||--o{ disponibilites : "professeur"
    users ||--o{ reservations : "eleveId"
    users ||--o{ reservations : "professeurId"
    users ||--o{ seances_cours : "eleveId"
    users ||--o{ seances_cours : "professeurId"
    users ||--o{ avis : "eleveId"
    users ||--o{ avis : "professeurId"
    users ||--o{ paiements : "eleveId"
    users ||--o{ messages : "expediteurId"
    users ||--o{ messages : "destinataireId"
    users ||--o{ notes_session : "professeurId"

    reservations ||--o| paiements : "paiement"
    reservations ||--|| seances_cours : "seance"
    seances_cours ||--o| etats_mushaf : "etatMushaf"
```

---

## 3. Diagramme de Séquence — Flux de Réservation Complet

Ce diagramme illustre l'ensemble des interactions entre composants lors d'une réservation standard (flux classique, sans réservation instantanée).

```mermaid
sequenceDiagram
    actor Élève
    participant Frontend as Frontend Next.js
    participant API as API NestJS
    participant DB as PostgreSQL (Prisma)
    participant PaiementSvc as PaiementService
    participant DailyAPI as Daily.co API
    participant Email as Service E-mail

    Élève->>Frontend: Sélectionne un créneau
    Frontend->>API: POST /reservations\n{ professeurId, creneauDebut, creneauFin, noteEleve }
    API->>API: ✅ Vérification JWT (JwtAuthGarde)\n✅ Vérification Rôle ELEVE (RolesGarde)
    API->>DB: Vérifier disponibilité créneau\n(pas de conflit horaire)
    DB-->>API: ✅ Créneau disponible
    API->>PaiementSvc: isPaiementActif()
    PaiementSvc->>DB: SELECT feature_flags WHERE cle='paiement.actif'
    DB-->>PaiementSvc: false (désactivé MVP)
    PaiementSvc-->>API: PAYMENTS_ENABLED = false

    API->>DB: INSERT reservations\n{ statut: EN_ATTENTE }
    DB-->>API: Reservation { id, reference: "RES-9A4F", ... }
    API-->>Frontend: 201 { reservation }
    Frontend-->>Élève: ✅ Demande envoyée

    Note over API,Email: (Notification asynchrone via BullMQ)
    API--)Email: sendEmail(professeur, "Nouvelle demande de réservation")

    Note over Élève,DB: ── Professeur confirme (tableau de bord) ──

    actor Professeur
    Professeur->>Frontend: Clique "Confirmer" sur la demande
    Frontend->>API: PATCH /reservations/{id}/statut\n{ nouveauStatut: "CONFIRME" }
    API->>DB: UPDATE reservations SET statut=CONFIRME WHERE id=...
    DB-->>API: ✅ Mis à jour

    API->>DB: INSERT seances_cours\n{ reservationId, eleveId, professeurId,\nstatut: PLANIFIEE }
    DB-->>API: SeanceCours { id }

    API->>DailyAPI: POST /v1/rooms\n{ privacy: "private", exp: timestamp }
    DailyAPI-->>API: { url: "https://equran.daily.co/abc123" }

    API->>DB: UPDATE seances_cours SET lienVisio='...'
    DB-->>API: ✅

    API-->>Frontend: 200 { reservation: { statut: "CONFIRME" } }
    Frontend-->>Professeur: ✅ Réservation confirmée

    API--)Email: sendEmail(élève, "Votre cours est confirmé",\n{ lienVisio, dateHeure })
```

---

## 4. Diagramme de Séquence — Synchronisation WebSocket Mushaf en Temps Réel

```mermaid
sequenceDiagram
    actor Professeur
    actor Élève
    participant GW as MushafGateway\n(WebSocket /classe-virtuelle)
    participant SVC as ClasseVirtuelleService
    participant DB as PostgreSQL
    participant Redis as Upstash Redis\n(Pub/Sub Adapter)

    Note over Professeur,Redis: ── Phase 1 : Connexion et authentification ──

    Professeur->>GW: connect({ auth: { token: "JWT..." } })
    GW->>GW: verifierJeton(client)\n→ PayloadJwt { sub, email, role: PROFESSEUR }
    GW->>GW: client.data.payload = { sub, email, role }
    GW-->>Professeur: ✅ Connecté

    Élève->>GW: connect({ auth: { token: "JWT..." } })
    GW->>GW: verifierJeton(client)\n→ PayloadJwt { sub, email, role: ELEVE }
    GW-->>Élève: ✅ Connecté

    Note over Professeur,Redis: ── Phase 2 : Rejoindre la séance ──

    Professeur->>GW: emit("rejoindreSeance", { seanceId: "..." })
    GW->>SVC: trouverSeance(seanceId, professeurId)
    SVC->>DB: SELECT seances_cours WHERE id=...
    DB-->>SVC: SeanceCours { id, professeurId, eleveId, ... }
    SVC-->>GW: ✅ SeanceCours
    GW->>GW: client.join("seance:<id>")
    GW->>SVC: marquerEnCours(seanceId)
    SVC->>DB: UPDATE seances_cours SET statut=EN_COURS
    GW->>SVC: obtenirEtatMushaf(seanceId, professeurId)
    SVC->>DB: SELECT etats_mushaf WHERE seanceId=...
    DB-->>SVC: EtatMushaf { numeroSourate: 1, numeroVerset: 1, ... }
    GW-->>Professeur: emit("roleConfirme", { estProfesseur: true })\n+ return { etatMushaf: { ... } }

    Élève->>GW: emit("rejoindreSeance", { seanceId: "..." })
    GW->>GW: client.join("seance:<id>")
    GW-->>Élève: emit("roleConfirme", { estProfesseur: false })\n+ return { etatMushaf: { ... } }

    Note over Professeur,Redis: ── Phase 3 : Surlignage du Mushaf ──

    Professeur->>GW: emit("surlignerMushaf",\n{ seanceId, numeroSourate: 2,\nnumeroVerset: 255, plageSurlignage: "1-5" })
    GW->>GW: Vérification : estProfesseur === true\n(en production, rejet si ELEVE)
    GW->>SVC: appliquerSurlignage(seanceId, professeurId,\n{ numeroSourate: 2, numeroVerset: 255,\nplageSurlignage: "1-5" })
    SVC->>DB: UPSERT etats_mushaf\n(UPDATE ou CREATE)
    DB-->>SVC: EtatMushaf mis à jour
    SVC-->>GW: EtatMushaf { numeroSourate: 2, ... }

    GW->>Redis: broadcast("seance:<id>", "mushafMisAJour", etat)
    Redis-->>GW: Propagation Pub/Sub (multi-instances)
    GW-->>Élève: emit("mushafMisAJour",\n{ numeroSourate: 2, numeroVerset: 255,\nplageSurlignage: "1-5" })

    Élève-->>Élève: 🟡 Afficher Sourate 2\nVerset 255 surligné (lecture seule)
    GW-->>Professeur: return { ok: true }

    Note over Professeur,Redis: ── Phase 4 : Reconnexion automatique ──

    Élève--xGW: ❌ Perte de connexion réseau

    Élève->>GW: Reconnexion automatique Socket.IO
    GW->>GW: verifierJeton(client) → OK
    Élève->>GW: emit("rejoindreSeance", { seanceId: "..." })
    GW->>SVC: obtenirEtatMushaf(seanceId, eleveId)
    SVC->>DB: SELECT etats_mushaf WHERE seanceId=...
    DB-->>SVC: EtatMushaf { numeroSourate: 2, numeroVerset: 255, ... }
    GW-->>Élève: return { etatMushaf: { ... } }
    Élève-->>Élève: ✅ État Mushaf restauré sans perte
```

---

## 5. Diagramme d'États — Cycle de Vie d'une Réservation

```mermaid
stateDiagram-v2
    [*] --> EN_ATTENTE : Élève crée la réservation\n(POST /reservations)

    EN_ATTENTE --> CONFIRME : Professeur confirme\n(PATCH /reservations/{id}/statut)\nOU Réservation instantanée activée

    EN_ATTENTE --> ANNULE : Élève ou Professeur annule\n→ Remboursement automatique si escrow BLOQUE

    CONFIRME --> REALISE : Tâche Cron détecte\nque l'heure de fin est passée\nET les deux participants ont rejoint

    CONFIRME --> ABSENT : Tâche Cron détecte\nque l'élève ne s'est pas présenté

    CONFIRME --> ANNULE : Annulation avant le début du cours\n→ Remboursement si escrow actif

    REALISE --> [*] : Tâche Cron libère l'escrow\n24h après REALISE\n(PaiementService.libererEscrowsAutomatique)

    ABSENT --> [*] : L'escrow est libéré\nvers le Professeur (présent)

    ANNULE --> [*] : Escrow remboursé à l'Élève\nou aucun mouvement si non activé

    note right of EN_ATTENTE
        Durée max configurable
        avant annulation auto
        (feature flag futur)
    end note

    note right of CONFIRME
        SeanceCours créée
        Lien Daily.co généré
        E-mail de confirmation envoyé
    end note

    note right of REALISE
        NoteSession remplie
        par le professeur
        Avis possible pour l'élève
    end note
```

---

## 6. Diagramme d'États — Cycle de Vie du Séquestre (Escrow Paiement)

```mermaid
stateDiagram-v2
    [*] --> BLOQUE : Réservation confirmée\n+ Solde élève suffisant\n(Paiement.bloquerFonds)

    BLOQUE --> LIBERE : 24h après Reservation.statut = REALISE\n(Cron horaire)\nOU Confirmation manuelle de l'élève\n→ Solde professeur crédité

    BLOQUE --> REMBOURSE : Reservation.statut = ANNULE\n(PaiementService.restituerFonds)\n→ Solde élève restitué

    LIBERE --> [*] : Fonds définitivement versés\nau professeur

    REMBOURSE --> [*] : Fonds définitivement\nremboursés à l'élève

    note right of BLOQUE
        PAYMENTS_ENABLED=false :
        Simulation (log uniquement)
        Sans mouvement réel de fonds
    end note

    note right of LIBERE
        Future intégration :
        Virement Stripe Connect
        ou PayDunya vers compte bancaire
    end note
```

---

## 7. Synchronisation Multi-Instances (Redis Pub/Sub)

Le diagramme ci-dessous illustre comment la synchronisation WebSocket est assurée lorsque plusieurs instances du backend sont actives (Phase 4+). Le `@socket.io/redis-adapter` est déjà intégré dans le code MVP.

```mermaid
graph LR
    subgraph "Instance Backend A\n(exemple: Region Europe)"
        GWA["MushafGateway A"]
        ProfA(["👨‍🏫 Professeur\n(connecté ici)"])
    end

    subgraph "Instance Backend B\n(exemple: Region Afrique)"
        GWB["MushafGateway B"]
        EleveB(["👤 Élève\n(connecté ici)"])
    end

    subgraph "Upstash Redis"
        PUB["📢 Canal Pub\n(publier)"]
        SUB["📻 Canal Sub\n(écouter)"]
    end

    ProfA -->|emit surlignerMushaf| GWA
    GWA -->|broadcast mushafMisAJour| PUB
    PUB <-->|Propagation Pub/Sub| SUB
    SUB -->|relay mushafMisAJour| GWB
    GWB -->|emit mushafMisAJour| EleveB
```

> **Note** : En développement mono-instance, l'adaptateur Redis est bypassé automatiquement si `REDIS_URL` est absente (`WARN: gateway mono-instance`). La plateforme reste entièrement fonctionnelle.
