import Link from 'next/link';

export function FooterLanding() {
  return (
    <footer
      className="pt-[48px] px-6 pb-6"
      style={{
        background: '#080F0B',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Colonne 1 */}
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-bold mb-4" style={{ color: '#F0EDE6' }}>
            📖 E-Quran Academy
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(240,237,230,0.5)' }}>
            La première plateforme SaaS d&apos;enseignement coranique pensée pour la diaspora francophone.
          </p>
        </div>

        {/* Colonne 2 */}
        <div>
          <h4 className="font-bold mb-4" style={{ color: '#F0EDE6' }}>Plateforme</h4>
          <ul className="space-y-3 text-[14px]" style={{ color: 'rgba(240,237,230,0.6)' }}>
            <li>
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            </li>
            <li>
              <Link href="/professeurs" className="hover:text-white transition-colors">Professeurs</Link>
            </li>
            <li>
              <a href="#comment" className="hover:text-white transition-colors">Comment ça marche</a>
            </li>
            <li>
              <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 */}
        <div>
          <h4 className="font-bold mb-4" style={{ color: '#F0EDE6' }}>Compte</h4>
          <ul className="space-y-3 text-[14px]" style={{ color: 'rgba(240,237,230,0.6)' }}>
            <li>
              <Link href="/connexion" className="hover:text-white transition-colors">Connexion</Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:text-white transition-colors">S&apos;inscrire</Link>
            </li>
            <li>
              <Link href="/inscription?role=prof" className="hover:text-white transition-colors">Devenir professeur</Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 */}
        <div>
          <h4 className="font-bold mb-4" style={{ color: '#F0EDE6' }}>Contact</h4>
          <ul className="space-y-3 text-[14px]" style={{ color: 'rgba(240,237,230,0.6)' }}>
            <li>
              <a href="mailto:contact@equran.academy" className="hover:text-white transition-colors">
                contact@equran.academy
              </a>
            </li>
            <li className="flex gap-4 mt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="WhatsApp">📱</a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">🐦</a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">📸</a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto pt-5 text-center text-[12px]"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          color: 'rgba(240,237,230,0.25)',
        }}
      >
        © 2026 E-Quran Academy — Tous droits réservés
      </div>
    </footer>
  );
}
