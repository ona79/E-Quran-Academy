'use client';

// Fournisseur de thème : gère le mode clair/sombre et le persiste en localStorage.
// Applique la classe `sombre` (ou `clair` pour forcer le mode clair malgré la
// préférence système) sur <html>.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'clair' | 'sombre';

interface ContexteTheme {
  theme: Theme;
  basculerTheme: () => void;
}

const ContexteFournisseurTheme = createContext<ContexteTheme | undefined>(undefined);

export function FournisseurTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('clair');

  // Au montage : on lit la préférence sauvegardée, sinon la préférence système.
  useEffect(() => {
    const sauvegarde = localStorage.getItem('theme') as Theme | null;
    const prefereSombre = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = sauvegarde ?? (prefereSombre ? 'sombre' : 'clair');
    setTheme(initial);
  }, []);

  // Applique la classe sur <html> à chaque changement.
  useEffect(() => {
    const racine = document.documentElement;
    racine.classList.remove('clair', 'sombre');
    racine.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const basculerTheme = () => {
    setTheme((t) => (t === 'clair' ? 'sombre' : 'clair'));
  };

  return (
    <ContexteFournisseurTheme.Provider value={{ theme, basculerTheme }}>
      {children}
    </ContexteFournisseurTheme.Provider>
  );
}

export function utiliserTheme(): ContexteTheme {
  const ctx = useContext(ContexteFournisseurTheme);
  if (!ctx) {
    throw new Error('utiliserTheme doit être utilisé dans FournisseurTheme');
  }
  return ctx;
}
