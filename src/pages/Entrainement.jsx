import { useState } from 'react'
import { ArrowRightIcon, FlagIcon } from '@heroicons/react/24/solid'
import { SUJETS, pageDe } from '../contenu'
import { aller } from '../components/Layout'
import Texte from '../components/Texte'
import Code from '../components/Code'
import { Badge, Carte, Onglets } from '../components/ui'
import SORTIES from '../contenu/sorties.json'

function Sujet({ s, actif }) {
  const [vue, setVue] = useState('modele')
  const chap = pageDe(`c/${s.chapitre}`)
  return (
    <Carte id={s.id} className={`scroll-mt-6 ${actif ? 'cible-active' : ''}`}>
      <div className="px-6 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge ton={s.ton}>{s.famille}</Badge>
          <span className="text-xs text-discret">Sujet {s.id.slice(1)} · énoncé + corrigé dans « Sujets entraînement »</span>
        </div>
        <h3 className="mt-1 text-[17px] font-bold text-encre">{s.titre}</h3>
        <Texte className="mt-1">{s.contexte}</Texte>
      </div>
      <div className="px-6 pb-5">
        <Onglets
          className="mt-3"
          valeur={vue}
          onChange={setVue}
          options={[
            { valeur: 'modele', libelle: 'Modélisation' },
            { valeur: 'fonctions', libelle: 'Fonctions du corrigé' },
            { valeur: 'metriques', libelle: 'Métriques à produire' },
            { valeur: 'code', libelle: 'Extrait de code' },
          ]}
        />
        <div className="mt-4">
          {vue === 'modele' && <Texte>{s.modele}</Texte>}
          {vue === 'fonctions' && (
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {s.fonctions.map((f) => (
                <li key={f} className="rounded-md bg-fond px-3 py-1.5 font-mono text-xs text-encre-2">{f}</li>
              ))}
            </ul>
          )}
          {vue === 'metriques' && (
            <ul className="texte">
              {s.metriques.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {vue === 'code' && <Code code={s.code} sortie={SORTIES[`${s.id}:exemple:0`]} titre="extrait exécuté" />}
        </div>
        {chap && (
          <button onClick={() => aller(chap.route)} className="mt-4 flex items-center gap-1.5 text-sm font-bold text-info hover:underline">
            Revoir le chapitre « {chap.titre} » <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </Carte>
  )
}

export default function Entrainement({ page, ancre }) {
  return (
    <div className="flex flex-col gap-6">
      <Carte>
        <div className="flex flex-wrap items-start gap-4 p-6">
          <div className="degrade-sombre ombre-icone grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white">
            <FlagIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-encre">{page.titre}</h2>
            <p className="mt-1 max-w-3xl text-[15px] text-encre-2">{page.intro}</p>
            <p className="mt-2 text-sm text-discret">
              Méthode conseillée : ouvrir le sujet (non corrigé) dans Jupyter, se chronométrer 2 h 30 en binôme, puis comparer avec le corrigé et avec la check-list de la méthodo.
            </p>
          </div>
        </div>
      </Carte>
      <div className="grid gap-6 2xl:grid-cols-2">
        {SUJETS.map((s) => (
          <Sujet key={s.id} s={s} actif={ancre === s.id} />
        ))}
      </div>
    </div>
  )
}
