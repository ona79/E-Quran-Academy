// Boutons du design system (modèle iTalki, thème coranique).
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

type Variante = 'primaire' | 'secondaire' | 'cta';

interface PropsBouton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variante?: Variante;
  pleineLargeur?: boolean;
}

const CLASSES_BASE =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

const CLASSES_VARIANTE: Record<Variante, string> = {
  primaire: 'bg-[var(--primaire)] text-[var(--primaire-contraste)] hover:bg-[var(--primaire-hover)] border border-transparent',
  secondaire: 'bg-transparent text-[var(--texte)] border border-[var(--primaire)] hover:bg-[var(--secondaire-hover)]',
  cta: 'bg-[var(--accent)] text-[var(--primaire-contraste)] hover:bg-[var(--accent-hover)] border border-transparent',
};

export function BoutonBase({
  children,
  variante = 'primaire',
  pleineLargeur,
  className = '',
  style,
  ...reste
}: PropsBouton) {
  return (
    <button
      className={`${CLASSES_BASE} ${CLASSES_VARIANTE[variante]} ${
        pleineLargeur ? 'w-full' : 'w-full sm:w-auto'
      } ${className}`}
      style={style}
      {...reste}
    >
      {children}
    </button>
  );
}

export function BoutonPrimaire(props: Omit<PropsBouton, 'variante'>) {
  return <BoutonBase variante="primaire" {...props} />;
}

export function BoutonSecondaire(props: Omit<PropsBouton, 'variante'>) {
  return <BoutonBase variante="secondaire" {...props} />;
}

export function BoutonCta(props: Omit<PropsBouton, 'variante'>) {
  return <BoutonBase variante="cta" {...props} />;
}

/** Variante lien (Next.js Link) stylée comme un bouton. */
export function LienBouton({
  href,
  children,
  variante = 'primaire',
  pleineLargeur,
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  pleineLargeur?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${CLASSES_BASE} ${CLASSES_VARIANTE[variante]} ${
        pleineLargeur ? 'w-full' : 'w-full sm:w-auto'
      }`}
    >
      {children}
    </Link>
  );
}
