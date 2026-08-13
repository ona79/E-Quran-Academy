import Link from 'next/link';
import { Mail, MessageCircle, ShieldCheck, Heart, Sparkles } from 'lucide-react';

function IconeFacebook({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconeInstagram({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function IconeYoutube({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 0 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconeWhatsapp({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export function FooterLanding() {
  return (
    <footer className="pt-20 px-6 pb-8 bg-[#09120e] border-t border-[#0B5E45]/40 relative overflow-hidden text-gray-300">
      {/* Halo lumineux d'arrière-plan en émeraude et or */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-[#B8923A] to-transparent opacity-60" />
      <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0B5E45] opacity-[0.18] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-[#B8923A] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

      {/* Motif géométrique discret */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="white" strokeWidth="0.8" />
              <circle cx="30" cy="30" r="12" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16 relative z-10">
        
        {/* Colonne 1 : Marque & Présentation */}
        <div className="lg:col-span-5 pr-0 lg:pr-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#B8923A]/50 transition-all duration-300">
              <img 
                src="/mascotte/logo_equran_accademy.png" 
                alt="Quran-Academy Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Quran-<span className="text-[#B8923A]">Academy</span>
            </span>
          </Link>

          <p className="text-[14px] leading-relaxed text-gray-400 max-w-md mb-6 font-normal">
            La première plateforme SaaS d&apos;apprentissage du Coran et du Tajwid pensée pour la diaspora francophone. Professeurs certifiés, suivi pédagogique et salle de classe interactive en direct (Warsh & Hafs).
          </p>

          {/* Réseaux sociaux avec leurs vraies couleurs officielles */}
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-[#1877F2]/25 hover:scale-110 hover:shadow-[#1877F2]/45 transition-all duration-300"
            >
              <IconeFacebook />
            </a>

            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-lg shadow-[#dc2743]/25 hover:scale-110 hover:shadow-[#dc2743]/45 transition-all duration-300"
            >
              <IconeInstagram />
            </a>

            {/* YouTube */}
            <a
              href="#"
              aria-label="YouTube"
              className="w-10 h-10 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shadow-lg shadow-[#FF0000]/25 hover:scale-110 hover:shadow-[#FF0000]/45 transition-all duration-300"
            >
              <IconeYoutube />
            </a>

            {/* WhatsApp */}
            <a
              href="#"
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/25 hover:scale-110 hover:shadow-[#25D366]/45 transition-all duration-300"
            >
              <IconeWhatsapp />
            </a>
          </div>
        </div>

        {/* Colonne 2 : Plateforme */}
        <div className="lg:col-span-2 lg:col-start-6">
          <h3 className="text-xs font-bold mb-5 text-[#B8923A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} /> Plateforme
          </h3>
          <ul className="space-y-3 text-[14px] text-gray-400 font-medium">
            <li>
              <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/professeurs" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Trouver un professeur
              </Link>
            </li>
            <li>
              <a href="#comment" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Comment ça marche
              </a>
            </li>
            <li>
              <a href="#tarifs" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Packs & Tarifs
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Espace Compte */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold mb-5 text-[#B8923A] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} /> Espaces
          </h3>
          <ul className="space-y-3 text-[14px] text-gray-400 font-medium">
            <li>
              <Link href="/connexion" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                Inscription Élève / Parent
              </Link>
            </li>
            <li>
              <Link href="/inscription?role=prof" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200 text-[#4ADE80]">
                Devenir Professeur →
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Contact Officiel */}
        <div className="lg:col-span-3">
          <h3 className="text-xs font-bold mb-5 text-[#B8923A] uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} /> Contact & Support
          </h3>
          <ul className="space-y-3 text-[14px] font-medium">
            <li>
              <a
                href="mailto:coranacademie@gmail.com"
                className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#B8923A]/50 hover:bg-white/10 flex items-center gap-3 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B5E45] text-white group-hover:scale-110 transition-transform">
                  <Mail size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] text-gray-400">Email officiel</p>
                  <p className="text-[13px] text-white font-semibold truncate">coranacademie@gmail.com</p>
                </div>
              </a>
            </li>
            <li>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#B8923A]/20 text-[#B8923A]">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Assistance</p>
                  <p className="text-[13px] text-white font-semibold">Support 7j/7 disponible</p>
                </div>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Barre inférieure de copyright et mentions */}
      <div className="max-w-[1280px] mx-auto pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-gray-500 font-medium relative z-10">
        <p className="flex items-center gap-1">
          © {new Date().getFullYear()} Quran-Academy. Conçu avec <Heart size={12} className="text-red-500 fill-red-500 inline" /> pour l&apos;apprentissage du Coran.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
          <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="#" className="hover:text-white transition-colors">CGV / CGU</Link>
        </div>
      </div>
    </footer>
  );
}
