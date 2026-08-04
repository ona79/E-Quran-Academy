// Carte statistique pour les tableaux de bord — Thème Clair.
import { type ReactNode } from 'react';

export function CarteStatistique({
  etiquette,
  valeur,
  icone,
}: {
  etiquette: string;
  valeur: ReactNode;
  icone?: ReactNode;
}) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-2 sm:p-5 flex flex-col gap-2 sm:gap-3"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--bordure)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
        {icone && (
          <div
            className="shrink-0 rounded-full flex items-center justify-center text-base sm:text-lg w-7 h-7 sm:w-10 sm:h-10"
            style={{
              background: 'rgba(27,94,59,0.08)',
              color: '#1B5E3B',
            }}
            aria-hidden
          >
            {icone}
          </div>
        )}
        <p className="text-[10px] sm:text-sm font-medium leading-tight" style={{ color: 'var(--texte-secondaire)' }}>
          {etiquette}
        </p>
      </div>
      <div>
        <p
          className="font-extrabold leading-none text-lg sm:text-3xl mt-1 sm:mt-0"
          style={{ color: 'var(--texte)' }}
        >
          {valeur}
        </p>
      </div>
    </div>
  );
}
