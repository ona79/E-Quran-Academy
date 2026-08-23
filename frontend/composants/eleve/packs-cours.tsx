'use client';

// Packs de cours à tarif réduit (modèle iTalki).
// NOTE : le paiement est DÉSACTIVÉ par défaut (PAYMENTS_ENABLED=false).
// Ces packs sont présentés à titre informatif ; l'achat réel sera activé
// en phase 4 (module paiement). Aucun flux de paiement n'est déclenché ici.
import { useState } from 'react';

interface Pack {
  nom: string;
  nombreCours: number;
  description: string;
  populaire?: boolean;
}

const PACKS: Pack[] = [
  {
    nom: 'Découverte',
    nombreCours: 1,
    description: 'Un cours d\'essai pour découvrir votre professeur.',
  },
  {
    nom: 'Essentiel',
    nombreCours: 5,
    description: 'Cinq cours pour progresser régulièrement.',
    populaire: true,
  },
  {
    nom: 'Assidu',
    nombreCours: 10,
    description: 'Dix cours à tarif réduit, idéal sur un mois.',
  },
];

export function PacksCours() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold">Packs de cours</h2>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
        >
          Paiement désactivé (MVP)
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {PACKS.map((pack) => (
          <div
            key={pack.nom}
            className="carte relative"
            style={pack.populaire ? { borderColor: 'var(--accent)' } : undefined}
          >
            {pack.populaire && (
              <span
                className="absolute -top-2 right-4 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--ivoire-50)' }}
              >
                Populaire
              </span>
            )}
            <h3 className="font-semibold text-lg">{pack.nom}</h3>
            <p className="text-3xl font-bold mt-2">{pack.nombreCours}</p>
            <p className="text-sm" style={{ color: 'var(--texte-secondaire)' }}>
              {pack.nombreCours === 1 ? 'cours' : 'cours'}
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--texte-secondaire)' }}>
              {pack.description}
            </p>
            <button
              type="button"
              className="btn-secondaire w-full mt-4"
              onClick={() =>
                setMessage('Le paiement sera disponible à la phase 4 du projet.')
              }
            >
              Choisir
            </button>
          </div>
        ))}
      </div>

      {message && (
        <p className="text-sm mt-4" style={{ color: 'var(--texte-secondaire)' }}>
          ℹ️ {message}
        </p>
      )}
    </section>
  );
}
