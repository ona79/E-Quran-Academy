// Validateur custom class-validator : vérifie qu'une URL est externe et sécurisée.
// Protection contre les attaques SSRF (Server-Side Request Forgery).
//
// Règles appliquées :
//  1. Protocol HTTPS obligatoire (http://, ftp://, file://, etc. sont refusés).
//  2. Longueur ≤ 500 caractères.
//  3. Hôte non privé/réservé :
//     - localhost, *.local
//     - 127.x.x.x
//     - 10.x.x.x (RFC 1918)
//     - 172.16-31.x.x (RFC 1918)
//     - 192.168.x.x (RFC 1918)
//     - 169.254.x.x (link-local, métadonnées cloud AWS/GCP/Azure)
//     - ::1, 0.0.0.0
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const URL_MAX_LONGUEUR = 500;

/** Plages d'adresses IP privées ou réservées — protection SSRF. */
const HOTES_BLOQUES = [
  /^localhost$/i,
  /\.local$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^\[::1\]$/,
];

export function estUrlExterneSecurisee(valeur: unknown): boolean {
  if (typeof valeur !== 'string') return false;
  if (valeur.length > URL_MAX_LONGUEUR) return false;

  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return false;
  }

  // Protocol HTTPS obligatoire.
  if (url.protocol !== 'https:') return false;

  // Hôte non privé/réservé.
  const hote = url.hostname;
  for (const patron of HOTES_BLOQUES) {
    if (patron.test(hote)) return false;
  }

  return true;
}

/**
 * Décorateur de propriété : marque un champ comme devant être une URL HTTPS
 * externe sécurisée (anti-SSRF). Peut être combiné avec @IsOptional().
 *
 * @example
 *   @IsOptional()
 *   @EstUrlExterneSecurisee()
 *   photoUrl?: string;
 */
export function EstUrlExterneSecurisee(options?: ValidationOptions) {
  return function (objet: object, propriete: string) {
    registerDecorator({
      name: 'estUrlExterneSecurisee',
      target: (objet as { constructor: Function }).constructor,
      propertyName: propriete,
      options: {
        message: `$property doit être une URL HTTPS externe valide (max ${URL_MAX_LONGUEUR} caractères, pas d'adresses internes)`,
        ...options,
      },
      validator: {
        validate(valeur: unknown, _args: ValidationArguments): boolean {
          // Autorise null/undefined (doit être combiné avec @IsOptional()).
          if (valeur === null || valeur === undefined) return true;
          return estUrlExterneSecurisee(valeur);
        },
      },
    });
  };
}
