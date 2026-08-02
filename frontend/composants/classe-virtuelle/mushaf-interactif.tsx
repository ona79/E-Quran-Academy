'use client';

// Mushaf interactif : affiche le texte coranique (RTL, police Amiri) et gère
// le surlignage.
//
// CONTRAINTE NON NÉGOCIABLE :
// - Seul le professeur peut surligner. L'étudiant est en lecture seule (aucun
//   contrôle de saisie ne lui est présenté).
// - Le payload de synchronisation ne contient que des références
//   (numeroSourate, numeroVerset, plageSurlignage) — jamais d'image.
//
// Les données proviennent de l'API QuranHub via le backend
// (GET /classe-virtuelle/mushaf/sourates et /mushaf/versets/:numero).
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { EtatMushaf } from '@/lib/types';

interface Sourate {
  numero: number;
  nomArabe: string;
  nomSimple: string;
  nombreVersets: number;
}

interface Verset {
  numero: number;
  texte: string;
}

interface MushafInteractifProps {
  etat: EtatMushaf | null;
  /** True si l'utilisateur est professeur (peut surligner). */
  estProfesseur: boolean;
  /** Callback appelé quand le professeur sélectionne un verset/plage. */
  surSurlignage: (etat: EtatMushaf) => void;
}

export function MushafInteractif({ etat, estProfesseur, surSurlignage }: MushafInteractifProps) {
  const [sourate, setSourate] = useState(etat?.numeroSourate ?? 1);
  const [versetCourant, setVersetCourant] = useState(etat?.numeroVerset ?? 1);

  const [sourates, setSourates] = useState<Sourate[]>([]);
  const [versets, setVersets] = useState<Verset[]>([]);
  const [chargementSourates, setChargementSourates] = useState(true);
  const [chargementVersets, setChargementVersets] = useState(false);

  // ── Charger la liste des 114 sourates au montage ────────────────────────
  useEffect(() => {
    apiClient
      .get<Sourate[]>('/classe-virtuelle/mushaf/sourates')
      .then(setSourates)
      .catch(() => {
        // Fallback minimal : Al-Fatiha si l'API est inaccessible
        setSourates([{ numero: 1, nomArabe: 'الفاتحة', nomSimple: 'Al-Fatihah', nombreVersets: 7 }]);
      })
      .finally(() => setChargementSourates(false));
  }, []);

  // ── Charger les versets à chaque changement de sourate ──────────────────
  const chargerVersets = useCallback(async (numeroSourate: number) => {
    setChargementVersets(true);
    try {
      const data = await apiClient.get<Verset[]>(
        `/classe-virtuelle/mushaf/versets/${numeroSourate}`,
      );
      setVersets(data);
    } catch {
      setVersets([]);
    } finally {
      setChargementVersets(false);
    }
  }, []);

  useEffect(() => {
    chargerVersets(sourate);
  }, [sourate, chargerVersets]);

  const [plageLocale, setPlageLocale] = useState<string | null>(etat?.plageSurlignage ?? null);

  // ── Synchronise l'affichage local avec l'état reçu du serveur ───────────
  useEffect(() => {
    if (etat) {
      setSourate(etat.numeroSourate);
      setVersetCourant(etat.numeroVerset);
      setPlageLocale(etat.plageSurlignage ?? null);
    }
  }, [etat]);

  // Calcule la plage surlignée à partir de l'état local (pour un affichage immédiat).
  const plage = plageLocale;
  const surlignageDebut = plage ? Number(plage.split('-')[0]) : null;
  const surlignageFin = plage ? Number(plage.split('-')[1] ?? plage.split('-')[0]) : null;

  const estSurligne = (numeroVerset: number) =>
    surlignageDebut !== null &&
    surlignageFin !== null &&
    Number(numeroVerset) >= surlignageDebut &&
    Number(numeroVerset) <= surlignageFin;

  // Le professeur peut cliquer un verset pour le surligner.
  const cliquerVerset = (numeroVerset: number) => {
    if (!estProfesseur) return;
    setVersetCourant(numeroVerset);
    const nouvellePlage = String(numeroVerset);
    setPlageLocale(nouvellePlage); // Mise à jour optimiste immédiate
    surSurlignage({
      numeroSourate: sourate,
      numeroVerset,
      plageSurlignage: nouvellePlage,
    });
  };

  const changerSourate = (s: number) => {
    if (!estProfesseur) return;
    setSourate(s);
    setVersetCourant(1);
    setPlageLocale(null); // Mise à jour optimiste
    surSurlignage({ numeroSourate: s, numeroVerset: 1, plageSurlignage: null });
  };

  const sourateCourante = sourates.find((s) => s.numero === sourate);

  return (
    <div className="carte flex flex-col h-full">
      {/* En-tête : sourate + rôle */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--bordure)' }}>
        <div className="flex items-center gap-3">
          {estProfesseur && !chargementSourates ? (
            <select
              className="champ !w-auto !py-1"
              value={sourate}
              onChange={(e) => changerSourate(Number(e.target.value))}
              aria-label="Choisir une sourate"
            >
              {sourates.map((s) => (
                <option key={s.numero} value={s.numero}>
                  {s.numero}. {s.nomSimple} — {s.nomArabe}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium">
              {chargementSourates
                ? 'Chargement…'
                : sourateCourante
                  ? `${sourateCourante.numero}. ${sourateCourante.nomSimple} — ${sourateCourante.nomArabe}`
                  : `Sourate ${sourate}`}
            </span>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={
            estProfesseur
              ? { backgroundColor: 'var(--primaire)', color: 'var(--ivoire-50)' }
              : { backgroundColor: 'var(--accent)', color: 'var(--ivoire-50)' }
          }
        >
          {estProfesseur ? 'Professeur' : 'Lecture seule'}
        </span>
      </div>

      {/* Texte coranique — RTL, police Amiri */}
      <div className="flex-1 overflow-y-auto">
        {chargementVersets ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-green-600 animate-spin" />
          </div>
        ) : versets.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: 'var(--texte-secondaire)' }}>
            Aucun verset disponible
          </p>
        ) : (
          <div className="coran text-xl leading-loose text-right">
            {versets.map((v) => (
              <span
                key={v.numero}
                onClick={() => cliquerVerset(v.numero)}
                className="inline px-1 py-0.5 rounded transition-colors"
                style={{
                  cursor: estProfesseur ? 'pointer' : 'default',
                  backgroundColor: estSurligne(v.numero)
                    ? '#fef08a' // Jaune surligneur classique, très visible
                    : 'transparent',
                }}
              >
                {v.texte}
                <sup
                  className="text-xs align-super mx-1"
                  style={{ color: 'var(--texte-secondaire)' }}
                >
                  {v.numero.toLocaleString('ar-EG')}
                </sup>
              </span>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
