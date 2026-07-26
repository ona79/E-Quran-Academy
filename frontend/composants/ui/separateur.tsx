// Séparateur : ligne dorée avec étoile centrée (thème coranique).
export function Separateur({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 my-6 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    >
      <span
        className="flex-1 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--couleur-or), transparent)',
        }}
      />
      <span aria-hidden style={{ color: 'var(--couleur-or)' }}>
        ✦
      </span>
      <span
        className="flex-1 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--couleur-or), transparent)',
        }}
      />
    </div>
  );
}
