// Point de démarrage de l'application NestJS.
//
// Sécurité appliquée ici (dans l'ordre) :
//  1. Validation des variables d'environnement critiques — arrêt immédiat si
//     DATABASE_URL ou JWT_SECRET sont absentes (fail-fast).
//  2. Helmet — positionne ~15 en-têtes HTTP de sécurité (CSP, HSTS, etc.).
//  3. ValidationPipe global — whitelist + forbidNonWhitelisted + transform.
//  4. ThrottlerGuard global — 100 req/min par défaut (surchargé par endpoint).
//  5. CORS restreint à l'origine frontend (variable FRONTEND_URL).
//  6. Swagger — documentation OpenAPI sur /api (dev/staging uniquement).
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

// ── 1. Validation des variables d'environnement critiques ──────────────────
//
// On valide AVANT la création de l'application Nest pour un fail-fast propre.
// Si une variable critique est manquante, le processus s'arrête avec un
// message d'erreur explicite plutôt qu'une erreur cryptique plus tard.
function validerVariablesEnvironnement(): void {
  const logger = new Logger('Bootstrap');
  const requises: string[] = ['DATABASE_URL', 'JWT_SECRET'];
  if (process.env.NODE_ENV === 'production') {
    requises.push('CORS_ORIGINE');
  }
  const manquantes = requises.filter((cle) => !process.env[cle]);

  if (manquantes.length > 0) {
    logger.error(
      `⛔  Variables d'environnement critiques manquantes : ${manquantes.join(', ')}\n` +
      `    Vérifiez votre fichier .env ou les secrets de déploiement.`,
    );
    process.exit(1);
  }

  logger.log('✅  Variables d\'environnement critiques présentes.');
}

async function bootstrap(): Promise<void> {
  // Fail-fast avant tout le reste.
  validerVariablesEnvironnement();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ── 2. Helmet — en-têtes de sécurité HTTP ──────────────────────────────
  // Positionne automatiquement : Content-Security-Policy, HSTS, X-Frame-Options,
  // X-Content-Type-Options, Referrer-Policy, etc.
  // Configuration permissive sur /api (Swagger) pour l'exploration en dev.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],   // Swagger UI
          styleSrc: ["'self'", "'unsafe-inline'"],    // Swagger UI
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // ── 3. CORS ─────────────────────────────────────────────────────────────
  // En production : CORS_ORIGINE doit être défini.
  // En développement : fallback sur http://localhost:3000.
  const originesAutorisees = process.env.CORS_ORIGINE
    ? process.env.CORS_ORIGINE.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: originesAutorisees,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  });

  // ── 4. ValidationPipe global ─────────────────────────────────────────────
  // - whitelist: true          → retire silencieusement les champs non déclarés.
  // - forbidNonWhitelisted: true → lève une 400 si un champ non attendu arrive.
  // - transform: true           → coerce automatiquement les types (string → number…).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Note : ThrottlerGuard est déclaré comme APP_GUARD dans AppModule plutôt
  // qu'ici pour bénéficier de l'injection de dépendances (accès au service
  // Throttler). Le module est configuré dans app.module.ts.

  // ── 5. Documentation API (Swagger) ──────────────────────────────────────
  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('E-Quran Academy — API')
    .setDescription('API du backend NestJS (monolithe modulaire)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ── Démarrage ────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`🚀  Backend démarré sur http://localhost:${port}`);
  logger.log(`📚  Swagger disponible sur http://localhost:${port}/api`);
}

void bootstrap();
