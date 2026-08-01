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
      <label htmlFor={id} className="etiquette !text-[11px] sm:!text-xs mb-1 block">
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

  const [enUpload, setEnUpload] = useState(false);

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

  const gererUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErreur("L'image est trop volumineuse (maximum 3 Mo).");
      return;
    }

    setErreur(null);
    setEnUpload(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const rep = await fetch('/api-backend/fichiers/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!rep.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await rep.json();
      setPhotoUrl(data.url);
      setSucces("Photo importée avec succès. N'oubliez pas d'enregistrer.");
      setTimeout(() => setSucces(null), 3000);
    } catch (err) {
      setErreur("L'importation de la photo a échoué.");
    } finally {
      setEnUpload(false);
    }
  };

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
      <div className="flex justify-center items-center h-full min-h-[200px]">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--primaire)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col max-w-3xl mx-auto w-full pb-8 gap-4 sm:gap-6">
      {/* En-tête */}
      <div 
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6 border border-[#E5E0D5] shrink-0 shadow-sm"
        style={{
          backgroundImage: 'url("/mascotte/image_fond_avant_footer.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#FDFBF6'
        }}
      >
        <div className="absolute inset-0 bg-white/70 sm:bg-white/60 backdrop-blur-[2px] z-0"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Mon profil professeur</h1>
            <p className="text-xs sm:text-sm mt-1 text-[#6B7280]">
              Ces informations sont visibles par les étudiants sur votre fiche.
            </p>
          </div>
          {profil && (
            <span
              className="text-xs sm:text-[13px] font-semibold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shrink-0 flex items-center gap-1.5 bg-white shadow-sm"
              style={{
                color: profil.valide ? '#0B5E45' : '#92751F',
                border: `1px solid ${profil.valide ? 'rgba(11,94,69,0.3)' : 'rgba(184,146,58,0.3)'}`,
              }}
            >
              {profil.valide ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0B5E45" stroke="#0B5E45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                    <path stroke="#FFF" d="m9 12 2 2 4-4"/>
                  </svg>
                  Vérifié
                </>
              ) : '⏳ En validation'}
            </span>
          )}
        </div>
      </div>

      {/* Corps : 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        {/* Colonne gauche */}
        <div className="rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: '#B8923A' }}>
            Identité &amp; Justificatifs
          </p>
          <Champ id="photoUpload" label="Photo de profil (max 3 Mo)">
            <div className="flex items-center gap-4">
              {photoUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border shadow-sm">
                  <img src={photoUrl.startsWith('/') ? `/api-backend${photoUrl}` : photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                id="photoUpload" type="file" accept="image/png, image/jpeg, image/webp"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#E8F5EF] file:text-[#0B5E45] hover:file:bg-[#D1EAE0]"
                onChange={gererUploadPhoto}
                disabled={enUpload}
              />
            </div>
            {enUpload && <p className="text-xs text-[#0B5E45] mt-1">Importation en cours...</p>}
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
        <div className="rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm" style={{ background: '#FFFFFF', border: '1px solid var(--bordure)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: '#B8923A' }}>
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
      <div className="space-y-2 mt-2 shrink-0">
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
          className="btn-primaire w-full !py-3 font-semibold shadow-sm"
        >
          {enEnvoi ? 'Enregistrement…' : 'Enregistrer le profil'}
        </button>
      </div>
    </form>
  );
}
