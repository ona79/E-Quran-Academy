-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ELEVE', 'PROFESSEUR', 'ADMIN');

-- CreateEnum
CREATE TYPE "JourSemaine" AS ENUM ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('PONCTUELLE', 'HEBDOMADAIRE');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'ANNULE', 'REALISE', 'ABSENT');

-- CreateEnum
CREATE TYPE "StatutSession" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE');

-- CreateEnum
CREATE TYPE "Qiraat" AS ENUM ('HAFS', 'WARSH');

-- CreateEnum
CREATE TYPE "StatutEscrow" AS ENUM ('BLOQUE', 'LIBERE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "MethodePaiement" AS ENUM ('STRIPE', 'PAYDUNYA', 'CINETPAY', 'MANUEL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ELEVE',
    "genre" TEXT,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "fuseauHoraire" TEXT NOT NULL DEFAULT 'Africa/Dakar',
    "solde" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "ijazaUrl" TEXT,
    "audioUrl" TEXT,
    "tarifHoraire" INTEGER NOT NULL DEFAULT 0,
    "qiraatParDefaut" "Qiraat" NOT NULL DEFAULT 'HAFS',
    "reservationInstantanee" BOOLEAN NOT NULL DEFAULT false,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "id" TEXT NOT NULL,
    "professeurId" TEXT NOT NULL,
    "jour" "JourSemaine" NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "recurrence" "Recurrence" NOT NULL DEFAULT 'HEBDOMADAIRE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "professeurId" TEXT NOT NULL,
    "creneauDebut" TIMESTAMP(3) NOT NULL,
    "creneauFin" TIMESTAMP(3) NOT NULL,
    "statut" "StatutReservation" NOT NULL DEFAULT 'EN_ATTENTE',
    "noteEleve" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seances_cours" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "professeurId" TEXT NOT NULL,
    "statut" "StatutSession" NOT NULL DEFAULT 'PLANIFIEE',
    "lienVisio" TEXT,
    "enregistrementConsente" BOOLEAN NOT NULL DEFAULT false,
    "enregistrementActif" BOOLEAN NOT NULL DEFAULT false,
    "enregistrementUrl" TEXT,
    "modeRepliActif" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seances_cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etats_mushaf" (
    "id" TEXT NOT NULL,
    "seanceId" TEXT NOT NULL,
    "numeroSourate" INTEGER NOT NULL,
    "numeroVerset" INTEGER NOT NULL,
    "plageSurlignage" TEXT,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etats_mushaf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes_session" (
    "id" TEXT NOT NULL,
    "seanceId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "professeurId" TEXT NOT NULL,
    "sourateMemorisee" TEXT,
    "sourateRevisee" TEXT,
    "pointsTajwid" TEXT,
    "commentaire" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "professeurId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "statutEscrow" "StatutEscrow" NOT NULL DEFAULT 'BLOQUE',
    "methode" "MethodePaiement" NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "acteurId" TEXT,
    "cibleId" TEXT,
    "evenement" TEXT NOT NULL,
    "details" JSONB,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- CreateIndex
CREATE INDEX "disponibilites_professeurId_jour_idx" ON "disponibilites"("professeurId", "jour");

-- CreateIndex
CREATE INDEX "reservations_professeurId_creneauDebut_idx" ON "reservations"("professeurId", "creneauDebut");

-- CreateIndex
CREATE INDEX "reservations_eleveId_creneauDebut_idx" ON "reservations"("eleveId", "creneauDebut");

-- CreateIndex
CREATE UNIQUE INDEX "seances_cours_reservationId_key" ON "seances_cours"("reservationId");

-- CreateIndex
CREATE INDEX "seances_cours_professeurId_idx" ON "seances_cours"("professeurId");

-- CreateIndex
CREATE INDEX "seances_cours_eleveId_idx" ON "seances_cours"("eleveId");

-- CreateIndex
CREATE UNIQUE INDEX "etats_mushaf_seanceId_key" ON "etats_mushaf"("seanceId");

-- CreateIndex
CREATE UNIQUE INDEX "notes_session_seanceId_key" ON "notes_session"("seanceId");

-- CreateIndex
CREATE INDEX "notes_session_eleveId_creeLe_idx" ON "notes_session"("eleveId", "creeLe");

-- CreateIndex
CREATE INDEX "avis_professeurId_idx" ON "avis"("professeurId");

-- CreateIndex
CREATE UNIQUE INDEX "avis_eleveId_professeurId_key" ON "avis"("eleveId", "professeurId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_cle_key" ON "feature_flags"("cle");

-- CreateIndex
CREATE INDEX "messages_destinataireId_horodatage_idx" ON "messages"("destinataireId", "horodatage");

-- CreateIndex
CREATE INDEX "messages_expediteurId_horodatage_idx" ON "messages"("expediteurId", "horodatage");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_reservationId_key" ON "paiements"("reservationId");

-- CreateIndex
CREATE INDEX "journal_audit_acteurId_idx" ON "journal_audit"("acteurId");

-- CreateIndex
CREATE INDEX "journal_audit_evenement_creeLe_idx" ON "journal_audit"("evenement", "creeLe");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances_cours" ADD CONSTRAINT "seances_cours_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances_cours" ADD CONSTRAINT "seances_cours_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etats_mushaf" ADD CONSTRAINT "etats_mushaf_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "seances_cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes_session" ADD CONSTRAINT "notes_session_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
