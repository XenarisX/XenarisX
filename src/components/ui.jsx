import { useEffect, useState } from 'react'

export function Carte({ className = '', children, ...props }) {
  return (
    <div className={`rounded-xl border border-trait bg-white ombre-carte ${className}`} {...props}>
      {children}
    </div>
  )
}

export function PiedCarte({ children, className = '' }) {
  return <div className={`border-t border-trait px-6 py-3.5 text-sm text-discret ${className}`}>{children}</div>
}

export function BoiteIcone({ icone: Icone, className = '', petite = false }) {
  return (
    <div className={`degrade-sombre ombre-icone grid shrink-0 place-items-center rounded-lg text-white ${petite ? 'h-9 w-9' : 'h-12 w-12'} ${className}`}>
      <Icone className={petite ? 'h-5 w-5' : 'h-6 w-6'} />
    </div>
  )
}

const TONS = {
  bleu: 'bg-info/10 text-[#1565c0]',
  vert: 'bg-ok/10 text-[#2e7d32]',
  orange: 'bg-attention/15 text-[#a35e00]',
  rouge: 'bg-alerte/10 text-[#c62828]',
  violet: 'bg-violet/10 text-[#7b1fa2]',
  neutre: 'bg-trait text-encre-2',
}

export function Badge({ ton = 'neutre', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${TONS[ton] ?? TONS.neutre} ${className}`}>
      {children}
    </span>
  )
}

export function Bouton({ variante = 'sombre', taille = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50'
  const tailles = { sm: 'px-3 py-1.5 text-[11px]', md: 'px-4 py-2.5 text-xs' }
  const variantes = {
    sombre: 'degrade-sombre text-white ombre-icone hover:brightness-125',
    contour: 'border border-trait-2 bg-white text-encre-2 hover:bg-fond',
    texte: 'text-encre-2 hover:bg-fond',
  }
  return (
    <button className={`${base} ${tailles[taille]} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Onglets({ valeur, onChange, options, className = '' }) {
  return (
    <div className={`inline-flex flex-wrap rounded-lg bg-fond p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o.valeur}
          onClick={() => onChange(o.valeur)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${valeur === o.valeur ? 'bg-white text-encre shadow-sm' : 'text-discret hover:text-encre'}`}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  )
}

/** Petit état persistant dans le navigateur (cases cochées, notions maîtrisées). */
export function usePersistant(cle, defaut) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(cle)
      return s ? JSON.parse(s) : defaut
    } catch {
      return defaut
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(cle, JSON.stringify(v))
    } catch {
      /* stockage indisponible */
    }
  }, [cle, v])
  return [v, setV]
}

export function TitreSection({ id, titre, sousTitre, icone }) {
  return (
    <div id={id} className="mb-4 mt-10 flex items-center gap-3 first:mt-0">
      {icone && <BoiteIcone icone={icone} petite />}
      <div>
        <h2 className="text-lg font-bold text-encre">{titre}</h2>
        {sousTitre && <p className="text-sm text-discret">{sousTitre}</p>}
      </div>
    </div>
  )
}
