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
      className="rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--bordure)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {icone && (
        <div
          className="shrink-0 rounded-xl flex items-center justify-center text-lg w-10 h-10"
          style={{
            background: 'rgba(27,94,59,0.1)',
            color: '#1B5E3B',
          }}
          aria-hidden
        >
          {icone}
        </div>
      )}
      <div>
        <p className="text-[10px] sm:text-sm font-medium leading-tight" style={{ color: 'var(--texte-secondaire)' }}>
          {etiquette}
        </p>
        <p
          className="font-extrabold leading-none mt-1 sm:mt-1 text-xl sm:text-3xl"
          style={{ color: 'var(--texte)' }}
        >
          {valeur}
        </p>
      </div>
    </div>
  );
}
