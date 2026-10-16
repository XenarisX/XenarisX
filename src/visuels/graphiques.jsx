import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Area } from 'recharts'
import D from '../contenu/donnees.json'

export const C = { vert: '#4caf50', bleu: '#2196f3', orange: '#ff9800', violet: '#9c27b0', rouge: '#f44336', gris: '#90a4ae', sarcelle: '#009688', encre: '#263238' }
const axe = { stroke: '#90a4ae', fontSize: 12, tickLine: false, axisLine: false }
const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 })
const fmt = (v) => (typeof v === 'number' ? nf.format(v) : v)

function Bulle({ active, payload, label, prefixe = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-trait bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-encre">
        {prefixe}
        {fmt(label)}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-encre-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name} : <b className="tabular-nums">{fmt(p.value)}</b>
        </p>
      ))}
    </div>
  )
}

export function Cadre({ titre, legende, children }) {
  return (
    <figure>
      {titre && <p className="mb-2 text-sm font-bold text-encre">{titre}</p>}
      {children}
      {legende && <figcaption className="mt-2 text-[13px] leading-relaxed text-discret">{legende}</figcaption>}
    </figure>
  )
}

function Courbes({ donnees, x, series, xLabel, yLabel, logY, hauteur = 280, refY, refX, prefixe, domaineY }) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <LineChart data={donnees} margin={{ top: 10, right: 16, left: 4, bottom: 18 }}>
        <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
        <XAxis dataKey={x} {...axe} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fontSize: 12, fill: '#607d8b' } : undefined} />
        <YAxis {...axe} scale={logY ? 'log' : 'auto'} domain={domaineY ?? (logY ? ['auto', 'auto'] : [0, 'auto'])} allowDataOverflow={logY} tickFormatter={(v) => (logY ? v.toExponential(0) : fmt(v))} width={64} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: '#607d8b', dx: 2, dy: 40 } : undefined} />
        <Tooltip content={<Bulle prefixe={prefixe} />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {refY != null && <ReferenceLine y={refY.valeur} stroke={C.rouge} strokeDasharray="4 4" label={{ value: refY.texte, fontSize: 11, fill: C.rouge, position: 'insideTopRight' }} />}
        {refX != null && <ReferenceLine x={refX.valeur} stroke={C.rouge} strokeDasharray="4 4" label={{ value: refX.texte, fontSize: 11, fill: C.rouge, position: 'top' }} />}
        {series.map((s) => (
          <Line key={s.cle} type="monotone" dataKey={s.cle} name={s.nom} stroke={s.couleur} strokeWidth={s.epais ?? 2.5} strokeDasharray={s.pointilles ? '6 4' : undefined} dot={s.points === false ? false : { r: 3, strokeWidth: 0, fill: s.couleur }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function Barres({ donnees, x, series, xLabel, hauteur = 260, horizontal, prefixe }) {
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <BarChart data={donnees} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 10, right: 16, left: horizontal ? 10 : 4, bottom: 18 }}>
        <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axe} />
            <YAxis type="category" dataKey={x} {...axe} width={190} fontSize={11} />
          </>
        ) : (
          <>
            <XAxis dataKey={x} {...axe} interval={0} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, fontSize: 12, fill: '#607d8b' } : undefined} />
            <YAxis {...axe} tickFormatter={fmt} width={56} />
          </>
        )}
        <Tooltip content={<Bulle prefixe={prefixe} />} cursor={{ fill: 'rgba(96,125,139,0.08)' }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
        {series.map((s) => (
          <Bar key={s.cle} dataKey={s.cle} name={s.nom} fill={s.couleur} radius={[6, 6, 6, 6]} maxBarSize={horizontal ? 18 : 28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------- Gale-Shapley / Selkow */
export const GsComplexite = () => (
  <Cadre titre="Nombre de propositions de Gale-Shapley selon n (moyenne de 10 essais)" legende="Mesuré avec galeShapleyCompteur sur des préférences aléatoires. La courbe mesurée suit n·log(n), très loin du pire cas n² (échelle logarithmique) : en pratique GS est rapide.">
    <Courbes donnees={D.gs_complexite} x="n" logY xLabel="n (taille des populations)" series={[
      { cle: 'mesure', nom: 'mesuré', couleur: C.bleu },
      { cle: 'nlogn', nom: 'n·log(n)', couleur: C.vert, pointilles: true, points: false },
      { cle: 'n2', nom: 'n²', couleur: C.rouge, pointilles: true, points: false },
    ]} />
  </Cadre>
)

export const GsRegrets = () => (
  <Cadre titre="Regret moyen par population : Gale-Shapley vs mariage aléatoire" legende="Ceux qui proposent (P1) ont un regret très faible ; ceux qui reçoivent (P2) beaucoup plus élevé. Le mariage aléatoire donne ≈ (n−1)/2 aux deux : GS est meilleur globalement, mais pas équitable.">
    <Courbes donnees={D.gs_regrets} x="n" xLabel="n" series={[
      { cle: 'gs_p1', nom: 'GS – P1 (proposent)', couleur: C.bleu },
      { cle: 'gs_p2', nom: 'GS – P2 (reçoivent)', couleur: C.orange },
      { cle: 'alea_p1', nom: 'Aléatoire – P1', couleur: C.gris, pointilles: true, points: false },
      { cle: 'alea_p2', nom: 'Aléatoire – P2', couleur: C.violet, pointilles: true, points: false },
    ]} />
  </Cadre>
)

export const SelkowRegretMax = () => (
  <Cadre titre="Regret maximal moyen (120 essais par n)" legende="Selkow réduit le regret du plus malheureux par rapport à Gale-Shapley ; le mariage aléatoire est le pire (≈ n−1).">
    <Courbes donnees={D.selkow} x="n" xLabel="n" series={[
      { cle: 'gs', nom: 'Gale-Shapley', couleur: C.bleu },
      { cle: 'selkow', nom: 'Selkow', couleur: C.vert },
      { cle: 'alea', nom: 'Aléatoire', couleur: C.gris, pointilles: true },
    ]} />
  </Cadre>
)

export const SelkowTemps = () => (
  <Cadre titre="Coût : temps moyen d’exécution (ms)" legende="Selkow relance deux Gale-Shapley à chaque tour : il est environ 10 fois plus lent. C’est le prix de l’équité, à citer dans la conclusion.">
    <Courbes donnees={D.selkow} x="n" xLabel="n" series={[
      { cle: 't_gs_ms', nom: 'Gale-Shapley (ms)', couleur: C.bleu },
      { cle: 't_selkow_ms', nom: 'Selkow (ms)', couleur: C.vert },
    ]} />
  </Cadre>
)

export const SelkowRegretP2 = () => (
  <Cadre titre="Regret moyen de P2 (ceux qui reçoivent)" legende="En plus du pire cas, Selkow améliore aussi la population désavantagée par GS.">
    <Courbes donnees={D.selkow} x="n" xLabel="n" series={[
      { cle: 'gs_p2_moy', nom: 'GS – P2', couleur: C.orange },
      { cle: 'selkow_p2_moy', nom: 'Selkow – P2', couleur: C.vert },
    ]} />
  </Cadre>
)

/* ------------------------------------------------------------- Flots */
const POS = { 0: [50, 150], 1: [190, 50], 2: [340, 50], 3: [260, 250], 4: [470, 90], 5: [560, 220] }
const NOMS = { 0: 's', 5: 't' }

function Fleche({ u, v, texte, couleur, epais, pointilles }) {
  const [x1, y1] = POS[u]
  const [x2, y2] = POS[v]
  const dx = x2 - x1
  const dy = y2 - y1
  const l = Math.hypot(dx, dy)
  const r = 22
  const ax = x1 + (dx / l) * r
  const ay = y1 + (dy / l) * r
  const bx = x2 - (dx / l) * (r + 6)
  const by = y2 - (dy / l) * (r + 6)
  const mx = (ax + bx) / 2 - (dy / l) * 14
  const my = (ay + by) / 2 + (dx / l) * 14
  return (
    <g>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={couleur} strokeWidth={epais} strokeDasharray={pointilles ? '6 4' : undefined} markerEnd={`url(#pointe-${couleur.slice(1)})`} />
      <rect x={mx - 22} y={my - 10} width={44} height={20} rx={5} fill="white" stroke="#eceff1" />
      <text x={mx} y={my + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={couleur}>
        {texte}
      </text>
    </g>
  )
}

export function GrapheFlot({ arcs, S1 = [], coupe = [], cheminSurligne = [] }) {
  const dansCoupe = (u, v) => coupe.some((c) => c.u === u && c.v === v)
  const dansChemin = (u, v) => cheminSurligne.some((x, i) => x === u && cheminSurligne[i + 1] === v)
  const couleurs = [C.encre, C.rouge, C.bleu, '#b0bec5']
  return (
    <svg viewBox="0 0 620 300" className="mx-auto w-full max-w-2xl">
      <defs>
        {couleurs.map((c) => (
          <marker key={c} id={`pointe-${c.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
          </marker>
        ))}
      </defs>
      {arcs.map((a) => {
        const sature = a.flot === a.cap
        const coul = dansChemin(a.u, a.v) ? C.bleu : dansCoupe(a.u, a.v) ? C.rouge : a.flot > 0 ? C.encre : '#b0bec5'
        return <Fleche key={`${a.u}-${a.v}`} u={a.u} v={a.v} texte={a.flot != null ? `${a.flot}/${a.cap}` : a.cap} couleur={coul} epais={dansChemin(a.u, a.v) ? 3.5 : sature ? 3 : 1.6} pointilles={dansCoupe(a.u, a.v)} />
      })}
      {Object.entries(POS).map(([k, [x, y]]) => {
        const i = Number(k)
        const s1 = S1.includes(i)
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={20} fill={i === 0 || i === 5 ? '#4caf50' : s1 ? '#e3f2fd' : 'white'} stroke={s1 ? C.bleu : '#90a4ae'} strokeWidth={2} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={i === 0 || i === 5 ? 'white' : C.encre}>
              {NOMS[i] ?? i}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export const EkCours = () => (
  <Cadre titre={`Flot maximal de l’exemple du cours : ${D.ek_cours.valeur}`} legende="Étiquettes flot/capacité après Edmonds-Karp. Arcs épais = saturés. En rouge pointillé : la coupe minimale S1 = {s, 1} → arcs s→3 (5) et 1→2 (9) : 5 + 9 = 14 = valeur du flot (théorème flot max = coupe min). Sommets bleutés : atteignables depuis s dans le graphe résiduel final.">
    <GrapheFlot arcs={D.ek_cours.arcs} S1={D.ek_cours.S1} coupe={D.ek_cours.coupe} />
  </Cadre>
)

export const EkComplexite = () => (
  <Cadre titre="Temps d’Edmonds-Karp (matrice) sur des graphes aléatoires (p = 0,15)" legende="Le temps croît vite avec la taille (BFS en O(V²) sur matrice, nombre de chemins augmentants qui grandit). Pour un sujet « passage à l’échelle », tracer cette courbe et la comparer à nx.maximum_flow.">
    <Courbes donnees={D.ek_complexite} x="n" xLabel="nombre de sommets" series={[{ cle: 'temps_ms', nom: 'temps (ms)', couleur: C.violet }]} />
  </Cadre>
)

export function Couplage() {
  const { S1, S2, aretes, couplage } = D.couplage
  const y = (i, n) => 30 + (i * 240) / (n - 1)
  const P = {}
  S1.forEach((u, i) => (P[u] = [90, y(i, S1.length)]))
  S2.forEach((u, i) => (P[u] = [420, y(i, S2.length)]))
  const dansM = (u, v) => couplage.some(([a, b]) => (a === u && b === v) || (a === v && b === u))
  return (
    <Cadre titre={`Couplage maximum d’un graphe biparti aléatoire : ${couplage.length} paires`} legende="Rouge : arêtes du couplage (Hopcroft-Karp, identique au flot de capacité 1). Gris : arêtes non retenues. Un sommet sans arête rouge ne peut pas être servi : c’est ce qu’on explique avec la coupe minimale.">
      <svg viewBox="0 0 510 300" className="w-full max-w-xl">
        {aretes.map(([u, v]) => (
          <line key={`${u}-${v}`} x1={P[u][0]} y1={P[u][1]} x2={P[v][0]} y2={P[v][1]} stroke={dansM(u, v) ? C.rouge : '#cfd8dc'} strokeWidth={dansM(u, v) ? 3 : 1.5} />
        ))}
        {[...S1, ...S2].map((u) => (
          <g key={u}>
            <circle cx={P[u][0]} cy={P[u][1]} r={13} fill={u < 8 ? '#4caf50' : '#2196f3'} />
            <text x={P[u][0]} y={P[u][1] + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>
              {u}
            </text>
          </g>
        ))}
        <text x={90} y={295} textAnchor="middle" fontSize={12} fill="#607d8b">S1</text>
        <text x={420} y={295} textAnchor="middle" fontSize={12} fill="#607d8b">S2</text>
      </svg>
    </Cadre>
  )
}

/* ------------------------------------------------------------- Valeurs propres */
export const Puissances = () => (
  <Cadre titre="Puissances itérées sur A = [[1, 6], [1, 2]]" legende="L’estimation de λ converge vers 4 (plus grande valeur propre). En échelle log, l’erreur décroît en ligne droite : convergence géométrique en (λ₂/λ₁)^k = (1/4)^k.">
    <div className="grid gap-4 lg:grid-cols-2">
      <Courbes donnees={D.puissances} x="k" xLabel="itération k" refY={{ valeur: 4, texte: 'λ₁ = 4' }} domaineY={[0, 'auto']} series={[{ cle: 'lambda', nom: 'λ estimé', couleur: C.bleu }]} />
      <Courbes donnees={D.puissances.filter((r) => r.erreur > 1e-15)} x="k" xLabel="itération k" logY series={[{ cle: 'erreur', nom: '|λ estimé − 4|', couleur: C.rouge }]} />
    </div>
  </Cadre>
)

export const Vitesse = () => (
  <Cadre titre="Vitesse de convergence selon le rapport λ₂/λ₁" legende="Plus λ₂ est proche de λ₁, plus les puissances itérées sont lentes. À citer pour justifier un nombre d’itérations ou un seuil.">
    <Courbes donnees={D.vitesse} x="k" xLabel="itération k" logY series={[
      { cle: 'r05', nom: 'λ₂/λ₁ = 0,5', couleur: C.vert, points: false },
      { cle: 'r08', nom: 'λ₂/λ₁ = 0,8', couleur: C.orange, points: false },
      { cle: 'r095', nom: 'λ₂/λ₁ = 0,95', couleur: C.rouge, points: false },
    ]} />
  </Cadre>
)

export const Leslie = () => (
  <Cadre titre={`Matrice de Leslie (exemple) : λ₁ = ${String(D.leslie.lambda).replace('.', ',')}`} legende={`λ₁ > 1 : la population croît d’environ ${Math.round((D.leslie.lambda - 1) * 100)} % par an à long terme. La répartition par âge se stabilise vers le vecteur propre normalisé : ${D.leslie.repartition.map((x) => Math.round(x * 100) + ' %').join(' / ')}.`}>
    <Courbes donnees={D.leslie.serie} x="t" xLabel="année t" logY series={[
      { cle: 'juv', nom: 'juvéniles', couleur: C.bleu, points: false },
      { cle: 'jeunes', nom: 'jeunes', couleur: C.vert, points: false },
      { cle: 'adultes', nom: 'adultes', couleur: C.orange, points: false },
      { cle: 'ages', nom: 'âgés', couleur: C.violet, points: false },
      { cle: 'total', nom: 'total', couleur: C.encre, points: false, epais: 3 },
    ]} />
  </Cadre>
)

/* ------------------------------------------------------------- Spectral */
const COUL3 = [C.bleu, C.orange, C.vert, C.violet]
export function Spectral() {
  const { noeuds, aretes } = D.spectral
  const xs = noeuds.map((n) => n.x)
  const ys = noeuds.map((n) => n.y)
  const sx = (x) => 30 + ((x - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs))) * 440
  const sy = (y) => 20 + ((y - Math.min(...ys)) / (Math.max(...ys) - Math.min(...ys))) * 260
  const P = Object.fromEntries(noeuds.map((n) => [n.id, [sx(n.x), sy(n.y), n.kmeans]]))
  return (
    <Cadre titre="Clustering spectral + k-means (k = 3) sur un graphe SBM [10, 15, 20]" legende="Couleur = groupe trouvé par KMeans sur les vecteurs propres 2 à 4 du Laplacien. Les trois communautés générées sont retrouvées ; les rares arêtes entre groupes (p_out = 0,02) sont celles que la coupe minimise.">
      <svg viewBox="0 0 500 300" className="w-full max-w-2xl">
        {aretes.map(([u, v]) => (
          <line key={`${u}-${v}`} x1={P[u][0]} y1={P[u][1]} x2={P[v][0]} y2={P[v][1]} stroke={P[u][2] === P[v][2] ? '#cfd8dc' : C.rouge} strokeWidth={P[u][2] === P[v][2] ? 1 : 1.8} />
        ))}
        {noeuds.map((n) => (
          <circle key={n.id} cx={P[n.id][0]} cy={P[n.id][1]} r={6.5} fill={COUL3[n.kmeans]} stroke="white" strokeWidth={1.5} />
        ))}
      </svg>
    </Cadre>
  )
}

export const SpectreLaplacien = () => (
  <Cadre titre="10 plus petites valeurs propres du Laplacien (graphe SBM ci-dessus)" legende="Une valeur propre nulle (graphe connexe), puis deux valeurs très petites : il y a un « trou » après la 3e valeur propre → 3 communautés. C’est l’heuristique du trou spectral (eigengap) pour choisir k.">
    <Barres donnees={D.spectral.valeurs.map((v, i) => ({ i: `λ${i}`, v }))} x="i" series={[{ cle: 'v', nom: 'valeur propre', couleur: C.violet }]} />
  </Cadre>
)

export const Composantes = () => (
  <Cadre titre={`Graphe à ${D.composantes.nb} composantes (K5 + cycle C6 + chemin P4)`} legende="La valeur propre 0 du Laplacien apparaît autant de fois qu’il y a de composantes connexes : ici 3 zéros (à 1e-10 près).">
    <Barres donnees={D.composantes.valeurs.map((v, i) => ({ i: `λ${i}`, v }))} x="i" series={[{ cle: 'v', nom: 'valeur propre', couleur: C.bleu }]} />
  </Cadre>
)

export const SpectralRobustesse = () => (
  <Cadre titre="Précision du vecteur de Fiedler selon la proportion de liens entre groupes" legende="Deux groupes de 20 (p_in = 0,4). Tant que p_out reste petit devant p_in, le signe de Fiedler retrouve les groupes ; quand p_out se rapproche de p_in, la précision chute vers 50 % (= hasard). C’est l’analyse « quand la méthode échoue » attendue.">
    <Courbes donnees={D.spectral_robustesse} x="pout" xLabel="p_out" refY={{ valeur: 0.5, texte: 'hasard' }} domaineY={[0.4, 1]} series={[{ cle: 'precision', nom: 'précision', couleur: C.vert }]} />
  </Cadre>
)

/* ------------------------------------------------------------- Arrêt optimal (TP noté 2024) */
export const SecretaireQ = () => (
  <Cadre titre="Stratégie « explorer q·n jours puis accepter ≥ max » (m = 1, n = 30, 20 000 essais)" legende="Rang moyen (1 = meilleur, à minimiser) et P(trouver le meilleur). Avec m = 1, le rang moyen est minimal vers q ≈ 0,15–0,2 (≈ 5,1) ; la probabilité du meilleur plafonne à ≈ 38 % pour q entre 0,3 et 0,45 (autour de 1/e ≈ 0,37). Les deux objectifs ne donnent pas le même q : il faut dire lequel on optimise.">
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={D.secretaire_q} margin={{ top: 10, right: 8, left: 4, bottom: 18 }}>
        <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
        <XAxis dataKey="q" {...axe} label={{ value: 'q (part des jours explorés)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#607d8b' }} />
        <YAxis yAxisId="g" {...axe} width={50} />
        <YAxis yAxisId="d" orientation="right" {...axe} width={50} domain={[0, 0.5]} tickFormatter={(v) => `${Math.round(v * 100)} %`} />
        <Tooltip content={<Bulle prefixe="q = " />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line yAxisId="g" dataKey="rang" name="rang moyen" stroke={C.bleu} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: C.bleu }} />
        <Line yAxisId="d" dataKey="pmeilleur" name="P(meilleur)" stroke={C.vert} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: C.vert }} />
      </ComposedChart>
    </ResponsiveContainer>
  </Cadre>
)

export function SecretaireHeatmap({ metrique = 'rang' }) {
  const { qs, ms, cases, meilleur } = D.secretaire_grille
  const vals = cases.map((c) => c[metrique])
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const couleur = (v) => {
    const t = (v - mn) / (mx - mn)
    const a = metrique === 'rang' ? t : 1 - t
    const r = Math.round(33 + a * (244 - 33))
    const g = Math.round(150 + a * (67 - 150))
    const b = Math.round(243 + a * (54 - 243))
    return `rgb(${r},${g},${b})`
  }
  const w = 30
  const h = 22
  const g0 = 46
  return (
    <Cadre
      titre={`Grille 2D : ${metrique === 'rang' ? 'rang moyen' : 'ratio moyen'} selon q (lignes) et m (colonnes)`}
      legende={`Chaque case = 4 000 simulations. Bleu = meilleur. Optimum : q = ${meilleur.q}, m = ${meilleur.m} → rang moyen ${String(meilleur.rang).replace('.', ',')}. Optimiser q puis m séparément donne (0,2 ; 0,9) et un rang ≈ 4,1 : il faut optimiser les deux ensemble (np.meshgrid + np.unravel_index).`}
    >
      <div className="defilement overflow-x-auto">
        <svg viewBox={`0 0 ${g0 + ms.length * w + 10} ${qs.length * h + 50}`} className="w-full min-w-[520px] max-w-3xl">
          {qs.map((q, i) => (
            <text key={q} x={g0 - 6} y={i * h + h / 2 + 4} textAnchor="end" fontSize={10} fill="#607d8b">
              {q}
            </text>
          ))}
          {ms.map((m, j) => (
            <text key={m} x={g0 + j * w + w / 2} y={qs.length * h + 14} textAnchor="middle" fontSize={10} fill="#607d8b">
              {m}
            </text>
          ))}
          <text x={g0 + (ms.length * w) / 2} y={qs.length * h + 34} textAnchor="middle" fontSize={11} fill="#455a64">m (exigence par rapport au max exploré)</text>
          {cases.map((c) => {
            const i = qs.indexOf(c.q)
            const j = ms.indexOf(c.m)
            const best = c.q === meilleur.q && c.m === meilleur.m
            return (
              <g key={`${c.q}-${c.m}`}>
                <rect x={g0 + j * w} y={i * h} width={w - 1} height={h - 1} fill={couleur(c[metrique])} stroke={best ? '#263238' : 'none'} strokeWidth={best ? 2.5 : 0} rx={2}>
                  <title>{`q = ${c.q}, m = ${c.m} : rang ${c.rang}, ratio ${c.ratio}`}</title>
                </rect>
                {best && (
                  <text x={g0 + j * w + w / 2} y={i * h + h / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">★</text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </Cadre>
  )
}

export function SecretaireComparatif() {
  const d = D.secretaire_comparatif
  return (
    <Cadre titre="Comparaison des versions de choice (n = 30, 20 000 essais)" legende="Le tableau final attendu dans le rendu : plusieurs indicateurs, dont un de pire cas (90e percentile du rang). La version 1/e a la meilleure P(meilleur) mais un mauvais rang moyen : quand elle rate, elle rate beaucoup (souvent le dernier jour).">
      <Barres donnees={d.map((x) => ({ ...x, nom: x.nom.replace(/\s*\(.*\)/, (s) => s) }))} x="nom" horizontal hauteur={250} series={[{ cle: 'rang', nom: 'rang moyen', couleur: C.bleu }]} />
      <div className="defilement mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase text-discret">
              {['Version', 'Rang moyen', 'Rang médian', 'Ratio moyen', 'P(meilleur)', 'Rang p90'].map((t) => (
                <th key={t} className="border-b border-trait-2 px-3 py-2 font-medium">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.map((x) => (
              <tr key={x.nom} className="text-encre-2">
                <td className="border-b border-trait px-3 py-2 font-medium text-encre">{x.nom}</td>
                <td className="border-b border-trait px-3 py-2 tabular-nums">{fmt(x.rang)}</td>
                <td className="border-b border-trait px-3 py-2 tabular-nums">{fmt(x.rang_med)}</td>
                <td className="border-b border-trait px-3 py-2 tabular-nums">{fmt(x.ratio)}</td>
                <td className="border-b border-trait px-3 py-2 tabular-nums">{Math.round(x.pmeilleur * 1000) / 10} %</td>
                <td className="border-b border-trait px-3 py-2 tabular-nums">{fmt(x.pire_rang_p90)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Cadre>
  )
}

export const SecretaireHist = () => (
  <Cadre titre="Distribution du rang obtenu avec la stratégie optimisée (q = 0,35 ; m = 0,9)" legende="Plus d’un cas sur deux finit dans le top 3. Un histogramme montre la forme de la distribution : une moyenne seule cache la queue (les mauvais cas).">
    <Barres donnees={D.secretaire_hist} x="rang" xLabel="rang de la formation choisie" series={[{ cle: 'freq', nom: 'fréquence', couleur: C.bleu }]} />
  </Cadre>
)

export const SecretaireJour = () => (
  <Cadre titre="Jour d’acceptation (stratégie optimisée)" legende="Rien avant le jour 11 (exploration de 10 jours = int(30 × 0,35)), un pic juste après, puis un pic au dernier jour : les cas où aucune proposition n’a atteint le seuil.">
    <Barres donnees={D.secretaire_jour} x="jour" xLabel="jour" series={[{ cle: 'freq', nom: 'fréquence', couleur: C.orange }]} />
  </Cadre>
)

export const SecretaireN = () => (
  <Cadre titre="Robustesse : rang relatif (rang / n) selon la durée n" legende="Avec les paramètres trouvés pour n = 30, le rang relatif s’améliore quand n grandit (rang ≈ 3,7 sur 30, ≈ 6,8 sur 100, soit le top 7 %) : la stratégie reste efficace sur de plus longues périodes. La stratégie 1/e garde une P(meilleur) ≈ 37–40 % quel que soit n : c’est le résultat théorique du problème du secrétaire.">
    <Courbes donnees={D.secretaire_n} x="n" xLabel="n (jours)" series={[
      { cle: 'grille_rang_rel', nom: 'rang/n – (0,35 ; 0,9)', couleur: C.bleu },
      { cle: 'classique_rang_rel', nom: 'rang/n – 1/e', couleur: C.orange },
      { cle: 'grille_p1', nom: 'P(meilleur) – (0,35 ; 0,9)', couleur: C.vert, pointilles: true },
      { cle: 'classique_p1', nom: 'P(meilleur) – 1/e', couleur: C.violet, pointilles: true },
    ]} />
  </Cadre>
)

export const SecretaireDistrib = () => (
  <Cadre titre="Robustesse : autres distributions de scores (q = 0,35 ; m = 0,9)" legende="Le seuil m·max dépend de l’échelle : sur des scores resserrés (230–788), m = 0,9 devient moins exigeant et le rang passe de 3,7 à 4,0 ; avec une loi normale ou exponentielle, la performance se dégrade nettement. Un seuil relatif min + m·(max − min) corrige le changement de bornes (rang 3,8 sur 230–788), mais pas le changement de loi : il faut alors ré-optimiser m.">
    <Barres donnees={D.secretaire_distributions} x="distribution" series={[{ cle: 'rang', nom: 'rang moyen', couleur: C.bleu }]} />
  </Cadre>
)

/* ------------------------------------------------------------- Méthodo */
const BUDGET = [
  { phase: 'Comprendre, reformuler', debut: 0, duree: 15, couleur: C.bleu },
  { phase: 'Données, baseline, indicateurs', debut: 15, duree: 20, couleur: C.sarcelle },
  { phase: 'Algorithme v1 puis v2', debut: 35, duree: 55, couleur: C.violet },
  { phase: 'Simulations, graphes, analyses', debut: 90, duree: 45, couleur: C.orange },
  { phase: 'Conclusion, Restart & Run All', debut: 135, duree: 15, couleur: C.vert },
]
export function BudgetTemps() {
  const total = 150
  return (
    <Cadre titre="Budget temps sur 2 h 30" legende="Règle d’or : à 1 h 30, on arrête d’inventer de nouveaux algorithmes et on analyse. Une analyse soignée rapporte plus qu’une v3 non mesurée.">
      <div className="space-y-2">
        {BUDGET.map((b) => (
          <div key={b.phase} className="flex items-center gap-3 text-sm">
            <span className="w-56 shrink-0 text-encre-2">{b.phase}</span>
            <div className="relative h-7 flex-1 rounded-md bg-fond">
              <div className="absolute inset-y-0 rounded-md text-[11px] font-bold leading-7 text-white" style={{ left: `${(100 * b.debut) / total}%`, width: `${(100 * b.duree) / total}%`, background: b.couleur }}>
                <span className="px-2">{b.duree} min</span>
              </div>
            </div>
            <span className="w-24 shrink-0 text-right tabular-nums text-discret">
              {Math.floor(b.debut / 60)}h{String(b.debut % 60).padStart(2, '0')} → {Math.floor((b.debut + b.duree) / 60)}h{String((b.debut + b.duree) % 60).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </Cadre>
  )
}

export { Area }
