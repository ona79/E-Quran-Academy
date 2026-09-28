# Cahier des Charges & Spécification des Besoins — E-Quran Academy

> **Version** : 1.0 · **Date** : 2026-09-28 · **Statut** : En cours de développement (MVP Phase 1-3)

---

## 1. Contexte et Vision du Projet

### 1.1 Présentation

**E-Quran Academy** est une plateforme SaaS (Software as a Service) qui met en relation des **professeurs de Coran certifiés** (détenteurs d'une Ijaza) avec des **élèves ou parents**, pour des cours individuels en ligne via une salle de classe virtuelle intégrée.

La plateforme se positionne comme l'équivalent islamique d'**iTalki** pour l'enseignement coranique, avec une dimension technologique forte : salle de classe virtuelle, synchronisation du Mushaf en temps réel, suivi pédagogique structuré.

### 1.2 Marché Cible

| Segment | Détail |
|---|---|
| **Géographies prioritaires** | Sénégal, Guinée, et diaspora francophone (Europe, Amérique du Nord) |
| **Lectures coraniques** | Hafs **et** Warsh (Maghreb & Afrique de l'Ouest) |
| **Connexion réseau** | Doit fonctionner sur des connexions faibles ou instables (3G/4G limitée) |
| **Budget** | Solutions low-cost privilégiées (Vercel, Supabase/Neon, Upstash, Daily.co, Resend, Cloudflare R2) |

### 1.3 Modèle de Référence

Le modèle produit de référence est **iTalki** avec les mécaniques suivantes reprises et adaptées :
- Packs de cours à tarif réduit
- Réservation instantanée optionnelle (configurée par le professeur)
- Confirmation post-cours (passage au statut `REALISE`)
- Système d'avis et de notation (1 à 5 étoiles)

---

## 2. Acteurs (Personas Utilisateurs)

### 2.1 Élève / Parent (Rôle `ELEVE`)

> *Note : Les parents utilisent le même type de compte que les élèves. Un parent peut créer un compte pour son enfant.*

**Besoins principaux :**
- Trouver et filtrer des professeurs certifiés (langue, tarif, genre, qiraat)
- Réserver des créneaux de cours avec conversion automatique de fuseau horaire
- Accéder à la salle de classe virtuelle au moment du cours
- Suivre la progression pédagogique (sourates mémorisées/révisées, points de tajwid)
- Laisser des avis après les cours
- Communiquer avec le professeur via messagerie asynchrone
- Gérer son portefeuille virtuel (solde, historique de transactions)

**Profil type :** Parent sénégalais ou français souhaitant que son enfant apprenne le Coran avec un professeur certifié Ijaza à distance.

### 2.2 Professeur Certifié (Rôle `PROFESSEUR`)

**Besoins principaux :**
- Créer et gérer un profil public (bio, Ijaza, audio de démonstration, tarif, qiraat par défaut)
- Définir ses créneaux de disponibilité récurrents (hebdomadaires) ou ponctuels
- Accepter ou refuser des demandes de réservation
- Animer la salle de classe virtuelle (surlignage du Mushaf, visioconférence)
- Remplir un formulaire pédagogique de fin de cours (notes de session)
- Consulter ses revenus et l'historique des versements
- Activer la réservation instantanée (sans attente de confirmation)

**Profil type :** Professeur mauritanien ou sénégalais, détenteur d'une Ijaza pour Hafs et Warsh, souhaitant enseigner à distance à des élèves de la diaspora.

### 2.3 Administrateur (Rôle `ADMIN`)

**Besoins principaux :**
- Valider ou rejeter les comptes professeurs (vérification de l'Ijaza)
- Gérer les feature flags (activer/désactiver des fonctionnalités sans redéploiement)
- Créditer manuellement les comptes élèves (paiements hors-plateforme, mode désactivé)
- Modérer les contenus (avis, messages)
- Accéder aux statistiques et au journal d'audit des actions sensibles
- Basculer `PAYMENTS_ENABLED` quand la plateforme est prête pour les vrais paiements

---

## 3. Exigences Fonctionnelles (EF)

### EF-01 — Gestion des Comptes Utilisateurs

| ID | Exigence |
|---|---|
| EF-01.1 | Un visiteur peut créer un compte avec un rôle `ELEVE` uniquement (le rôle `PROFESSEUR` est attribué par l'admin après vérification de l'Ijaza). |
| EF-01.2 | L'authentification utilise un jeton JWT stocké dans un cookie `httpOnly` (sécurisé contre le vol XSS). |
| EF-01.3 | Un mécanisme de réinitialisation de mot de passe par lien éphémère (e-mail) est disponible. |
| EF-01.4 | L'utilisateur peut mettre à jour son profil (nom, langue, fuseau horaire, genre). |
| EF-01.5 | L'administrateur peut valider ou rejeter un compte professeur. Le rejet repasse l'utilisateur au rôle `ELEVE`. |

### EF-02 — Profil Public du Professeur

| ID | Exigence |
|---|---|
| EF-02.1 | Le profil public du professeur affiche : bio, photo, URL Ijaza, audio de démonstration, tarif horaire en FCFA, qiraat par défaut (Hafs ou Warsh). |
| EF-02.2 | Le profil n'est visible que si le professeur a été validé par l'administrateur. |
| EF-02.3 | Le professeur peut activer la réservation instantanée (bypass de la validation manuelle). |

### EF-03 — Disponibilités et Réservations

| ID | Exigence |
|---|---|
| EF-03.1 | Un professeur définit ses créneaux de disponibilité (récurrents ou ponctuels) avec des heures en fuseau local. |
| EF-03.2 | Un élève peut réserver un créneau disponible. Les heures sont stockées en UTC ; la conversion pour l'affichage utilise le fuseau horaire de l'utilisateur. |
| EF-03.3 | Cycle de vie d'une réservation : `EN_ATTENTE` → `CONFIRME` → `REALISE` (ou `ABSENT` ou `ANNULE`). |
| EF-03.4 | La réservation instantanée (si activée par le professeur) passe directement à `CONFIRME`. |
| EF-03.5 | 24h après le passage à `REALISE`, les fonds séquestrés sont automatiquement libérés vers le compte du professeur. |
| EF-03.6 | Un utilisateur peut masquer un cours passé de son affichage (la donnée reste en base pour les logs). |

### EF-04 — Salle de Classe Virtuelle

| ID | Exigence |
|---|---|
| EF-04.1 | Chaque séance de cours est liée à une salle Daily.co créée au moment de la confirmation. |
| EF-04.2 | Le professeur peut surligner en temps réel des versets du Mushaf (sourate, verset, plage). L'élève reçoit les mises à jour en lecture seule. |
| EF-04.3 | Les payloads WebSocket ne contiennent que des références texte (numéroSourate, numéroVerset) — jamais d'images. |
| EF-04.4 | En cas de faible bande passante signalée, le mode de repli « audio seul + Mushaf » est activé automatiquement. |
| EF-04.5 | La reconnexion automatique restaure le dernier état du Mushaf sans perte. |
| EF-04.6 | L'enregistrement de séance est optionnel, nécessite un consentement parental explicite et est conservé 30 jours maximum. |

### EF-05 — Suivi Pédagogique

| ID | Exigence |
|---|---|
| EF-05.1 | À la fin de chaque cours, le professeur remplit une note de session (sourate mémorisée, sourate révisée, points de tajwid, commentaire libre). |
| EF-05.2 | L'élève peut consulter l'historique de ses notes de session pour suivre sa progression. |

### EF-06 — Système de Paiement (Escrow)

| ID | Exigence |
|---|---|
| EF-06.1 | Le système de paiement est entièrement modélisé mais désactivé par défaut (`PAYMENTS_ENABLED=false`). |
| EF-06.2 | Quand activé, le montant est séquestré (`BLOQUE`) au moment de la réservation. |
| EF-06.3 | Le fond est libéré (`LIBERE`) vers le professeur 24h après la fin du cours, sauf signalement de l'élève. |
| EF-06.4 | En cas d'annulation, les fonds sont restitués (`REMBOURSE`) à l'élève. |
| EF-06.5 | En mode désactivé, l'admin peut créditer manuellement les comptes après paiement hors-plateforme. |

### EF-07 — Messagerie Asynchrone

| ID | Exigence |
|---|---|
| EF-07.1 | Un élève et un professeur peuvent échanger des messages texte asynchrones. |
| EF-07.2 | Les messages non lus sont marqués comme non lus jusqu'à consultation par le destinataire. |

### EF-08 — Avis et Notation

| ID | Exigence |
|---|---|
| EF-08.1 | Un élève peut laisser un avis (note 1-5 + commentaire optionnel) sur un professeur. |
| EF-08.2 | Un élève ne peut laisser qu'un seul avis par professeur (contrainte d'unicité). |

---

## 4. Exigences Non Fonctionnelles (ENF)

### ENF-01 — Performance et Scalabilité

| ID | Exigence |
|---|---|
| ENF-01.1 | MVP : une seule instance backend avec auto-scaling configuré mais non déclenché (réduction des coûts). |
| ENF-01.2 | Phase 4+ : passage à plusieurs instances derrière un load balancer. La synchronisation Redis Pub/Sub est déjà câblée dans le MVP. |
| ENF-01.3 | Le texte coranique (`QuranTextCache`) est mis en cache local lors de l'importation initiale. Aucun appel API externe ne se produit pendant un cours. |

### ENF-02 — Sécurité

| ID | Exigence |
|---|---|
| ENF-02.1 | Toutes les routes sensibles sont protégées par des gardes JWT et Rôles (NestJS Guards). |
| ENF-02.2 | Rate-limiting global : 100 requêtes / minute par IP. Routes critiques (`/inscription`, `/connexion`) : 5 et 10 req/min respectivement. |
| ENF-02.3 | Toutes les actions sensibles (connexions, changements de rôle, validations) sont journalisées dans `JournalAudit`. |
| ENF-02.4 | Les mots de passe sont hachés (bcrypt). Les tokens JWT ne contiennent jamais de données sensibles. |

### ENF-03 — Conventions de Développement

| ID | Exigence |
|---|---|
| ENF-03.1 | Tout le vocabulaire métier est en **français** : variables, fonctions, colonnes de BDD, endpoints, messages d'erreur. |
| ENF-03.2 | Seuls les mots-clés de langages/frameworks restent en anglais (`class`, `async`, `interface`). |
| ENF-03.3 | L'organisation du code est par fonctionnalité métier (module NestJS par domaine), jamais par type technique. |

### ENF-04 — Disponibilité et Dégradation Gracieuse

| ID | Exigence |
|---|---|
| ENF-04.1 | La plateforme doit rester fonctionnelle sur des connexions 3G/4G instables. |
| ENF-04.2 | En cas de coupure WebSocket, la reconnexion automatique restaure l'état sans intervention manuelle. |
| ENF-04.3 | En cas de bande passante insuffisante, le mode « audio seul + Mushaf » s'active sans interrompre la séance. |

---

## 5. Phases de Déploiement (Roadmap)

```
Phase 1 — MVP Core
├── Inscription / Connexion / Profils
├── Disponibilités & Réservations
└── Salle de classe virtuelle (visio + Mushaf WS)

Phase 2 — Engagement
├── Suivi pédagogique (notes de session)
├── Messagerie asynchrone
└── Avis & notation

Phase 3 — Pédagogie avancée
├── Enregistrement optionnel des séances
├── Tableau de bord analytique élève
└── Qiraat Warsh complet (cache QuranHub)

Phase 4 — Monétisation réelle
├── Activation paiement réel (Stripe + PayDunya/CinetPay)
├── KYC professeurs
├── Multi-instances backend (load balancer)
└── Facturation et fiscalité
```
