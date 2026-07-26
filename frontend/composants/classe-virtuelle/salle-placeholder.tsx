'use client';

// Placeholder de salle de classe — remplacé par le composant complet à l'étape 4.
// Garde la signature (reservationId) pour faciliter le branchement.
export function SalleDeClassePlaceholder({ reservationId }: { reservationId: string }) {
  return (
    <div className="carte text-center py-12">
      <span className="text-4xl">🎓</span>
      <h2 className="text-xl font-semibold mt-3">Salle de classe</h2>
      <p className="mt-2" style={{ color: 'var(--texte-secondaire)' }}>
        Réservation : <code>{reservationId}</code>
      </p>
      <p className="text-sm mt-2" style={{ color: 'var(--texte-secondaire)' }}>
        Le composant de visioconférence (Daily.co) + Mushaf interactif est
        intégré à l'étape 4 du phasage.
      </p>
    </div>
  );
}
