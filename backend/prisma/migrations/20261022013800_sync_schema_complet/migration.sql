-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "masquePourEleve" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "masquePourProfesseur" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reference" TEXT,
ADD COLUMN     "tokenReinitialisation" TEXT,
ADD COLUMN     "tokenReinitialisationExpireLe" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "quran_text_cache" (
    "id" TEXT NOT NULL,
    "qiraat" "Qiraat" NOT NULL,
    "sourate" INTEGER NOT NULL,
    "verset" INTEGER NOT NULL,
    "texte" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quran_text_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quran_text_cache_qiraat_sourate_idx" ON "quran_text_cache"("qiraat", "sourate");

-- CreateIndex
CREATE UNIQUE INDEX "quran_text_cache_qiraat_sourate_verset_key" ON "quran_text_cache"("qiraat", "sourate", "verset");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reference_key" ON "reservations"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "users_reference_key" ON "users"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "users_tokenReinitialisation_key" ON "users"("tokenReinitialisation");
