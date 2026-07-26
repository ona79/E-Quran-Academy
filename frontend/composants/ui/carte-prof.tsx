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
}

export function CarteProf({ profil, nomComplet, noteMoyenne }: CarteProfProps) {
  const initiales = (nomComplet ?? 'P')
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article
      className="carte group cursor-default transition-all hover:shadow-elevee h-full flex flex-col"
      style={{ borderLeft: '3px solid var(--couleur-primaire)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--couleur-or)';
        e.currentTarget.style.borderLeftColor = 'var(--couleur-primaire)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bordure)';
        e.currentTarget.style.borderLeftColor = 'var(--couleur-primaire)';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-medium shrink-0"
          style={{ backgroundColor: 'var(--couleur-primaire)', color: 'var(--couleur-ivoire)' }}
        >
          {initiales}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{nomComplet ?? 'Professeur'}</h3>

          {/* Note étoiles */}
          {noteMoyenne !== undefined && (
            <p className="flex items-center gap-1 text-sm mt-0.5">
              <span style={{ color: 'var(--couleur-or)' }}>★</span>
              <span className="font-medium">{noteMoyenne.toFixed(1)}</span>
            </p>
          )}

          {/* Badge qiraat */}
          <span
            className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--couleur-or-clair)', color: 'var(--couleur-primaire-profond)' }}
          >
            {profil.qiraatParDefaut === 'WARSH' ? 'Warsh' : 'Hafs'}
          </span>
        </div>

        {/* Tarif */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold">
            {profil.tarifHoraire.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs" style={{ color: 'var(--texte-secondaire)' }}>FCFA/h</p>
        </div>
      </div>

      {/* Bio tronquée */}
      {profil.bio && (
        <p
          className="text-sm mt-3 line-clamp-2"
          style={{ color: 'var(--texte-secondaire)' }}
        >
          {profil.bio}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4">
        <Link
          href={`/professeurs/${profil.userId}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-secondaire flex-1 text-sm !py-2 text-center"
        >
          Voir profil
        </Link>
        <Link
          href={`/eleve/reserver?prof=${profil.userId}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-primaire flex-1 text-sm !py-2 text-center"
        >
          Réserver
        </Link>
      </div>
    </article>
  );
}
