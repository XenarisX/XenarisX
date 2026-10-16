import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { Bouton } from '../components/ui'
import { C, Cadre, GrapheFlot } from './graphiques'

/* ------------------------------------------------------------------ Simulateur ParcourSup */
function aleaGraine(graine) {
  let s = graine >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 1e9) / 1e9
  }
}

/** Même règle que choice(n, seen) : explorer k = int(n*q) jours, puis accepter si x >= m*max ; dernier jour obligé. */
function simuler(n, q, m, essais, mode, graine) {
  const r = aleaGraine(graine)
  const k = Math.floor(n * q)
  let sRang = 0
  let sRatio = 0
  let meilleurs = 0
  const hist = new Array(n).fill(0)
  for (let e = 0; e < essais; e++) {
    const x = Array.from({ length: n }, () => Math.floor(r() * 5001))
    let j = n - 1
    if (k === 0) j = 0
    else {
      const seuilMax = Math.max(...x.slice(0, k))
      const mn = Math.min(...x.slice(0, k))
      const seuil = mode === 'relatif' ? mn + m * (seuilMax - mn) : m * seuilMax
      for (let d = k; d < n; d++)
        if (x[d] >= seuil) {
          j = d
          break
        }
    }
    const c = x[j]
    const rang = 1 + x.filter((v) => v > c).length
    const mn = Math.min(...x)
    const mx = Math.max(...x)
    sRang += rang
    sRatio += mx > mn ? (c - mn) / (mx - mn) : 1
    if (rang === 1) meilleurs++
    hist[Math.min(rang, n) - 1]++
  }
  return {
    rang: sRang / essais,
    ratio: sRatio / essais,
    p: meilleurs / essais,
    hist: hist.slice(0, Math.min(n, 15)).map((v, i) => ({ rang: i + 1, freq: v / essais })),
    k,
  }
}

function Curseur({ libelle, valeur, min, max, pas, onChange, format = (v) => v }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm text-encre-2">
        {libelle} <b className="tabular-nums text-encre">{format(valeur)}</b>
      </span>
      <input type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[#263238]" />
    </label>
  )
}

