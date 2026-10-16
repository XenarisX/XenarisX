// Boîte à outils : code prêt à coller pour mesurer n'importe quelle stratégie.
// Les blocs s'exécutent dans l'ordre (les fonctions d'un bloc servent aux suivants).

export const blocs = [
  {
    id: 'k-imports',
    genre: 'code',
    titre: 'Cellule d’imports universelle',
    explication: `À coller en première cellule de n’importe quel TP noté. La graine (\`seed\`) rend les résultats **reproductibles** : le correcteur qui relance obtient les mêmes chiffres que dans ton texte.`,
    exemple: {
      code: `import random, copy, time
from collections import deque
import numpy as np
import numpy.linalg as la
import matplotlib.pyplot as plt
from matplotlib import cm
import networkx as nx

random.seed(42)
np.random.seed(42)
plt.rcParams["figure.figsize"] = (8, 4.5)
plt.rcParams["axes.grid"] = True`,
      titre: 'cellule 1',
    },
    plus: `\`random.seed\` ne fixe que le module \`random\` ; \`np.random.seed\` fixe numpy. Si tu utilises les deux, fixe les deux.
\`from sklearn.cluster import KMeans\` seulement si tu fais du clustering : l’import est lent.`,
  },
  {
    id: 'k-banc',
    genre: 'metrique',
    titre: 'Banc d’essai Monte Carlo générique',
    explication: `Une seule fonction pour **mesurer n’importe quelle stratégie** : elle répète l’expérience N fois sur des données aléatoires et renvoie moyenne, écart-type, médiane, 90e percentile et minimum/maximum de chaque indicateur.

Principe Monte Carlo : quand un résultat dépend du hasard, **un seul essai ne prouve rien** ; la moyenne sur beaucoup d’essais converge vers l’espérance (loi des grands nombres).`,
    exemple: {
      code: `def resume(valeurs):
    v = np.array(valeurs, dtype=float)
    return {"moyenne": v.mean(), "ecart_type": v.std(), "mediane": np.median(v),
            "p90": np.percentile(v, 90), "min": v.min(), "max": v.max()}

def banc_essai(experience, nb=1000):
    """experience() renvoie un dict {indicateur: valeur} pour UN essai."""
    resultats = {}
    for _ in range(nb):
        for cle, val in experience().items():
            resultats.setdefault(cle, []).append(val)
    return {cle: resume(vals) for cle, vals in resultats.items()}

# exemple : la moyenne de 10 dés à 6 faces
def exp_des():
    tirage = [random.randint(1, 6) for _ in range(10)]
    return {"somme": sum(tirage), "max": max(tirage)}

r = banc_essai(exp_des, 2000)
print({k: round(v["moyenne"], 2) for k, v in r.items()})`,
      titre: 'banc d’essai',
    },
    plus: `Le banc d’essai sépare **l’expérience** (un essai) de **la mesure** (la répétition). Pour le sujet 2024, une expérience = tirer une liste, jouer la stratégie, calculer rang/ratio/meilleur. Tu réutilises \`banc_essai\` pour chaque version sans recopier la boucle.

\`dict.setdefault(cle, [])\` crée la liste si la clé n’existe pas encore et la renvoie : pratique pour accumuler.`,
  },
  {
    id: 'k-indicateurs',
    genre: 'metrique',
    titre: 'Catalogue des indicateurs (et quand les utiliser)',
    explication: `| Indicateur | Formule / code | Sert à | Sujet type |
|---|---|---|---|
| **Rang** | \`1 + nb de valeurs > choisie\` | proximité au meilleur, sans échelle | arrêt optimal |
| **Ratio** | \`(c − min)/(max − min)\` | proximité en valeur, entre 0 et 1 | arrêt optimal |
| **P(meilleur)** | \`mean(rang == 1)\` | probabilité de succès parfait | secrétaire |
| **Regret** | \`pref[e].index(partenaire)\` | satisfaction d’un individu | mariages |
| **Regret moyen / max** | \`mean\`, \`max\` des regrets | global vs pire cas (équité) | GS, Selkow |
| **Valeur du flot** | \`sum(flot[s])\` | débit maximal | flots |
| **Taux de saturation** | arcs avec flot = capacité | goulots | flots |
| **Taille du couplage** | \`len(M)//2\` ou flot | nb d’affectations possibles | couplage |
| **Erreur relative** | \`abs(x − ref)/abs(ref)\` | justesse d’une méthode numérique | valeurs propres |
| **Nb d’itérations** | compteur | vitesse de convergence | puissances itérées |
| **Précision** | bien classés / total | qualité d’un découpage | clustering |
| **Arêtes coupées** | arêtes entre groupes | qualité de la coupe | clustering |
| **Temps** | \`time.perf_counter()\` | coût, passage à l’échelle | tous |`,
    exemple: {
      code: `def rang(liste, i):
    """Rang (1 = meilleur) de l'élément d'indice i."""
    return 1 + sum(1 for x in liste if x > liste[i])

def rang_numpy(liste, i):
    """Version du corrigé 2024 (argsort décroissant)."""
    L = np.array(liste)
    ordre = (-L).argsort()
    return int(np.where(ordre == i)[0][0]) + 1

def ratio(liste, choisi):
    mn, mx = min(liste), max(liste)
    return (choisi - mn) / (mx - mn) if mx > mn else 1.0

l = [300, 900, 450, 900, 120]
print(rang(l, 2), rang_numpy(l, 2), round(ratio(l, 450), 3))`,
      titre: 'indicateurs de proximité au meilleur',
    },
    plus: `**Toujours au moins deux indicateurs** : une moyenne peut cacher un pire cas catastrophique (cf. la stratégie 1/e : meilleure P(meilleur), mauvais rang moyen).

Rang avec égalités : \`rang\` (version comptage) donne le même rang aux ex æquo, \`rang_numpy\` les départage selon l’ordre du tri. Avec des scores entiers tirés entre 0 et 5000, les égalités sont rares : dis-le en une phrase.`,
  },
  {
    id: 'k-balayage',
    genre: 'metrique',
    titre: 'Balayage d’un paramètre + courbe',
    visuel: 'secretaire_q',
    explication: `Pour choisir un paramètre (q, seuil, nombre d’itérations…) : on le fait varier sur une grille de valeurs, on mesure l’indicateur pour chacune, on trace la courbe et on lit l’optimum avec \`argmin\` / \`argmax\`.`,
    exemple: {
      code: `def strategie(q, m=1.0):
    def choix(n, seen):
        k = int(n * q)
        i = len(seen)
        if i == n or k == 0:
            return True
        if i <= k:
            return False
        return seen[-1] >= m * max(seen[:k])
    return choix

def jouer(liste, choix):
    n = len(liste)
    for i in range(1, n + 1):
        if choix(n, liste[:i]) or i == n:
            return liste[i - 1], i - 1

def mesurer(choix, n=30, nb=1000):
    rangs, meilleurs = [], 0
    for _ in range(nb):
        l = [random.randint(0, 5000) for _ in range(n)]
        c, i = jouer(l, choix)
        r = rang(l, i)
        rangs.append(r)
        meilleurs += (r == 1)
    return np.mean(rangs), meilleurs / nb

q_vals = np.arange(0.05, 1, 0.05)
res = [mesurer(strategie(q)) for q in q_vals]
rangs_moy = [r[0] for r in res]
p_meilleur = [r[1] for r in res]

fig, ax1 = plt.subplots()
ax1.plot(q_vals, rangs_moy, "o-", label="rang moyen")
ax1.set_xlabel("q (part des jours explorés)")
ax1.set_ylabel("rang moyen (plus bas = mieux)")
ax2 = ax1.twinx()                       # second axe y à droite
ax2.plot(q_vals, p_meilleur, "s--", color="tab:green", label="P(meilleur)")
ax2.set_ylabel("P(meilleur)")
fig.legend(loc="upper center")
plt.title("Choix du seuil d'exploration q (m = 1)")
plt.show()
print("q optimal (rang) :", round(q_vals[np.argmin(rangs_moy)], 2))
print("q optimal (P(meilleur)) :", round(q_vals[np.argmax(p_meilleur)], 2))`,
      titre: 'balayage 1D',
    },
    plus: `\`np.arange(0.05, 1, 0.05)\` exclut 1 (borne de fin exclue) ; \`np.linspace(0, 1, 21)\` inclut les deux bornes et donne exactement 21 valeurs.

\`twinx()\` crée un deuxième axe y : indispensable quand deux indicateurs n’ont pas la même échelle (un rang ~5 et une probabilité ~0,3).

Avec 1000 essais par point, la courbe est bruitée d’environ ±0,2 en rang : si deux q sont à 0,1 près, dis qu’ils sont **équivalents** plutôt que de choisir au centième.`,
  },
  {
    id: 'k-grille',
    genre: 'metrique',
    titre: 'Grille 2D : optimiser deux paramètres ensemble',
    visuel: 'secretaire_heatmap',
    explication: `Optimiser q puis m **séparément** ne donne pas forcément l’optimum : les paramètres interagissent. On calcule l’indicateur sur **toutes les paires** (q, m), on l’affiche en carte de chaleur (\`imshow\`) ou en surface 3D (\`plot_surface\`), et on récupère l’optimum avec \`np.unravel_index\`.`,
    exemple: {
      code: `q_vals = np.arange(0.1, 0.65, 0.05)
m_vals = np.arange(0.7, 1.15, 0.05)
grille = np.zeros((len(q_vals), len(m_vals)))
for a, q in enumerate(q_vals):
    for b, m in enumerate(m_vals):
        grille[a, b] = mesurer(strategie(q, m), nb=300)[0]

i, j = np.unravel_index(np.argmin(grille), grille.shape)   # indice 2D du minimum
print(f"optimum : q = {q_vals[i]:.2f}, m = {m_vals[j]:.2f}, rang moyen = {grille[i, j]:.2f}")

# carte de chaleur
plt.imshow(grille, origin="lower", aspect="auto", cmap="coolwarm",
           extent=[m_vals[0], m_vals[-1], q_vals[0], q_vals[-1]])
plt.colorbar(label="rang moyen")
plt.xlabel("m"); plt.ylabel("q"); plt.title("Rang moyen selon (q, m)")
plt.show()

# surface 3D (comme dans le corrigé)
X, Y = np.meshgrid(m_vals, q_vals)        # X : colonnes = m, Y : lignes = q
ax = plt.figure().add_subplot(projection="3d")
ax.plot_surface(X, Y, grille, cmap=cm.coolwarm)
ax.set_xlabel("m"); ax.set_ylabel("q"); ax.set_zlabel("rang moyen")
plt.show()`,
      titre: 'grille 2D',
    },
    plus: `**np.argmin(grille)** renvoie l’indice du minimum dans le tableau **aplati** (un seul entier). **np.unravel_index(k, forme)** retransforme cet entier en (ligne, colonne). Exemple : dans une grille 3×4, l’indice 7 correspond à (1, 3).

**np.meshgrid(x, y)** fabrique deux matrices de même forme que la grille : X répète x sur chaque ligne, Y répète y sur chaque colonne. \`plot_surface\` en a besoin pour savoir où placer chaque valeur. Attention à l’ordre : la grille doit avoir **len(y) lignes et len(x) colonnes**.

Coût : len(q) × len(m) × nb essais. Ici 11 × 9 × 300 ≈ 30 000 simulations : quelques secondes. Monter à 1000+ essais seulement autour de l’optimum.

**Biais d’optimisme** : le minimum d’une grille bruitée est presque toujours **trop beau** (on choisit la case qui a eu de la chance). Ici la grille annonce un rang ≈ 3,3 alors que la vraie valeur de (0,35 ; 0,9) est ≈ 3,8. Remesurer la case gagnante sur **de nouvelles listes** avant de citer le chiffre.`,
  },
  {
    id: 'k-comparatif',
    genre: 'metrique',
    titre: 'Tableau comparatif des versions (le cœur de la conclusion)',
    visuel: 'secretaire_comparatif',
    explication: `Mesure toutes les versions **sur les mêmes listes** (même graine) et présente un tableau : c’est ce que le correcteur cherche pour savoir « quelle version choisir en définitive ».`,
    exemple: {
      code: `versions = {
    "dummy (3e jour)": lambda n, s: len(s) == 3,
    "q=0,5 m=1": strategie(0.5),
    "q=1/e m=1": strategie(1 / np.e),
    "q=0,35 m=0,9": strategie(0.35, 0.9),
}

random.seed(1)
listes = [[random.randint(0, 5000) for _ in range(30)] for _ in range(3000)]   # mêmes données pour tous

print(f"{'version':<16}{'rang moy':>9}{'médiane':>9}{'p90':>6}{'P(meilleur)':>13}")
for nom, choix in versions.items():
    rangs = []
    for l in listes:
        c, i = jouer(l, choix)
        rangs.append(rang(l, i))
    rangs = np.array(rangs)
    print(f"{nom:<16}{rangs.mean():>9.2f}{np.median(rangs):>9.1f}{np.percentile(rangs, 90):>6.0f}{(rangs == 1).mean():>12.1%}")`,
      titre: 'comparaison équitable',
    },
    plus: `Comparer sur **les mêmes listes** supprime une source de bruit : les écarts mesurés viennent des stratégies, pas du tirage. C’est l’équivalent d’un « essai apparié ».

Si pandas est disponible : \`pd.DataFrame(lignes).set_index("version").round(2)\` affiche un joli tableau dans Jupyter. Sinon, le \`print\` formaté ci-dessus (\`:>9.2f\` = aligné à droite sur 9 caractères, 2 décimales ; \`:.1%\` = pourcentage) suffit.`,
  },
  {
    id: 'k-distribution',
    genre: 'metrique',
    titre: 'Distribution des résultats : histogramme et boîte à moustaches',
    visuel: 'secretaire_hist',
    explication: `Une moyenne résume, une **distribution** montre : les cas d’échec, l’asymétrie, la queue. Histogramme pour une version, boîte à moustaches (\`boxplot\`) pour comparer plusieurs versions d’un coup d’œil.`,
    exemple: {
      code: `donnees = {}
for nom in ["q=1/e m=1", "q=0,35 m=0,9"]:
    donnees[nom] = [rang(l, jouer(l, versions[nom])[1]) for l in listes]

plt.hist(donnees["q=0,35 m=0,9"], bins=range(1, 32), density=True, rwidth=0.85)
plt.xlabel("rang obtenu"); plt.ylabel("fréquence"); plt.title("Distribution du rang (q=0,35, m=0,9)")
plt.show()

plt.boxplot(list(donnees.values()), tick_labels=list(donnees.keys()))
plt.ylabel("rang"); plt.title("Comparaison des distributions")
plt.show()`,
      titre: 'distributions',
    },
    plus: `Lire une boîte à moustaches : le trait central est la **médiane**, la boîte va du 1er au 3e quartile (50 % des valeurs), les moustaches s’étendent jusqu’à 1,5 fois l’écart interquartile, et les points au-delà sont les valeurs extrêmes. Ici la version 1/e a une médiane basse (souvent le meilleur) mais une boîte très étirée (souvent très mauvais).

Sur une version ancienne de matplotlib (< 3.9), remplace \`tick_labels=\` par \`labels=\`.`,
  },
  {
    id: 'k-robustesse',
    genre: 'metrique',
    titre: 'Robustesse : autre n, autres bornes, autre distribution',
    visuel: 'secretaire_distrib',
    explication: `Une stratégie optimisée pour un cas précis peut s’effondrer ailleurs. Teste-la en faisant varier **une chose à la fois** : la taille n, les bornes des données, la loi de tirage. Le sujet 2024 y invite explicitement (« rien ne dit que les bornes seront les mêmes »).`,
    exemple: {
      code: `generateurs = {
    "uniforme 0-5000": lambda n: [random.randint(0, 5000) for _ in range(n)],
    "uniforme 230-788": lambda n: [random.randint(230, 788) for _ in range(n)],
    "normale": lambda n: list(np.clip(np.random.normal(2500, 600, n), 0, None)),
}

def seuil_relatif(q, m):
    def choix(n, seen):
        k = int(n * q); i = len(seen)
        if i == n or k == 0: return True
        if i <= k: return False
        mn, mx = min(seen[:k]), max(seen[:k])
        return seen[-1] >= mn + m * (mx - mn)       # ne dépend plus de l'échelle
    return choix

for nom, gen in generateurs.items():
    for libelle, choix in [("absolu", strategie(0.35, 0.9)), ("relatif", seuil_relatif(0.35, 0.9))]:
        rangs = []
        for _ in range(1500):
            l = gen(30)
            rangs.append(rang(l, jouer(l, choix)[1]))
        print(f"{nom:<18} seuil {libelle:<8} rang moyen = {np.mean(rangs):.2f}")`,
      titre: 'robustesse',
    },
    plus: `Pourquoi le seuil absolu \`m × max\` souffre sur 230–788 ? Avec m = 0,9 et un max exploré de 780, le seuil vaut 702 : il est atteint bien plus souvent, en relatif, que sur 0–5000. Le seuil **relatif** \`min + m·(max − min)\` se calcule dans l’échelle des données : il est invariant si on multiplie ou décale tous les scores.

Lis bien la sortie : sur la loi normale, le seuil relatif avec m = 0,9 fait **moins bien** que le seuil absolu. L’invariance d’échelle ne protège pas d’un changement de **loi** : chaque version doit être ré-optimisée pour la nouvelle distribution. C’est exactement le genre de nuance qui fait la note.

Pour n : remplace \`gen(30)\` par \`gen(n)\` dans une boucle \`for n in [10, 30, 100]\` et compare le **rang relatif** (rang / n), sinon les chiffres ne sont pas comparables.`,
  },
  {
    id: 'k-complexite',
    genre: 'metrique',
    titre: 'Complexité expérimentale : temps, compteur d’opérations, log-log',
    visuel: 'gs_complexite',
    explication: `Deux façons de mesurer un coût :
- **compter** les opérations clés (propositions de Gale-Shapley, chemins augmentants d’Edmonds-Karp) : indépendant de la machine ;
- **chronométrer** avec \`time.perf_counter()\` : dépend de la machine, moyenne sur plusieurs essais.

En **échelle log-log**, une complexité en nᵏ devient une droite de pente k : \`np.polyfit(np.log(n), np.log(t), 1)\` estime k.`,
    exemple: {
      code: `def chrono(f, *args, repet=5):
    t = []
    for _ in range(repet):
        d = time.perf_counter()
        f(*args)
        t.append(time.perf_counter() - d)
    return np.mean(t)

tailles = [100, 200, 400, 800, 1600]
temps = [chrono(lambda n: sorted(random.sample(range(10 * n), n)), n) for n in tailles]

pente, _ = np.polyfit(np.log(tailles), np.log(temps), 1)
plt.loglog(tailles, temps, "o-", label=f"mesuré (pente ≈ {pente:.2f})")
plt.loglog(tailles, [temps[0] * (n / tailles[0]) ** 2 for n in tailles], "--", label="référence n²")
plt.xlabel("n"); plt.ylabel("temps (s)"); plt.legend(); plt.title("Complexité en log-log")
plt.show()
print(f"pente estimée : {pente:.2f} (≈ 1 pour n log n)")`,
      titre: 'complexité',
    },
    plus: `Ordres de grandeur du cours à savoir citer :
- Gale-Shapley : **O(n²)** propositions dans le pire cas, ≈ **n log n** en moyenne sur des préférences aléatoires (courbe ci-dessus).
- Edmonds-Karp : **O(V·E²)**.
- Hopcroft-Karp : **O(E·√V)**.
- Puissances itérées : chaque itération coûte un produit matrice-vecteur **O(n²)** ; le nombre d’itérations dépend de λ₂/λ₁.
- Valeurs propres par \`eig\` : **O(n³)**.

\`time.perf_counter()\` est plus précis que \`time.time()\` pour des durées courtes.`,
  },
  {
    id: 'k-incertitude',
    genre: 'metrique',
    titre: 'Combien d’essais ? Intervalle de confiance et barres d’erreur',
    explication: `La moyenne de N essais a une incertitude d’environ **σ / √N** (erreur standard). Un intervalle de confiance à 95 % ≈ **moyenne ± 1,96 × σ/√N**. Pour diviser l’erreur par 2, il faut **4 fois plus** d’essais.

Afficher des barres d’erreur (\`errorbar\` ou \`fill_between\`) montre au correcteur que tu sais distinguer une vraie différence du bruit.`,
    exemple: {
      code: `def moyenne_ic(valeurs):
    v = np.array(valeurs, float)
    e = 1.96 * v.std(ddof=1) / np.sqrt(len(v))
    return v.mean(), e

for N in [100, 1000, 10000]:
    rangs = []
    for _ in range(N):
        l = [random.randint(0, 5000) for _ in range(30)]
        rangs.append(rang(l, jouer(l, strategie(0.35, 0.9))[1]))
    m, e = moyenne_ic(rangs)
    print(f"N = {N:>5} : rang moyen = {m:.2f} ± {e:.2f}")

q_vals = np.arange(0.1, 0.8, 0.1)
moy, err = [], []
for q in q_vals:
    rs = [rang(l, jouer(l, strategie(q))[1]) for l in ([random.randint(0, 5000) for _ in range(30)] for _ in range(500))]
    a, b = moyenne_ic(rs); moy.append(a); err.append(b)
plt.errorbar(q_vals, moy, yerr=err, fmt="o-", capsize=4)
plt.fill_between(q_vals, np.array(moy) - err, np.array(moy) + err, alpha=0.2)
plt.xlabel("q"); plt.ylabel("rang moyen ± IC 95 %"); plt.title("Barres d'erreur")
plt.show()`,
      titre: 'incertitude',
    },
    plus: `\`std(ddof=1)\` donne l’écart-type « corrigé » (division par N − 1), celui qu’on utilise pour estimer l’écart-type d’une population à partir d’un échantillon.

Phrase type : « Avec 10 000 essais, le rang moyen vaut 3,77 ± 0,05 : la différence avec la version 1/e (7,0) est donc largement significative. »`,
  },
  {
    id: 'k-trace',
    genre: 'code',
    titre: 'Gabarit de graphique propre (à réutiliser partout)',
    explication: `Un graphique sans titre, sans axes nommés ou sans légende perd des points de « clarté ». Une petite fonction évite de l’oublier.`,
    exemple: {
      code: `def tracer(x, series, titre, xlabel, ylabel, logy=False, ref=None):
    """series = {"nom de la courbe": liste_de_y}"""
    plt.figure(figsize=(8, 4.5))
    for nom, y in series.items():
        plt.plot(x, y, "o-", label=nom, markersize=4)
    if ref is not None:
        plt.axhline(ref[0], color="red", linestyle="--", label=ref[1])
    if logy:
        plt.yscale("log")
    plt.title(titre); plt.xlabel(xlabel); plt.ylabel(ylabel)
    plt.legend(); plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

x = list(range(1, 11))
tracer(x, {"n": x, "n log n": [k * np.log(k) for k in x]}, "Exemple", "n", "coût", ref=(5, "seuil"))`,
      titre: 'tracer()',
    },
    plus: `Autres réglages utiles :
- \`plt.subplots(1, 2, figsize=(12, 4))\` : deux graphiques côte à côte (comparaison) ;
- \`plt.axvline(x)\` : marquer un paramètre choisi ;
- \`plt.annotate("optimum", xy=(x, y), xytext=(x + 0.1, y + 1), arrowprops={"arrowstyle": "->"})\` : pointer l’optimum ;
- \`plt.savefig("figure.png", dpi=150)\` **avant** \`plt.show()\`.`,
  },
]
