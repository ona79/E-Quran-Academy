// Carte statistique pour les tableaux de bord — Dark Dashboard Edition.
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
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: '#131F18',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {icone && (
        <div
          className="shrink-0 rounded-xl flex items-center justify-center text-lg"
          style={{
            width: 40,
            height: 40,
            background: 'rgba(11,94,69,0.2)',
            color: '#33997A',
          }}
          aria-hidden
        >
          {icone}
        </div>
      )}
      <div>
        <p className="text-sm font-medium" style={{ color: 'rgba(240,237,230,0.55)' }}>
          {etiquette}
        </p>
        <p
          className="font-extrabold leading-none mt-1"
          style={{ fontSize: 28, color: '#F0EDE6' }}
        >
          {valeur}
        </p>
      </div>
    </div>
  );
}
