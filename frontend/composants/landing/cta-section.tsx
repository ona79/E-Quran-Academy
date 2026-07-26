'use client';

import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-[100px] px-6 text-center">
      {/* Blobs décoratifs de fond statiques */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: '#0B5E45',
          opacity: 0.15,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: '#B8923A',
          opacity: 0.15,
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-[36px] font-extrabold mb-4" style={{ color: '#F0EDE6' }}>
          Prêt à commencer votre voyage ?
        </h2>
        <p className="text-lg mb-8" style={{ color: 'rgba(240,237,230,0.6)' }}>
          Rejoignez des centaines d&apos;élèves de la diaspora francophone. Premier cours d&apos;essai disponible.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/inscription"
            className="w-full sm:w-auto text-center font-semibold py-4 px-8 rounded-xl transition-transform"
            style={{
              background: 'linear-gradient(135deg, #0B5E45, #B8923A)',
              color: 'white',
              boxShadow: '0 8px 30px rgba(11,94,69,0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Créer un compte gratuit
          </Link>
          <Link
            href="/professeurs"
            className="w-full sm:w-auto text-center font-semibold py-4 px-8 rounded-xl transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F0EDE6',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Voir les professeurs
          </Link>
        </div>
      </div>
    </section>
  );
}
