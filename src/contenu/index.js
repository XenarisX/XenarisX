import { blocs as methodo, CHECKLIST } from './methodo'
import { blocs as metriques } from './metriques'
import { blocs as tp2024 } from './tp2024'
import { blocs as python } from './python'
import { blocs as pieges } from './pieges'
import { blocs as matplotlib } from './matplotlib'
import { CHAPITRES } from './chapitres'
import { SUJETS } from './entrainement'

export { CHECKLIST, CHAPITRES, SUJETS }

/** Toutes les pages du site, dans l'ordre de la barre latérale. */
export const PAGES = [
  { route: 'accueil', groupe: 'Préparer', titre: 'Tableau de bord', icone: 'home' },
  { route: 'methodo', groupe: 'Préparer', titre: 'Méthodo du TP noté', icone: 'map', blocs: methodo, intro: 'La démarche pas à pas pour réussir un TP noté de modélisation en binôme : du sujet au notebook rendu.' },
  { route: 'metriques', groupe: 'Préparer', titre: 'Boîte à outils métriques', icone: 'chart', blocs: metriques, intro: 'Le code prêt à coller pour mesurer, comparer et représenter n’importe quelle stratégie : banc d’essai, indicateurs, balayage, grille 2D, robustesse, complexité, incertitude.' },
  ...CHAPITRES.map((c) => ({ route: `c/${c.id}`, groupe: 'Cours', titre: c.titre, court: c.court, icone: 'book', blocs: c.blocs, intro: c.resume, cours: c.cours })),
  { route: 'tp2024', groupe: 'Entraînement', titre: 'TP noté 2024 corrigé', icone: 'trophy', blocs: tp2024, intro: 'Affectations ParcourSup (problème du secrétaire) : le sujet, le corrigé commenté et ses bugs, une solution complète et toutes les métriques en graphiques.', cours: 'Évaluation 2024' },
  { route: 'entrainement', groupe: 'Entraînement', titre: 'Sujets d’entraînement', icone: 'flag', intro: 'Les six sujets du dossier, un par famille du cours : contexte, modélisation, fonctions du corrigé, métriques attendues et un extrait de code.' },
  { route: 'matplotlib', groupe: 'Mémo', titre: 'Graphiques matplotlib', icone: 'paint', blocs: matplotlib, intro: 'Tout pour faire des graphiques qui rapportent des points : choisir le bon type, l’interface fig/ax, styles, sous-graphiques, double axe, échelles log, histogrammes, barres d’erreur, boîtes à moustaches, cartes de chaleur, contours et 3D, clustering, matrices, réseaux de flots, annotations et pièges. Chaque exemple a été exécuté : l’image affichée est celle produite par le code.' },
  { route: 'python', groupe: 'Mémo', titre: 'Aide-mémoire Python', icone: 'code', blocs: python, intro: 'Les fonctions Python, numpy, networkx et matplotlib des TP, avec une explication, un exemple exécuté et les pièges.' },
  { route: 'pieges', groupe: 'Mémo', titre: 'Pièges & erreurs', icone: 'warning', blocs: pieges, intro: 'Les erreurs qui coûtent des points : messages Python, erreurs de logique silencieuses, pièges du rendu.' },
]

export const pageDe = (route) => PAGES.find((p) => p.route === route)

/** Index de recherche : une entrée par fiche (titre, texte, code), plus les sujets d'entraînement. */
export const INDEX = [
  ...PAGES.flatMap((p) =>
    (p.blocs ?? []).map((b) => ({
      route: p.route,
      ancre: b.id,
      page: p.titre,
      titre: b.titre,
      genre: b.genre,
      texte: [b.explication, b.plus, b.exemple?.texte].filter(Boolean).join('\n'),
      code: [b.exemple?.code, ...(b.codes ?? []).map((c) => c.code)].filter(Boolean).join('\n'),
    })),
  ),
  ...SUJETS.map((s) => ({
    route: 'entrainement',
    ancre: s.id,
    page: 'Sujets d’entraînement',
    titre: s.titre,
    genre: 'question',
    texte: [s.famille, s.contexte, s.modele, s.metriques.join(', '), s.fonctions.join(', ')].join('\n'),
    code: s.code,
  })),
]

const sansAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const PRE = INDEX.map((e) => ({ ...e, _t: sansAccents(e.titre), _x: sansAccents(e.texte), _c: sansAccents(e.code) }))

/** Recherche plein texte (insensible aux accents) avec score : titre > texte > code. */
export function rechercher(requete, max = 30) {
  const mots = sansAccents(requete).split(/\s+/).filter((m) => m.length > 1)
  if (!mots.length) return []
  const res = []
  for (const e of PRE) {
    let score = 0
    let ok = true
    for (const m of mots) {
      const s = (e._t.includes(m) ? 10 : 0) + (e._x.includes(m) ? 3 : 0) + (e._c.includes(m) ? 1 : 0)
      if (!s) {
        ok = false
        break
      }
      score += s
    }
    if (ok) res.push({ ...e, score, extrait: extrait(e, mots) })
  }
  return res.sort((a, b) => b.score - a.score).slice(0, max)
}

function extrait(e, mots) {
  for (const [brut, norm] of [
    [e.texte, e._x],
    [e.code, e._c],
  ]) {
    const i = norm.indexOf(mots[0])
    if (i >= 0) {
      const d = Math.max(0, i - 60)
      return (d > 0 ? '…' : '') + brut.slice(d, i + 110).replace(/[*`|]/g, '').replace(/\s+/g, ' ') + '…'
    }
  }
  return e.texte.slice(0, 150).replace(/[*`|]/g, '').replace(/\s+/g, ' ') + '…'
}

export const NB_FICHES = INDEX.length
export const NB_CODES = PAGES.reduce((n, p) => n + (p.blocs ?? []).filter((b) => b.exemple?.code || b.codes?.length).length, 0) + SUJETS.length
export const NB_VISUELS = PAGES.reduce((n, p) => n + (p.blocs ?? []).filter((b) => b.visuel).length, 0)
