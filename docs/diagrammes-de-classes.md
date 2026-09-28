# Diagrammes de Classes UML — E-Quran Academy

> **Version** : 1.0 · **Date** : 2026-09-28 · **Convention** : UML 2.5 — Notation Mermaid

---

## 1. Diagramme de Classes du Domaine (Modèle de Données)

Ce diagramme représente le modèle de données complet tel que défini dans le schéma Prisma (`backend/prisma/schema.prisma`). Il couvre les entités, leurs attributs, les relations entre elles et les énumérations métier.

```mermaid
classDiagram
    class User {
        +String id
        +String? reference
        +String email
        +String motDePasse
        +String nomComplet
        +Role role
        +String? genre
        +String langue
        +String fuseauHoraire
        +Int solde
        +String? tokenReinitialisation
        +DateTime? tokenReinitialisationExpireLe
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class TeacherProfile {
        +String id
        +String userId
        +String? bio
        +String? photoUrl
        +String? ijazaUrl
        +String? audioUrl
        +Int tarifHoraire
        +Qiraat qiraatParDefaut
        +Boolean reservationInstantanee
        +Boolean valide
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class Disponibilite {
        +String id
        +String professeurId
        +JourSemaine jour
        +String heureDebut
        +String heureFin
        +Recurrence recurrence
        +DateTime creeLe
    }

    class Reservation {
        +String id
        +String? reference
        +String eleveId
        +String professeurId
        +DateTime creneauDebut
        +DateTime creneauFin
        +StatutReservation statut
        +String? noteEleve
        +Boolean masquePourEleve
        +Boolean masquePourProfesseur
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class SeanceCours {
        +String id
        +String reservationId
        +String eleveId
        +String professeurId
        +StatutSession statut
        +String? lienVisio
        +Boolean enregistrementConsente
        +Boolean enregistrementActif
        +String? enregistrementUrl
        +Boolean modeRepliActif
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class EtatMushaf {
        +String id
        +String seanceId
        +Int numeroSourate
        +Int numeroVerset
        +String? plageSurlignage
        +DateTime misAJourLe
    }

    class NoteSession {
        +String id
        +String seanceId
        +String eleveId
        +String professeurId
        +String? sourateMemorisee
        +String? sourateRevisee
        +String? pointsTajwid
        +String? commentaire
        +DateTime creeLe
    }

    class Avis {
        +String id
        +String professeurId
        +String eleveId
        +Int note
        +String? commentaire
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class Paiement {
        +String id
        +String eleveId
        +String reservationId
        +Int montant
        +StatutEscrow statutEscrow
        +MethodePaiement methode
        +DateTime creeLe
        +DateTime misAJourLe
    }

    class Message {
        +String id
        +String expediteurId
        +String destinataireId
        +String contenu
        +Boolean lu
        +DateTime horodatage
    }

    class FeatureFlag {
        +String id
        +String cle
        +Boolean actif
        +String? description
        +DateTime misAJourLe
    }

    class JournalAudit {
        +String id
        +String? acteurId
        +String? cibleId
        +String evenement
        +Json? details
        +DateTime creeLe
    }

    class QuranTextCache {
        +String id
        +Qiraat qiraat
        +Int sourate
        +Int verset
        +String texte
        +DateTime creeLe
    }

    %% Relations
    User "1" --> "0..1" TeacherProfile : profilProfesseur
    User "1" --> "0..*" Disponibilite : disponibilites
    User "1" --> "0..*" Reservation : reservationsEnTantQueEleve
    User "1" --> "0..*" Reservation : reservationsEnTantQueProfesseur
    User "1" --> "0..*" SeanceCours : seancesEnTantQueEleve
    User "1" --> "0..*" SeanceCours : seancesEnTantQueProfesseur
    User "1" --> "0..*" Avis : avisLaisses
    User "1" --> "0..*" Avis : avisRecus
    User "1" --> "0..*" Paiement : paiements
    User "1" --> "0..*" Message : messagesEnvoyes
    User "1" --> "0..*" Message : messagesRecus
    User "1" --> "0..*" NoteSession : notesDeSession

    Reservation "1" --> "0..1" Paiement : paiement
    Reservation "1" --> "1" SeanceCours : seance
    SeanceCours "1" --> "0..1" EtatMushaf : etatMushaf
```

---

## 2. Énumérations Métier (Enums)

