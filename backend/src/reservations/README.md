# Module : reservations

**Rôle :** calendrier de disponibilité, créneaux, réservation de cours

**Règle d'or :** ce module ne lit ni n'écrit jamais directement dans les
données d'un autre module. Toute communication avec un autre domaine passe
par une interface explicite (appel de service exposé, ou événement).

## Étendue

Deux sous-domaines :

1. **Disponibilités** d'un professeur : créneaux hebdomadaires récurrents
   (jour + heures locales au professeur + récurrence). CRUD réservé au
   professeur lui-même.
2. **Réservations** de cours : un élève demande un créneau ; le professeur
   confirme (ou réservation instantanée via feature flag). Détection des
   conflits et conversion de fuseau horaire à l'enregistrement.

## Conversion de fuseau horaire (point clé)

- L'élève saisit sa demande dans **son** fuseau (`fuseauHoraireEleve`).
- Le service convertit en **UTC** (`partages/fuseau-horaire`) avant stockage
  (`creneauDebut` / `creneauFin`).
- Pour valider qu'un créneau tombe dans une disponibilité du professeur, on
  re-projette le créneau UTC dans le **fuseau du professeur** afin de
  retrouver le jour de la semaine et l'heure locale à comparer.

## API

| Méthode | Route | Rôle | Description |
|---|---|---|---|
| GET | `/reservations/professeurs/:id/disponibilites` | auth. | Liste paginée des disponibilités |
| POST | `/reservations/disponibilites` | `PROFESSEUR` | Créer un créneau |
| DELETE | `/reservations/disponibilites/:id` | `PROFESSEUR` | Supprimer un créneau |
| POST | `/reservations` | `ELEVE` | Créer une demande de réservation |
| GET | `/reservations/moi` | auth. | Mes réservations (élève) |
| GET | `/reservations/moi-professeur` | `PROFESSEUR` | Réservations reçues |
| GET | `/reservations/:id` | auth. (participants) | Détail d'une réservation |
| PATCH | `/reservations/:id/statut` | auth. (participants) | Changer le statut |

## Cycle de vie d'une réservation

```
EN_ATTENTE ──confirme──▶ CONFIRME ──réalisé──▶ REALISE
     │                       │
     └──annule──▶ ANNULE ◀──annule──┘
                          │
                          └──absent──▶ ABSENT
```

Seules les transitions licites sont acceptées (voir `verifierTransition`).

## Modèle de données

Voir `prisma/schema.prisma` — modèles `Disponibilite`, `Reservation` et
énumérations `JourSemaine`, `Recurrence`, `StatutReservation`. Les index
couvrent `professeurId`, `eleveId` et les colonnes de date.

## À faire plus tard

- Réservation instantanée : `CONFIRME` d'emblée si feature flag actif sur le
  profil professeur (module feature-flags).
- Notifications (messagerie / e-mail) à chaque changement de statut.
- Annulation avec délai de prévenance et pénalités éventuelles (module paiement).
