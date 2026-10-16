// Mini rendu « markdown » des fiches : paragraphes, listes, tableaux, **gras**, *italique*, `code`.
import { Fragment } from 'react'

function enLigne(texte, cle = 0) {
  const morceaux = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g
  let dernier = 0
  let m
  let i = 0
  while ((m = re.exec(texte))) {
    if (m.index > dernier) morceaux.push(texte.slice(dernier, m.index))
    const t = m[0]
    if (t.startsWith('**')) morceaux.push(<strong key={`${cle}-${i++}`}>{enLigne(t.slice(2, -2), `${cle}b`)}</strong>)
    else if (t.startsWith('`')) morceaux.push(<code key={`${cle}-${i++}`}>{t.slice(1, -1)}</code>)
    else morceaux.push(<em key={`${cle}-${i++}`}>{t.slice(1, -1)}</em>)
    dernier = m.index + t.length
  }
  if (dernier < texte.length) morceaux.push(texte.slice(dernier))
  return morceaux
}

export default function Texte({ children, className = '' }) {
  if (!children) return null
  const lignes = String(children).trim().split('\n')
  const blocs = []
  let i = 0
  while (i < lignes.length) {
    const l = lignes[i]
    if (!l.trim()) {
      i++
      continue
    }
    if (/^\s*[-•] /.test(l)) {
      const items = []
      while (i < lignes.length && /^\s*[-•] /.test(lignes[i])) items.push(lignes[i++].replace(/^\s*[-•] /, ''))
      blocs.push(
        <ul key={blocs.length}>
          {items.map((t, j) => (
            <li key={j}>{enLigne(t, j)}</li>
          ))}
        </ul>,
      )
      continue
    }
    if (/^\s*\d+[.)] /.test(l)) {
      const items = []
      while (i < lignes.length && /^\s*\d+[.)] /.test(lignes[i])) items.push(lignes[i++].replace(/^\s*\d+[.)] /, ''))
      blocs.push(
        <ol key={blocs.length}>
          {items.map((t, j) => (
            <li key={j}>{enLigne(t, j)}</li>
          ))}
        </ol>,
      )
      continue
    }
    if (l.trim().startsWith('|')) {
      const rangs = []
      while (i < lignes.length && lignes[i].trim().startsWith('|')) rangs.push(lignes[i++])
      const cellules = rangs
        .filter((r) => !/^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(r))
        .map((r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
      const [tete, ...corps] = cellules
      blocs.push(
        <div key={blocs.length} className="defilement overflow-x-auto">
          <table>
            <thead>
              <tr>
                {tete.map((c, j) => (
                  <th key={j}>{enLigne(c, j)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corps.map((r, j) => (
                <tr key={j}>
                  {r.map((c, k) => (
                    <td key={k}>{enLigne(c, k)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    const para = []
    while (i < lignes.length && lignes[i].trim() && !/^\s*([-•]|\d+[.)]) /.test(lignes[i]) && !lignes[i].trim().startsWith('|')) para.push(lignes[i++])
    blocs.push(
      <p key={blocs.length}>
        {para.map((t, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {enLigne(t, j)}
          </Fragment>
        ))}
      </p>,
    )
  }
  return <div className={`texte text-[15px] text-encre-2 ${className}`}>{blocs}</div>
}
