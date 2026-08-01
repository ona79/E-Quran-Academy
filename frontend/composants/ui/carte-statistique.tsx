// Carte statistique pour les tableaux de bord — Thème Clair.
import { type ReactNode } from 'react';

export function CarteStatistique({
  etiquette,
  valeur,
  icone,
}: {
  etiquette: string;
  valeur: ReactNode;
  icone?: string;
}) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--bordure)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        {icone && (
          <div
            className="shrink-0 rounded-full flex items-center justify-center text-lg w-10 h-10"
            style={{
              background: 'rgba(27,94,59,0.08)',
              color: '#1B5E3B',
            }}
            aria-hidden
          >
            {icone}
          </div>
        )}
        <p className="text-xs sm:text-sm font-medium leading-tight" style={{ color: 'var(--texte-secondaire)' }}>
          {etiquette}
        </p>
      </div>
      <div>
        <p
          className="font-extrabold leading-none text-2xl sm:text-3xl"
          style={{ color: 'var(--texte)' }}
        >
          {valeur}
        </p>
      </div>
    </div>
  );
}
