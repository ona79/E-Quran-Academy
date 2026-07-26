import type { Config } from 'tailwindcss';

// Design system E-Quran Academy — thème coranique, modèle iTalki.
const config: Config = {
  darkMode: ['class', '.sombre'],
  content: [
    './app/**/*.{ts,tsx}',
    './composants/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette liée aux variables CSS
        'fond-page': 'var(--fond-page)',
        'fond-surface': 'var(--fond-surface)',
        'fond-surface-2': 'var(--fond-surface-2)',
        'fond-sidebar': 'var(--fond-sidebar)',
        'bordure': 'var(--bordure)',
        'texte': 'var(--texte)',
        'texte-secondaire': 'var(--texte-secondaire)',
        'primaire': 'var(--primaire)',
        'accent': 'var(--accent)',
        'succes': 'var(--succes)',
        'erreur': 'var(--erreur)',

        // Anciennes variables pour rétro-compatibilité
        or: {
          DEFAULT: 'var(--couleur-or)',
          clair: 'var(--couleur-or-clair)',
        },
        ivoire: {
          DEFAULT: 'var(--couleur-ivoire)',
          fonce: 'var(--couleur-ivoire-fonce)',
        },
        nuit: {
          DEFAULT: 'var(--couleur-nuit)',
          card: 'var(--couleur-card-sombre)',
          sidebar: 'var(--couleur-sidebar-sombre)',
        },
        // Variantes numérotées (utilitaires type bg-primaire-500)
        emeraude: {
          50: '#E6F2EE',
          100: '#CCE5DD',
          200: '#99CCBB',
          300: '#66B299',
          400: '#339977',
          500: '#0B5E45',
          600: '#094B38',
          700: '#08402F',
          800: '#05251C',
          900: '#03120E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        coran: ['Amiri', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
      boxShadow: {
        douce: '0 2px 8px rgba(0, 0, 0, 0.06)',
        carte: '0 4px 12px rgba(0, 0, 0, 0.08)',
        elevee: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        fondu: 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
