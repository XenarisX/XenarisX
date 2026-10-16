import { useMemo } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts'
import { AcademicCapIcon, BeakerIcon, ChartBarIcon, ClockIcon, CodeBracketSquareIcon, CheckBadgeIcon, PlayIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { CHAPITRES, NB_CODES, NB_FICHES, NB_VISUELS, PAGES } from '../contenu'
import { blocs as methodo } from '../contenu/methodo'
import D from '../contenu/donnees.json'
import { aller } from '../components/Layout'
import Texte from '../components/Texte'
import { Badge, BoiteIcone, Carte, PiedCarte, usePersistant } from '../components/ui'

const axe = { stroke: '#90a4ae', fontSize: 11, tickLine: false, axisLine: false }

function Stat({ icone, libelle, valeur, pied }) {
  return (
    <Carte>
      <div className="flex items-start justify-between gap-4 p-4">
        <BoiteIcone icone={icone} />
        <div className="text-right">
          <p className="text-sm text-encre-2">{libelle}</p>
          <p className="text-2xl font-bold tabular-nums text-encre">{valeur}</p>
        </div>
      </div>
      <PiedCarte className="!px-4">{pied}</PiedCarte>
    </Carte>
  )
}

function CarteGraphe({ titre, sousTitre, pied, lien, children }) {
  return (
    <Carte className="cursor-pointer transition hover:shadow-md" onClick={() => aller(...lien)}>
      <div className="h-[220px] px-3 pt-5">{children}</div>
      <div className="px-6 pb-4 pt-3">
        <h3 className="font-bold text-encre">{titre}</h3>
        <p className="text-sm text-discret">{sousTitre}</p>
      </div>
      <PiedCarte>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" /> {pied}
        </span>
      </PiedCarte>
    </Carte>
  )
}

const PLAN = [
  { t: '0:00', titre: 'Lire, reformuler, reconnaître la famille', d: 'markdown de modélisation' },
  { t: '0:15', titre: 'Baseline + 2 indicateurs mesurés', d: '1000 essais, graine fixée' },
  { t: '0:35', titre: 'Algorithme v1 puis v2', d: 'même signature, assert' },
  { t: '1:30', titre: 'Stop au codage : simulations et graphes', d: 'courbe, grille 2D, robustesse' },
  { t: '2:15', titre: 'Tableau comparatif + recommandation', d: 'puis Restart & Run All' },
]

export default function Accueil() {
  const [maitrises] = usePersistant('exams.maitrises', {})
  const toutes = PAGES.flatMap((p) => p.blocs ?? [])
  const faits = toutes.filter((b) => maitrises[b.id]).length
  const pct = Math.round((100 * faits) / toutes.length)
  const reconnaitre = methodo.find((b) => b.id === 'm-reconnaitre')
  const selkow = useMemo(() => D.selkow.filter((r) => r.n >= 3), [])

  return (
    <div>
      {/* Bandeau */}
      <Carte className="mb-8 overflow-hidden">
        <div className="degrade-sombre flex flex-col gap-5 px-6 py-7 text-white lg:flex-row lg:items-center">
          <div className="min-w-0 lg:flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">R5.A.12 · Modélisations mathématiques</p>
            <h2 className="mt-1 text-2xl font-bold">Préparer le TP noté en binôme</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Méthode pas à pas, code prêt à coller pour toutes les métriques, chaque chapitre du cours avec explication, exemple exécuté et « plus d’explications », le TP noté 2024 corrigé et six sujets d’entraînement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => aller('methodo')} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-encre hover:bg-trait">
              <PlayIcon className="h-4 w-4" /> Commencer par la méthodo
            </button>
            <button onClick={() => aller('tp2024', 't-simulateur')} className="flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10">
              <BoltIcon className="h-4 w-4" /> Simulateur 2024
            </button>
          </div>
        </div>
      </Carte>

      <div className="mb-10 grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
        <Stat icone={AcademicCapIcon} libelle="Fiches" valeur={NB_FICHES} pied={<><b className="text-ok">{faits}</b> marquées « maîtrisé »</>} />
        <Stat icone={CodeBracketSquareIcon} libelle="Blocs de code" valeur={NB_CODES} pied={<><b className="text-ok">100 %</b> exécutés, sorties réelles</>} />
        <Stat icone={ChartBarIcon} libelle="Visuels" valeur={NB_VISUELS} pied={<><b className="text-ok">mesurés</b> avec le code du cours</>} />
        <Stat icone={CheckBadgeIcon} libelle="Progression" valeur={`${pct} %`} pied={<><b className={pct >= 80 ? 'text-ok' : 'text-attention'}>{toutes.length - faits}</b> fiches à revoir</>} />
      </div>

      <div className="mb-10 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        <CarteGraphe titre="Arrêt optimal : choix de q" sousTitre="Rang moyen selon la part explorée (n = 30)" pied="20 000 simulations par point" lien={['tp2024', 't-v1']}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={D.secretaire_q} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="q" {...axe} />
              <YAxis {...axe} />
              <Tooltip formatter={(v) => [v, 'rang moyen']} labelFormatter={(l) => `q = ${l}`} />
              <Bar dataKey="rang" fill="#4caf50" radius={[6, 6, 6, 6]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </CarteGraphe>
        <CarteGraphe titre="Équité : Gale-Shapley vs Selkow" sousTitre="Regret maximal moyen selon n" pied="120 essais par point" lien={['c/selkow', 'sk-mesures']}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selkow} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
              <XAxis dataKey="n" {...axe} />
              <YAxis {...axe} />
              <Tooltip />
              <Line dataKey="gs" name="GS" stroke="#2196f3" strokeWidth={3} dot={{ r: 3.5, fill: '#2196f3', strokeWidth: 0 }} />
              <Line dataKey="selkow" name="Selkow" stroke="#4caf50" strokeWidth={3} dot={{ r: 3.5, fill: '#4caf50', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CarteGraphe>
        <CarteGraphe titre="Puissances itérées" sousTitre="λ estimé → 4 pour [[1, 6], [1, 2]]" pied="convergence en (1/4)^k" lien={['c/valeurs-propres', 'vp-puissance']}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={D.puissances.slice(0, 14)} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
              <XAxis dataKey="k" {...axe} />
              <YAxis {...axe} domain={[0, 'auto']} />
              <Tooltip />
              <Line dataKey="lambda" name="λ estimé" stroke="#2196f3" strokeWidth={3} dot={{ r: 3.5, fill: '#2196f3', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </CarteGraphe>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <Carte className="overflow-hidden xl:col-span-2">
          <div className="p-6">
            <h3 className="font-bold text-encre">Chapitres du cours</h3>
            <p className="mt-1 text-sm text-discret">Clique pour ouvrir ; la barre suit les fiches marquées « maîtrisé ».</p>
          </div>
          <div className="defilement overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  {['Chapitre', 'Cours', 'Fiches', 'Maîtrise'].map((t) => (
                    <th key={t} className="border-b border-trait px-6 py-3 text-left text-[11px] font-medium uppercase text-discret">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...CHAPITRES.map((c) => ({ route: `c/${c.id}`, court: c.court, titre: c.titre, cours: c.cours, blocs: c.blocs })), ...PAGES.filter((p) => ['methodo', 'metriques', 'tp2024'].includes(p.route)).map((p) => ({ ...p, court: p.route === 'tp2024' ? '2024' : p.route === 'methodo' ? 'M' : 'Σ' }))].map((c) => {
                  const f = c.blocs.filter((b) => maitrises[b.id]).length
                  const p = Math.round((100 * f) / c.blocs.length)
                  return (
                    <tr key={c.route} className="cursor-pointer hover:bg-fond/60" onClick={() => aller(c.route)}>
                      <td className="border-b border-trait px-6 py-3">
                        <div className="flex items-center gap-4">
                          <span className="degrade-sombre grid h-9 min-w-11 place-items-center rounded-lg px-1 text-[11px] font-bold text-white">{c.court}</span>
                          <span className="text-sm font-bold text-encre">{c.titre}</span>
                        </div>
                      </td>
                      <td className="border-b border-trait px-6 py-3 text-xs text-encre-2">{c.cours ?? '–'}</td>
                      <td className="border-b border-trait px-6 py-3 text-xs font-medium tabular-nums text-encre-2">{c.blocs.length}</td>
                      <td className="w-44 border-b border-trait px-6 py-3">
                        <p className="mb-1 text-xs font-medium text-encre-2">{p} %</p>
                        <div className="h-1 rounded-full bg-trait">
                          <div className={`h-1 rounded-full ${p === 100 ? 'bg-ok' : 'bg-info'}`} style={{ width: `${Math.max(p, 2)}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Carte>

        <Carte>
          <div className="p-6">
            <h3 className="font-bold text-encre">Plan de bataille (2 h 30)</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-discret">
              <BeakerIcon className="h-4 w-4 text-ok" /> à 1 h 30 on <b className="text-encre-2">analyse</b>, on ne code plus
            </p>
          </div>
          <div className="px-6 pb-6">
            {PLAN.map((p, i) => (
              <div key={p.t} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="degrade-sombre grid h-7 w-12 place-items-center rounded-md text-[11px] font-bold text-white">{p.t}</span>
                  {i < PLAN.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-trait" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-medium text-encre">{p.titre}</p>
                  <p className="text-xs font-medium text-discret">{p.d}</p>
                </div>
              </div>
            ))}
            <button onClick={() => aller('methodo', 'checklist')} className="flex items-center gap-1.5 text-sm font-bold text-info hover:underline">
              Ouvrir la check-list <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </Carte>
      </div>

      <Carte className="mb-4">
        <div className="px-6 pt-5">
          <Badge ton="orange">Réflexe n°1</Badge>
          <h3 className="mt-1 text-[17px] font-bold text-encre">Reconnaître la famille du problème</h3>
        </div>
        <div className="px-6 pb-5">
          <Texte>{reconnaitre.explication}</Texte>
        </div>
      </Carte>
    </div>
  )
}
