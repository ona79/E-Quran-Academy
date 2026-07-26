# Module : messagerie

**Rôle :** messagerie asynchrone entre élève et professeur

**Règle d'or :** ce module ne lit ni n'écrit jamais directement dans les
données d'un autre module. Toute communication avec un autre domaine passe
par une interface explicite (appel de service exposé, ou événement).
