'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiClient, ErreurApi } from '@/lib/api-client';
import type { ProfilProfesseur, Qiraat } from '@/lib/types';

const SI = {
  background: '#FFFFFF',
  border: '1px solid var(--bordure)',
  color: 'var(--texte)',
};

function Champ({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="etiquette !text-[11px]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProfilProfesseurForm() {
  const [profil, setProfil] = useState<ProfilProfesseur | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [ijazaUrl, setIjazaUrl] = useState('');
  const [tarifHoraire, setTarifHoraire] = useState(0);
  const [qiraatParDefaut, setQiraatParDefaut] = useState<Qiraat>('HAFS');
  const [audioUrl, setAudioUrl] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [enChargement, setEnChargement] = useState(true);

  useEffect(() => {
    apiClient
      .get<ProfilProfesseur>('/utilisateurs/professeurs/moi')
      .then((p) => {
        setProfil(p);
        setPhotoUrl(p.photoUrl ?? '');
        setBio(p.bio ?? '');
        setIjazaUrl(p.ijazaUrl ?? '');
        setTarifHoraire(p.tarifHoraire);
        setQiraatParDefaut(p.qiraatParDefaut);
        setAudioUrl(p.audioUrl ?? '');
      })
      .catch(() => undefined)
      .finally(() => setEnChargement(false));
  }, []);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnEnvoi(true);
    try {
      const maj = await apiClient.patch<ProfilProfesseur>('/utilisateurs/professeurs/moi', {
        bio: bio || undefined,
        photoUrl: photoUrl || undefined,
        ijazaUrl: ijazaUrl || undefined,
        audioUrl: audioUrl || undefined,
        tarifHoraire,
        qiraatParDefaut,
      });
      setProfil(maj);
      setSucces('Profil mis à jour avec succès.');
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : 'Échec de la mise à jour');
    } finally {
      setEnEnvoi(false);
    }
  };

  if (enChargement) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--primaire)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="h-full flex flex-col max-w-3xl mx-auto w-full">
      {/* En-tête */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--texte)' }}>Mon profil professeur</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--texte-secondaire)' }}>
            Ces informations sont visibles par les élèves sur votre fiche.
          </p>
        </div>
        {profil && (
          <span
            className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ml-4"
            style={{
              background: profil.valide ? 'rgba(22,163,74,0.08)' : 'rgba(184,146,58,0.1)',
              color: profil.valide ? '#16A34A' : '#92751F',
              border: `1px solid ${profil.valide ? 'rgba(22,163,74,0.2)' : 'rgba(184,146,58,0.2)'}`,
            }}
          >
            {profil.valide ? '✅ Vérifié' : '⏳ En validation'}
          </span>
        )}
      </div>

      {/* Corps : 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Colonne gauche */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#B8923A' }}>
            Identité &amp; Justificatifs
          </p>
          <Champ id="photoUrl" label="URL de votre photo">
            <input
              id="photoUrl" type="url"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={SI}
              placeholder="https://exemples.com/photo.jpg"
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </Champ>
          <Champ id="bio" label="Biographie professionnelle">
            <textarea
              id="bio"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none" style={SI}
              rows={4} maxLength={2000}
              placeholder="Hafiz certifié Ijaza, spécialisé en Tajwid..."
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={bio} onChange={(e) => setBio(e.target.value)}
            />
          </Champ>
          <Champ id="ijazaUrl" label="URL du diplôme d'Ijaza">
            <input
              id="ijazaUrl" type="url"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={SI}
              placeholder="https://exemples.com/ijaza.pdf"
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={ijazaUrl} onChange={(e) => setIjazaUrl(e.target.value)}
            />
          </Champ>
        </div>

        {/* Colonne droite */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#B8923A' }}>
            Enseignement &amp; Tarification
          </p>
          <Champ id="tarif" label="Tarif horaire (FCFA/h)">
            <input
              id="tarif" type="number" min={0} step={500}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={SI}
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={tarifHoraire} onChange={(e) => setTarifHoraire(Number(e.target.value))}
            />
          </Champ>
          <Champ id="qiraat" label="Lecture (Qiraat) enseignée">
            <select
              id="qiraat"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={SI}
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={qiraatParDefaut} onChange={(e) => setQiraatParDefaut(e.target.value as Qiraat)}
            >
              <option value="HAFS">Hafs (Standard)</option>
              <option value="WARSH">Warsh (Afrique du Nord/Ouest)</option>
            </select>
          </Champ>
          <Champ id="audioUrl" label="URL audio de récitation (MP3)">
            <input
              id="audioUrl" type="url"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={SI}
              placeholder="https://exemples.com/recitation.mp3"
              onFocus={(e) => (e.currentTarget.style.border = '1px solid var(--primaire)')}
              onBlur={(e) => (e.currentTarget.style.border = '1px solid var(--bordure)')}
              value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)}
            />
          </Champ>
          {audioUrl && <audio controls src={audioUrl} className="w-full h-9 mt-1" />}
        </div>
      </div>

      {/* Retours + bouton */}
      <div className="mt-4 space-y-2">
        {erreur && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            ⚠️ {erreur}
          </p>
        )}
        {succes && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#16A34A', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)' }}>
            ✅ {succes}
          </p>
        )}
        <button
          type="submit" disabled={enEnvoi}
          className="btn-primaire w-full !py-3"
        >
          {enEnvoi ? 'Enregistrement…' : 'Enregistrer le profil'}
        </button>
      </div>
    </form>
  );
}