export function SimulateurSecretaire() {
  const [n, setN] = useState(30)
  const [q, setQ] = useState(0.35)
  const [m, setM] = useState(0.9)
  const [mode, setMode] = useState('absolu')
  const [graine, setGraine] = useState(7)
  const res = useMemo(() => simuler(n, q, m, 4000, mode, graine), [n, q, m, mode, graine])
  const Tuile = ({ t, v, s }) => (
    <div className="rounded-lg border border-trait px-4 py-3">
      <p className="text-xs text-discret">{t}</p>
      <p className="text-2xl font-bold tabular-nums text-encre">{v}</p>
      {s && <p className="text-xs text-discret">{s}</p>}
    </div>
  )
  return (
    <Cadre titre="Simulateur : stratégie à seuil du TP noté 2024 (4 000 essais, calcul dans le navigateur)" legende="Bouge q et m et regarde les métriques changer. Essaie q = 1/e ≈ 0,37 avec m = 1 : P(meilleur) monte vers 37 % mais le rang moyen se dégrade. Le mode « relatif » utilise min + m·(max − min) : il ne dépend plus de l’échelle des scores.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Curseur libelle="n (jours)" valeur={n} min={5} max={100} pas={1} onChange={setN} />
          <Curseur libelle="q (part explorée)" valeur={q} min={0} max={0.95} pas={0.01} onChange={setQ} format={(v) => v.toFixed(2)} />
          <Curseur libelle="m (exigence)" valeur={m} min={0.5} max={1.3} pas={0.01} onChange={setM} format={(v) => v.toFixed(2)} />
          <div className="flex gap-2 text-sm">
            {['absolu', 'relatif'].map((x) => (
              <button key={x} onClick={() => setMode(x)} className={`rounded-md px-3 py-1.5 font-medium ${mode === x ? 'degrade-sombre text-white' : 'bg-fond text-discret'}`}>
                seuil {x}
              </button>
            ))}
          </div>
          <Bouton variante="contour" taille="sm" onClick={() => setGraine((g) => g + 1)}>
            <ArrowPathIcon className="h-4 w-4" /> Nouveau tirage
          </Bouton>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tuile t="Rang moyen" v={res.rang.toFixed(2).replace('.', ',')} s="1 = le meilleur" />
            <Tuile t="Ratio moyen" v={res.ratio.toFixed(3).replace('.', ',')} s="(c − min)/(max − min)" />
            <Tuile t="P(meilleur)" v={`${(res.p * 100).toFixed(1).replace('.', ',')} %`} />
            <Tuile t="Jours explorés" v={res.k} s={`int(${n} × ${q.toFixed(2)})`} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={res.hist} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="rang" stroke="#90a4ae" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#90a4ae" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)} %`} labelFormatter={(l) => `rang ${l}`} />
              <Bar dataKey="freq" name="fréquence" fill={C.bleu} radius={[5, 5, 5, 5]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Cadre>
  )
}

/* ------------------------------------------------------------------ Gale-Shapley pas à pas (exemple du TP1) */
const P1 = { 0: [4, 1, 2, 0, 3], 1: [2, 3, 0, 1, 4], 2: [4, 0, 1, 2, 3], 3: [3, 1, 4, 0, 2], 4: [3, 4, 1, 2, 0] }
const P2 = { 1: [3, 4, 0, 2, 1], 2: [1, 3, 0, 4, 2], 3: [1, 4, 3, 2, 0], 0: [2, 1, 0, 3, 4], 4: [3, 1, 4, 2, 0] }

function traceGS() {
  const mariage = {}
  const suivant = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
  const celib = [0, 1, 2, 3, 4]
  const etapes = [{ texte: 'Départ : tous les étudiants (P1) sont célibataires.', mariage: {}, celib: [...celib] }]
  while (celib.length) {
    const e = celib.shift()
    const f = P1[e][suivant[e]++]
    const rival = Object.keys(mariage).find((k) => mariage[k] === f)
    let texte
    if (rival === undefined) {
      mariage[e] = f
      texte = `Étudiant ${e} propose à la formation ${f} (son choix n°${suivant[e]}) : elle est libre → accepte.`
    } else if (P2[f].indexOf(e) < P2[f].indexOf(Number(rival))) {
      delete mariage[rival]
      mariage[e] = f
      celib.push(Number(rival))
      texte = `Étudiant ${e} propose à ${f}, déjà avec ${rival}. ${f} préfère ${e} (rang ${P2[f].indexOf(e)} < ${P2[f].indexOf(Number(rival))}) → ${rival} redevient célibataire.`
    } else {
      celib.push(e)
      texte = `Étudiant ${e} propose à ${f}, déjà avec ${rival}. ${f} préfère garder ${rival} → ${e} est refusé et reste célibataire.`
    }
    etapes.push({ texte, mariage: { ...mariage }, celib: [...celib], e, f })
  }
  etapes.push({ texte: 'Fin : plus de célibataire. Mariage stable {0: 0, 1: 2, 2: 4, 3: 1, 4: 3} (identique à l’assert du TP1).', mariage: { ...mariage }, celib: [] })
  return etapes
}

export function GsPasAPas() {
  const etapes = useMemo(traceGS, [])
  const [i, setI] = useState(0)
  const et = etapes[i]
  return (
    <Cadre titre={`Gale-Shapley pas à pas : exemple du TP1 (étape ${i}/${etapes.length - 1})`} legende="Les étudiants proposent dans l’ordre de leur liste ; une formation garde la meilleure proposition reçue. Chaque étudiant propose au plus une fois à chaque formation → au plus n² propositions.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="text-xs">
          <p className="mb-1 font-bold text-encre">Préférences P1 (étudiants)</p>
          {Object.entries(P1).map(([e, l]) => (
            <p key={e} className={`font-mono ${et.e === Number(e) ? 'font-bold text-info' : 'text-encre-2'}`}>
              {e} : [{l.join(', ')}]
            </p>
          ))}
          <p className="mb-1 mt-3 font-bold text-encre">Préférences P2 (formations)</p>
          {Object.entries(P2).sort().map(([f, l]) => (
            <p key={f} className={`font-mono ${et.f === Number(f) ? 'font-bold text-attention' : 'text-encre-2'}`}>
              {f} : [{l.join(', ')}]
            </p>
          ))}
        </div>
        <div>
          <p className="min-h-16 rounded-lg bg-fond px-3 py-2 text-sm text-encre">{et.texte}</p>
          <p className="mt-3 text-xs font-bold uppercase text-discret">Mariages provisoires</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {Object.entries(et.mariage).map(([e, f]) => (
              <span key={e} className="rounded-md bg-ok/10 px-2 py-1 font-mono text-sm text-[#2e7d32]">
                {e} ↔ {f}
              </span>
            ))}
            {!Object.keys(et.mariage).length && <span className="text-sm text-discret">aucun</span>}
          </div>
          <p className="mt-3 text-xs font-bold uppercase text-discret">Célibataires (file)</p>
          <p className="font-mono text-sm text-encre-2">[{et.celib.join(', ')}]</p>
          <div className="mt-4 flex gap-2">
            <Bouton variante="contour" taille="sm" disabled={i === 0} onClick={() => setI(i - 1)}>
              <ChevronLeftIcon className="h-4 w-4" /> Précédent
            </Bouton>
            <Bouton taille="sm" disabled={i === etapes.length - 1} onClick={() => setI(i + 1)}>
              Suivant <ChevronRightIcon className="h-4 w-4" />
            </Bouton>
          </div>
        </div>
      </div>
    </Cadre>
  )
}

/* ------------------------------------------------------------------ Edmonds-Karp pas à pas (exemple du cours) */
const CAP = [
  [0, 10, 0, 5, 0, 0],
  [0, 0, 9, 0, 0, 0],
  [0, 0, 0, 7, 10, 0],
  [0, 0, 0, 0, 0, 12],
  [0, 0, 0, 0, 0, 6],
  [0, 0, 0, 0, 0, 0],
]
function traceEK() {
  const n = 6
  const F = CAP.map((l) => l.map(() => 0))
  const etapes = []
  let total = 0
  for (;;) {
    const parent = new Array(n).fill(-1)
    parent[0] = 0
    const file = [0]
    while (file.length && parent[5] === -1) {
      const u = file.shift()
      for (let v = 0; v < n; v++) if (parent[v] === -1 && CAP[u][v] - F[u][v] > 0) {
        parent[v] = u
        file.push(v)
      }
    }
    if (parent[5] === -1) break
    const chemin = [5]
    while (chemin[0] !== 0) chemin.unshift(parent[chemin[0]])
    let c = Infinity
    for (let i = 0; i < chemin.length - 1; i++) c = Math.min(c, CAP[chemin[i]][chemin[i + 1]] - F[chemin[i]][chemin[i + 1]])
    for (let i = 0; i < chemin.length - 1; i++) {
      F[chemin[i]][chemin[i + 1]] += c
      F[chemin[i + 1]][chemin[i]] -= c
    }
    total += c
    etapes.push({ chemin, c, total, F: F.map((l) => [...l]) })
  }
  return etapes
}
const NOM = (x) => (x === 0 ? 's' : x === 5 ? 't' : x)

export function EkPasAPas() {
  const etapes = useMemo(traceEK, [])
  const [i, setI] = useState(0)
  const et = etapes[i]
  const arcs = []
  CAP.forEach((l, u) => l.forEach((c, v) => c > 0 && arcs.push({ u, v, cap: c, flot: Math.max(et.F[u][v], 0) })))
  return (
    <Cadre titre={`Edmonds-Karp pas à pas : chemin augmentant n°${i + 1}/${etapes.length}`} legende="À chaque tour : BFS dans le graphe résiduel → plus court chemin s→t (en nombre d’arcs) → on y pousse le minimum des capacités résiduelles. Fin quand t n’est plus atteignable.">
      <GrapheFlot arcs={arcs} cheminSurligne={et.chemin} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-sm text-encre">
          Chemin <b className="font-mono">{et.chemin.map(NOM).join(' → ')}</b>, goulot <b>{et.c}</b>, flot total <b>{et.total}</b>
        </p>
        <div className="ml-auto flex gap-2">
          <Bouton variante="contour" taille="sm" disabled={i === 0} onClick={() => setI(i - 1)}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Bouton>
          <Bouton taille="sm" disabled={i === etapes.length - 1} onClick={() => setI(i + 1)}>
            <ChevronRightIcon className="h-4 w-4" />
          </Bouton>
        </div>
      </div>
    </Cadre>
  )
}
