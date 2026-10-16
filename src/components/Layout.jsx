import { useEffect, useMemo, useRef, useState } from 'react'
import {
  HomeIcon, MapIcon, ChartBarIcon, BookOpenIcon, TrophyIcon, FlagIcon, CodeBracketIcon, ExclamationTriangleIcon,
  Bars3Icon, XMarkIcon, MagnifyingGlassIcon, PrinterIcon,
} from '@heroicons/react/24/solid'
import { PAGES, pageDe, rechercher } from '../contenu'
import { usePersistant } from './ui'

export const ICONES = { home: HomeIcon, map: MapIcon, chart: ChartBarIcon, book: BookOpenIcon, trophy: TrophyIcon, flag: FlagIcon, code: CodeBracketIcon, warning: ExclamationTriangleIcon }

export const aller = (route, ancre) => {
  window.location.hash = `/${route}${ancre ? '/' + ancre : ''}`
}

/** #/c/flots/fl-coupe -> { route: 'c/flots', ancre: 'fl-coupe' } */
export function lireRoute() {
  const parties = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parties[0] === 'c') return { route: `c/${parties[1] ?? ''}`, ancre: parties[2] ?? null }
  return { route: parties[0] ?? 'accueil', ancre: parties[1] ?? null }
}

export function Sidebar({ route, ouverte, onFermer }) {
  const [maitrises] = usePersistant('exams.maitrises', {})
  const groupes = [...new Set(PAGES.map((p) => p.groupe))]
  return (
    <>
      {ouverte && <div className="fixed inset-0 z-40 bg-encre/30 xl:hidden" onClick={onFermer} />}
      <aside className={`fixed inset-y-0 left-0 z-50 my-4 ml-4 flex w-72 flex-col rounded-xl border border-trait bg-white transition-transform duration-300 xl:translate-x-0 ${ouverte ? 'translate-x-0' : '-translate-x-80'}`}>
        <div className="relative px-6 py-5">
          <button onClick={() => { aller('accueil'); onFermer() }} className="flex items-center gap-2.5">
            <span className="degrade-sombre grid h-8 w-8 place-items-center rounded-md text-[11px] font-bold text-white">R5</span>
            <span className="text-left">
              <span className="block text-[15px] font-bold leading-tight text-encre">Prépa TP noté</span>
              <span className="block text-xs text-discret">R5.A.12 Modélisations</span>
            </span>
          </button>
          <button onClick={onFermer} className="absolute right-3 top-5 rounded-md p-1 text-discret hover:bg-fond xl:hidden" aria-label="Fermer le menu">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="defilement flex-1 overflow-y-auto px-4 pb-4">
          {groupes.map((g) => (
            <div key={g} className="mb-3">
              <p className="mx-3 mb-1.5 mt-2 text-xs font-bold uppercase tracking-wide text-encre-2">{g}</p>
              {PAGES.filter((p) => p.groupe === g).map((p) => {
                const actif = route === p.route
                const Icone = ICONES[p.icone]
                const total = p.blocs?.length ?? 0
                const faits = (p.blocs ?? []).filter((b) => maitrises[b.id]).length
                return (
                  <button
                    key={p.route}
                    onClick={() => { aller(p.route); onFermer() }}
                    className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium transition ${actif ? 'degrade-sombre ombre-icone text-white' : 'text-encre-2 hover:bg-fond'}`}
                  >
                    {p.court ? (
                      <span className={`grid h-5 min-w-5 place-items-center rounded px-1 text-[9px] font-bold ${actif ? 'bg-white/20 text-white' : 'bg-trait text-encre-2'}`}>{p.court}</span>
                    ) : (
                      <Icone className={`h-5 w-5 shrink-0 ${actif ? 'text-white' : 'text-discret'}`} />
                    )}
                    <span className="flex-1 leading-snug">{p.titre}</span>
                    {total > 0 && <span className={`text-[10px] tabular-nums ${actif ? 'text-white/70' : faits === total ? 'text-ok' : 'text-discret'}`}>{faits}/{total}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="mx-4 mb-4 rounded-lg bg-fond px-4 py-3 text-xs text-discret">
          IUT de Vannes · BUT Informatique
          <br />
          <span className="text-encre-2">Ctrl + K : recherche globale</span>
        </div>
      </aside>
    </>
  )
}

export function Navbar({ route, onMenu, onRecherche }) {
  const page = pageDe(route)
  return (
    <header className="flex flex-col-reverse justify-between gap-3 py-1 md:flex-row md:items-center">
      <div>
        <nav className="flex items-center gap-2 text-sm">
          <button onClick={() => aller('accueil')} className="text-discret hover:text-encre">Accueil</button>
          {page && route !== 'accueil' && (
            <>
              <span className="text-discret">/</span>
              <span className="text-discret">{page.groupe}</span>
              <span className="text-discret">/</span>
              <span className="text-encre">{page.court ?? page.titre}</span>
            </>
          )}
        </nav>
        <h1 className="mt-1 text-base font-bold text-encre">{page?.titre ?? 'Tableau de bord'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRecherche} className="mr-auto flex w-full items-center gap-2 rounded-lg border border-trait-2 bg-white px-3 py-2 text-sm text-discret hover:border-encre-2 md:mr-2 md:w-72">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span className="flex-1 text-left">Rechercher partout…</span>
          <kbd className="rounded border border-trait-2 px-1.5 text-[10px] font-bold">Ctrl K</kbd>
        </button>
        <button onClick={() => window.print()} className="pas-impression rounded-lg p-2 text-discret hover:bg-white" title="Imprimer la page" aria-label="Imprimer">
          <PrinterIcon className="h-5 w-5" />
        </button>
        <button onClick={onMenu} className="rounded-lg p-2 text-encre-2 hover:bg-white xl:hidden" aria-label="Menu">
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

function Surligne({ texte, mots }) {
  if (!mots.length) return texte
  const sa = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const n = sa(texte)
  const parties = []
  let i = 0
  while (i < texte.length) {
    let trouve = -1
    let lg = 0
    for (const m of mots) {
      const j = n.indexOf(m, i)
      if (j !== -1 && (trouve === -1 || j < trouve)) {
        trouve = j
        lg = m.length
      }
    }
    if (trouve === -1) {
      parties.push(texte.slice(i))
      break
    }
    if (trouve > i) parties.push(texte.slice(i, trouve))
    parties.push(<mark key={trouve} className="surligne">{texte.slice(trouve, trouve + lg)}</mark>)
    i = trouve + lg
  }
  return parties
}

export function Recherche({ ouverte, onFermer }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const champ = useRef(null)
  const res = useMemo(() => rechercher(q), [q])
  const mots = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/\s+/).filter((m) => m.length > 1)
  useEffect(() => {
    if (ouverte) setTimeout(() => champ.current?.focus(), 30)
  }, [ouverte])
  useEffect(() => setSel(0), [q])
  if (!ouverte) return null
  const ouvrir = (r) => {
    aller(r.route, r.ancre)
    onFermer()
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-encre/40 p-4 pt-[10vh]" onMouseDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-trait px-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-discret" />
          <input
            ref={champ}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onFermer()
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, res.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
              if (e.key === 'Enter' && res[sel]) ouvrir(res[sel])
            }}
            placeholder="ex. unravel_index, coupe minimale, Fiedler, regret, deepcopy…"
            className="flex-1 py-4 text-[15px] text-encre outline-none placeholder:text-discret"
          />
          <kbd className="rounded border border-trait-2 px-1.5 text-[10px] font-bold text-discret">Échap</kbd>
        </div>
        <div className="defilement max-h-[60vh] overflow-y-auto">
          {q && !res.length && <p className="px-5 py-8 text-center text-sm text-discret">Aucun résultat pour « {q} ».</p>}
          {!q && (
            <div className="px-5 py-5 text-sm text-discret">
              <p className="mb-2">Recherche dans toutes les fiches, explications, « plus d’explications » et tout le code.</p>
              <div className="flex flex-wrap gap-2">
                {['meshgrid', 'coupe min', 'Fiedler', 'regret max', 'deepcopy', 'argsort', 'dernier jour', 'Leslie', 'hopcroft'].map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full bg-fond px-3 py-1 text-xs font-medium text-encre-2 hover:bg-trait">{s}</button>
                ))}
              </div>
            </div>
          )}
          {res.map((r, i) => (
            <button key={`${r.route}-${r.ancre}`} onClick={() => ouvrir(r)} onMouseEnter={() => setSel(i)} className={`block w-full border-b border-trait px-5 py-3 text-left ${i === sel ? 'bg-fond' : ''}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-discret">{r.page}</p>
              <p className="font-medium text-encre"><Surligne texte={r.titre} mots={mots} /></p>
              <p className="mt-0.5 line-clamp-2 text-xs text-encre-2"><Surligne texte={r.extrait} mots={mots} /></p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
