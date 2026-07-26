// Motif islamique : étoile à 8 branches en filigrane, utilisée en fond de
// hero et de headers de section. SVG léger (aucune image binaire).
export function MotifIslamique({
  opacite = 0.06,
  couleur = 'var(--couleur-primaire)',
  className = '',
  taille = 200,
}: {
  opacite?: number;
  couleur?: string;
  className?: string;
  taille?: number;
}) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: opacite, color: couleur }}
      aria-hidden
    >
      {/* Étoile à 8 branches = deux carrés superposés décalés à 45° */}
      <rect
        x="25"
        y="25"
        width="50"
        height="50"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(0 50 50)"
      />
      <rect
        x="25"
        y="25"
        width="50"
        height="50"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(45 50 50)"
      />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
