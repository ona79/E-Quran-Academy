'use client';

// Carte de professeur (modèle iTalki) — utilisée dans les listes de profs.
// - Avatar initiales (fond primaire) ou photo
// - Nom, tarif FCFA, note étoiles or
// - Badge qiraat (Hafs/Warsh) fond or clair
// - Bordure gauche 3px primaire
// - Hover : élévation + bordure or
// - Boutons "Voir profil" + "Réserver"
import Link from 'next/link';
import type { ProfilProfesseur } from '@/lib/types';

interface CarteProfProps {
  profil: ProfilProfesseur;
  nomComplet?: string;
  noteMoyenne?: number;
  lienProfil?: string;
}

export function CarteProf({ profil, nomComplet, noteMoyenne, lienProfil }: CarteProfProps) {
  const lienFinal = lienProfil || `/professeurs/${profil.userId}`;
  const initiales = (nomComplet ?? 'P')
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      className="carte cliquable group transition-all h-full flex flex-col !p-3 sm:!p-5"
      style={{ borderLeft: '3px solid var(--primaire)' }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-base font-medium shrink-0 overflow-hidden"
          style={{ backgroundColor: 'var(--couleur-primaire)', color: 'var(--couleur-ivoire)' }}
        >
          {profil.photoUrl ? (
            <img src={profil.photoUrl.startsWith('/') ? `/api-backend${profil.photoUrl}` : profil.photoUrl} alt={nomComplet ?? 'Professeur'} className="w-full h-full object-cover" />
          ) : (
            initiales
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-xs sm:text-base">{nomComplet ?? 'Professeur'}</h3>

          {/* Note étoiles */}
          {noteMoyenne !== undefined && (
            <p className="flex items-center gap-1 text-[10px] sm:text-sm mt-0.5">
              <span style={{ color: 'var(--couleur-or)' }}>★</span>
              <span className="font-medium">{noteMoyenne.toFixed(1)}</span>
            </p>
          )}

          {/* Badge qiraat */}
          <span
            className="inline-block mt-1 sm:mt-2 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--couleur-or-clair)', color: 'var(--couleur-primaire-profond)' }}
          >
            {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
          </span>
        </div>

        {/* Tarif */}
        <div className="text-right shrink-0">
          <p className="text-sm sm:text-lg font-bold leading-tight">
            {profil.tarifHoraire.toLocaleString('fr-FR')}
          </p>
          <p className="text-[9px] sm:text-xs" style={{ color: 'var(--texte-secondaire)' }}>FCFA/h</p>
        </div>
      </div>

      {/* Bio tronquée */}
      {profil.bio && (
        <p
          className="text-[10px] sm:text-sm mt-2 sm:mt-3 line-clamp-2"
          style={{ color: 'var(--texte-secondaire)' }}
        >
          {profil.bio}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 sm:gap-2 mt-auto pt-3 sm:pt-4">
        <Link
          href={lienFinal}
          onClick={(e) => e.stopPropagation()}
          className="btn-secondaire flex-1 text-[10px] sm:text-sm !py-1.5 sm:!py-2 !px-1 sm:!px-3 text-center truncate"
        >
          Voir profil
        </Link>
        <Link
          href={`/eleve/reserver?prof=${profil.userId}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-primaire flex-1 text-[10px] sm:text-sm !py-1.5 sm:!py-2 !px-1 sm:!px-3 text-center truncate"
        >
          Réserver
        </Link>
      </div>
    </article>
  );
}
