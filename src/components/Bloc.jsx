import { useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon, LightBulbIcon, ExclamationTriangleIcon, CodeBracketIcon, ChartBarIcon, AcademicCapIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckVide } from '@heroicons/react/24/outline'
import Texte from './Texte'
import Code from './Code'
import { Badge, Carte, usePersistant } from './ui'
import { VISUELS } from '../visuels'
import SORTIES from '../contenu/sorties.json'
import FIGURES from '../contenu/figures.json'

/** Images réellement produites par matplotlib à l'exécution du code (public/assets/mpl). */
function Figures({ cle }) {
  const liste = FIGURES[cle]
  if (!liste?.length) return null
  return (
    <div className="mt-3 flex flex-col gap-3">
      {liste.map(([f, l, h]) => {
        const src = `${import.meta.env.BASE_URL}assets/mpl/${f}`
        return (
          <figure key={f} className="rounded-lg border border-trait bg-white p-2">
            <a href={src} target="_blank" rel="noreferrer" title="Ouvrir l’image en grand">
              <img src={src} width={l} height={h} alt="Figure produite par le code" loading="lazy" className="mx-auto h-auto w-full" style={{ maxWidth: Math.round(l * 0.8) }} />
            </a>
            <figcaption className="mt-1 text-center text-[11px] text-discret">Rendu matplotlib réel de ce code · cliquer pour agrandir</figcaption>
          </figure>
        )
      })}
    </div>
  )
}

const GENRES = {
  notion: { libelle: 'Notion', ton: 'bleu', icone: AcademicCapIcon },
  code: { libelle: 'Code', ton: 'violet', icone: CodeBracketIcon },
  metrique: { libelle: 'Métrique', ton: 'vert', icone: ChartBarIcon },
  piege: { libelle: 'Piège', ton: 'rouge', icone: ExclamationTriangleIcon },
  methode: { libelle: 'Méthode', ton: 'orange', icone: LightBulbIcon },
  question: { libelle: 'Question type', ton: 'neutre', icone: QuestionMarkCircleIcon },
}

/**
 * Une fiche : explication → exemple (code + sortie) → visuel → « Plus d'explications ».
 */
export default function Bloc({ bloc, actif }) {
  const [ouvert, setOuvert] = useState(false)
  const [maitrises, setMaitrises] = usePersistant('exams.maitrises', {})
  const g = GENRES[bloc.genre] ?? GENRES.notion
  const Visuel = bloc.visuel ? VISUELS[bloc.visuel] : null
  const fait = !!maitrises[bloc.id]
  return (
    <Carte id={bloc.id} className={`scroll-mt-6 ${actif ? 'cible-active' : ''}`}>
      <div className="flex flex-wrap items-start gap-3 px-6 pt-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge ton={g.ton}>
              <g.icone className="h-3 w-3" /> {g.libelle}
            </Badge>
            {bloc.source && <span className="text-xs text-discret">{bloc.source}</span>}
          </div>
          <h3 className="text-[17px] font-bold text-encre">{bloc.titre}</h3>
        </div>
        <button
          onClick={() => setMaitrises((m) => ({ ...m, [bloc.id]: !fait }))}
          className={`pas-impression flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${fait ? 'bg-ok/10 text-[#2e7d32]' : 'text-discret hover:bg-fond'}`}
          title="Marquer comme maîtrisé"
        >
          {fait ? <CheckCircleIcon className="h-4 w-4" /> : <CheckVide className="h-4 w-4" />}
          {fait ? 'Maîtrisé' : 'À revoir'}
        </button>
      </div>

      <div className="px-6 pb-5">
        {bloc.explication && (
          <div className="mt-2">
            <Texte>{bloc.explication}</Texte>
          </div>
        )}

        {bloc.exemple && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-discret">{bloc.exemple.libelle ?? 'Exemple'}</p>
            {bloc.exemple.texte && <Texte className="mb-2">{bloc.exemple.texte}</Texte>}
            {bloc.exemple.code && <Code code={bloc.exemple.code} sortie={SORTIES[`${bloc.id}:exemple:0`] ?? bloc.exemple.sortie} titre={bloc.exemple.titre} langage={bloc.exemple.langage} />}
            <Figures cle={`${bloc.id}:exemple:0`} />
          </div>
        )}

        {Visuel && (
          <div className="mt-5 rounded-lg border border-trait p-4">
            <Visuel />
          </div>
        )}

        {bloc.codes?.map((c, i) => (
          <div key={i} className="mt-4">
            {c.texte && <Texte className="mb-2">{c.texte}</Texte>}
            <Code code={c.code} sortie={SORTIES[`${bloc.id}:codes:${i}`] ?? c.sortie} titre={c.titre} />
            <Figures cle={`${bloc.id}:codes:${i}`} />
          </div>
        ))}

        {bloc.plus && (
          <div className="mt-4">
            <button onClick={() => setOuvert((o) => !o)} className="pas-impression flex items-center gap-1.5 text-sm font-bold text-info hover:underline">
              <ChevronDownIcon className={`h-4 w-4 transition ${ouvert ? 'rotate-180' : ''}`} />
              {ouvert ? 'Moins d’explications' : 'Plus d’explications'}
            </button>
            {ouvert && (
              <div className="mt-3 rounded-lg border-l-4 border-info bg-info/5 px-4 py-2">
                <Texte>{bloc.plus}</Texte>
              </div>
            )}
          </div>
        )}
      </div>
    </Carte>
  )
}