```mermaid
classDiagram
    class Role {
        <<enumeration>>
        ELEVE
        PROFESSEUR
        ADMIN
    }

    class StatutReservation {
        <<enumeration>>
        EN_ATTENTE
        CONFIRME
        ANNULE
        REALISE
        ABSENT
    }

    class StatutSession {
        <<enumeration>>
        PLANIFIEE
        EN_COURS
        TERMINEE
    }

    class StatutEscrow {
        <<enumeration>>
        BLOQUE
        LIBERE
        REMBOURSE
    }

    class MethodePaiement {
        <<enumeration>>
        STRIPE
        PAYDUNYA
        CINETPAY
        MANUEL
    }

    class Qiraat {
        <<enumeration>>
        HAFS
        WARSH
    }

    class JourSemaine {
        <<enumeration>>
        LUNDI
        MARDI
        MERCREDI
        JEUDI
        VENDREDI
        SAMEDI
        DIMANCHE
    }

    class Recurrence {
        <<enumeration>>
        PONCTUELLE
        HEBDOMADAIRE
    }
```

---

## 3. Diagramme de Classes — Architecture Applicative Backend (NestJS)

Ce diagramme représente la structure des modules, contrôleurs, services et gateways NestJS, avec les dépendances entre composants applicatifs.

```mermaid
classDiagram
    direction TB

    %% ═══════════════════════════════════════════════
    %% MODULE PARTAGÉ (Couche transverse)
    %% ═══════════════════════════════════════════════
    class PartagesModule {
        <<Module NestJS>>
        Exporte : PrismaService
        Exporte : JwtModule
        Exporte : BullModule
    }

    class PrismaService {
        <<Service Injectable>>
        +$connect() Promise~void~
        +$disconnect() Promise~void~
        +$transaction(fn) Promise~T~
        +user PrismaUser
        +reservation PrismaReservation
        +seanceCours PrismaSeanceCours
        +paiement PrisamPaiement
        +...
    }

    class JwtAuthGarde {
        <<Guard NestJS>>
        +canActivate(ctx) boolean
        -extraireJetonDuCookie(req) string
        -extraireJetonDuHeader(req) string
    }

    class RolesGarde {
        <<Guard NestJS>>
        +canActivate(ctx) boolean
    }

    %% ═══════════════════════════════════════════════
    %% MODULE UTILISATEURS
    %% ═══════════════════════════════════════════════
    class UtilisateursModule {
        <<Module NestJS>>
    }

    class UtilisateursControleur {
        <<Controller REST /utilisateurs>>
        +inscrire(dto) Promise~UtilisateurReponseDto~
        +connecter(dto, res) Promise~ConnexionReponse~
        +demanderReinitialisation(dto) Promise~MessageReponse~
        +reinitialiserMotDePasse(dto) Promise~MessageReponse~
        +deconnecter(res) Object
        +moi(utilisateur, res, req) Promise~UtilisateurReponseDto~
        +mettreAJour(utilisateur, dto) Promise~UtilisateurReponseDto~
        +changerRole(id, dto, admin) Promise~UtilisateurReponseDto~
        +listerTous(role) Promise~UtilisateurReponseDto[]~
        +validerProfesseur(id, admin) Promise~UtilisateurReponseDto~
        +rejeterProfesseur(id, admin) Promise~UtilisateurReponseDto~
    }

    class UtilisateursService {
        <<Service Injectable>>
        +inscrire(dto) Promise~UtilisateurReponseDto~
        +connecter(dto) Promise~ConnexionResultat~
        +trouverParId(id) Promise~UtilisateurReponseDto~
        +mettreAJour(id, dto) Promise~UtilisateurReponseDto~
        +changerRole(id, role, adminId) Promise~UtilisateurReponseDto~
        +listerTous(role) Promise~UtilisateurReponseDto[]~
        +validerProfesseur(id, adminId) Promise~UtilisateurReponseDto~
        +rejeterProfesseur(id, adminId) Promise~UtilisateurReponseDto~
        +demanderReinitialisation(email) Promise~Resultat~
        +reinitialiserMotDePasse(token, mdp) Promise~Resultat~
        -hacher(mdp) Promise~string~
        -verifier(mdp, hash) Promise~boolean~
    }

    class ProfesseursControleur {
        <<Controller REST /professeurs>>
        +listerProfesseurs(filtres) Promise~PageReponse~
        +trouverProfesseur(id) Promise~ProfilProfesseurDto~
        +mettreAJourMonProfil(utilisateur, dto) Promise~ProfilDto~
    }

    class ProfesseursService {
        <<Service Injectable>>
        +listerProfesseurs(filtres) Promise~PageReponse~
        +trouverProfesseur(id) Promise~ProfilProfesseurDto~
        +mettreAJourProfil(userId, dto) Promise~ProfilDto~
    }

    %% ═══════════════════════════════════════════════
    %% MODULE RÉSERVATIONS
    %% ═══════════════════════════════════════════════
    class ReservationsModule {
        <<Module NestJS>>
    }

    class ReservationsControleur {
        <<Controller REST /reservations>>
        +listerDisponibilites(id, pagination) Promise~PageReponse~
        +creerDisponibilite(utilisateur, dto) Promise~DisponibiliteDto~
        +supprimerDisponibilite(utilisateur, id) Promise~void~
        +creerReservation(utilisateur, dto) Promise~ReservationDto~
        +listerMesReservations(utilisateur, pagination) Promise~PageReponse~
        +listerReservationsProfesseur(utilisateur, pagination) Promise~PageReponse~
        +trouverReservation(utilisateur, id) Promise~ReservationDto~
        +changerStatut(utilisateur, id, dto) Promise~ReservationDto~
        +supprimerReservation(utilisateur, id) Promise~MessageReponse~
    }

    class ReservationsService {
        <<Service Injectable>>
        +creerDisponibilite(userId, dto) Promise~DisponibiliteDto~
        +supprimerDisponibilite(userId, id) Promise~void~
        +listerDisponibilites(userId, pagination) Promise~PageReponse~
        +creerReservation(eleveId, dto) Promise~ReservationDto~
        +listerReservations(userId, pagination, estProf) Promise~PageReponse~
        +trouverReservation(id, userId) Promise~ReservationDto~
        +changerStatut(id, statut, userId) Promise~ReservationDto~
        +supprimerReservationDefinitivement(id, userId) Promise~Resultat~
        -creerSeanceApresConfirmation(reservation) Promise~void~
        -verifierConflitHoraire(professeurId, debut, fin) Promise~void~
    }

    class ReservationsCron {
        <<Cron NestJS>>
        +marquerCoursRealises() Promise~void~
        +marquerCoursAbsents() Promise~void~
    }

    %% ═══════════════════════════════════════════════
    %% MODULE CLASSE VIRTUELLE
    %% ═══════════════════════════════════════════════
    class ClasseVirtuelleModule {
        <<Module NestJS>>
    }

    class ClasseVirtuelleControleur {
        <<Controller REST /classe-virtuelle>>
        +obtenirSeance(utilisateur, id) Promise~SeanceDto~
        +obtenirTokenVisio(utilisateur, id) Promise~TokenDto~
        +terminerSeance(utilisateur, id) Promise~SeanceDto~
        +obtenirVerset(utilisateur, sourate, verset, qiraat) Promise~VersetDto~
        +obtenirSourate(utilisateur, sourate, qiraat) Promise~VersetDto[]~
    }

    class ClasseVirtuelleService {
        <<Service Injectable>>
        +trouverSeance(seanceId, userId) Promise~SeanceCours~
        +obtenirTokenVisio(seanceId, userId) Promise~TokenVisio~
        +marquerEnCours(seanceId) Promise~SeanceCours~
        +terminerSeance(seanceId, userId) Promise~SeanceCours~
        +obtenirEtatMushaf(seanceId, userId) Promise~EtatMushaf~
        +appliquerSurlignage(seanceId, userId, dto) Promise~EtatMushaf~
        +basculerModeRepli(seanceId, activer, userId) Promise~SeanceCours~
        +obtenirVerset(sourate, verset, qiraat) Promise~VersetDto~
        +obtenirSourate(sourate, qiraat) Promise~VersetDto[]~
    }

    class MushafGateway {
        <<WebSocket Gateway /classe-virtuelle>>
        -server Server
        +afterInit(server) Promise~void~
        +handleConnection(client) Promise~void~
        +handleDisconnect(client) Promise~void~
        +rejoindreSeance(client, corps) Promise~EtatMushaf~
        +surlignerMushaf(client, dto) Promise~Ok~
        +signalerBandePassante(client, dto) Promise~ModeRepli~
        -verifierJeton(client) PayloadJwt|null
        -nomRoom(seanceId) string
        -seanceDeLaRoom(client) string|null
    }

    %% ═══════════════════════════════════════════════
    %% MODULE PAIEMENT
    %% ═══════════════════════════════════════════════
    class PaiementModule {
        <<Module NestJS>>
    }

    class PaiementControleur {
        <<Controller REST /paiement>>
        +obtenirSolde(utilisateur) Promise~SoldeDto~
        +simulerRecharge(utilisateur, dto) Promise~SoldeDto~
        +crediterManuellement(admin, dto) Promise~SoldeDto~
        +listerTransactions(utilisateur) Promise~Paiement[]~
    }

    class PaiementService {
        <<Service Injectable>>
        +chargerSolde(userId) Promise~number~
        +simulerRecharge(userId, montant) Promise~SoldeDto~
        +crediterManuellement(email, montant) Promise~SoldeDto~
        +isPaiementActif() Promise~boolean~
        +bloquerFonds(eleveId, reservationId, montant) Promise~void~
        +restituerFonds(reservationId) Promise~void~
        +libererFonds(reservationId) Promise~void~
        +libererEscrowsAutomatique() Promise~void~
        +listerTransactions(userId) Promise~Paiement[]~
    }

    %% ═══════════════════════════════════════════════
    %% Relations entre modules
    %% ═══════════════════════════════════════════════
    UtilisateursModule --> PartagesModule : importe
    ReservationsModule --> PartagesModule : importe
    ClasseVirtuelleModule --> PartagesModule : importe
    PaiementModule --> PartagesModule : importe

    UtilisateursControleur --> UtilisateursService : injecte
    UtilisateursModule --> ProfesseursControleur : contient
    ProfesseursControleur --> ProfesseursService : injecte

    ReservationsControleur --> ReservationsService : injecte
    ReservationsService --> PaiementService : injecte (séquestre)
    ReservationsCron --> ReservationsService : utilise

    ClasseVirtuelleControleur --> ClasseVirtuelleService : injecte
    MushafGateway --> ClasseVirtuelleService : injecte
    MushafGateway --> JwtAuthGarde : utilise (handshake)

    PaiementControleur --> PaiementService : injecte

    UtilisateursService --> PrismaService : injecte
    ReservationsService --> PrismaService : injecte
    ClasseVirtuelleService --> PrismaService : injecte
    PaiementService --> PrismaService : injecte
```

