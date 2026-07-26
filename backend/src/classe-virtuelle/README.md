# Module : classe-virtuelle

**Rôle :** salle de visioconférence, Mushaf interactif synchronisé, enregistrement

**Règle d'or :** ce module ne lit ni n'écrit jamais directement dans les
données d'un autre module. Toute communication avec un autre domaine passe
par une interface explicite (appel de service exposé, ou événement).

## Contraintes non négociables (respectées)

1. **Surlignage réservé au professeur** — l'élève est en lecture seule côté
   gateway. Tout événement `surlignerMushaf` est vérifié contre
   `seance.professeurId === sub` puis rejeté sinon.
2. **Payload minimal** — les messages de synchronisation ne contiennent que des
   références (`numeroSourate`, `numeroVerset`, `plageSurlignage`), jamais
   d'image → léger sur connexion faible.
3. **Mode de repli « audio seul »** — déclenché automatiquement quand un client
   signale une bande passante `FAIBLE` ; la séance continue sans interruption.
4. **Reconnexion sans perte** — l'état du Mushaf est persisté (`EtatMushaf`) et
   renvoyé au client dès qu'il rejoint la room (événement `rejoindreSeance`).
5. **Enregistrement = micro-service séparé, optionnel, consentement parental
   obligatoire** — l'enregistrement ne peut être activé qu'après consentement
   parental explicite ; le traitement vidéo (R2) sera un micro-service dédié.

## Architecture

```
classe-virtuelle/
├── daily-co/               # Intégration Daily.co (fetch, mode placeholder en dev)
├── dto/                    # Surlignage, bande passante, consentement, réponses
├── classe-virtuelle.service.ts     # Cycle de vie séance, état Mushaf, mode repli
├── classe-virtuelle.controleur.ts  # Endpoints REST
└── mushaf.gateway.ts              # Gateway WebSocket (temps réel)
```

- **REST** : cycle de vie de la séance (créer, voir, consentement, mode repli,
  terminer).
- **WebSocket** (`socket.io`, port `PORT_WS`, namespace `classe-virtuelle`) :
  synchronisation temps réel du Mushaf, une room par séance
  (`seance:<id>`).

## Flux WebSocket

| Événement (client → serveur) | Rôle | Effet |
|---|---|---|
| `rejoindreSeance` | élève/prof | Rejoint la room, reçoit l'état Mushaf courant |
| `surlignerMushaf` | **professeur seul** | Persiste l'état + broadcast `mushafMisAJour` |
| `signalerBandePassante` | élève/prof | Active/désactive le mode repli → broadcast `modeRepliMisAJour` |

| Événement (serveur → client) | Description |
|---|---|
| `roleConfirme` | Indique au client s'il peut surligner (`estProfesseur`) |
| `mushafMisAJour` | Nouvel état du Mushaf (broadcast) |
| `modeRepliMisAJour` | Bascule du mode audio seul (broadcast) |
| `erreur` | Message d'erreur (ex : tentative de surlignage par un élève) |

Authentification : jeton JWT fourni en query au handshake (`?jeton=...`).

## API REST

| Méthode | Route | Rôle | Description |
|---|---|---|---|
| POST | `/classe-virtuelle/seances` | `PROFESSEUR` | Créer une séance |
| GET | `/classe-virtuelle/seances/:id` | participant | Voir une séance |
| POST | `/classe-virtuelle/seances/:id/consentement-enregistrement` | — | Recueillir le consentement parental |
| PATCH | `/classe-virtuelle/seances/:id/enregistrement` | `PROFESSEUR` | Activer/désactiver l'enregistrement |
| PATCH | `/classe-virtuelle/seances/:id/mode-repli` | participant | Basculer le mode audio seul |
| POST | `/classe-virtuelle/seances/:id/terminer` | `PROFESSEUR` | Terminer la séance |

## Modèle de données

Voir `prisma/schema.prisma` — modèles `SeanceCours`, `EtatMushaf` et
énumération `StatutSession`. Les identifiants `eleveId`/`professeurId` sont
dénormalisés sur la séance pour respecter le découplage (le module ne lit pas
la table reservations).

## Adaptateur Redis (multi-instances)

La gateway branche l'adaptateur `@socket.io/redis-adapter` dans `afterInit`,
via la paire pub/sub Upstash (`REDIS_URL`). Sans lui, un professeur connecté à
l'instance A et un élève à l'instance B ne se verraient pas. Indispensable dès
le premier déploiement (≥ 2 instances derrière le load balancer).

Si `REDIS_URL` est absente (développement mono-instance), la gateway continue
de fonctionner sans adaptateur — un avertissement est journalisé.

## À faire plus tard

- Micro-service d'enregistrement asynchrone (BullMQ + Cloudflare R2, rétention 30 j).
- Vraie vérification du consentement parental lié au compte de l'élève mineur.
