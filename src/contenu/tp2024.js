// TP noté 2024 « affectations ParcourSup » : sujet, corrigé commenté, solution complète et métriques.

export const blocs = [
  {
    id: 't-sujet',
    genre: 'notion',
    titre: 'Le sujet en 30 secondes',
    source: '2024_R5A12_TPnote_Sujet.ipynb',
    explication: `ParcourSup propose **une formation par jour pendant n jours** (n connu). Chaque formation a un **score** (plus il est grand, mieux c’est). L’élève ne peut **pas revenir** sur une proposition passée, **ne connaît pas** les suivantes, et toute acceptation est **définitive**.

À écrire : \`choice(n, seen)\` → \`True\` (accepter la proposition du jour \`seen[-1]\`) ou \`False\` (attendre). Fournis : \`dummy_choice\` (accepte le 3e jour), \`rand_list(n)\` (scores entre 100 et 1000, **bornes de l’an passé, susceptibles de changer**), \`resultat(listeScores, fonctionChoix)\`.

Attendu : une ou plusieurs versions, **analyse des résultats** (texte, courbes, métriques), **comparaison** et **choix final justifié**.`,
    plus: `Famille : **arrêt optimal**, plus précisément le **problème du secrétaire**. Le mot-clé à écrire dans le notebook pour montrer qu’on l’a reconnu, avec le lien Wikipédia (internet est autorisé).

Ce qu’on ne connaît pas et qu’il faut estimer : le **niveau des bons scores**. Idée centrale : l’utiliser les premiers jours pour **apprendre** ce niveau (exploration), puis **décider** (exploitation).`,
  },
  {
    id: 't-indicateurs',
    genre: 'metrique',
    titre: 'Étape 1 du corrigé : définir des indicateurs',
    explication: `On connaît la liste complète **après coup** : on peut donc mesurer à quel point le choix était proche du meilleur.
- **rang** du choix parmi les scores triés par ordre décroissant (1 = le meilleur) ;
- **ratio** (choisi − min)/(max − min) ∈ [0, 1] ;
- à ajouter (absent du corrigé, mais très pertinent) : **P(meilleur)** = fréquence des rangs 1, et un **pire cas** (90e percentile du rang).`,
    exemple: {
      code: `import random
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
random.seed(2024)

def rang(listeFinale, i):
    """i est l'indice de la formation choisie"""
    listeFinale = np.array(listeFinale)
    argsort_l = (-listeFinale).argsort()        # indices triés par valeur DÉCROISSANTE
    return np.where(argsort_l == i)[0][0] + 1   # position de i dans ce classement, +1 -> rang 1..n

def ratio(listeFinale, chosen):
    return (chosen - min(listeFinale)) / (max(listeFinale) - min(listeFinale))

l = [450, 120, 980, 300, 760]
print("rang de l'indice 4 (760) :", rang(l, 4), "| ratio :", round(ratio(l, 760), 3))`,
      titre: 'corrigé : rang et ratio',
    },
    plus: `Décomposons \`(-L).argsort()\` : \`argsort\` renvoie les **indices** qui trient par ordre croissant. Sur \`-L\`, l’ordre croissant de −L est l’ordre **décroissant** de L. Pour [450, 120, 980, 300, 760] : −L = [−450, −120, −980, −300, −760] → argsort = [2, 4, 0, 3, 1] (980, 760, 450, 300, 120).
\`np.where(argsort_l == 4)[0][0]\` = position de l’indice 4 dans ce classement = 1 → rang 2.`,
  },
  {
    id: 't-baseline',
    genre: 'metrique',
    titre: 'Étape 2 : mesurer la baseline sur 1000 essais',
    explication: `Un seul exemple ne dit rien (hasard) : on répète 1000 fois et on moyenne. Le corrigé passe à des scores entre 0 et 5000 pour l’étude, et n = 30 (un mois).`,
    exemple: {
      code: `def dummy_choice(n, seen):
    return len(seen) == 3

def rand_list(n):
    return [random.randint(0, 5000) for _ in range(n)]

def resultat(listeScores, fonctionChoix):
    n = len(listeScores)                     # correction : plus de dépendance au n global
    i, choice = 0, False
    while i < len(listeScores) and not choice:
        i += 1
        choice = fonctionChoix(n, listeScores[:i])
    return listeScores[i - 1], i - 1         # (score choisi, INDICE 0..n-1)

n, nbEx = 30, 1000
rangs, ratios = [], []
for _ in range(nbEx):
    liste = rand_list(n)
    chosen, i = resultat(liste, dummy_choice)
    rangs.append(rang(liste, i)); ratios.append(ratio(liste, chosen))
print("dummy : rang moyen", round(np.mean(rangs), 2), "| ratio moyen", round(np.mean(ratios), 3))`,
      titre: 'baseline',
    },
    plus: `Résultat attendu ≈ 15,5 de rang et ≈ 0,5 de ratio : c’est exactement ce que donnerait un choix au hasard ((n + 1)/2 et 1/2). Phrase type : « la stratégie fournie ne fait pas mieux que le hasard ».`,
  },
  {
    id: 't-v1',
    genre: 'code',
    titre: 'Étape 3 : explorer puis accepter mieux que le max exploré (paramètre q)',
    visuel: 'secretaire_q',
    explication: `On laisse passer une part **q** des jours (exploration) en retenant le **max**, puis on accepte la **première proposition ≥ ce max** ; si aucune n’arrive, on prend le dernier jour. On balaie q de 0,05 à 0,95.

Lecture du graphique (20 000 essais par point) : le **rang moyen** est minimal vers **q ≈ 0,15–0,2** (rang ≈ 5,1–5,3, le corrigé retient 0,2) ; la **probabilité de trouver le meilleur** plafonne à **≈ 38 %** pour q entre 0,3 et 0,45, autour de **1/e ≈ 0,37**. Deux objectifs, deux optimums différents : il faut dire lequel on vise. Avec 1000 ou 2000 essais seulement, l’optimum lu bouge d’un cran d’un tirage à l’autre.`,
    exemple: {
      code: `def choice_q(n, seen, q):
    tresh = int(n * q)                # nombre de jours d'exploration
    i = len(seen)                     # numéro du jour (1..n)
    if i == n:                        # dernier jour : obligé d'accepter
        return True
    if i <= tresh or tresh == 0:      # exploration (tresh = 0 -> on accepte tout de suite)
        return tresh == 0
    return seen[-1] >= max(seen[:tresh])

q_vals = np.arange(0.05, 1, 0.05)
rangMoy, pMeilleur = [], []
for q in q_vals:
    rs = []
    for _ in range(2000):
        liste = rand_list(30)
        chosen, i = resultat(liste, lambda n, s: choice_q(n, s, q))
        rs.append(rang(liste, i))
    rs = np.array(rs)
    rangMoy.append(rs.mean()); pMeilleur.append((rs == 1).mean())

plt.plot(q_vals, rangMoy, "o-")
plt.xlabel("q"); plt.ylabel("rang moyen"); plt.title("Rang moyen selon q (m = 1)")
plt.show()
print("q qui minimise le rang :", round(q_vals[np.argmin(rangMoy)], 2), "| q qui maximise P(meilleur) :", round(q_vals[np.argmax(pMeilleur)], 2))`,
      titre: 'v1 : choice_q',
    },
    plus: `Pourquoi une courbe en U ? Trop peu d’exploration (q petit) : le max exploré est faible, on accepte trop tôt une proposition moyenne. Trop d’exploration (q grand) : le max exploré est très haut, il reste peu de jours pour le battre, on finit souvent par le dernier jour (au hasard).

\`lambda n, s: choice_q(n, s, q)\` fabrique une fonction à 2 paramètres (la signature attendue) qui « fige » q. Dans une boucle, la lambda est appelée immédiatement par \`resultat\`, donc elle utilise bien le q courant.`,
  },
  {
    id: 't-v2',
    genre: 'code',
    titre: 'Étape 4 : être moins exigeant (paramètre m)',
    explication: `Accepter dès que la proposition atteint **m × max exploré** (m < 1 = moins exigeant, m > 1 = plus exigeant). Le corrigé fixe q = 0,2 puis fait varier m : optimum **m = 0,9**, rang moyen ≈ 4,1-4,3.`,
    exemple: {
      code: `def choice_mq(n, seen, m, q=0.2):
    tresh = int(n * q)
    i = len(seen)
    if i == n or tresh == 0:
        return True
    if i <= tresh:
        return False
    return seen[-1] >= m * max(seen[:tresh])

m_vals = np.arange(0.5, 1.5, 0.1)
res = []
for m in m_vals:
    rs = []
    for _ in range(2000):
        liste = rand_list(30)
        rs.append(rang(liste, resultat(liste, lambda n, s: choice_mq(n, s, m, 0.2))[1]))
    res.append(np.mean(rs))
print("m optimal (q = 0,2) :", round(m_vals[np.argmin(res)], 1), "| rang moyen :", round(min(res), 2))`,
      titre: 'v2 : choice_mq',
    },
  },
  {
    id: 't-grille',
    genre: 'metrique',
    titre: 'Étape 5 : optimiser q et m ensemble (grille 2D)',
    visuel: 'secretaire_heatmap',
    explication: `Optimiser l’un puis l’autre donne (0,2 ; 0,9). En les faisant varier **ensemble**, on trouve une zone autour de **(0,35 ; 0,9)** et un rang moyen ≈ **3,7–3,8** (mesuré sur 20 000 essais) : nettement mieux. Le corrigé trace la surface 3D (\`plot_surface\`) et récupère l’optimum avec \`np.unravel_index\`.`,
    exemple: {
      code: `q_vals = np.arange(0.1, 0.65, 0.05)
m_vals = np.arange(0.7, 1.15, 0.05)
rangMoy = np.zeros((len(q_vals), len(m_vals)))
for a, q in enumerate(q_vals):
    for b, m in enumerate(m_vals):
        rs = []
        for _ in range(400):
            liste = rand_list(30)
            rs.append(rang(liste, resultat(liste, lambda n, s: choice_mq(n, s, m, q))[1]))
        rangMoy[a, b] = np.mean(rs)

ind = np.unravel_index(np.argmin(rangMoy), rangMoy.shape)
print("optimum : q =", round(q_vals[ind[0]], 2), "m =", round(m_vals[ind[1]], 2), "rang moyen =", round(rangMoy[ind], 2))

ax = plt.figure().add_subplot(projection="3d")
X, Y = np.meshgrid(m_vals, q_vals)
ax.plot_surface(X, Y, rangMoy, cmap=cm.coolwarm, linewidth=0, antialiased=False)
ax.set_xlabel("m"); ax.set_ylabel("q"); ax.set_zlabel("rang moyen")
plt.show()`,
      titre: 'grille 2D (comme le corrigé)',
    },
    plus: `Avec seulement 400 essais par case, l’optimum peut bouger d’une case d’un tirage à l’autre (bruit ≈ ±0,3 en rang). Pour une conclusion solide : refaire une mesure à 10 000 essais sur les 3–4 meilleures cases, et dire que la zone q ∈ [0,3 ; 0,4], m ∈ [0,85 ; 0,95] est équivalente.`,
  },
  {
    id: 't-carte-ratio',
    genre: 'metrique',
    titre: 'La même grille pour le ratio moyen',
    visuel: 'secretaire_heatmap_ratio',
    explication: `Le ratio donne une zone optimale proche mais pas identique : changer d’indicateur peut changer la recommandation. Le mentionner montre la rigueur de l’analyse.`,
  },
  {
    id: 't-comparatif',
    genre: 'metrique',
    titre: 'Comparaison finale des versions',
    visuel: 'secretaire_comparatif',
    explication: `Le tableau qui permet de **choisir**. La stratégie classique du secrétaire (q = 1/e, m = 1) **maximise la probabilité d’avoir le meilleur** (≈ 37 %, résultat théorique) mais a un rang moyen de 7 : quand elle échoue, elle tombe souvent au dernier jour. La version (0,35 ; 0,9) a un rang moyen deux fois meilleur.

**Recommandation** : (q = 0,35, m = 0,9) si l’objectif est une **bonne formation en moyenne** ; (1/e, 1) si l’objectif est **la meilleure formation ou rien**.`,
  },
  {
    id: 't-distribution',
    genre: 'metrique',
    titre: 'Distribution et jour d’acceptation',
    visuel: 'secretaire_hist',
    explication: `Compléments d’analyse rarement faits, donc valorisants : la **distribution** du rang (combien de fois dans le top 3 ?) et le **jour d’acceptation** (un pic au dernier jour = cas où la stratégie « rate »).`,
  },
  {
    id: 't-jour',
    genre: 'metrique',
    titre: 'Jour d’acceptation',
    visuel: 'secretaire_jour',
    explication: `Aucune acceptation pendant l’exploration, un pic juste après, puis une traîne et un pic final : on visualise directement le compromis exploration / exploitation.`,
  },
  {
    id: 't-robustesse',
    genre: 'metrique',
    titre: 'Robustesse : n et distribution des scores',
    visuel: 'secretaire_n',
    explication: `Les paramètres (0,35 ; 0,9) ont été optimisés pour n = 30 et des scores uniformes. On vérifie qu’ils restent bons pour d’autres n (rang **relatif** rang/n) et d’autres distributions. Le sujet insiste : les bornes de scores peuvent changer.`,
  },
  {
    id: 't-distrib',
    genre: 'metrique',
    titre: 'Robustesse aux bornes et à la loi des scores',
    visuel: 'secretaire_distrib',
    explication: `Avec un seuil **multiplicatif** m × max, changer les bornes (230–788 au lieu de 0–5000) change le comportement : m = 0,9 devient moins exigeant en proportion. Le seuil **relatif** min + m·(max − min) est invariant si l’on décale ou multiplie tous les scores, ce qui corrige ce cas. En revanche, il ne règle pas un **changement de loi** (scores normaux, exponentiels) : il faut alors ré-optimiser m. Les deux phrases sont à écrire, elles montrent la rigueur de l’analyse.`,
  },
  {
    id: 't-simulateur',
    genre: 'metrique',
    titre: 'Simulateur interactif',
    visuel: 'simulateur',
    explication: `Pour **sentir** les compromis avant le contrôle : bouge q, m et n, compare seuil absolu et relatif. Tout est recalculé dans le navigateur (4 000 essais).`,
  },
  {
    id: 't-bugs',
    genre: 'piege',
    titre: 'Les bugs du corrigé (à ne pas reproduire)',
    explication: `1. **Dernier jour** : le corrigé teste \`if i == n - 1\` alors que \`i = len(seen)\` vaut **n** le dernier jour → il accepte l’**avant-dernier** jour d’office. Correct : \`if len(seen) == n\`.
2. **\`max([])\`** : si \`int(n*q) == 0\` (q petit ou n petit), \`max(seen[:0])\` lève \`ValueError\`. Traiter le cas \`tresh == 0\`.
3. **\`n\` global** : \`resultat\` appelle \`fonctionChoix(n, …)\` avec la variable globale n, pas \`len(listeScores)\`. Changer n dans une boucle sans le redéfinir fausse tout.
4. **Indice vs jour** : le sujet renvoie \`i\` (jour 1..n), le corrigé \`i - 1\` (indice 0..n−1). La fonction \`rang\` attend un **indice**.
5. **\`opti_choice_wiki\`** : \`i == n or seen[-1] >= max(seen[:tresh])\` ne bloque pas la phase d’exploration : le jour 1, \`seen[:tresh]\` vaut \`[seen[0]]\` et la condition est vraie, donc la fonction **accepte toujours le 1er jour**. Le corrigé ne l’utilise heureusement pas pour ses mesures (il passe par \`resultat_mq\` avec q = 1/e, m = 1).`,
    plus: `Signaler ces points dans ton notebook (« nous avons corrigé… ») montre que tu as **testé** ton code : c’est noté dans la pertinence. Pour les attraper toi-même : \`assert\` sur un mini-exemple n = 3, et un \`print(len(seen))\` dans la fonction de choix sur un essai.`,
  },
  {
    id: 't-solution',
    genre: 'code',
    titre: 'Solution complète prête à adapter (une cellule)',
    explication: `Tout ce qu’il faut pour un rendu solide : fonctions corrigées, banc d’essai commun, quatre versions, comparaison sur les **mêmes** listes, robustesse. À adapter à un sujet du même type (accepter/attendre, enchères, recrutement…).`,
    exemple: {
      code: `import random, numpy as np, matplotlib.pyplot as plt
random.seed(0); np.random.seed(0)

def jouer(liste, choix):
    n = len(liste)
    for i in range(1, n + 1):
        if choix(n, liste[:i]) or i == n:
            return liste[i - 1], i - 1

def mesures(choix, listes):
    r, ra = [], []
    for l in listes:
        c, i = jouer(l, choix)
        r.append(1 + sum(x > c for x in l))
        ra.append((c - min(l)) / (max(l) - min(l)))
    r = np.array(r)
    return {"rang": r.mean(), "médiane": np.median(r), "p90": np.percentile(r, 90),
            "ratio": np.mean(ra), "P(meilleur)": (r == 1).mean()}

def fabrique(q, m=1.0, relatif=False):
    def choice(n, seen):
        k = int(n * q); i = len(seen)
        if i == n or k == 0: return True
        if i <= k: return False
        mn, mx = min(seen[:k]), max(seen[:k])
        seuil = mn + m * (mx - mn) if relatif else m * mx
        return seen[-1] >= seuil
    return choice

versions = {
    "dummy (3e jour)": lambda n, s: len(s) == 3,
    "secrétaire 1/e": fabrique(1 / np.e),
    "q=0,35 m=0,9": fabrique(0.35, 0.9),
    "q=0,35 relatif m=0,9": fabrique(0.35, 0.9, relatif=True),
}

for bornes in [(0, 5000), (230, 788)]:
    listes = [[random.randint(*bornes) for _ in range(30)] for _ in range(5000)]
    print(f"\\nscores entre {bornes[0]} et {bornes[1]}")
    for nom, f in versions.items():
        m = mesures(f, listes)
        print(f"  {nom:<22} rang {m['rang']:5.2f}  médiane {m['médiane']:4.1f}  p90 {m['p90']:4.0f}  ratio {m['ratio']:.3f}  P(meilleur) {m['P(meilleur)']:.1%}")

def choice(n, seen):            # version finale rendue (signature imposée)
    return fabrique(0.35, 0.9, relatif=True)(n, seen)`,
      titre: 'solution complète',
    },
    plus: `Pourquoi le seuil relatif change peu sur 0–5000 mais beaucoup sur 230–788 ? Sur 0–5000 le min exploré est proche de 0, donc min + m(max − min) ≈ m × max. Sur 230–788 le min n’est plus négligeable : le seuil relatif reste aussi exigeant **en proportion**, alors que m × max devient laxiste.

Si le temps le permet : **seuil décroissant** (m diminue à l’approche de la fin, on devient moins exigeant quand il reste peu de jours). C’est une v3 naturelle, à mesurer comme les autres.`,
  },
]
