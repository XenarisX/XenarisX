import { useEffect, useState } from 'react'
import { Sidebar, Navbar, Recherche, lireRoute } from './components/Layout'
import { pageDe } from './contenu'
import Accueil from './pages/Accueil'
import PageBlocs from './pages/PageBlocs'
import Entrainement from './pages/Entrainement'

export default function App() {
  const [{ route, ancre }, setR] = useState(lireRoute)
  const [menu, setMenu] = useState(false)
  const [recherche, setRecherche] = useState(false)

  useEffect(() => {
    const surHash = () => setR(lireRoute())
    window.addEventListener('hashchange', surHash)
    return () => window.removeEventListener('hashchange', surHash)
  }, [])

  useEffect(() => {
    const surTouche = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setRecherche((o) => !o)
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        setRecherche(true)
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])

  // défilement vers la fiche demandée, sinon haut de page
  useEffect(() => {
    const t = setTimeout(() => {
      if (ancre) document.getElementById(ancre)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0 })
    }, 60)
    return () => clearTimeout(t)
  }, [route, ancre])

  const page = pageDe(route)
  let contenu
  if (!page || route === 'accueil') contenu = <Accueil />
  else if (route === 'entrainement') contenu = <Entrainement page={page} ancre={ancre} />
  else contenu = <PageBlocs key={route} page={page} ancre={ancre} />

  return (
    <div className="min-h-screen bg-fond">
      <Sidebar route={page ? route : 'accueil'} ouverte={menu} onFermer={() => setMenu(false)} />
      <div className="p-4 xl:ml-80">
        <Navbar route={page ? route : 'accueil'} onMenu={() => setMenu(true)} onRecherche={() => setRecherche(true)} />
        <main className="mt-6">{contenu}</main>
        <footer className="py-6 text-sm text-discret">R5.A.12 Modélisations mathématiques · IUT de Vannes · fiches de révision rédigées à partir des cours, TP et corrigés</footer>
      </div>
      <Recherche ouverte={recherche} onFermer={() => setRecherche(false)} />
    </div>
  )
}
