# Portail de Documentation Professionnelle — E-Quran Academy

Bienvenue dans la documentation technique et fonctionnelle officielle de la plateforme **E-Quran Academy**. Ce dossier regroupe l'ensemble des spécifications d'ingénierie, des cas d'utilisation, des diagrammes de modélisation UML (diagrammes de classes, diagrammes de séquences, diagrammes d'états, diagramme ERD) et de l'architecture logicielle de la plateforme.

---

## 📚 Sommaire des Documents

Pour une navigation structurée, vous pouvez consulter les modules de documentation ci-dessous :

1. [Spécification des Besoins et Cahier des Charges](file:///home/diallo/for_me/Semestre_6/project/equran-academy/docs/cahier-des-charges-et-besoins.md)
   - Contexte du projet et marché cible (Sénégal, Guinée, Diaspora francophone).
   - Personas utilisateurs (Élève/Parent, Professeur certifié, Administrateur).
   - Exigences fonctionnelles (EF) et non fonctionnelles (ENF).
   - Règles métier strictes (Budget, Qira'at Hafs & Warsh, Réservation instantanée, Escrow).

2. [Cas d'Utilisation Spécifiés et Diagrammes UML](file:///home/diallo/for_me/Semestre_6/project/equran-academy/docs/cas-d-utilisation.md)
   - Diagramme global des cas d'utilisation UML (Mermaid).
   - Fiches détaillées des Cas d'Utilisation (UC-01 à UC-08) avec acteurs, préconditions, déclencheurs, scénarios nominaux et d'exception.

3. [Diagrammes de Classes UML et Modélisation Objet](file:///home/diallo/for_me/Semestre_6/project/equran-academy/docs/diagrammes-de-classes.md)
   - Diagramme de classes UML complet du domaine et des données (Prisma Models & Enums).
   - Diagramme de classes UML de la structure applicative Backend (Modules NestJS, Contrôleurs, Services, Gateways WebSockets et DTOs).

4. [Architecture Technique et Diagrammes Dynamiques](file:///home/diallo/for_me/Semestre_6/project/equran-academy/docs/architecture-technique.md)
   - Architecture globale du système (Monolithe modulaire NestJS, Next.js Frontend, Supabase PostgreSQL, Upstash Redis, SFU Daily.co, Cloudflare R2).
   - Diagramme Entité-Association (ERD) complet.
   - Diagrammes de Séquence UML (Flux de Réservation de cours, Synchronisation WebSocket temps réel du Mushaf).
   - Diagrammes d'États UML (Cycle de vie des Réservations et Séquestre / Escrow des Paiements).
   - Prise en charge du multi-instances (Redis Pub/Sub Socket.IO adapter).

5. [Spécification API, Sécurité et Traçabilité](file:///home/diallo/for_me/Semestre_6/project/equran-academy/docs/api-et-securite.md)
   - Endpoints de l'API REST et contrat WebSocket.
   - Stratégie d'authentification (JWT httpOnly / Cookie / Guard NestJS).
   - Système de Feature Flags et journal d'audit des actions sensibles (`JournalAudit`).
   - Gestion des limites de bande passante et mode de repli audio.

---

## 🛠️ Stack Technique Synthétique

- **Frontend** : Next.js 14+ (App Router), TypeScript, TailwindCSS, Lucide Icons, Socket.io-client.
- **Backend** : NestJS (Node.js + TypeScript), API REST Stateless, WebSockets Socket.IO.
- **Base de données** : PostgreSQL via ORM Prisma.
- **Cache & Async** : Upstash Redis & BullMQ.
- **Visioconférence** : Daily.co (Architecture SFU avec simulcast et bitrate adaptatif).
- **Texte Coranique** : QuranHub API (mises en cache localement dans `QuranTextCache` pour Hafs et Warsh).
- **Stockage Objets** : Cloudflare R2 / Backblaze B2 (Ijazas, audios de démo, enregistrements).