---

## 4. Diagramme de Classes — Composants Frontend (Next.js)

Ce diagramme représente les principaux composants React et hooks personnalisés du frontend, organisés par espace utilisateur.

```mermaid
classDiagram
    direction TB

    class PagePrincipale {
        <<Page Next.js />>
        -HeaderLanding
        -HeroSection
        -FonctionnalitesSection
        -ListeProfesseursPublique
        -FooterSection
    }

    class PageSalleClasse {
        <<Page Next.js /eleve/salle-classe>>
        -useSalleClasse()
        -WidgetDaily
        -AfficheurMushaf
        -PanneauControle
    }

    class UseSalleClasse {
        <<Custom Hook>>
        +seance SeanceCours|null
        +etatMushaf EtatMushaf|null
        +modeRepliActif boolean
        +estConnecte boolean
        +rejoindre(seanceId) void
        +surlignerVerset(dto) void
        +signalerBandePassante(niveau) void
        +quitter() void
        -socket Socket|null
        -initialiserSocket(jeton) void
        -gererReconnexion() void
    }

    class TableauDeBordProfesseur {
        <<Composant /professeur/tableau-de-bord>>
        -ProchainsCours ReservationDto[]
        -StatistiquesRapides StatsDto
        -DemandesEnAttente ReservationDto[]
    }

    class GestionRevenus {
        <<Composant /professeur/revenus>>
        -SoldeActuel number
        -HistoriqueTransactions Paiement[]
        -GraphiqueRevenus
    }

    class TableauDeBordAdmin {
        <<Composant /admin/dashboard>>
        -ListeProfesseursAValider User[]
        -GestionFeatureFlags FeatureFlag[]
        -JournalAuditRecent JournalAudit[]
    }

    PageSalleClasse --> UseSalleClasse : utilise
    TableauDeBordProfesseur --> GestionRevenus : navigue vers
```
