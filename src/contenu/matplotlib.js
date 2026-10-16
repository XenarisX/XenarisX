// Section matplotlib : chaque exemple est exécuté (outils/executer.py) et les figures produites
// sont enregistrées dans public/assets/mpl/ puis affichées sous le code (figures.json).
const py = String.raw

// Simulation du secrétaire réutilisée dans plusieurs exemples (vectorisée, rapide).
const SIM = py`import numpy as np
import matplotlib.pyplot as plt

def simuler(n, k, N=4000, graine=0):
    """Rang (1 = meilleur) choisi par la règle : observer k candidats, puis prendre
    le premier meilleur que tous ceux vus ; sinon le dernier. N essais d'un coup."""
    rng = np.random.default_rng(graine)
    rangs = rng.random((N, n)).argsort(1).argsort(1) + 1
    if k == 0:
        return rangs[:, 0]
    meilleur_vu = rangs[:, :k].min(1)
    mieux = rangs[:, k:] < meilleur_vu[:, None]
    idx = np.where(mieux.any(1), k + mieux.argmax(1), n - 1)
    return rangs[np.arange(N), idx]
`

export const blocs = [
  {
    id: 'mpl-choisir',
    genre: 'methode',
    titre: 'Quel graphique pour quelle question ?',
    explication: `Avant d’écrire une ligne, se demander **quelle question le graphique doit trancher**. Le type de graphique en découle :

| Question posée | Graphique | Fonction |
|---|---|---|
| Comment un indicateur évolue selon **un** paramètre (q, n, k…) ? | courbe | \`ax.plot(x, y, "o-")\` |
| Comment il évolue selon **deux** paramètres ? | carte de chaleur | \`ax.imshow(Z)\` + \`fig.colorbar\` |
| Quelle stratégie est la meilleure (moyennes) ? | barres + barres d’erreur | \`ax.bar(x, y, yerr=e)\` |
| Comment se **répartissent** les résultats ? | histogramme | \`ax.hist(r, bins=…)\` |
| Comparer des **distributions** côte à côte ? | boîtes à moustaches / violons | \`ax.boxplot([a, b])\` |
| La mesure est-elle fiable ? | bande de confiance | \`ax.fill_between(x, bas, haut)\` |
| Complexité d’un algorithme ? | log-log + pente | \`ax.loglog\` + \`np.polyfit\` |
| Convergence (puissance itérée) ? | erreur en échelle log | \`ax.semilogy\` |
| Deux indicateurs d’unités différentes ? | double axe | \`ax.twinx()\` |
| Points dans le plan, groupes (clustering) ? | nuage coloré | \`ax.scatter(x, y, c=labels)\` |
| Structure d’une matrice (blocs) ? | matrice en image | \`ax.imshow(A)\` / \`ax.spy(A)\` |
| Graphe, réseau de flots ? | dessin networkx | \`nx.draw_networkx(G, pos, ax=ax)\` |`,
    exemple: {
      texte: 'Le squelette à copier en début de notebook (imports, taille par défaut, police lisible) :',
      code: py`import numpy as np
import matplotlib.pyplot as plt

plt.rcParams.update({
    "figure.figsize": (7, 4),     # taille par défaut de toutes les figures
    "font.size": 11,
    "axes.grid": True,            # grille sur tous les graphiques
    "grid.alpha": 0.3,
    "axes.spines.top": False,     # enlève les bords inutiles
    "axes.spines.right": False,
})
print("figsize :", plt.rcParams["figure.figsize"])`,
    },
    plus: `Règle d’or pour un TP noté : **un graphique = une question = une phrase d’analyse en dessous** (cellule markdown). Un correcteur ne lit pas un graphique sans conclusion. Formule type : « Le rang moyen est minimal pour q ≈ 0,15 (≈ 5,1) ; au-delà, on rate trop souvent le meilleur et on finit au dernier jour. »`,
  },
  {
    id: 'mpl-interfaces',
    genre: 'notion',
    titre: 'Les deux façons d’écrire : plt.… ou fig, ax',
    explication: `matplotlib propose deux interfaces qui produisent la même chose :

- **pyplot (implicite)** : \`plt.plot\`, \`plt.title\`, \`plt.xlabel\`… agissent sur « la figure courante ». Pratique pour un seul graphique rapide.
- **objet (explicite)** : \`fig, ax = plt.subplots()\` puis \`ax.plot\`, \`ax.set_title\`, \`ax.set_xlabel\`… On sait **toujours** sur quel graphique on dessine. Indispensable dès qu’il y a plusieurs sous-graphiques, un double axe ou une barre de couleur.

| pyplot | objet (ax) |
|---|---|
| \`plt.title("…")\` | \`ax.set_title("…")\` |
| \`plt.xlabel("…")\` / \`plt.ylabel\` | \`ax.set_xlabel("…")\` / \`ax.set_ylabel\` |
| \`plt.xlim(0, 1)\` / \`plt.ylim\` | \`ax.set_xlim(0, 1)\` / \`ax.set_ylim\` |
| \`plt.xticks(pos, noms)\` | \`ax.set_xticks(pos, noms)\` |
| \`plt.legend()\`, \`plt.grid()\` | \`ax.legend()\`, \`ax.grid()\` |
| \`plt.colorbar(im)\` | \`fig.colorbar(im, ax=ax)\` |
| \`plt.suptitle\` | \`fig.suptitle\` |

**Conseil** : prendre l’habitude de l’interface objet ; c’est elle qu’on trouve dans la documentation et elle évite les graphiques qui se dessinent au mauvais endroit.`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 1, 50)
fig, ax = plt.subplots(figsize=(6, 3.5))
ax.plot(x, x ** 2, label="x²")
ax.plot(x, np.sqrt(x), "--", label="√x")
ax.set(title="Interface objet", xlabel="x", ylabel="f(x)", xlim=(0, 1))   # set(...) règle tout d'un coup
ax.legend()
plt.show()
print(type(fig).__name__, type(ax).__name__)`,
    },
    plus: `\`ax.set(title=…, xlabel=…, ylim=…)\` fixe plusieurs propriétés en une ligne. \`plt.gca()\` (« get current axes ») renvoie l’\`ax\` courant si on a commencé en pyplot et qu’on veut passer à l’objet. \`plt.subplots()\` sans argument crée une figure avec **un seul** \`ax\`.`,
  },
  {
    id: 'mpl-parfait',
    genre: 'methode',
    titre: 'Le graphique « qui rapporte les points »',
    explication: `Checklist à appliquer à **chaque** graphique du rendu :

1. **Titre qui dit ce qu’on mesure** et les conditions (n, nombre d’essais).
2. **Axes nommés avec unité ou sens** (« rang moyen (1 = meilleur) »).
3. **Légende** dès qu’il y a plus d’une courbe (et un \`label=\` sur chaque tracé).
4. **Référence / baseline** : \`ax.axhline\` (hasard, borne théorique, 1/e…).
5. **Optimum repéré** : point + \`ax.annotate\` avec sa valeur.
6. **Grille légère** et taille suffisante (\`figsize=(7, 4)\`).
7. **Phrase d’analyse** en markdown juste en dessous.`,
    exemple: {
      code: SIM + py`
n = 30
q = np.linspace(0, 0.95, 20)
rang = np.array([simuler(n, int(n * v)).mean() for v in q])
i = rang.argmin()

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(q, rang, "o-", label="règle d'arrêt (exploration q)")
ax.axhline((n + 1) / 2, color="gray", ls="--", label=f"au hasard = {(n + 1) / 2:.1f}")
ax.plot(q[i], rang[i], "r*", ms=15, zorder=3)
ax.annotate(f"optimum q = {q[i]:.2f}\nrang = {rang[i]:.2f}", xy=(q[i], rang[i]),
            xytext=(q[i] + 0.15, rang[i] + 5), arrowprops=dict(arrowstyle="->"))
ax.set(title=f"Rang moyen obtenu selon q (n = {n}, 4 000 essais)",
       xlabel="q : part des candidats seulement observés", ylabel="rang moyen (1 = meilleur)")
ax.legend(); ax.grid(alpha=0.3)
plt.show()
print(f"meilleur q = {q[i]:.2f}, rang moyen = {rang[i]:.2f}")`,
    },
    plus: `Ce qui fait perdre des points le plus souvent : pas de légende, axes « x » / « y », une figure minuscule, deux graphiques superposés par erreur (oubli de \`plt.show()\` ou de \`fig, ax = plt.subplots()\`), et surtout **aucune conclusion écrite**. Mettre la valeur de l’optimum dans le titre ou l’annotation évite au correcteur de la chercher.`,
  },
  {
    id: 'mpl-styles',
    genre: 'code',
    titre: 'plot : marqueurs, traits, couleurs',
    explication: `\`ax.plot(x, y, fmt, **options)\`. La chaîne **fmt** combine couleur, marqueur et trait : \`"o-"\` (ronds reliés), \`"s--"\` (carrés, tirets), \`"^:"\` (triangles, pointillés), \`"r."\` (points rouges seuls), \`"k-"\` (trait noir).

| Option | Rôle | Exemples |
|---|---|---|
| \`color\` / \`c\` | couleur | \`"tab:blue"\`, \`"C0"\`…\`"C9"\`, \`"#e53935"\`, \`"0.5"\` (gris) |
| \`marker\` | marqueur | \`"o" "s" "^" "v" "D" "x" "+" "*" "."\` |
| \`linestyle\` / \`ls\` | trait | \`"-" "--" ":" "-." "none"\` |
| \`linewidth\` / \`lw\` | épaisseur | \`2\` |
| \`markersize\` / \`ms\` | taille marqueur | \`8\` |
| \`alpha\` | transparence | \`0.4\` |
| \`label\` | nom dans la légende | \`"Gale-Shapley"\` |
| \`markevery\` | un marqueur sur k | \`5\` |
| \`zorder\` | ordre d’affichage | \`3\` (au-dessus) |`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

x = np.arange(1, 11)
fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(x, x, "o-", label='"o-"')
ax.plot(x, 1.5 * x, "s--", label='"s--"')
ax.plot(x, 2 * x, "^:", ms=9, label='"^:" ms=9')
ax.plot(x, 2.5 * x, color="#e53935", lw=3, alpha=0.5, label="lw=3 alpha=0.5")
ax.plot(x, 3 * x, "kD", ls="none", label='"kD" sans trait')
ax.set(title="Styles de tracé", xlabel="x", ylabel="y")
ax.legend(ncol=2, fontsize=9)
plt.show()`,
    },
    plus: `Pour comparer des stratégies, garder **une couleur par stratégie** sur tous les graphiques du notebook (ex. Gale-Shapley toujours bleu, Selkow toujours orange). Les couleurs \`"C0"\`, \`"C1"\`… sont celles du cycle par défaut : \`color="C1"\` garantit la même teinte partout. Pour l’impression noir et blanc, varier aussi les marqueurs et les traits.`,
  },
  {
    id: 'mpl-famille',
    genre: 'code',
    titre: 'Une famille de courbes (balayage d’un 2ᵉ paramètre)',
    explication: `Quand on veut montrer l’effet d’un paramètre secondaire (n, m, seuil…), on trace **une courbe par valeur dans une boucle**, avec un dégradé de couleurs ordonné : \`couleurs = plt.cm.viridis(np.linspace(0, 1, len(valeurs)))\`. La légende peut avoir un titre (\`ax.legend(title="n")\`).

Colormaps utiles : \`viridis\`, \`plasma\` (séquentielles, lisibles en N&B), \`coolwarm\` / \`RdBu\` (divergentes autour d’un centre), \`tab10\` (catégories). Ajouter \`_r\` inverse : \`viridis_r\`.`,
    exemple: {
      code: SIM + py`
tailles = [5, 10, 20, 50, 100]
couleurs = plt.cm.viridis(np.linspace(0, 0.9, len(tailles)))
fig, ax = plt.subplots(figsize=(7, 4))
for n, c in zip(tailles, couleurs):
    q = np.linspace(0, 0.9, 19)
    p = [(simuler(n, int(n * v), N=3000) == 1).mean() for v in q]
    ax.plot(q, p, "o-", color=c, ms=4, label=f"n = {n}")
ax.axhline(1 / np.e, color="red", ls="--", label="1/e ≈ 0,368")
ax.axvline(1 / np.e, color="red", ls=":", alpha=0.6)
ax.set(title="P(choisir le meilleur) selon q, pour plusieurs n",
       xlabel="q (part observée)", ylabel="P(rang 1)")
ax.legend(title="taille", fontsize=9)
plt.show()`,
    },
    plus: `Autre option quand il y a beaucoup de valeurs : pas de légende mais une **barre de couleur** : \`sm = plt.cm.ScalarMappable(cmap="viridis", norm=plt.Normalize(min(v), max(v)))\` puis \`fig.colorbar(sm, ax=ax, label="n")\`. Au-delà de 6–7 courbes, préférer une carte de chaleur (fiche « Carte de chaleur »).`,
  },
  {
    id: 'mpl-subplots',
    genre: 'code',
    titre: 'Plusieurs graphiques : subplots, axes[i, j], suptitle',
    explication: `\`fig, axes = plt.subplots(lignes, colonnes, figsize=(L, H))\` renvoie un **tableau numpy d’axes** :

- 1 ligne ou 1 colonne → tableau 1D : \`axes[0]\`, \`axes[1]\` (ou \`a, b = axes\`) ;
- grille → tableau 2D : \`axes[i, j]\` ; parcourir tout : \`for ax in axes.flat\` ;
- \`sharex=True\` / \`sharey=True\` : même échelle (comparaison honnête) ;
- \`layout="constrained"\` (ou \`plt.tight_layout()\` à la fin) : évite les titres qui se chevauchent ;
- \`fig.suptitle("…")\` : titre général ; \`ax.axis("off")\` cache une case vide ;
- grille irrégulière : \`plt.subplot_mosaic("AAB;CCB")\` renvoie un dictionnaire d’axes.`,
    exemple: {
      code: SIM + py`
n = 30
q = np.linspace(0.05, 0.9, 18)
res = [simuler(n, int(n * v)) for v in q]
moy = [r.mean() for r in res]
pmeil = [(r == 1).mean() for r in res]
pdern = [(r == n).mean() for r in res]

fig, axes = plt.subplots(2, 2, figsize=(9, 6), layout="constrained")
axes[0, 0].plot(q, moy, "o-"); axes[0, 0].set_title("rang moyen")
axes[0, 1].plot(q, pmeil, "o-", color="C2"); axes[0, 1].set_title("P(meilleur)")
axes[1, 0].plot(q, pdern, "o-", color="C3"); axes[1, 0].set_title("P(pire candidat)")
axes[1, 1].hist(res[5], bins=np.arange(0.5, n + 1.5), color="C4")
axes[1, 1].set_title(f"distribution des rangs, q = {q[5]:.2f}")
for ax in [axes[0, 0], axes[0, 1], axes[1, 0]]:
    ax.set_xlabel("q")
axes[1, 1].set_xlabel("rang")
fig.suptitle("Quatre indicateurs d'une même stratégie (n = 30)", fontweight="bold")
plt.show()`,
    },
    plus: `Erreur classique : \`fig, ax = plt.subplots(1, 2)\` puis \`ax.plot(...)\` → *AttributeError: 'numpy.ndarray' object has no attribute 'plot'*. Avec plusieurs cases, \`ax\` est un **tableau** : écrire \`ax[0].plot\`. Attention aussi à \`sharex=True\` : il impose le même axe x à **toutes** les cases. Ici la case histogramme a un axe « rang » (1 à 30) et les autres un axe « q » (0 à 1) : partager écraserait les trois courbes contre le bord. Ne partager que des axes qui mesurent la même chose.`,
  },
  {
    id: 'mpl-twinx',
    genre: 'code',
    titre: 'Double axe y : twinx (deux indicateurs sur un graphique)',
    explication: `\`ax2 = ax.twinx()\` crée un second axe y à droite qui partage l’axe x. Utile pour montrer **le compromis** entre deux indicateurs d’échelles différentes (rang moyen ~ 1–15 et probabilité 0–1).

Bonnes pratiques :
- colorer chaque axe comme sa courbe (\`ax.set_ylabel(…, color="C0")\`, \`ax.tick_params(axis="y", labelcolor="C0")\`) ;
- **fusionner les légendes** : chaque axe a la sienne ; on récupère les tracés et on fait une seule \`ax.legend(l1 + l2, …)\`.`,
    exemple: {
      code: SIM + py`
n = 30
q = np.linspace(0, 0.9, 19)
res = [simuler(n, int(n * v)) for v in q]
fig, ax = plt.subplots(figsize=(7, 4.4), layout="constrained")
l1 = ax.plot(q, [r.mean() for r in res], "o-", color="C0", label="rang moyen")
ax.set_ylabel("rang moyen (1 = meilleur)", color="C0")
ax.tick_params(axis="y", labelcolor="C0")
ax2 = ax.twinx()
l2 = ax2.plot(q, [(r == 1).mean() for r in res], "s--", color="C1", label="P(meilleur)")
ax2.set_ylabel("P(meilleur)", color="C1")
ax2.tick_params(axis="y", labelcolor="C1"); ax2.grid(False)
ax.set(title="Le compromis exploration / exploitation (n = 30)", xlabel="q")
ax.legend(l1 + l2, [l.get_label() for l in l1 + l2], loc="upper center",
          bbox_to_anchor=(0.5, -0.15), ncol=2)        # légende sous le graphique
plt.show()`,
    },
    plus: `\`ax.plot\` renvoie une **liste** de tracés : d’où \`l1 + l2\` (concaténation de listes). Un double axe peut tromper visuellement (deux échelles choisies arbitrairement) : si le correcteur doit comparer précisément, préférer deux sous-graphiques côte à côte.`,
  },
  {
    id: 'mpl-echelles',
    genre: 'code',
    titre: 'Échelles log : convergence et complexité',
    explication: `- **Convergence** (puissance itérée, chapitre valeurs propres) : l’erreur décroît comme (λ₂/λ₁)ᵏ → en **échelle log en y** (\`ax.semilogy\` ou \`ax.set_yscale("log")\`) c’est une **droite** de pente log(λ₂/λ₁).
- **Complexité** : si le coût vaut c·nᵃ, en **log-log** (\`ax.loglog\`) c’est une droite de pente **a**. On mesure la pente avec \`np.polyfit(np.log(n), np.log(cout), 1)[0]\`.
- \`ax.set_xscale("log", base=2)\` pour des tailles en puissances de 2.`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

# 1) convergence de la puissance itérée
A = np.array([[4.0, 1.0], [2.0, 3.0]])           # valeurs propres 5 et 2
v = np.array([1.0, -0.3]); err = []
for k in range(25):
    v = A @ v; v /= np.linalg.norm(v)
    err.append(abs(v @ A @ v - 5))

# 2) complexité mesurée : comparaisons du tri par insertion
def comparaisons(n, rng):
    t, c = list(rng.random(n)), 0
    for i in range(1, n):
        j = i
        while j > 0:
            c += 1
            if t[j - 1] <= t[j]: break
            t[j - 1], t[j] = t[j], t[j - 1]; j -= 1
    return c
rng = np.random.default_rng(0)
tailles = np.array([50, 100, 200, 400, 800, 1600])
cout = np.array([comparaisons(n, rng) for n in tailles])
pente, b = np.polyfit(np.log(tailles), np.log(cout), 1)

fig, (a, c) = plt.subplots(1, 2, figsize=(10, 3.8), layout="constrained")
a.semilogy(err, "o-"); a.set(title="Erreur de la puissance itérée", xlabel="itération k", ylabel="|λ estimé − 5| (log)")
c.loglog(tailles, cout, "o", label="mesures")
c.loglog(tailles, np.exp(b) * tailles ** pente, "--", label=f"ajustement : pente {pente:.2f}")
c.set(title="Tri par insertion : comparaisons", xlabel="n (log)", ylabel="comparaisons (log)"); c.legend()
plt.show()
print(f"pente log-log = {pente:.2f}  ->  O(n^{round(pente)})")`,
    },
    plus: `Une pente ≈ 1 → linéaire, ≈ 2 → quadratique, ≈ 3 → cubique. Pour \`n log n\`, la pente est un peu au-dessus de 1 (≈ 1,1). Mesurer sur des tailles **géométriques** (×2) pour avoir des points régulièrement espacés en log. Si on mesure des **temps** (\`time.perf_counter\`), répéter et prendre le minimum ou la médiane, les petites tailles sont bruitées.`,
  },
  {
    id: 'mpl-hist',
    genre: 'metrique',
    titre: 'Histogramme : la distribution des résultats',
    explication: `\`ax.hist(donnees, bins=…)\` compte combien de valeurs tombent dans chaque intervalle.

- \`bins=20\` (nombre), \`bins="auto"\`, ou des bornes explicites ;
- **données entières (rangs, jours)** : centrer les barres avec \`bins=np.arange(0.5, n + 1.5)\` → une barre par valeur ;
- \`density=True\` : hauteurs = proportions (comparer des échantillons de tailles différentes) ;
- superposer deux distributions : \`alpha=0.5\` ou \`histtype="step"\` ;
- \`cumulative=True\` : fonction de répartition (« P(rang ≤ r) ») ;
- ajouter la moyenne / médiane avec \`ax.axvline\`.`,
    exemple: {
      code: SIM + py`
n = 30
a = simuler(n, int(0.2 * n))
b = simuler(n, int(0.37 * n))
bornes = np.arange(0.5, n + 1.5)
fig, (g, d) = plt.subplots(1, 2, figsize=(10, 3.8), layout="constrained")
g.hist(a, bins=bornes, alpha=0.6, density=True, label="q = 0,2")
g.hist(b, bins=bornes, histtype="step", lw=2, density=True, label="q = 0,37")
g.axvline(a.mean(), color="C0", ls="--"); g.axvline(b.mean(), color="C1", ls="--")
g.set(title="Distribution du rang obtenu", xlabel="rang", ylabel="proportion"); g.legend()
d.hist(a, bins=bornes, cumulative=True, density=True, histtype="step", lw=2, label="q = 0,2")
d.hist(b, bins=bornes, cumulative=True, density=True, histtype="step", lw=2, label="q = 0,37")
d.set(title="Répartition cumulée : P(rang ≤ r)", xlabel="r", ylabel="P(rang ≤ r)"); d.legend(loc="lower right")
plt.show()
print("P(rang <= 3) :", round((a <= 3).mean(), 3), "contre", round((b <= 3).mean(), 3))`,
    },
    plus: `La moyenne seule cache la forme : deux stratégies de même moyenne peuvent avoir l’une beaucoup d’échecs graves (dernier jour, rang 30) et l’autre jamais. L’histogramme (ou la répartition cumulée) montre ce **risque**. C’est l’argument « analyse exhaustive » attendu au TP noté.`,
  },
  {
    id: 'mpl-bar',
    genre: 'metrique',
    titre: 'Barres groupées + barres d’erreur : comparer des stratégies',
    explication: `\`ax.bar(x, hauteurs, width, yerr=erreurs, capsize=4, label=…)\`.

- **barres groupées** : positions \`x = np.arange(len(categories))\`, décalées de \`± largeur/2\` pour chaque série, puis \`ax.set_xticks(x, categories)\` ;
- **barres d’erreur** : \`yerr\` = demi-largeur de l’intervalle de confiance (\`1.96 * écart-type / √N\`) ;
- \`ax.bar_label(barres, fmt="%.2f")\` écrit la valeur au-dessus de chaque barre ;
- \`ax.barh\` (horizontal) pour un classement avec des noms longs ;
- \`rotation=30\` dans \`set_xticks\` / \`tick_params\` si les noms se chevauchent.`,
    exemple: {
      code: SIM + py`
n, N = 30, 4000
strategies = {"premier jour": 0, "q = 0,1": 3, "q = 0,2": 6, "q = 0,37": 11, "q = 0,6": 18}
res = {nom: simuler(n, k, N) for nom, k in strategies.items()}
noms = list(res)
moy = np.array([res[s].mean() for s in noms])
ic = np.array([1.96 * res[s].std() / np.sqrt(N) for s in noms])
pm = np.array([(res[s] == 1).mean() for s in noms])

x = np.arange(len(noms)); w = 0.4
fig, ax = plt.subplots(figsize=(8, 4))
b1 = ax.bar(x - w / 2, moy, w, yerr=ic, capsize=4, label="rang moyen (± IC 95 %)")
ax2 = ax.twinx()
b2 = ax2.bar(x + w / 2, 100 * pm, w, color="C1", label="P(meilleur) en %")
ax.bar_label(b1, fmt="%.1f", padding=3); ax2.bar_label(b2, fmt="%.0f%%", padding=3)
ax.set_xticks(x, noms)
ax.set(title=f"Comparatif des stratégies (n = {n}, {N} essais)", ylabel="rang moyen")
ax2.set_ylabel("P(meilleur) %"); ax2.set_ylim(0, 60); ax2.grid(False)
ax.legend(handles=[b1, b2], loc="upper right")
plt.show()`,
    },
    plus: `Les barres d’erreur répondent à « la différence est-elle réelle ou due au hasard ? » : si les intervalles de deux stratégies se chevauchent largement, on ne peut pas conclure qu’une est meilleure. Avec \`N\` essais, l’intervalle rétrécit comme \`1/√N\` : 4× plus d’essais pour 2× plus de précision.`,
  },
  {
    id: 'mpl-boxplot',
    genre: 'metrique',
    titre: 'Boîtes à moustaches et violons',
    explication: `\`ax.boxplot([serie1, serie2, …], tick_labels=noms)\` résume chaque distribution :

- la **boîte** va du 1ᵉʳ quartile (25 %) au 3ᵉ quartile (75 %), le **trait** est la **médiane** ;
- les **moustaches** vont jusqu’à la dernière valeur à moins de 1,5 × (Q3 − Q1) de la boîte ;
- les **points isolés** sont les valeurs extrêmes (outliers) ;
- \`showmeans=True\` ajoute la moyenne (triangle).

\`ax.violinplot(series, showmedians=True)\` montre en plus la **forme** (densité). Idéal pour comparer 3 à 8 stratégies d’un coup.`,
    exemple: {
      code: SIM + py`
n = 30
ks = [0, 3, 6, 11, 18, 25]
series = [simuler(n, k) for k in ks]
noms = [f"k={k}" for k in ks]
fig, (g, d) = plt.subplots(1, 2, figsize=(10, 3.8), layout="constrained", sharey=True)
g.boxplot(series, tick_labels=noms, showmeans=True)
g.set(title="Boîtes à moustaches", xlabel="candidats observés", ylabel="rang obtenu")
d.violinplot(series, showmedians=True)
d.set_xticks(range(1, len(ks) + 1), noms)
d.set(title="Violons (forme de la distribution)", xlabel="candidats observés")
plt.show()
for k, s in zip(ks, series):
    print(f"k={k:2d}  médiane={np.median(s):4.1f}  Q1-Q3=[{np.percentile(s, 25):.0f}, {np.percentile(s, 75):.0f}]")`,
    },
    plus: `Dans matplotlib ≥ 3.9 l’argument s’appelle \`tick_labels=\` ; dans les versions plus anciennes c’est \`labels=\`. En cas d’erreur *unexpected keyword argument*, essayer l’autre, ou faire \`ax.set_xticks(range(1, len(noms) + 1), noms)\` après le boxplot (marche partout). Les positions des boîtes commencent à **1**, pas 0.`,
  },
  {
    id: 'mpl-incertitude',
    genre: 'metrique',
    titre: 'Bande de confiance : fill_between',
    explication: `Pour montrer que la courbe mesurée est fiable, on trace la **moyenne** et une **bande** autour :

\`ax.fill_between(x, moyenne - ic, moyenne + ic, alpha=0.25)\` avec \`ic = 1.96 * ecart_type / np.sqrt(N)\` (intervalle de confiance à 95 %).

Variante en points : \`ax.errorbar(x, moyenne, yerr=ic, fmt="o-", capsize=3)\`.

On peut aussi montrer la **dispersion** des résultats (pas l’incertitude de la moyenne) avec les quantiles 10 %–90 % : \`np.percentile(r, [10, 90])\`.`,
    exemple: {
      code: SIM + py`
n, N = 30, 1500
q = np.linspace(0, 0.9, 19)
R = [simuler(n, int(n * v), N) for v in q]
m = np.array([r.mean() for r in R])
ic = np.array([1.96 * r.std() / np.sqrt(N) for r in R])
p10, p90 = np.array([np.percentile(r, [10, 90]) for r in R]).T

fig, ax = plt.subplots(figsize=(7, 4))
ax.fill_between(q, p10, p90, color="C0", alpha=0.12, label="10 %–90 % des essais")
ax.fill_between(q, m - ic, m + ic, color="C0", alpha=0.4, label="IC 95 % de la moyenne")
ax.plot(q, m, "o-", color="C0", label="rang moyen")
ax.set(title=f"Moyenne, incertitude et dispersion ({N} essais par point)", xlabel="q", ylabel="rang")
ax.legend(loc="upper left")
plt.show()
print("demi-largeur max de l'IC :", round(ic.max(), 2))`,
    },
    plus: `Ne pas confondre : l’**écart-type** décrit la variabilité d’un essai à l’autre (il ne diminue pas avec N) ; l’**intervalle de confiance** décrit la précision de la moyenne (il diminue en 1/√N). Les deux sont intéressants : le premier dit « c’est risqué », le second dit « ma mesure est précise ».`,
  },
  {
    id: 'mpl-heatmap',
    genre: 'metrique',
    titre: 'Carte de chaleur : un indicateur selon deux paramètres',
    explication: `Pour une grille \`Z[i, j]\` (ligne i = paramètre 1, colonne j = paramètre 2) :

\`im = ax.imshow(Z, origin="lower", aspect="auto", cmap="viridis")\` puis \`fig.colorbar(im, ax=ax, label="…")\`.

- \`origin="lower"\` : la ligne 0 en bas (sinon en haut, comme une matrice) ;
- \`aspect="auto"\` : cases rectangulaires qui remplissent la figure ;
- graduations : \`ax.set_xticks(range(len(qs)), [f"{v:.1f}" for v in qs])\` ;
- **meilleure case** : \`i, j = np.unravel_index(Z.argmin(), Z.shape)\` puis \`ax.plot(j, i, "r*")\` (attention : x = colonne j, y = ligne i) ;
- valeurs dans les cases : \`ax.text(j, i, f"{Z[i, j]:.1f}", ha="center", va="center")\` ;
- colormap **divergente** centrée (\`cmap="RdBu"\`, \`vmin=-a, vmax=a\`) pour des différences entre deux stratégies.
- alternative : \`ax.pcolormesh(X, Y, Z)\` avec les vraies coordonnées.`,
    exemple: {
      code: SIM + py`
ns = [5, 10, 20, 30, 50, 80]
qs = np.round(np.arange(0.1, 0.71, 0.1), 1)
Z = np.array([[(simuler(n, int(n * q), N=2000) == 1).mean() for q in qs] for n in ns])

fig, ax = plt.subplots(figsize=(7.5, 4.2))
im = ax.imshow(Z, origin="lower", aspect="auto", cmap="viridis")
fig.colorbar(im, ax=ax, label="P(choisir le meilleur)")
ax.set_xticks(range(len(qs)), qs)
ax.set_yticks(range(len(ns)), ns)
for i in range(len(ns)):
    for j in range(len(qs)):
        ax.text(j, i, f"{Z[i, j]:.2f}", ha="center", va="center", fontsize=8,
                color="white" if Z[i, j] < 0.3 else "black")
for i in range(len(ns)):                   # meilleur q de chaque ligne
    ax.plot(Z[i].argmax(), i, "r*", ms=12)
ax.set(title="P(meilleur) selon n et q (★ = meilleur q pour chaque n)", xlabel="q", ylabel="n")
ax.grid(False)
plt.show()
i, j = np.unravel_index(Z.argmax(), Z.shape)
print(f"maximum global : n = {ns[i]}, q = {qs[j]}, P = {Z[i, j]:.3f}")`,
    },
    plus: `Piège n°1 : inverser lignes et colonnes. \`Z.shape\` doit valoir \`(len(param_y), len(param_x))\`. Si on a construit \`Z[j, i]\`, utiliser \`Z.T\`. Piège n°2 : prendre le maximum d’une grille bruitée → biais d’optimisme (la meilleure case est souvent « chanceuse ») ; revalider la case choisie avec plus d’essais.`,
  },
  {
    id: 'mpl-contour',
    genre: 'code',
    titre: 'meshgrid, contours et surface 3D',
    explication: `Pour une fonction de deux variables f(x, y) :

1. \`X, Y = np.meshgrid(x, y)\` crée deux grilles (chaque case = un couple (x, y)) ;
2. \`Z = f(X, Y)\` calcule tout d’un coup (numpy vectorisé) ;
3. \`ax.contourf(X, Y, Z, levels=20, cmap=…)\` : zones colorées ; \`cs = ax.contour(X, Y, Z, colors="k")\` + \`ax.clabel(cs)\` : lignes de niveau étiquetées ;
4. 3D : \`ax = fig.add_subplot(projection="3d")\` puis \`ax.plot_surface(X, Y, Z, cmap="coolwarm")\` ; \`ax.view_init(elev, azim)\` change l’angle.

Lien cours : les lignes de niveau de la forme quadratique xᵀAx sont des **ellipses dont les axes sont les vecteurs propres** de A (tracés avec \`ax.quiver\`).`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

A = np.array([[3.0, 1.0], [1.0, 2.0]])
vals, vecs = np.linalg.eigh(A)
x = np.linspace(-2, 2, 120)
X, Y = np.meshgrid(x, x)
Z = A[0, 0] * X**2 + 2 * A[0, 1] * X * Y + A[1, 1] * Y**2      # xᵀ A x

fig = plt.figure(figsize=(10, 4.2), layout="constrained")
ax = fig.add_subplot(1, 2, 1)
ax.contourf(X, Y, Z, levels=20, cmap="viridis")
cs = ax.contour(X, Y, Z, levels=[1, 3, 6], colors="white")
ax.clabel(cs, fmt="%g")
for l, v in zip(vals, vecs.T):            # vecteurs propres = COLONNES de vecs
    ax.quiver(0, 0, *v / np.sqrt(l), angles="xy", scale_units="xy", scale=1, color="red", width=0.012)
ax.set(title="Lignes de niveau de xᵀAx et vecteurs propres", aspect="equal")
ax3 = fig.add_subplot(1, 2, 2, projection="3d")
ax3.plot_surface(X, Y, Z, cmap="viridis", linewidth=0)
ax3.view_init(elev=30, azim=-60)
ax3.set(title="Surface 3D", xlabel="x", ylabel="y")
plt.show()
print("valeurs propres :", vals.round(3))`,
    },
    plus: `\`quiver(x0, y0, dx, dy, angles="xy", scale_units="xy", scale=1)\` dessine une flèche de (x0, y0) à (x0 + dx, y0 + dy) **à la vraie échelle** ; sans ces trois options, matplotlib redimensionne les flèches automatiquement et le dessin devient faux. \`aspect="equal"\` évite que les angles droits paraissent déformés.`,
  },
  {
    id: 'mpl-scatter',
    genre: 'code',
    titre: 'Nuage de points coloré : visualiser un clustering',
    explication: `\`ax.scatter(x, y, c=valeurs, cmap=…, s=taille, edgecolors="k")\` :

- \`c=labels\` (entiers) → une couleur par groupe ; \`c=vecteur\` (réels) → dégradé, avec \`fig.colorbar(sc)\` ;
- légende automatique des groupes : \`ax.legend(*sc.legend_elements(), title="cluster")\` ;
- \`ax.set_aspect("equal")\` pour ne pas déformer les distances ;
- marquer des centres : \`ax.scatter(cx, cy, marker="X", s=200, c="red")\`.

Exemple tiré du chapitre clustering spectral : couleur = **signe du vecteur de Fiedler** (2ᵉ plus petite valeur propre du laplacien), à droite le vecteur trié qui montre la « marche ».`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
P = np.vstack([rng.normal((0, 0), 0.5, (40, 2)), rng.normal((3, 2), 0.5, (40, 2))])
D2 = ((P[:, None] - P[None]) ** 2).sum(-1)
W = np.exp(-D2 / 0.5); np.fill_diagonal(W, 0)          # similarité gaussienne
L = np.diag(W.sum(1)) - W                              # laplacien
vals, vecs = np.linalg.eigh(L)                         # valeurs triées par eigh
fiedler = vecs[:, 1]
labels = (fiedler > 0).astype(int)

fig, (g, d) = plt.subplots(1, 2, figsize=(10, 4), layout="constrained")
sc = g.scatter(P[:, 0], P[:, 1], c=labels, cmap="coolwarm", s=40, edgecolors="k")
g.legend(*sc.legend_elements(), title="cluster")
g.set(title="Clustering spectral : signe de Fiedler", aspect="equal")
d.plot(np.sort(fiedler), "o", ms=4)
d.axhline(0, color="gray", ls="--")
d.set(title="Vecteur de Fiedler trié", xlabel="indice (trié)", ylabel="composante")
plt.show()
print("tailles des clusters :", np.bincount(labels), "| λ2 =", vals[1].round(4))`,
    },
    plus: `Avec 3 clusters ou plus, on colore par les étiquettes de KMeans appliqué aux k premiers vecteurs propres (\`c=kmeans.labels_\`). Les numéros de cluster sont arbitraires (0 et 1 peuvent être inversés d’une exécution à l’autre) : ne jamais comparer les couleurs entre deux graphiques sans les réaligner.`,
  },
  {
    id: 'mpl-matrice',
    genre: 'code',
    titre: 'Afficher une matrice : imshow, spy, spectre',
    explication: `- \`ax.imshow(A, cmap="Greys")\` affiche une matrice (adjacence, similarité, laplacien) : ligne 0 **en haut**, comme sur papier ;
- \`ax.spy(A, markersize=2)\` : seulement les cases non nulles (matrices creuses) ;
- **réordonner** les lignes/colonnes avec \`ordre = np.argsort(fiedler)\` puis \`A[np.ix_(ordre, ordre)]\` fait apparaître les **blocs** (communautés) ;
- le **spectre** : \`ax.plot(np.sort(vals), "o")\` ou \`ax.stem(vals)\` ; le nombre de valeurs propres proches de 0 du laplacien = nombre de composantes (ou de clusters nets).`,
    exemple: {
      code: py`import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(3)
tailles = [15, 20, 15]
groupe = np.repeat([0, 1, 2], tailles)
n = len(groupe)
proba = np.where(groupe[:, None] == groupe[None], 0.6, 0.03)
A = np.triu(rng.random((n, n)) < proba, 1); A = (A | A.T).astype(float)
perm = rng.permutation(n); A = A[np.ix_(perm, perm)]          # on mélange les sommets
L = np.diag(A.sum(1)) - A
vals, vecs = np.linalg.eigh(L)
ordre = np.lexsort((vecs[:, 2], vecs[:, 1]))                    # tri par vecteurs 2 et 3

fig, axes = plt.subplots(1, 3, figsize=(11, 3.7), layout="constrained")
axes[0].imshow(A, cmap="Greys"); axes[0].set_title("adjacence (sommets mélangés)")
axes[1].imshow(A[np.ix_(ordre, ordre)], cmap="Greys"); axes[1].set_title("réordonnée par vecteurs propres")
axes[2].plot(vals[:10], "o-"); axes[2].set(title="10 plus petites valeurs propres de L", xlabel="indice")
axes[2].axvspan(-0.3, 2.5, color="C2", alpha=0.15)
plt.show()
print("4 plus petites valeurs propres :", vals[:4].round(2) + 0.0)`,
    },
    plus: `Le « trou spectral » (grand saut entre la k-ième et la (k+1)-ième valeur propre) indique k groupes : ici trois petites valeurs puis un saut. C’est le graphique le plus convaincant pour justifier le choix de k au clustering spectral. \`np.ix_(ordre, ordre)\` permute **à la fois** lignes et colonnes ; \`A[ordre][:, ordre]\` fait pareil.`,
  },
  {
    id: 'mpl-networkx',
    genre: 'code',
    titre: 'Dessiner un réseau de flots avec networkx + matplotlib',
    explication: `networkx dessine **dans un ax matplotlib** :

- positions fixes : un dictionnaire \`pos = {"s": (0, 1), "a": (1, 2), …}\` (lisible, stable) ou \`nx.spring_layout(G, seed=1)\` ;
- \`nx.draw_networkx(G, pos, ax=ax, node_color=…, edge_color=…, width=…, arrows=True)\` ;
- étiquettes d’arcs « flot/capacité » : \`nx.draw_networkx_edge_labels(G, pos, edge_labels=dico, ax=ax)\` ;
- colorer la **coupe minimale** : sommets côté s / côté t de couleurs différentes, arcs saturés en rouge ;
- \`connectionstyle="arc3,rad=0.15"\` courbe les arcs (utile s’il y a des arcs dans les deux sens).`,
    exemple: {
      code: py`import networkx as nx
import matplotlib.pyplot as plt

G = nx.DiGraph()
for u, v, c in [("s", "a", 10), ("s", "b", 5), ("a", "b", 15), ("a", "t", 4), ("b", "t", 10), ("a", "c", 6), ("c", "t", 8)]:
    G.add_edge(u, v, capacity=c)
valeur, flot = nx.maximum_flow(G, "s", "t")
_, (S, T) = nx.minimum_cut(G, "s", "t")
pos = {"s": (0, 1), "a": (1, 2), "b": (1, 0), "c": (2, 2), "t": (3, 1)}

coupe = [(u, v) for u, v in G.edges if u in S and v in T]
fig, ax = plt.subplots(figsize=(7, 4))
nx.draw_networkx(G, pos, ax=ax, node_size=900, font_color="white",
                 node_color=["C0" if x in S else "C1" for x in G.nodes],
                 edge_color=["red" if e in coupe else "gray" for e in G.edges],
                 width=[1 + G.edges[e]["capacity"] / 3 for e in G.edges], arrowsize=18)
nx.draw_networkx_edge_labels(G, pos, ax=ax, font_size=9,
    edge_labels={(u, v): f"{flot[u][v]}/{d['capacity']}" for u, v, d in G.edges(data=True)})
ax.set_title(f"Flot max = {valeur} ; coupe min (rouge) : côté s en bleu, côté t en orange")
ax.axis("off")
plt.show()
print("S =", sorted(S), "| T =", sorted(T), "| arcs coupés :", coupe)
print("capacité de la coupe =", sum(G.edges[e]["capacity"] for e in coupe), "= flot max", valeur)`,
    },
    plus: `Vérification visuelle du théorème flot max = coupe min : la somme des capacités des arcs rouges est égale à la valeur du flot (le programme l’affiche). Les arcs de la coupe sont tous **saturés** (flot = capacité). Pour un graphe biparti (couplage), \`pos = nx.bipartite_layout(G, gauche)\` aligne les deux côtés.`,
  },
  {
    id: 'mpl-annotations',
    genre: 'code',
    titre: 'Annoter : lignes, zones, flèches, texte',
    explication: `| Besoin | Code |
|---|---|
| ligne horizontale / verticale de référence | \`ax.axhline(y, color="gray", ls="--")\`, \`ax.axvline(x)\` |
| zone verticale / horizontale colorée | \`ax.axvspan(x1, x2, alpha=0.15)\`, \`ax.axhspan(y1, y2)\` |
| flèche + texte vers un point | \`ax.annotate("texte", xy=(x, y), xytext=(x2, y2), arrowprops=dict(arrowstyle="->"))\` |
| texte à une position du graphique | \`ax.text(x, y, "…")\` |
| texte dans un coin, quelle que soit l’échelle | \`ax.text(0.02, 0.95, "…", transform=ax.transAxes, va="top")\` |
| encadré | \`bbox=dict(boxstyle="round", fc="white", alpha=0.8)\` |
| graduations personnalisées | \`ax.set_xticks([...], [...])\` |
| format des nombres (pourcentages) | \`from matplotlib.ticker import PercentFormatter\` ; \`ax.yaxis.set_major_formatter(PercentFormatter(1))\` |`,
    exemple: {
      code: SIM + py`
from matplotlib.ticker import PercentFormatter
n = 30
k = np.arange(0, n)
p = np.array([(simuler(n, int(v), N=3000) == 1).mean() for v in k])
fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(k, p, "o-", ms=3)
ax.axvspan(0, 5, color="C3", alpha=0.12)
ax.axvspan(22, n - 1, color="C3", alpha=0.12)
ax.text(2.5, 0.05, "trop tôt", ha="center", color="C3")
ax.text(26, 0.05, "trop tard", ha="center", color="C3")
ax.axvline(n / np.e, color="k", ls=":")
ax.annotate("n/e ≈ 11", xy=(n / np.e, p[11]), xytext=(14, 0.22), arrowprops=dict(arrowstyle="->"))
ax.text(0.98, 0.95, f"n = {n}\n3 000 essais/point", transform=ax.transAxes, ha="right", va="top",
        bbox=dict(boxstyle="round", fc="white", alpha=0.8))
ax.yaxis.set_major_formatter(PercentFormatter(1))
ax.set(title="P(meilleur) selon le nombre de candidats observés", xlabel="k observés", ylabel="P(meilleur)")
plt.show()`,
    },
    plus: `\`transform=ax.transAxes\` : les coordonnées vont de 0 à 1 dans le cadre du graphique (0,0 = bas gauche), donc le texte reste au même endroit même si les données changent. Les zones (\`axvspan\`) et lignes de référence sont la façon la plus rapide de rendre un graphique « lisible en 3 secondes ».`,
  },
  {
    id: 'mpl-export',
    genre: 'code',
    titre: 'Style global, enregistrement, Jupyter',
    explication: `- \`%matplotlib inline\` (souvent implicite) : figures affichées dans le notebook ; \`%matplotlib widget\` pour zoomer (si ipympl installé).
- **Style global** : \`plt.style.use("seaborn-v0_8-whitegrid")\` (ou \`"ggplot"\`, \`"bmh"\`) ; voir \`plt.style.available\`. \`plt.rcParams["font.size"] = 12\` ;
- **Enregistrer** : \`fig.savefig("graphique.png", dpi=150, bbox_inches="tight")\` **avant** \`plt.show()\` (après, la figure est vidée) ; \`.pdf\` / \`.svg\` pour un rendu vectoriel ;
- \`plt.close(fig)\` libère la mémoire dans une boucle qui crée beaucoup de figures ;
- \`plt.tight_layout()\` ou \`layout="constrained"\` pour que rien ne soit coupé.`,
    exemple: {
      code: py`import io
import numpy as np
import matplotlib.pyplot as plt

print("quelques styles :", [s for s in plt.style.available if "seaborn" in s][:3], "…")
with plt.style.context("seaborn-v0_8-whitegrid"):         # style limité à ce bloc
    fig, ax = plt.subplots(figsize=(6, 3.2))
    x = np.linspace(0, 2 * np.pi, 100)
    ax.plot(x, np.sin(x), label="sin"); ax.plot(x, np.cos(x), label="cos")
    ax.set(title="Style seaborn-whitegrid"); ax.legend()
    tampon = io.BytesIO()                                  # en vrai : "figure.png"
    fig.savefig(tampon, format="png", dpi=150, bbox_inches="tight")
    plt.show()
print("PNG enregistré :", len(tampon.getvalue()) // 1024, "Ko")`,
    },
    plus: `Pour un rendu de TP, inutile d’exporter les images : le notebook exécuté suffit. Mais vérifier **Kernel → Restart & Run All** avant de rendre : toutes les figures doivent se régénérer sans erreur. Si un calcul est long, enregistrer les résultats avec \`np.save("grille.npy", Z)\` et les recharger avec \`np.load\` pour retracer vite.`,
  },
  {
    id: 'mpl-pieges',
    genre: 'piege',
    titre: 'Pièges matplotlib et leurs corrections',
    explication: `| Symptôme | Cause | Correction |
|---|---|---|
| deux courbes sur le même graphique alors qu’on en voulait deux | pas de nouvelle figure | \`fig, ax = plt.subplots()\` pour chaque graphique, \`plt.show()\` à la fin |
| \`'numpy.ndarray' object has no attribute 'plot'\` | \`ax\` est un tableau (plusieurs cases) | \`ax[0].plot\` ou \`a, b = ax\` |
| \`'AxesSubplot' has no attribute 'title'\` (ou appel qui écrase) | \`ax.title("…")\` | \`ax.set_title("…")\` (idem xlabel → \`set_xlabel\`) |
| \`No artists with labels found to put in legend\` | aucun \`label=\` | ajouter \`label="…"\` aux tracés |
| \`x and y must have same first dimension\` | longueurs différentes | \`print(len(x), len(y))\` ; souvent un \`range(n)\` contre \`range(1, n)\` |
| heatmap « à l’envers » | \`imshow\` met la ligne 0 en haut | \`origin="lower"\` |
| heatmap transposée | \`Z[i, j]\` avec i = paramètre x | \`imshow(Z.T)\` ou reconstruire Z |
| fichier enregistré vide (blanc) | \`savefig\` après \`show\` | \`savefig\` puis \`show\` |
| titres / étiquettes coupés ou superposés | mise en page par défaut | \`layout="constrained"\` ou \`plt.tight_layout()\` |
| flèches \`quiver\` fausses | redimensionnement auto | \`angles="xy", scale_units="xy", scale=1\` |
| graduations illisibles (trop nombreuses) | une graduation par valeur | n’en afficher qu’une sur k : \`ax.set_xticks(x[::5])\` |
| couleurs différentes entre graphiques pour la même stratégie | cycle de couleurs | fixer \`color="C0"\`, \`"C1"\`… par stratégie |`,
  },
]
