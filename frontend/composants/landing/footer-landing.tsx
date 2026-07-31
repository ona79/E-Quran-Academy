import Link from 'next/link';

export function FooterLanding() {
  return (
    <footer className="pt-24 px-6 pb-8 bg-[#0a0a0a] border-t border-[#1F6948]/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#1F6948] to-transparent" />
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1F6948] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 relative z-10">
        
        {/* Colonne 1 : Marque (Prend plus de place) */}
        <div className="lg:col-span-5 pr-0 md:pr-10">
          <Link href="/" className="flex items-center gap-3 mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <img 
                src="/mascotte/logo_equran_accademy.png" 
                alt="E-Quran Academy Logo" 
                className="h-12 w-auto object-contain relative z-10"
              />
            </div>
            <span className="text-[24px] font-extrabold text-white tracking-tight">
              E-Quran <span className="text-[#D1B875]">Academy</span>
            </span>
          </Link>
          <p className="text-[15px] leading-relaxed text-[#A1A1AA] max-w-sm mb-8 font-medium">
            La première plateforme SaaS d&apos;enseignement coranique pensée pour la diaspora francophone. Apprenez le Coran avec des professeurs certifiés.
          </p>
          <div className="flex items-center gap-3">
            {['facebook', 'twitter', 'instagram'].map((social) => (
              <a key={social} href="#" className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#1F6948] hover:border-[#1F6948] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(31,105,72,0.3)] transition-all duration-300">
                <span className="sr-only">{social}</span>
                <div className="w-4 h-4 bg-current rounded-sm" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'12\'/%3E%3C/svg%3E")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Colonne 2 */}
        <div className="lg:col-span-2 lg:col-start-7">
          <h4 className="text-[13px] font-bold mb-6 text-white uppercase tracking-[0.15em] opacity-80">Plateforme</h4>
          <ul className="space-y-4 text-[15px] text-[#A1A1AA] font-medium">
            <li><Link href="/" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Accueil</Link></li>
            <li><Link href="/professeurs" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Professeurs</Link></li>
            <li><a href="#comment" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Comment ça marche</a></li>
            <li><a href="#tarifs" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Tarifs</a></li>
          </ul>
        </div>

        {/* Colonne 3 */}
        <div className="lg:col-span-2">
          <h4 className="text-[13px] font-bold mb-6 text-white uppercase tracking-[0.15em] opacity-80">Compte</h4>
          <ul className="space-y-4 text-[15px] text-[#A1A1AA] font-medium">
            <li><Link href="/connexion" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Connexion</Link></li>
            <li><Link href="/inscription" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">S&apos;inscrire</Link></li>
            <li><Link href="/inscription?role=prof" className="hover:text-[#D1B875] hover:translate-x-1 inline-block transition-all">Devenir professeur</Link></li>
          </ul>
        </div>

        {/* Colonne 4 */}
        <div className="lg:col-span-2">
          <h4 className="text-[13px] font-bold mb-6 text-white uppercase tracking-[0.15em] opacity-80">Contact</h4>
          <ul className="space-y-4 text-[15px] text-[#A1A1AA] font-medium">
            <li>
              <a href="mailto:contact@equran.academy" className="group flex items-center gap-3 hover:text-white transition-colors">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1F6948]/20 text-[#4ADE80] group-hover:bg-[#1F6948] group-hover:text-white transition-colors">✉️</span>
                <span>contact@equran.academy</span>
              </a>
            </li>
            <li>
              <a href="#" className="group flex items-center gap-3 hover:text-white transition-colors">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1F6948]/20 text-[#4ADE80] group-hover:bg-[#1F6948] group-hover:text-white transition-colors">💬</span>
                <span>Support 7j/7</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-[1280px] mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-[#71717A] font-medium relative z-10">
        <p>© {new Date().getFullYear()} E-Quran Academy. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="#" className="hover:text-white transition-colors">CGV / CGU</Link>
        </div>
      </div>
    </footer>
  );
}
