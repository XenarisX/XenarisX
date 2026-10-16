// Aide-mémoire Python : les fonctions utilisées dans les TP, expliquées avec un exemple exécutable.

export const blocs = [
  {
    id: 'py-dict',
    genre: 'code',
    titre: 'Dictionnaires : préférences, mariages, regrets',
    explication: `Un dictionnaire associe une **clé** à une **valeur** : \`pref = {0: [2, 1, 0]}\`. Opérations utiles dans les TP :
- \`d[k]\` (erreur si absente), \`d.get(k, défaut)\` (pas d’erreur) ;
- \`k in d\` teste une **clé** ; \`v in d.values()\` teste une valeur ;
- \`d.items()\` donne les paires (clé, valeur) ; \`del d[k]\` supprime ;
- **clé à partir d’une valeur** : \`list(d.keys())[list(d.values()).index(v)]\` ;
- **inverser** un dictionnaire bijectif : \`{v: k for k, v in d.items()}\`.`,
    exemple: {
      code: `mariage = {0: 3, 1: 0, 2: 1, 3: 2}
print(mariage.get(5, -1))                                   # -1 : pas de KeyError
print(list(mariage.keys())[list(mariage.values()).index(0)])  # qui est avec 0 ? -> 1
inverse = {f: e for e, f in mariage.items()}
print(inverse)
for e in list(mariage.keys()):                              # copie des clés : on peut supprimer
    if mariage[e] % 2 == 0:
        del mariage[e]
print(mariage)`,
    },
    plus: `Modifier un dictionnaire pendant qu’on itère dessus (\`for e in mariage: del mariage[e]\`) lève \`RuntimeError: dictionary changed size during iteration\`. D’où \`list(mariage.keys())\` qui fige une copie.

Compréhension de dictionnaire : \`{e: 0 for e in pref}\` initialise un compteur par individu.`,
  },
  {
    id: 'py-listes',
    genre: 'code',
    titre: 'Listes : index, remove, pop, tranches, zip, enumerate',
    explication: `- \`l.index(x)\` : **position** de x (erreur si absent) ;
- \`l.remove(x)\` : retire la **première valeur** x ; \`l.pop(i)\` : retire et renvoie l’élément à l’**indice** i (\`pop(0)\` = file, mais O(n)) ;
- \`l[-1]\` dernier élément ; \`l[:k]\` les k premiers ; \`l[k:]\` à partir de k ; \`l[::-1]\` inversée ;
- \`enumerate(l)\` : paires (indice, valeur) ; \`zip(l, l[1:])\` : paires consécutives.`,
    exemple: {
      code: `seen = [430, 120, 980, 760]
print(seen[-1], seen[:2], max(seen[:2]))           # jour courant, exploration, max exploré
pref = [4, 1, 2, 0, 3]
print(pref.index(2))                               # 2 est le 3e choix (position 2)
chemin = [0, 1, 2, 5]
print(list(zip(chemin, chemin[1:])))               # arcs du chemin
for i, cap in enumerate([0, 10, 0, 5]):
    if cap > 0:
        print("voisin", i, "capacité", cap)
file = [3, 1, 4]
print(file.pop(0), file)                           # retire le premier`,
    },
    plus: `\`max([])\` lève \`ValueError: max() arg is an empty sequence\` : toujours vérifier que la tranche n’est pas vide (\`k == 0\`).

\`sorted(l)\` renvoie une **nouvelle** liste ; \`l.sort()\` trie **sur place** et renvoie None. \`sorted(d, key=lambda x: d[x])\` trie les clés d’un dictionnaire par valeur.`,
  },
  {
    id: 'py-random',
    genre: 'code',
    titre: 'Module random : bien générer des données de test',
    explication: `- \`random.randint(a, b)\` : entier entre a et b **inclus** ;
- \`random.random()\` : réel dans [0, 1[ ; \`random.uniform(a, b)\` ;
- \`random.choice(l)\` : un élément ; \`random.sample(l, k)\` : k éléments **distincts** (\`sample(range(n), n)\` = permutation) ;
- \`random.shuffle(l)\` : mélange **sur place**, renvoie **None** ;
- \`random.seed(x)\` : reproductibilité.`,
    exemple: {
      code: `import random
random.seed(1)
print(random.randint(100, 1000), random.choice(["A", "B", "C"]))
print(random.sample(range(5), 5))          # permutation de 0..4
l = list(range(5))
r = random.shuffle(l)
print(r, l)                                # None, puis la liste mélangée
pref = {i: random.sample(range(4), 4) for i in range(3)}
print(pref)`,
    },
    plus: `Erreur classique : \`d[i] = random.shuffle(l)\` met None dans d. Et si l’on écrit \`d[i] = l\` puis \`random.shuffle(l)\` pour l’entrée suivante **sans recréer l**, toutes les entrées pointent vers **la même liste** ! Recréer la liste à chaque tour (\`l = list(range(n))\`) ou utiliser \`random.sample\`.`,
  },
  {
    id: 'py-numpy-base',
    genre: 'code',
    titre: 'numpy : tableaux, produit matriciel, axes',
    explication: `- \`np.array(l)\`, \`np.zeros((n, n), int)\`, \`np.ones(n)\`, \`np.eye(n)\` (identité) ;
- \`A @ B\` produit matriciel, \`A * B\` produit **terme à terme**, \`A.T\` transposée ;
- \`A[i, j]\`, \`A[:, j]\` (colonne j), \`A[i, :]\` (ligne i) ;
- \`A.sum(axis=1)\` somme de chaque **ligne**, \`axis=0\` de chaque **colonne** ;
- \`np.diag(v)\` : matrice diagonale ; \`np.diag(M)\` : diagonale de M ; \`np.outer(u, v)\` : matrice u vᵀ ;
- \`np.allclose(a, b)\` : égalité à la précision numérique près.`,
    exemple: {
      code: `import numpy as np
A = np.array([[0, 1, 1], [1, 0, 0], [1, 0, 0]])
print(A @ A)                         # chemins de longueur 2
print(A.sum(axis=1))                 # degrés
D = np.diag(A.sum(axis=1))
print(D - A)                         # Laplacien
v = np.array([1., 2.])
print(np.outer(v, v), v @ v)         # matrice v vᵀ, produit scalaire
print(np.allclose(0.1 + 0.2, 0.3), 0.1 + 0.2 == 0.3)`,
    },
    plus: `Ne jamais tester l’égalité de réels avec \`==\` : 0.1 + 0.2 vaut 0.30000000000000004. \`np.allclose\` (ou \`abs(a − b) < 1e-9\`) est la bonne façon.

\`np.zeros((n, n), int)\` : le 2e argument est le type ; sans lui, on obtient des réels (0.), ce qui gêne l’affichage des flots.`,
  },
  {
    id: 'py-numpy-tri',
    genre: 'code',
    titre: 'numpy : argsort, argmax, where, unravel_index',
    explication: `- \`np.argsort(a)\` : **indices** qui trient a par ordre croissant ; \`(-a).argsort()\` : décroissant ;
- \`np.argmax(a)\` / \`np.argmin(a)\` : indice du max / min (dans le tableau **aplati** si 2D) ;
- \`np.unravel_index(k, forme)\` : indice aplati → (ligne, colonne) ;
- \`np.where(condition)\` : indices où la condition est vraie (renvoie un **tuple** de tableaux) ;
- \`w[:, np.argsort(v)]\` : réordonner les **colonnes** de w selon v (vecteurs propres triés).`,
    exemple: {
      code: `import numpy as np
scores = np.array([450, 120, 980, 300, 760])
ordre = (-scores).argsort()
print(ordre)                                  # [2 4 0 3 1] : du meilleur au pire
print(np.where(ordre == 4)[0][0] + 1)         # rang de l'indice 4 -> 2
grille = np.array([[5.0, 4.2, 6.1], [3.9, 3.7, 4.4]])
k = np.argmin(grille)
print(k, np.unravel_index(k, grille.shape))   # 4 -> (1, 1)
v = np.array([3., 0., 1.])
w = np.array([[1, 2, 3], [4, 5, 6]])
print(w[:, np.argsort(v)])                    # colonnes réordonnées : [2 3 1]`,
    },
  },
  {
    id: 'py-numpy-gen',
    genre: 'code',
    titre: 'numpy : arange, linspace, meshgrid, statistiques',
    explication: `- \`np.arange(début, fin, pas)\` : fin **exclue** ; \`np.linspace(a, b, k)\` : k valeurs, a et b **inclus** ;
- \`np.meshgrid(x, y)\` : deux matrices pour évaluer une fonction sur une grille (surface 3D) ;
- \`np.mean\`, \`np.median\`, \`np.std\`, \`np.percentile(a, 90)\`, \`np.cumsum\` (sommes cumulées), \`np.bincount\` (comptage d’entiers).`,
    exemple: {
      code: `import numpy as np
print(np.arange(0.05, 0.3, 0.05))
print(np.linspace(0, 1, 5))
X, Y = np.meshgrid([1, 2, 3], [10, 20])
print(X, Y, X + Y, sep="\\n")
r = np.array([1, 3, 2, 1, 7, 2, 1])
print(r.mean(), np.median(r), np.percentile(r, 90), np.bincount(r))
print(np.cumsum([10, 15, 20]))                # bornes des communautés d'un SBM`,
    },
    plus: `\`np.arange\` avec un pas réel peut produire une valeur de plus ou de moins à cause des arrondis (0.1 + 0.1 + 0.1 ≠ 0.3) : pour un nombre de points précis, préférer \`linspace\`. Arrondir à l’affichage : \`round(q, 2)\` ou \`f"{q:.2f}"\`.`,
  },
  {
    id: 'py-linalg',
    genre: 'code',
    titre: 'numpy.linalg : eig, eigh, eigvals, norm, det',
    explication: `- \`la.eig(A)\` → (valeurs, vecteurs) ; **vecteurs en colonnes**, non triés, éventuellement complexes ;
- \`la.eigh(A)\` : pour A **symétrique** ; valeurs réelles **triées croissantes** ;
- \`la.eigvals\`, \`la.eigvalsh\` : seulement les valeurs ;
- \`la.norm(v)\` ; \`la.det(A)\` ; \`la.inv(A)\` ; \`la.solve(A, b)\` (résout Ax = b).`,
    exemple: {
      code: `import numpy as np, numpy.linalg as la
A = np.array([[1, 2], [4, 3]])
vals, vecs = la.eig(A)
print(vals)                              # [-1.  5.] (ordre quelconque)
v = vecs[:, np.argmax(vals)]
print(v, np.allclose(A @ v, 5 * v))
S = np.array([[2., -1.], [-1., 2.]])
print(la.eigh(S)[0])                     # [1. 3.] triées
print(round(la.det(A), 6), "= produit des valeurs propres ;", np.trace(A), "= somme")`,
    },
  },
  {
    id: 'py-networkx',
    genre: 'code',
    titre: 'networkx : construire, convertir, calculer, dessiner',
    explication: `- \`nx.Graph()\` / \`nx.DiGraph()\` ; \`G.add_edge(u, v, capacity=10)\` ; \`G.nodes[u]["cluster"] = 0\` ;
- conversions : \`nx.to_numpy_array(G)\` ↔ \`nx.from_numpy_array(A)\` (pour un orienté : \`create_using=nx.DiGraph\`) ;
- calculs : \`nx.maximum_flow\`, \`nx.minimum_cut\`, \`nx.bipartite.hopcroft_karp_matching\`, \`nx.shortest_path\`, \`nx.connected_components\`, \`nx.pagerank\` ;
- générateurs : \`nx.random_partition_graph\`, \`nx.bipartite.random_graph\`, \`nx.gnp_random_graph\`, \`nx.karate_club_graph\` ;
- dessin : \`nx.draw(G, pos, with_labels=True, node_color=…)\`, positions \`nx.spring_layout\`, \`nx.shell_layout\`, \`nx.bipartite_layout\`.`,
    exemple: {
      code: `import networkx as nx, numpy as np
import matplotlib.pyplot as plt
G = nx.DiGraph()
G.add_edge("s", "a", capacity=4); G.add_edge("a", "t", capacity=3); G.add_edge("s", "t", capacity=2)
print(nx.maximum_flow_value(G, "s", "t"))
H = nx.from_numpy_array(np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]))
print(list(H.edges), nx.is_connected(H))
pos = nx.spring_layout(H, seed=1)
nx.draw(H, pos, with_labels=True, node_color=["tab:blue", "tab:orange", "tab:blue"])
labels = nx.get_edge_attributes(G, "capacity")
print(labels)
plt.show()`,
    },
    plus: `Le dessin des flots du TP3 (\`edmonds_Karp_draw\`) : \`nx.draw_networkx_edge_labels(G, pos, edge_labels={(u, v): "flot/cap"})\` pour afficher « 5/10 » sur chaque arc, \`width=\` pour l’épaisseur proportionnelle à la capacité, \`edge_color=\` + \`edge_cmap\` pour colorer selon la saturation.`,
  },
  {
    id: 'py-matplotlib',
    genre: 'code',
    titre: 'matplotlib : les tracés des TP',
    explication: `- \`plt.plot(x, y, "o-", label="…")\`, \`plt.xlabel\`, \`plt.ylabel\`, \`plt.title\`, \`plt.legend()\`, \`plt.grid()\`, \`plt.show()\` ;
- \`plt.yscale("log")\` (convergence), \`plt.loglog\` (complexité) ;
- \`plt.axhline(y)\` / \`plt.axvline(x)\` : ligne de référence ;
- \`plt.hist\`, \`plt.bar\`, \`plt.boxplot\`, \`plt.imshow\` + \`plt.colorbar\` (heatmap), \`plt.quiver\` (vecteurs, TP4) ;
- 3D : \`ax = plt.figure().add_subplot(projection="3d")\`, \`ax.plot_surface(X, Y, Z, cmap=cm.coolwarm)\`.`,
    exemple: {
      code: `import numpy as np, matplotlib.pyplot as plt
k = np.arange(1, 21)
fig, (a, b) = plt.subplots(1, 2, figsize=(10, 3.5))
a.plot(k, 4 + 3 * 0.25 ** k, "o-", label="λ estimé"); a.axhline(4, color="red", ls="--", label="λ = 4")
a.set_xlabel("itération"); a.legend(); a.set_title("Convergence")
b.plot(k, 3 * 0.25 ** k); b.set_yscale("log"); b.set_title("Erreur (échelle log)")
plt.tight_layout(); plt.show()
plt.quiver(0, 0, 1, 2, angles="xy", scale_units="xy", scale=1, color="k")
plt.quiver(0, 0, 4, 8, angles="xy", scale_units="xy", scale=1, color="orange")
plt.xlim(-1, 5); plt.ylim(-1, 9); plt.title("v et A v : même direction -> vecteur propre"); plt.show()`,
    },
  },
  {
    id: 'py-copy',
    genre: 'piege',
    titre: 'Copies : =, .copy(), copy.deepcopy',
    explication: `\`b = a\` ne copie **rien** : a et b désignent le même objet. \`a.copy()\` ou \`list(a)\` copie **un niveau** (les listes internes sont partagées). \`copy.deepcopy(a)\` copie **tout**. Pour un dictionnaire de listes de préférences que l’algorithme modifie (Selkow), seule \`deepcopy\` est sûre.`,
    exemple: {
      code: `import copy
pref = {0: [1, 2], 1: [2, 1]}
alias = pref
surface = pref.copy()
profonde = copy.deepcopy(pref)
pref[0].remove(1)
print(alias[0], surface[0], profonde[0])     # [2] [2] [1, 2]`,
    },
  },
  {
    id: 'py-deque',
    genre: 'code',
    titre: 'collections.deque : la file du BFS',
    explication: `\`deque\` est une liste optimisée aux deux bouts : \`append\` (ajout à droite), \`popleft\` (retrait à gauche) en O(1). C’est la **file** (premier entré, premier sorti) du parcours en largeur.`,
    exemple: {
      code: `from collections import deque
file = deque([0])
vus = {0}
voisins = {0: [1, 3], 1: [2], 3: [2, 4], 2: [5], 4: [5], 5: []}
ordre = []
while file:
    u = file.popleft(); ordre.append(u)
    for v in voisins[u]:
        if v not in vus:
            vus.add(v); file.append(v)
print(ordre)                                  # parcours par niveaux`,
    },
  },
  {
    id: 'py-lambda',
    genre: 'code',
    titre: 'lambda, fonctions en paramètre, fabriques',
    explication: `Une fonction est une valeur : on peut la passer en paramètre (\`resultat(liste, dummy_choice)\`). \`lambda n, s: choice_q(n, s, 0.3)\` crée une petite fonction anonyme qui **fige** un paramètre pour respecter la signature \`(n, seen)\`. Une **fabrique** (fonction qui renvoie une fonction) fait la même chose plus proprement.`,
    exemple: {
      code: `def choice_q(n, seen, q):
    k = int(n * q)
    return len(seen) == n or (len(seen) > k > 0 and seen[-1] >= max(seen[:k]))

f = lambda n, s: choice_q(n, s, 0.3)
print(f(10, [5, 3, 9, 4]))

def fabrique(q):
    def choix(n, seen):
        return choice_q(n, seen, q)
    return choix

strategies = {q: fabrique(q) for q in [0.2, 0.4]}
print([s(10, [1, 2, 3, 4, 5]) for s in strategies.values()])`,
    },
    plus: `Piège des lambdas dans une boucle stockées pour plus tard : \`[lambda n, s: choice_q(n, s, q) for q in qs]\` → toutes utilisent le **dernier** q (liaison tardive). La fabrique, ou \`lambda n, s, q=q: …\`, fige la valeur. Si la lambda est appelée tout de suite dans la boucle (cas de \`resultat\`), pas de problème.`,
  },
  {
    id: 'py-temps',
    genre: 'code',
    titre: 'Mesurer le temps : time.perf_counter',
    explication: `\`time.perf_counter()\` renvoie un temps en secondes très précis ; la différence avant/après donne la durée. Moyenner sur plusieurs exécutions et tester des tailles croissantes.`,
    exemple: {
      code: `import time
debut = time.perf_counter()
s = sum(i * i for i in range(200_000))
print(f"{(time.perf_counter() - debut) * 1000:.1f} ms")`,
    },
  },
  {
    id: 'py-assert',
    genre: 'code',
    titre: 'Tests : assert et try/except comme dans les TP',
    explication: `\`assert condition\` lève \`AssertionError\` si la condition est fausse. Les TP l’entourent d’un \`try/except\` pour afficher OK / ERREUR. Indispensable sur les cas limites (n = 1, liste vide, dernier jour).`,
    exemple: {
      code: `def choice(n, seen):
    k = int(n * 0.35)
    if len(seen) == n or k == 0:
        return True
    return len(seen) > k and seen[-1] >= 0.9 * max(seen[:k])

try:
    assert choice(1, [5]) is True                    # n = 1 : on accepte
    assert choice(3, [1, 2, 3]) is True              # dernier jour : obligé
    assert choice(30, [100] * 5) is False            # exploration
    assert choice(30, [100] * 10 + [95]) is True     # 95 >= 0.9 * 100
    print("choice : OK")
except AssertionError:
    print("choice : ERREUR")`,
    },
  },
  {
    id: 'py-fstring',
    genre: 'code',
    titre: 'Afficher proprement : f-strings',
    explication: `\`f"{x:.2f}"\` 2 décimales, \`f"{x:>8}"\` aligné à droite sur 8 caractères, \`f"{p:.1%}"\` pourcentage, \`f"{n:,}"\` séparateur de milliers. Un tableau aligné au \`print\` rend les résultats lisibles sans pandas.`,
    exemple: {
      code: `resultats = [("dummy", 15.52, 0.033), ("q=0,35 m=0,9", 3.77, 0.199)]
print(f"{'version':<14}{'rang':>7}{'P(meilleur)':>13}")
for nom, r, p in resultats:
    print(f"{nom:<14}{r:>7.2f}{p:>13.1%}")`,
    },
  },
]
