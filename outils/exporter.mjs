// Exporte tous les blocs de code du site (dans l'ordre) pour les exécuter en Python.
import { blocs as methodo } from '../src/contenu/methodo.js'
import { blocs as metriques } from '../src/contenu/metriques.js'
import { blocs as tp2024 } from '../src/contenu/tp2024.js'
import { blocs as python } from '../src/contenu/python.js'
import { CHAPITRES } from '../src/contenu/chapitres.js'
import { SUJETS } from '../src/contenu/entrainement.js'
import { writeFileSync } from 'node:fs'

const items = (blocs) => blocs.flatMap((b) => [
  ...(b.exemple?.code && b.exemple.langage !== 'texte' ? [{ id: b.id, kind: 'exemple', idx: 0, code: b.exemple.code }] : []),
  ...(b.codes ?? []).map((c, i) => ({ id: b.id, kind: 'codes', idx: i, code: c.code })),
])
const pages = [
  { page: 'methodo', partage: false, items: items(methodo) },
  { page: 'metriques', partage: true, items: items(metriques) },
  { page: 'tp2024', partage: true, items: items(tp2024) },
  { page: 'python', partage: false, items: items(python) },
  ...CHAPITRES.map((c) => ({ page: c.id, partage: true, items: items(c.blocs) })),
  { page: 'entrainement', partage: false, items: SUJETS.map((s) => ({ id: s.id, kind: 'exemple', idx: 0, code: s.code })) },
]
writeFileSync('outils/codes.json', JSON.stringify(pages))
console.log(pages.map((p) => `${p.page}:${p.items.length}`).join(' '))
