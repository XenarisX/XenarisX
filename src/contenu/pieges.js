// Erreurs fréquentes et messages d'erreur Python rencontrés dans les TP.

export const blocs = [
  {
    id: 'pg-erreurs',
    genre: 'piege',
    titre: 'Lire un message d’erreur en 10 secondes',
    explication: `| Message | Cause probable | Correction |
|---|---|---|
| \`ValueError: max() arg is an empty sequence\` | \`max(seen[:k])\` avec k = 0 | traiter \`k == 0\` à part |
| \`KeyError: 5\` | clé absente d’un dictionnaire | \`d.get(5, -1)\` ou \`if 5 in d\` |
| \`ValueError: 3 is not in list\` | \`l.index(3)\` ou \`l.remove(3)\` sur absent | tester \`3 in l\` avant |
| \`IndexError: list index out of range\` | indice ≥ len (souvent jour vs indice) | vérifier \`i - 1\` / \`len(l)\` |
| \`RuntimeError: dictionary changed size during iteration\` | suppression dans une boucle sur le dict | itérer sur \`list(d.keys())\` |
| \`TypeError: 'NoneType' object …\` | résultat de \`shuffle\`, \`sort\`, \`append\` utilisé | ces méthodes renvoient None |
| \`ValueError: operands could not be broadcast\` | tailles de tableaux incompatibles | \`print(A.shape, v.shape)\` |
| \`LinAlgError\` / valeurs complexes | matrice non symétrique avec \`eigh\` ou complexe | \`eig\` + \`.real\` |
| boucle infinie | condition jamais vraie, compteur non incrémenté | \`print\` dans la boucle, max d’itérations |`,
  },
  {
    id: 'pg-logique',
    genre: 'piege',
    titre: 'Les erreurs de logique qui ne plantent pas (les pires)',
    explication: `- **Variable globale \`n\`** utilisée dans une fonction alors qu’on la change dans une boucle (fonction \`resultat\` du sujet).
- **Jour vs indice** : \`len(seen)\` va de 1 à n ; les indices de 0 à n − 1. Le dernier jour : \`len(seen) == n\`.
- **Même liste partagée** : \`d[i] = l\` puis \`shuffle(l)\` → toutes les entrées identiques.
- **Préférences détruites** par un algorithme qui fait des \`remove\` sans \`deepcopy\`.
- **Comparer des stratégies sur des tirages différents** sans assez d’essais : la différence mesurée est du bruit.
- **Valeurs propres non triées** : prendre \`w[:, 1]\` après \`eig\` sans \`argsort\` n’est pas forcément Fiedler.
- **Vecteurs propres en lignes** : \`vecteurs[i]\` au lieu de \`vecteurs[:, i]\`.
- **Seuils codés en dur** (100, 1000) alors que le sujet prévient que les bornes changent.
- **Étiquettes de clustering permutées** : 40 % de précision peut vouloir dire 60 %.`,
  },
  {
    id: 'pg-rendu',
    genre: 'piege',
    titre: 'Pièges du rendu',
    explication: `- Graphique **sans titre, axes ou légende** → perte de points de clarté.
- Graphique **sans phrase d’analyse** en dessous → le correcteur ne sait pas ce que tu en conclus.
- **Une seule métrique** → analyse jugée non exhaustive.
- **Pas de baseline** → impossible de dire si la stratégie est bonne.
- **Pas de choix final** alors que plusieurs versions sont proposées (demandé explicitement).
- Notebook qui **ne tourne pas** après Restart & Run All (cellules exécutées dans le désordre pendant la séance).
- Temps de calcul énorme (grille 2D à 10 000 essais par case) : le correcteur ne relancera pas. Réduire, et indiquer le temps.`,
  },
  {
    id: 'pg-jupyter',
    genre: 'methode',
    titre: 'Réflexes Jupyter',
    explication: `- **Shift + Entrée** exécute la cellule ; **Échap puis M** la passe en markdown, **Y** en code ; **A** / **B** insèrent au-dessus / en dessous ; **D D** supprime.
- \`%%time\` en première ligne d’une cellule affiche son temps d’exécution.
- \`?fonction\` affiche l’aide (\`?np.unravel_index\`).
- Redémarrer le noyau si une variable « fantôme » traîne (fonction redéfinie, ancien n).
- Markdown : \`#\` titres, \`**gras**\`, listes \`-\`, formules \`$\\lambda_1$\`, tableaux \`| a | b |\`.`,
  },
]
