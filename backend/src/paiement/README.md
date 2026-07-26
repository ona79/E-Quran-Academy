# Module : paiement

**Rôle :** crédits, packs de cours, escrow — désactivé par défaut (PAYMENTS_ENABLED)

**Règle d'or :** ce module ne lit ni n'écrit jamais directement dans les
données d'un autre module. Toute communication avec un autre domaine passe
par une interface explicite (appel de service exposé, ou événement).
