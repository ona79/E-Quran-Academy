'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Info, X } from 'lucide-react';

export interface ModalConfirmationProps {
  ouvert: boolean;
  titre: string;
  description?: string;
  libelleConfirmer?: string;
  libelleAnnuler?: string;
  variante?: 'danger' | 'warning' | 'info';
  enChargement?: boolean;
  surConfirmation: () => void;
  surFermeture: () => void;
}

export function ModalConfirmation({
  ouvert,
  titre,
  description,
  libelleConfirmer = 'Confirmer',
  libelleAnnuler = 'Annuler',
  variante = 'danger',
  enChargement = false,
  surConfirmation,
  surFermeture,
}: ModalConfirmationProps) {
  // Fermeture par touche Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ouvert && !enChargement) {
        surFermeture();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ouvert, enChargement, surFermeture]);

  const configVariante = {
    danger: {
      icone: Trash2,
      couleurIcone: 'text-red-500',
      bgIcone: 'bg-red-500/10 border-red-500/20',
      btnConfirmerBg: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
    },
    warning: {
      icone: AlertTriangle,
      couleurIcone: 'text-amber-500',
      bgIcone: 'bg-amber-500/10 border-amber-500/20',
      btnConfirmerBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20',
    },
    info: {
      icone: Info,
      couleurIcone: 'text-[#0B5E45]',
      bgIcone: 'bg-[#0B5E45]/10 border-[#0B5E45]/20',
      btnConfirmerBg: 'bg-[#0B5E45] hover:bg-[#08402F] text-white shadow-lg shadow-[#0B5E45]/20',
    },
  }[variante];

  const Icone = configVariante.icone;

  return (
    <AnimatePresence>
      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec flou glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={enChargement ? undefined : surFermeture}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Fenêtre modale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden z-10"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid var(--bordure)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            }}
          >
            {/* Bouton fermer */}
            {!enChargement && (
              <button
                type="button"
                onClick={surFermeture}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            )}

            <div className="flex items-center gap-4">
              {/* Icône de statut */}
              <div className={`p-3 rounded-xl border shrink-0 ${configVariante.bgIcone} ${configVariante.couleurIcone}`}>
                <Icone size={24} />
              </div>

              {/* Textes */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-base text-gray-900 leading-snug">
                  {titre}
                </h3>
                {description && (
                  <p className="text-sm text-gray-600 leading-relaxed font-normal mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={enChargement}
                onClick={surFermeture}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {libelleAnnuler}
              </button>

              <button
                type="button"
                disabled={enChargement}
                onClick={surConfirmation}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${configVariante.btnConfirmerBg} disabled:opacity-50 flex items-center gap-2`}
              >
                {enChargement ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Traitement…
                  </span>
                ) : (
                  libelleConfirmer
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
