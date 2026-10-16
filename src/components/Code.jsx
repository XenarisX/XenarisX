import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid'

export default function Code({ code, langage = 'python', titre, sortie, maxHauteur = 560 }) {
  const [copie, setCopie] = useState(false)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(code.trim())
      setCopie(true)
      setTimeout(() => setCopie(false), 1500)
    } catch {
      /* presse-papiers indisponible */
    }
  }
  return (
    <div className="overflow-hidden rounded-lg border border-[#37474f] bg-[#263238]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-[#90a4ae]">{titre ?? langage}</span>
        <button onClick={copier} className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-bold uppercase text-[#b0bec5] hover:bg-white/10 hover:text-white">
          {copie ? <CheckIcon className="h-3.5 w-3.5 text-ok" /> : <ClipboardDocumentIcon className="h-3.5 w-3.5" />}
          {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      <Highlight theme={themes.oceanicNext} code={code.trim()} language={langage}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="defilement overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed" style={{ maxHeight: maxHauteur, background: 'transparent' }}>
            {tokens.map((ligne, i) => (
              <div key={i} {...getLineProps({ line: ligne })}>
                {ligne.map((t, j) => (
                  <span key={j} {...getTokenProps({ token: t })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      {sortie && (
        <div className="border-t border-white/10 bg-[#1e272c] px-4 py-2.5">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-[#78909c]">Sortie</p>
          <pre className="defilement overflow-auto whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-[#c5e1a5]">{sortie.trim()}</pre>
        </div>
      )}
    </div>
  )
}
