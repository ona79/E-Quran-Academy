'use client';

// Bouton de bascule clair/sombre.
import { utiliserTheme } from './fournisseur-theme';

export function BasculeTheme() {
  const { theme, basculerTheme } = utiliserTheme();
  const estSombre = theme === 'sombre';

  return (
    <button
      type="button"
      onClick={basculerTheme}
      aria-label={estSombre ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="btn-secondaire !px-3 !py-2"
      title={estSombre ? 'Mode clair' : 'Mode sombre'}
    >
      <span aria-hidden>{estSombre ? '☀️' : '🌙'}</span>
    </button>
  );
}
