import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Bloc from '../components/Bloc'
import { Badge, Carte, usePersistant } from '../components/ui'
import { aller, ICONES } from '../components/Layout'
import { CHECKLIST } from '../contenu'

function Checklist() {
  const [coches, setCoches] = usePersistant('exams.checklist', {})
  const total = CHECKLIST.reduce((n, p) => n + p.items.length, 0)
  const faits = Object.values(coches).filter(Boolean).length
  return (
    <Carte id="checklist" className="scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
        <div>
          <Badge ton="orange">Le jour J</Badge>
          <h3 className="mt-1 text-[17px] font-bold text-encre">Check-list pendant le TP noté</h3>
          <p className="text-sm text-discret">Coche au fur et à mesure (enregistré dans ce navigateur).</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-encre">{faits}/{total}</p>
          <button onClick={() => setCoches({})} className="pas-impression text-xs font-bold text-info hover:underline">Tout décocher</button>
        </div>
      </div>
      <div className="mx-6 mt-3 h-1.5 rounded-full bg-trait">
        <div className="h-1.5 rounded-full bg-ok transition-all" style={{ width: `${(100 * faits) / total}%` }} />
      </div>
      <div className="grid gap-x-8 gap-y-5 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
        {CHECKLIST.map((p) => (
          <div key={p.phase}>
            <p className="mb-2 text-sm font-bold text-encre">{p.phase}</p>
            {p.items.map((it) => {
              const cle = `${p.phase}|${it}`
              return (
                <label key={it} className="flex cursor-pointer items-start gap-2 py-1 text-sm text-encre-2">
                  <input type="checkbox" checked={!!coches[cle]} onChange={(e) => setCoches((c) => ({ ...c, [cle]: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[#4caf50]" />
                  <span className={coches[cle] ? 'text-discret line-through' : ''}>{it}</span>
                </label>
              )
            })}
          </div>
        ))}
      </div>
    </Carte>
  )
}

export default function PageBlocs({ page, ancre }) {
  const [maitrises] = usePersistant('exams.maitrises', {})
  const Icone = ICONES[page.icone]
  const faits = page.blocs.filter((b) => maitrises[b.id]).length
  return (
    <div className="flex flex-col gap-6">
      <Carte>
        <div className="flex flex-wrap items-start gap-4 p-6">
          <div className="degrade-sombre ombre-icone grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white">
            {page.court ? <span className="text-sm font-bold">{page.court}</span> : <Icone className="h-7 w-7" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {page.cours && <Badge ton="bleu">{page.cours}</Badge>}
              <span className="text-xs text-discret">{page.blocs.length} fiches · {faits} maîtrisée{faits > 1 ? 's' : ''}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-encre">{page.titre}</h2>
            <p className="mt-1 max-w-3xl text-[15px] text-encre-2">{page.intro}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-trait px-6 py-3">
          {page.route === 'methodo' && (
            <button onClick={() => aller(page.route, 'checklist')} className="rounded-full bg-attention/15 px-3 py-1 text-xs font-medium text-[#a35e00] hover:brightness-95">Check-list</button>
          )}
          {page.blocs.map((b) => (
            <button key={b.id} onClick={() => aller(page.route, b.id)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium hover:bg-trait ${maitrises[b.id] ? 'bg-ok/10 text-[#2e7d32]' : 'bg-fond text-encre-2'}`}>
              {maitrises[b.id] && <CheckCircleIcon className="h-3.5 w-3.5" />}
              {b.titre.length > 46 ? b.titre.slice(0, 44) + '…' : b.titre}
            </button>
          ))}
        </div>
      </Carte>
      {page.route === 'methodo' && <Checklist />}
      {page.blocs.map((b) => (
        <Bloc key={b.id} bloc={b} actif={ancre === b.id} />
      ))}
    </div>
  )
}
