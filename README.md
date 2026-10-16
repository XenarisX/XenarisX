# Prépa TP noté R5.A.12 (xenaris.org/exams)

Site React de révision pour le TP noté de Modélisations mathématiques (IUT de Vannes) :
méthodo, boîte à outils de métriques, chapitres du cours (Gale-Shapley, Selkow, flots, couplage,
valeurs propres, clustering spectral), TP noté 2024 corrigé, sujets d'entraînement, aide-mémoire Python.

```bash
npm install
npm run dev      # http://localhost:5173/exams/
npm run build    # dist/exams
```

- `outils/generer_donnees.py` : exécute le code du cours et produit `src/contenu/donnees.json` (données des graphiques).
- `node outils/exporter.mjs && python3 outils/executer.py` : exécute tout le code Python du site et met à jour `src/contenu/sorties.json`.
