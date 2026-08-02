// Seed initial : crée un compte administrateur et un professeur de test.
// Les identifiants admin sont pilotés par des variables d'environnement.
// Le professeur de test (prof1@equran.com) est créé en dur pour faciliter
// le développement et les tests — à supprimer en production via une migration.
//
// Lancement : `npm run prisma:seed` (voir package.json).
import { PrismaClient, Role, Qiraat } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const COUT_HACHAGE = 12;

async function creerAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const motDePasse = process.env.ADMIN_MOT_DE_PASSE;
  const nomComplet = process.env.ADMIN_NOM_COMPLET ?? 'Administrateur';

  if (!email || !motDePasse) {
    console.info(
      'Seed : variables ADMIN_EMAIL / ADMIN_MOT_DE_PASSE absentes — aucun admin créé.',
    );
    return;
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    console.info(`Seed : l'admin ${email} existe déjà — rien à faire.`);
    return;
  }

  const motDePasseHache = await bcrypt.hash(motDePasse, COUT_HACHAGE);

  await prisma.user.create({
    data: {
      email,
      motDePasse: motDePasseHache,
      nomComplet,
      role: Role.ADMIN,
      langue: 'fr',
      fuseauHoraire: 'Africa/Dakar',
    },
  });

  console.info(`Seed : compte administrateur créé pour ${email}.`);
}

async function creerProfesseurTest(): Promise<void> {
  const EMAIL_PROF = 'prof1@equran.com';

  const existant = await prisma.user.findUnique({ where: { email: EMAIL_PROF } });
  if (existant) {
    console.info(`Seed : le professeur de test ${EMAIL_PROF} existe déjà — rien à faire.`);
    return;
  }

  const motDePasseHache = await bcrypt.hash('Prof123!', COUT_HACHAGE);

  const prof = await prisma.user.create({
    data: {
      email: EMAIL_PROF,
      motDePasse: motDePasseHache,
      nomComplet: 'Moussa Kouyaté',
      role: Role.PROFESSEUR,
      langue: 'fr',
      fuseauHoraire: 'Africa/Dakar',
    },
  });

  // Créer le profil professeur validé
  await prisma.teacherProfile.create({
    data: {
      userId: prof.id,
      bio: 'Hafiz certifié, spécialisé dans la lecture Warsh. 10 ans d\'expérience pédagogique.',
      photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      audioUrl: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3',
      tarifHoraire: 1500,
      qiraatParDefaut: Qiraat.WARSH,
      reservationInstantanee: true,
      valide: true,
    },
  });

  console.info(`Seed : professeur de test créé — ${EMAIL_PROF} / Prof123!`);
}

async function main(): Promise<void> {
  await creerAdmin();

  // Le professeur de test n'est créé qu'en développement.
  // En production, NODE_ENV=production doit être défini pour éviter
  // d'exposer des comptes avec des mots de passe connus.
  if (process.env.NODE_ENV !== 'production') {
    await creerProfesseurTest();
  } else {
    console.info('Seed : environnement production — professeur de test ignoré.');
  }

  // Feature flags
  await prisma.featureFlag.upsert({
    where: { cle: 'paiement.actif' },
    update: {},
    create: {
      cle: 'paiement.actif',
      actif: false,
      description: 'Active les paiements réels via Stripe (si faux, simulation escrow)',
    },
  });
  console.info('Seed : feature flags insérés.');

  // Quran cache (mock partiel pour la démo)
  const quranCount = await prisma.quranTextCache.count();
  if (quranCount === 0) {
    await prisma.quranTextCache.createMany({
      data: [
        { qiraat: Qiraat.HAFS, sourate: 1, verset: 1, texte: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
        { qiraat: Qiraat.HAFS, sourate: 1, verset: 2, texte: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
        { qiraat: Qiraat.HAFS, sourate: 1, verset: 3, texte: 'الرَّحْمَٰنِ الرَّحِيمِ' },
        { qiraat: Qiraat.HAFS, sourate: 1, verset: 4, texte: 'مَالِكِ يَوْمِ الدِّينِ' },
        { qiraat: Qiraat.WARSH, sourate: 1, verset: 1, texte: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
        { qiraat: Qiraat.WARSH, sourate: 1, verset: 2, texte: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
        // On se limite à quelques versets pour le seed. Un vrai import lirait un JSON complet.
      ],
      skipDuplicates: true,
    });
    console.info('Seed : QuranTextCache initialisé avec Al-Fatiha.');
  }
}

main()
  .catch((erreur) => {
    console.error('Seed : échec.', erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
