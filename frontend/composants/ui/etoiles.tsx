// Affichage d'une note sur 5 étoiles (lecture seule).
export function Etoiles({ note }: { note: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`Note ${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden style={{ opacity: i <= note ? 1 : 0.25 }}>
          ⭐
        </span>
      ))}
    </span>
  );
}
