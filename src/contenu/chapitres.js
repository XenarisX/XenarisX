// Chapitres du cours R5.A.12 : chaque chapitre est exécuté dans l'ordre (vérification automatique du code).

const IMPORTS = `import random, copy, time
from collections import deque
import numpy as np
import numpy.linalg as la
import matplotlib.pyplot as plt
import networkx as nx
random.seed(0); np.random.seed(0)`

export const CHAPITRES = [
  /* =============================================================== GALE-SHAPLEY */
  {
    id: 'gale-shapley',
    court: 'GS',
    titre: 'Mariages stables : Gale-Shapley',
    cours: 'Cours 1 · TP1',
    resume: 'Apparier deux populations qui se classent mutuellement, sans paire bloquante. Algorithme glouton de propositions, optimal pour ceux qui proposent.',
    blocs: [
      {
        id: 'gs-probleme',
        genre: 'notion',
        titre: 'Le problème et la notion de stabilité',
        source: 'Cours 1',
        explication: `Deux populations de même taille n : **P1** (ex. étudiants) et **P2** (ex. formations). Chaque individu classe **tous** les membres de l’autre population, du préféré au moins aimé. On cherche un **mariage** (une bijection P1 ↔ P2).

Une **paire bloquante** est un couple (e, f) **non marié ensemble** tel que e préfère f à son partenaire **et** f préfère e au sien : ils auraient intérêt à quitter leurs partenaires. Un mariage est **stable** s’il n’a **aucune** paire bloquante.`,
        exemple: {
          texte: 'Structure de données du TP : un dictionnaire `identifiant → liste ordonnée`, et un mariage `{p1: p2}` (−1 = célibataire).',
          code: `${IMPORTS}

etudiantPref  = {0: [4, 1, 2, 0, 3], 1: [2, 3, 0, 1, 4], 2: [4, 0, 1, 2, 3], 3: [3, 1, 4, 0, 2], 4: [3, 4, 1, 2, 0]}
formationPref = {1: [3, 4, 0, 2, 1], 2: [1, 3, 0, 4, 2], 3: [1, 4, 3, 2, 0], 0: [2, 1, 0, 3, 4], 4: [3, 1, 4, 2, 0]}

def prefer(pref, c1, c2):
    """True si c1 est préféré à c2 dans la liste pref (c1 absent -> False, c2 absent -> True)."""
    if c1 not in pref:
        return False
    if c2 not in pref:
        return True
    return pref.index(c1) < pref.index(c2)

def marriedTo(mariage, e, isP1):
    """Partenaire de e (-1 s'il est seul). isP1 : e est-il une clé du dictionnaire ?"""
    if isP1:
        return mariage.get(e, -1)
    for i in mariage:
        if mariage[i] == e:
            return i
    return -1

print(prefer(etudiantPref[0], 4, 1), prefer(etudiantPref[0], 0, 1))
print(marriedTo({0: 0, 2: 4, 3: 1, 1: 2}, 1, True), marriedTo({0: 0, 2: 4, 3: 1, 1: 2}, 1, False))`,
          titre: 'TP1 : fonctions de base',
        },
        plus: `\`pref.index(c)\` renvoie la **position** de c dans la liste : 0 = premier choix. Comparer deux positions dit qui est préféré. Coût O(n) : pour de grandes instances on précalcule un dictionnaire de rangs \`rang[f][e] = position\` (accès O(1)).

\`marriedTo\` côté P2 doit parcourir les valeurs du dictionnaire (« clé par valeur ») : \`list(m.keys())[list(m.values()).index(f)]\` fait la même chose en une ligne mais lève une erreur si f est absent.`,
      },
      {
        id: 'gs-algo',
        genre: 'code',
        titre: 'L’algorithme de Gale-Shapley',
        visuel: 'gs_pas',
        explication: `Tant qu’il reste un membre de P1 célibataire :
1. il **propose** au prochain membre de P2 de sa liste (à qui il n’a pas encore proposé) ;
2. si ce membre de P2 est **libre**, il accepte (mariage provisoire) ;
3. s’il est déjà fiancé, il **garde celui qu’il préfère** ; l’autre redevient célibataire.

Propriétés à citer : il **termine** (chacun propose au plus une fois à chacun → ≤ n² propositions), tout le monde est marié, le résultat est **stable**, il est **optimal pour ceux qui proposent** et le pire mariage stable pour ceux qui reçoivent. L’ordre de traitement des célibataires ne change pas le résultat.`,
        exemple: {
          code: `def galeShapley(p1Pref, p2Pref):
    mariage = {}
    suivant = {e: 0 for e in p1Pref}          # indice du prochain choix de e
    celibataires = list(p1Pref)
    while celibataires:
        e = celibataires.pop(0)
        f = p1Pref[e][suivant[e]]
        suivant[e] += 1
        rival = marriedTo(mariage, f, False)
        if rival == -1:                         # f est libre : accepte
            mariage[e] = f
        elif prefer(p2Pref[f], e, rival):       # f préfère e : le rival est libéré
            del mariage[rival]
            mariage[e] = f
            celibataires.append(rival)
        else:                                   # f refuse e
            celibataires.append(e)
    return mariage

m = galeShapley(etudiantPref, formationPref)
print(m)
assert m == {0: 0, 1: 2, 2: 4, 3: 1, 4: 3}      # résultat attendu du TP1`,
          titre: 'TP1 : galeShapley',
        },
        plus: `Pourquoi c’est stable ? Supposons (e, f) bloquante : e préfère f à sa partenaire, donc **e a proposé à f avant**. f l’a refusé ou quitté pour quelqu’un qu’elle préférait, et une formation ne fait que **s’améliorer** au fil de l’algorithme. Donc f préfère son partenaire final à e : contradiction.

Inverser les rôles (\`galeShapley(formationPref, etudiantPref)\`) donne en général **un autre** mariage stable, optimal cette fois pour P2.`,
      },
      {
        id: 'gs-stable',
        genre: 'code',
        titre: 'Vérifier qu’un mariage est stable',
        explication: `Indispensable pour un sujet qui modifie l’algorithme (capacités, préférences incomplètes) : on **prouve** que la sortie est stable en cherchant toutes les paires bloquantes.`,
        exemple: {
          code: `def pairesBloquantes(mariage, p1Pref, p2Pref):
    inverse = {f: e for e, f in mariage.items()}
    bloquantes = []
    for e in p1Pref:
        for f in p1Pref[e]:
            if f == mariage[e]:
                break                            # au-delà, e préfère son partenaire
            if prefer(p2Pref[f], e, inverse[f]):
                bloquantes.append((e, f))
    return bloquantes

print(pairesBloquantes(m, etudiantPref, formationPref))            # [] -> stable
print(pairesBloquantes({0: 1, 1: 0, 2: 2, 3: 3, 4: 4}, etudiantPref, formationPref)[:3])`,
          titre: 'test de stabilité',
        },
        plus: `On ne parcourt pour chaque e que les f qu’il **préfère** à son partenaire (on s’arrête à son partenaire) : coût O(n²) au pire.`,
      },
      {
        id: 'gs-regret',
        genre: 'metrique',
        titre: 'Mesurer la satisfaction : le regret',
        visuel: 'gs_regrets',
        explication: `Le **regret** d’un individu = position de son partenaire dans sa liste (0 = premier choix). Indicateurs du TP1 :
- **regret moyen de chaque population** (globalement, les gens sont-ils contents ?) ;
- **regret maximal** (le plus mal loti : une moyenne basse peut cacher quelqu’un de très mal marié).

On compare à une **baseline** : le mariage aléatoire, dont le regret moyen vaut ≈ (n − 1)/2.`,
        exemple: {
          code: `def regret(mariage, e, p1Pref, p2Pref, isP1):
    partenaire = marriedTo(mariage, e, isP1)
    if partenaire == -1:
        return -1
    return p1Pref[e].index(partenaire) if isP1 else p2Pref[e].index(partenaire)

def regrets(mariage, p1Pref, p2Pref):
    r1 = {e: regret(mariage, e, p1Pref, p2Pref, True) for e in p1Pref}
    r2 = {f: regret(mariage, f, p1Pref, p2Pref, False) for f in p2Pref}
    return [r1, r2]

def dicoPrefGenerator(n):
    d = {}
    for i in range(n):
        l = list(range(n))
        random.shuffle(l)                       # en place, renvoie None !
        d[i] = l
    return d

def mariageAleatoire(n):
    p = random.sample(range(n), n)              # permutation aléatoire
    return {i: p[i] for i in range(n)}

print(regrets(m, etudiantPref, formationPref))

n, essais = 50, 30
moy = np.zeros(4)
for _ in range(essais):
    p1, p2 = dicoPrefGenerator(n), dicoPrefGenerator(n)
    r = regrets(galeShapley(p1, p2), p1, p2)
    a = regrets(mariageAleatoire(n), p1, p2)
    moy += [np.mean(list(r[0].values())), np.mean(list(r[1].values())), np.mean(list(a[0].values())), np.mean(list(a[1].values()))]
print("GS P1, GS P2, alea P1, alea P2 :", np.round(moy / essais, 2))`,
          titre: 'TP1 : regrets',
        },
        plus: `Résultat à commenter : avec GS, les P1 (qui proposent) ont un regret moyen ≈ ln(n) (très faible), les P2 ≈ n/ln(n) (beaucoup plus fort). GS est **bien meilleur que l’aléatoire** pour les deux, mais **pas équitable** : c’est la motivation de Selkow.

Attention à \`mariageAleatoire\` : la version naïve \`{i: random.choice(list(p2))}\` peut donner deux fois la même formation (ce n’est plus un mariage) ; \`random.sample\` garantit une bijection.`,
      },
      {
        id: 'gs-complexite',
        genre: 'metrique',
        titre: 'Complexité en pratique',
        visuel: 'gs_complexite',
        explication: `Compter les propositions plutôt que chronométrer : on ajoute un compteur dans la boucle. Pire cas théorique **n²**, mais sur des préférences aléatoires la courbe suit **n·log n**.`,
        exemple: {
          code: `def galeShapleyCompteur(p1Pref, p2Pref):
    mariage, suivant, celib, nb = {}, {e: 0 for e in p1Pref}, list(p1Pref), 0
    while celib:
        e = celib.pop(0)
        f = p1Pref[e][suivant[e]]; suivant[e] += 1; nb += 1
        rival = marriedTo(mariage, f, False)
        if rival == -1:
            mariage[e] = f
        elif prefer(p2Pref[f], e, rival):
            del mariage[rival]; mariage[e] = f; celib.append(rival)
        else:
            celib.append(e)
    return nb

for n in [20, 40, 80, 160]:
    c = np.mean([galeShapleyCompteur(dicoPrefGenerator(n), dicoPrefGenerator(n)) for _ in range(5)])
    print(f"n = {n:>3} : {c:7.0f} propositions | n log n = {n * np.log(n):7.0f} | n² = {n * n}")`,
          titre: 'TP1 : compteur',
        },
        plus: `Pire cas n² : quand toutes les P1 ont les mêmes préférences, chacun doit descendre presque toute la liste. Construire ce cas (\`{i: list(range(n)) for i in range(n)}\`) et le mesurer est une très bonne analyse complémentaire.`,
      },
      {
        id: 'gs-pieges',
        genre: 'piege',
        titre: 'Pièges fréquents',
        explication: `- \`random.shuffle(l)\` **modifie l** et renvoie **None** : \`d[i] = random.shuffle(l)\` met None dans le dictionnaire.
- Ne pas modifier les listes de préférences d’origine (\`copy.deepcopy\`) si l’algorithme les consomme.
- \`pop(0)\` retire **par indice** ; \`remove(x)\` retire **par valeur** (la première occurrence).
- Confondre la **position** (\`index\`) et la **valeur** dans la liste de préférences.
- Itérer sur un dictionnaire **en le modifiant** → \`RuntimeError\` : itérer sur \`list(d.keys())\`.`,
      },
    ],
  },

  /* =============================================================== SELKOW */
  {
    id: 'selkow',
    court: 'Selkow',
    titre: 'Mariages stables équitables : Selkow',
    cours: 'Cours 1 · TP2',
    resume: 'Parmi tous les mariages stables, trouver celui où le plus malheureux l’est le moins possible (minimiser le regret maximal).',
    blocs: [
      {
        id: 'sk-idee',
        genre: 'notion',
        titre: 'Idée : encadrer le regret de chacun',
        explication: `Gale-Shapley avantage toujours ceux qui proposent. Selkow cherche un mariage stable **équitable** : celui qui **minimise le regret maximal**.

Ingrédients :
- \`GS(P1, P2)\` donne le **meilleur** mariage stable pour P1 → **borne inf** du regret de P1 et **borne sup** du regret de P2 ;
- \`GS(P2, P1)\` donne l’inverse → **borne inf de P2** et **borne sup de P1**.

Un individu dont **inf = sup** a le même partenaire dans **tous** les mariages stables : son mariage est **forcé** (non perfectible).`,
        exemple: {
          code: `${IMPORTS}

def prefer(pref, c1, c2):
    if c1 not in pref: return False
    if c2 not in pref: return True
    return pref.index(c1) < pref.index(c2)

def marriedTo(mariage, e, isP1):
    if isP1: return mariage.get(e, -1)
    for i in mariage:
        if mariage[i] == e: return i
    return -1

def galeShapley(p1Pref, p2Pref):
    mariage, suivant, celib = {}, {e: 0 for e in p1Pref}, list(p1Pref)
    while celib:
        e = celib.pop(0); f = p1Pref[e][suivant[e]]; suivant[e] += 1
        rival = marriedTo(mariage, f, False)
        if rival == -1: mariage[e] = f
        elif prefer(p2Pref[f], e, rival):
            del mariage[rival]; mariage[e] = f; celib.append(rival)
        else: celib.append(e)
    return mariage

def regrets(mariage, p1Pref, p2Pref):
    inv = {f: e for e, f in mariage.items()}
    return [{e: p1Pref[e].index(mariage[e]) for e in p1Pref}, {f: p2Pref[f].index(inv[f]) for f in p2Pref}]

def bornesSupInfGS(p1Pref, p2Pref):
    m1 = galeShapley(p1Pref, p2Pref)        # optimal pour P1
    m2 = galeShapley(p2Pref, p1Pref)        # optimal pour P2 (clés = P2)
    p1inf, p2sup = regrets(m1, p1Pref, p2Pref)
    p2inf, p1sup = regrets(m2, p2Pref, p1Pref)
    return p1inf, p1sup, p2inf, p2sup

etudiantPref1 = {0: [0, 2, 5, 1, 4, 3], 1: [5, 0, 1, 3, 4, 2], 2: [2, 5, 1, 3, 0, 4], 3: [3, 4, 5, 0, 1, 2], 4: [0, 2, 5, 1, 3, 4], 5: [5, 4, 3, 2, 0, 1]}
formationPref1 = {0: [0, 5, 4, 1, 3, 2], 1: [5, 0, 4, 3, 1, 2], 2: [0, 1, 3, 4, 5, 2], 3: [1, 4, 5, 0, 2, 3], 4: [3, 5, 1, 0, 2, 4], 5: [4, 1, 2, 0, 3, 5]}
b = bornesSupInfGS(etudiantPref1, formationPref1)
assert b == ({0: 0, 1: 0, 2: 2, 3: 0, 4: 1, 5: 1}, {0: 0, 1: 0, 2: 2, 3: 1, 4: 1, 5: 2},
             {0: 0, 1: 5, 2: 3, 3: 2, 4: 0, 5: 1}, {0: 0, 1: 5, 2: 3, 3: 5, 4: 1, 5: 1})   # assert du TP2
for nom, d in zip(["inf P1", "sup P1", "inf P2", "sup P2"], b):
    print(nom, d)`,
          titre: 'TP2 : bornesSupInfGS',
        },
        plus: `Attention à l’ordre des retours (piège du TP) : \`regrets(m2, p2Pref, p1Pref)\` renvoie **[regrets de P2, regrets de P1]** car on a inversé les rôles. D’où \`p2inf, p1sup = ...\`.`,
      },
      {
        id: 'sk-algo',
        genre: 'code',
        titre: 'L’algorithme de Selkow',
        explication: `Tant qu’il reste des individus :
1. calculer les bornes inf/sup avec deux Gale-Shapley ;
2. **figer** les mariages non perfectibles (inf = sup) et retirer ces individus du problème (des deux côtés des listes) ;
3. parmi les perfectibles, prendre celui dont la **borne sup est maximale** (le plus menacé) ;
4. **interdire** son mariage « pire cas » (le retirer de ses préférences et réciproquement), puis recommencer.`,
        exemple: {
          code: `def individuRegretMax(i1, s1, i2, s2):
    """Individu perfectible (inf != sup) de borne sup maximale, et sa population."""
    isP1, individu, maxSup = False, -1, -1
    for e in s1:
        if s1[e] != i1[e] and s1[e] > maxSup:
            maxSup, individu, isP1 = s1[e], e, True
    for f in s2:
        if s2[f] != i2[f] and s2[f] > maxSup:
            maxSup, individu, isP1 = s2[f], f, False
    return individu, isP1

def selkow(p1Pref, p2Pref):
    pref1, pref2 = copy.deepcopy(p1Pref), copy.deepcopy(p2Pref)   # on ne touche pas aux originaux
    final = {}
    while pref1:
        m1 = galeShapley(pref1, pref2)            # P1 -> P2
        m2 = galeShapley(pref2, pref1)            # P2 -> P1
        i1, s1, i2, s2 = bornesSupInfGS(pref1, pref2)
        for e in list(pref1.keys()):              # 1) figer les mariages forcés
            if i1[e] == s1[e]:
                f = m1[e]
                final[e] = f
                del pref1[e]; del pref2[f]
                for l in pref1.values():
                    if f in l: l.remove(f)
                for l in pref2.values():
                    if e in l: l.remove(e)
        if not pref1:
            break
        i1 = {k: v for k, v in i1.items() if k in pref1}; s1 = {k: v for k, v in s1.items() if k in pref1}
        i2 = {k: v for k, v in i2.items() if k in pref2}; s2 = {k: v for k, v in s2.items() if k in pref2}
        x, isP1 = individuRegretMax(i1, s1, i2, s2)     # 2) le plus menacé
        if isP1:                                  # son pire partenaire stable = celui de GS(P2, P1)
            f = marriedTo(m2, x, False)
            pref1[x].remove(f); pref2[f].remove(x)
        else:                                     # pour un P2 : son partenaire dans GS(P1, P2)
            e = marriedTo(m1, x, False)
            pref2[x].remove(e); pref1[e].remove(x)
    return final

def regretMaximal(mariage, p1Pref, p2Pref):
    r = regrets(mariage, p1Pref, p2Pref)
    return max(max(r[0].values()), max(r[1].values()))

e3 = {0: [1, 0, 2], 1: [2, 1, 0], 2: [0, 2, 1]}
f3 = {0: [1, 0, 2], 1: [2, 1, 0], 2: [0, 2, 1]}
print("GS     :", galeShapley(e3, f3), "regret max", regretMaximal(galeShapley(e3, f3), e3, f3))
print("Selkow :", selkow(e3, f3), "regret max", regretMaximal(selkow(e3, f3), e3, f3))
assert regretMaximal(selkow(e3, f3), e3, f3) == 1      # assert du TP2`,
          titre: 'TP2 : selkow',
        },
        plus: `Pourquoi interdire le mariage « sup » ? C’est le pire partenaire **stable** de l’individu le plus menacé. En l’interdisant, on force l’algorithme à chercher un autre mariage stable où cet individu est mieux loti ; on recommence tant qu’il reste des marges.

Exemple du cours : (1,A)(2,F)(3,B)(5,C) sont figés, on interdit (4,D) → on obtient (4,E)(6,D).

\`list(pref1.keys())\` : on copie les clés car on supprime dans le dictionnaire pendant la boucle.`,
      },
      {
        id: 'sk-mesures',
        genre: 'metrique',
        titre: 'Ce qu’il faut mesurer : équité et coût',
        visuel: 'selkow_regretmax',
        explication: `- **Regret maximal moyen** (l’objectif de Selkow) : GS > Selkow, aléatoire ≈ n − 1.
- **Regret moyen par population** : Selkow rééquilibre P1 et P2 (P1 perd un peu, P2 gagne).
- **Temps** : Selkow relance 2 Gale-Shapley à chaque tour → nettement plus lent.`,
        exemple: {
          code: `def dicoPrefGenerator(n):
    return {i: random.sample(range(n), n) for i in range(n)}

def mariageAleatoire(n):
    p = random.sample(range(n), n)
    return {i: p[i] for i in range(n)}

for n in [4, 7, 10]:
    gs = sk = al = tg = ts = 0
    for _ in range(80):
        p1, p2 = dicoPrefGenerator(n), dicoPrefGenerator(n)
        d = time.perf_counter(); mg = galeShapley(p1, p2); tg += time.perf_counter() - d
        d = time.perf_counter(); ms = selkow(p1, p2); ts += time.perf_counter() - d
        gs += regretMaximal(mg, p1, p2); sk += regretMaximal(ms, p1, p2); al += regretMaximal(mariageAleatoire(n), p1, p2)
    print(f"n={n:>2} regret max moyen : GS {gs/80:.2f} | Selkow {sk/80:.2f} | aléatoire {al/80:.2f} | temps x{ts/tg:.0f}")`,
          titre: 'TP2 : comparaison',
        },
        plus: `Pour vérifier que Selkow renvoie bien un **mariage stable**, réutilise \`pairesBloquantes\` du chapitre Gale-Shapley : une sortie instable signale un bug (souvent une préférence retirée d’un seul côté).

Sujet d’entraînement 2 (« tutorat équitable ») : pour n ≤ 7, on peut **énumérer tous les mariages** (\`itertools.permutations\`) et garder les stables, pour savoir à quel point GS et Selkow sont loin du meilleur possible selon chaque indicateur.`,
      },
      {
        id: 'sk-visuels',
        genre: 'metrique',
        titre: 'Visuels complémentaires',
        visuel: 'selkow_temps',
        explication: `Coût de l’équité : Selkow est environ 10 fois plus lent que Gale-Shapley sur ces tailles. Il améliore aussi le regret moyen de la population désavantagée (voir ci-dessous).`,
      },
      {
        id: 'sk-p2',
        genre: 'metrique',
        titre: 'Regret moyen de P2',
        visuel: 'selkow_p2',
        explication: `Les individus qui reçoivent les propositions (P2) sont ceux que GS pénalise : c’est sur eux que Selkow fait gagner le plus.`,
      },
      {
        id: 'sk-pieges',
        genre: 'piege',
        titre: 'Pièges fréquents',
        explication: `- Oublier \`copy.deepcopy\` : les préférences originales sont détruites et les essais suivants sont faux.
- Retirer un partenaire d’**un seul côté** des listes : les deux GS ne travaillent plus sur le même problème.
- Inverser inf/sup ou P1/P2 dans \`bornesSupInfGS\`.
- Boucle infinie si \`individuRegretMax\` renvoie −1 et qu’on continue quand même : sortir de la boucle.`,
      },
    ],
  },

  /* =============================================================== FLOTS */
  {
    id: 'flots',
    court: 'Flots',
    titre: 'Flot maximal : Edmonds-Karp et coupe minimale',
    cours: 'Cours 2 · TP3',
    resume: 'Faire passer le plus possible de « matière » d’une source à un puits dans un réseau à capacités. Chemins augmentants trouvés par BFS ; flot max = coupe min.',
    blocs: [
      {
        id: 'fl-def',
        genre: 'notion',
        titre: 'Vocabulaire : réseau, flot, graphe résiduel',
        explication: `Un **réseau** : graphe orienté, une **source s**, un **puits t**, une **capacité c(u, v)** ≥ 0 par arc. Un **flot** f vérifie :
- **capacité** : f(u, v) ≤ c(u, v) ;
- **anti-symétrie** : f(u, v) = −f(v, u) ;
- **conservation** : en tout sommet sauf s et t, ce qui entre = ce qui sort.

La **valeur** du flot = ce qui sort de s. Le **graphe résiduel** donne ce qu’on peut encore faire passer : **r(u, v) = c(u, v) − f(u, v)**. Un arc saturé a r = 0 ; l’arc retour r(v, u) = f(u, v) permet d’**annuler** du flot (corriger une mauvaise décision).`,
        exemple: {
          code: `${IMPORTS}

# exemple du cours : s = 0, t = 5
capacity_matrix = np.array([
    [0, 10, 0, 5, 0, 0],
    [0, 0, 9, 0, 0, 0],
    [0, 0, 0, 7, 10, 0],
    [0, 0, 0, 0, 0, 12],
    [0, 0, 0, 0, 0, 6],
    [0, 0, 0, 0, 0, 0]])

def residual_graph(capacity_graph, flow_graph):
    return capacity_graph - flow_graph

flow = np.zeros((6, 6), int)
flow[0][3], flow[3][0] = 5, -5          # 5 unités sur s -> 3 (anti-symétrie)
flow[3][5], flow[5][3] = 5, -5
print(residual_graph(capacity_matrix, flow))`,
          titre: 'TP3 : graphe résiduel',
        },
        plus: `Lire le résultat : r(0, 3) = 0 (arc saturé), et **r(3, 0) = 5** : on pourrait « renvoyer » 5 unités de 3 vers s si cela permet un meilleur chemin ailleurs. C’est grâce à ces arcs retour qu’Edmonds-Karp trouve l’optimum même après un mauvais premier choix.`,
      },
      {
        id: 'fl-bfs',
        genre: 'code',
        titre: 'BFS et plus court chemin augmentant',
        explication: `Le **parcours en largeur** (BFS) part de s, visite les voisins par niveaux avec une **file** (\`deque\`), et note le **parent** de chaque sommet. Le chemin s → t se lit en **remontant les parents** depuis t. Sa capacité = le **minimum** des capacités résiduelles de ses arcs (le goulot).`,
        exemple: {
          code: `def bfs(graph, source):
    visited = [False] * len(graph)
    parent = [-1] * len(graph)
    queue = deque([source])                  # file : on ajoute à droite, on retire à gauche
    visited[source] = True
    while queue:
        u = queue.popleft()
        for v, capacity in enumerate(graph[u]):   # enumerate : (indice, valeur)
            if not visited[v] and capacity > 0:
                queue.append(v); visited[v] = True; parent[v] = u
    return parent

def shortest_augmenting_path(graph, source, sink):
    parent = bfs(graph, source)
    if parent[sink] == -1:
        return [], 0                        # t inatteignable : plus de chemin
    path, s = [], sink
    while s != -1:
        path.append(s); s = parent[s]
    path.reverse()
    capacity = min(graph[path[i]][path[i + 1]] for i in range(len(path) - 1))
    return path, capacity

print(bfs(capacity_matrix, 0))
print(shortest_augmenting_path(capacity_matrix, 0, 5))
assert shortest_augmenting_path(capacity_matrix, 0, 5) == ([0, 3, 5], 5)`,
          titre: 'TP3 : bfs',
        },
        plus: `Pourquoi une **file** ? Elle garantit qu’on visite les sommets par distance croissante : le premier chemin trouvé est le **plus court en nombre d’arcs**. C’est ce qui distingue Edmonds-Karp de Ford-Fulkerson (chemin quelconque) et lui donne sa complexité garantie O(V·E²).

\`deque.popleft()\` est en O(1) ; \`list.pop(0)\` est en O(n) : pour un BFS, toujours \`deque\`.`,
      },
      {
        id: 'fl-ek',
        genre: 'code',
        titre: 'Edmonds-Karp',
        visuel: 'ek_pas',
        explication: `Tant qu’il existe un chemin s → t dans le **graphe résiduel** : on y ajoute sa capacité c (\`f[u][v] += c\`, \`f[v][u] -= c\`). Quand t n’est plus atteignable, le flot est **maximal**.

Exemple du cours : 5 (s→3→t) + 7 (s→1→2→3→t) + 2 (s→1→2→4→t) = **14**. Exemple du Cormen : **23**.`,
        exemple: {
          code: `def edmonds_karp(capacity_graph, source, sink):
    n = len(capacity_graph)
    flow_matrix = np.zeros((n, n), int)
    max_flow = 0
    path, c = shortest_augmenting_path(residual_graph(capacity_graph, flow_matrix), source, sink)
    while path:
        for u, v in zip(path, path[1:]):        # arcs consécutifs du chemin
            flow_matrix[u][v] += c
            flow_matrix[v][u] -= c               # anti-symétrie
        max_flow += c
        path, c = shortest_augmenting_path(residual_graph(capacity_graph, flow_matrix), source, sink)
    return max_flow, flow_matrix

valeur, F = edmonds_karp(capacity_matrix, 0, 5)
print("flot max :", valeur)
cormen = np.array([[0, 16, 13, 0, 0, 0], [0, 0, 10, 12, 0, 0], [0, 4, 0, 0, 14, 0],
                   [0, 0, 9, 0, 0, 20], [0, 0, 0, 7, 0, 4], [0, 0, 0, 0, 0, 0]])
print("Cormen :", edmonds_karp(cormen, 0, 5)[0])
assert valeur == 14 and edmonds_karp(cormen, 0, 5)[0] == 23`,
          titre: 'TP3 : edmonds_karp',
        },
        plus: `\`zip(path, path[1:])\` fabrique les paires consécutives : pour [0, 1, 2, 5] on obtient (0, 1), (1, 2), (2, 5).

Le flot sur un arc réel se lit dans \`max(F[u][v], 0)\` (les valeurs négatives sont l’autre sens). Vérification : \`F.sum(axis=1)\` vaut 0 pour tous les sommets sauf s (+14) et t (−14) : c’est la conservation.`,
      },
      {
        id: 'fl-coupe',
        genre: 'notion',
        titre: 'Coupe minimale = goulot d’étranglement',
        visuel: 'ek_cours',
        explication: `Une **coupe** sépare les sommets en S1 (contient s) et S2 (contient t) ; sa capacité = somme des capacités des arcs **S1 → S2**. **Théorème : flot max = capacité de la coupe minimale.**

Pour la trouver : à la fin d’Edmonds-Karp, **S1 = sommets encore atteignables depuis s dans le graphe résiduel**. Les arcs S1 → S2 sont saturés : ce sont **les goulots**, la réponse à « où faut-il élargir ? ».`,
        exemple: {
          code: `def coupe_min(capacity_graph, flow_matrix, s):
    parent = bfs(residual_graph(capacity_graph, flow_matrix), s)
    S1 = [v for v in range(len(parent)) if parent[v] != -1 or v == s]
    arcs = [(u, v, int(capacity_graph[u][v])) for u in S1 for v in range(len(parent))
            if v not in S1 and capacity_graph[u][v] > 0]
    return S1, arcs

S1, arcs = coupe_min(capacity_matrix, F, 0)
print("S1 =", S1, "| arcs de la coupe :", arcs, "| capacité :", sum(c for _, _, c in arcs))`,
          titre: 'coupe minimale',
        },
        plus: `Question type « quel passage élargir ? » (sujet d’entraînement 3) : élargir un arc **hors** de la coupe minimale ne change rien. Il faut tester chaque arc **de la coupe** : augmenter sa capacité, relancer Edmonds-Karp, garder celui qui augmente le plus le flot (il peut y avoir une autre coupe presque aussi petite).

Question « passage critique » : mettre la capacité d’un arc à 0 et mesurer la chute du flot.`,
      },
      {
        id: 'fl-nx',
        genre: 'code',
        titre: 'Version networkx (plus rapide à écrire)',
        explication: `En TP noté, si le sujet ne demande pas d’implémenter Edmonds-Karp, \`networkx\` donne flot et coupe en trois lignes, et permet de **vérifier** ta propre implémentation.`,
        exemple: {
          code: `G = nx.DiGraph()
for u in range(6):
    for v in range(6):
        if capacity_matrix[u][v] > 0:
            G.add_edge(u, v, capacity=int(capacity_matrix[u][v]))   # attribut "capacity" obligatoire

valeur, flot = nx.maximum_flow(G, 0, 5)              # flot[u][v]
coupe, (S1, S2) = nx.minimum_cut(G, 0, 5)
print(valeur, coupe, sorted(S1), sorted(S2))
print({(u, v): f for u in flot for v, f in flot[u].items() if f > 0})`,
          titre: 'networkx',
        },
        plus: `Modélisations classiques à connaître :
- **plusieurs sources / puits** : ajouter une super-source reliée à chaque source (capacité = effectif ou infinie) et un super-puits ;
- **capacité sur un sommet** (une salle, un carrefour) : dédoubler le sommet en v_in → v_out avec la capacité du sommet ;
- **temps d’évacuation** : avec un débit maximal D (personnes/min) et P personnes, ≈ P / D minutes (approximation en flot stationnaire).`,
      },
      {
        id: 'fl-mesures',
        genre: 'metrique',
        titre: 'Ce qu’il faut mesurer',
        visuel: 'ek_complexite',
        explication: `- La **valeur** du flot et la **coupe minimale** (goulots) ;
- les arcs **saturés** (flot = capacité) ;
- l’effet d’une **modification** (élargir / bloquer un arc) ;
- le **passage à l’échelle** : temps selon le nombre de sommets, comparaison avec \`nx.maximum_flow\` ;
- le **nombre de chemins augmentants** (compteur dans la boucle while).`,
        exemple: {
          code: `def temps_ek(n, p=0.15):
    G = nx.gnp_random_graph(n, p, directed=True, seed=1)
    M = np.zeros((n, n), int)
    for u, v in G.edges:
        M[u][v] = random.randint(1, 20)
    d = time.perf_counter(); v1, _ = edmonds_karp(M, 0, n - 1); t = time.perf_counter() - d
    H = nx.DiGraph(); H.add_nodes_from(range(n))
    for u, v in G.edges: H.add_edge(u, v, capacity=int(M[u][v]))
    assert v1 == nx.maximum_flow_value(H, 0, n - 1)      # même résultat que networkx
    return t

for n in [20, 40, 80]:
    print(f"n = {n} : {1000 * temps_ek(n):.1f} ms")`,
          titre: 'passage à l’échelle',
        },
      },
    ],
  },

  /* =============================================================== COUPLAGE */
  {
    id: 'couplage',
    court: 'Couplage',
    titre: 'Couplage biparti (par le flot)',
    cours: 'Cours 2 · TP3',
    resume: 'Associer 1 à 1 les éléments de deux groupes selon des compatibilités. Un couplage maximum = un flot maximum avec des capacités 1.',
    blocs: [
      {
        id: 'cp-def',
        genre: 'notion',
        titre: 'Définitions à ne pas confondre',
        explication: `- **Couplage** : ensemble d’arêtes sans sommet commun.
- **Maximal** : on ne peut plus ajouter d’arête (mais il n’est pas forcément le plus grand).
- **Maximum** : de taille maximale (le plus grand possible).
- **Parfait** : tous les sommets sont couverts.
- **Biparti** : S = S1 ∪ S2, S1 ∩ S2 = ∅, arêtes uniquement entre S1 et S2.

Exemple des bénévoles (TP3) : on ne peut réaliser que **3 tâches** car seul Jules sait faire le son et l’électricité : l’une des deux reste non faite.`,
      },
      {
        id: 'cp-flot',
        genre: 'code',
        titre: 'Modélisation en flot (capacités 1)',
        visuel: 'couplage',
        explication: `Source → chaque sommet de S1 (capacité 1), arêtes **orientées** S1 → S2 (capacité 1), chaque sommet de S2 → puits (capacité 1). **Flot max = taille du couplage maximum** ; les paires sont les arcs S1 → S2 qui portent 1.

Variante « k places » (stage à 2 étudiants, poste à 3 bénévoles) : capacité **k** sur l’arc vers le puits.`,
        exemple: {
          code: `${IMPORTS}

def bfs(graph, source):
    visited, parent, q = [False] * len(graph), [-1] * len(graph), deque([source])
    visited[source] = True
    while q:
        u = q.popleft()
        for v, c in enumerate(graph[u]):
            if not visited[v] and c > 0:
                q.append(v); visited[v] = True; parent[v] = u
    return parent

def edmonds_karp(C, s, t):
    F = np.zeros_like(C); total = 0
    while True:
        R = C - F; parent = bfs(R, s)
        if parent[t] == -1: return total, F
        path, x = [], t
        while x != -1: path.append(x); x = parent[x]
        path.reverse()
        c = min(R[u][v] for u, v in zip(path, path[1:]))
        for u, v in zip(path, path[1:]): F[u][v] += c; F[v][u] -= c
        total += c

def couplage_to_capacity(matrix, s1, s2):
    n = len(matrix); source, sink = n, n + 1   # source et puits ajoutés à la fin
    capacity = np.zeros((n + 2, n + 2), int)
    for u in s1:
        capacity[source][u] = 1
        for v in s2:
            if matrix[u][v] > 0:
                capacity[u][v] = 1                 # orienté S1 -> S2
    for v in s2:
        capacity[v][sink] = 1                      # mettre k ici pour « k places »
    return capacity

def couplage_max(matrix, s1, s2):
    capacity = couplage_to_capacity(matrix, s1, s2)
    n = len(matrix)
    taille, flow = edmonds_karp(capacity, n, n + 1)
    paires = [(u, v) for u in s1 for v in s2 if flow[u][v] == 1]
    return taille, paires

G = nx.bipartite.random_graph(6, 6, 0.35, seed=4)
s1, s2 = list(range(6)), list(range(6, 12))
taille, paires = couplage_max(nx.to_numpy_array(G, nodelist=range(12)), s1, s2)
hk = nx.bipartite.hopcroft_karp_matching(G, top_nodes=s1)
print("flot :", taille, paires)
print("Hopcroft-Karp :", len(hk) // 2)            # dict dans les 2 sens -> // 2
assert taille == len(hk) // 2`,
          titre: 'TP3 : couplage_max',
        },
        plus: `\`hopcroft_karp_matching\` renvoie un dictionnaire **dans les deux sens** (u → v **et** v → u) : la taille du couplage est \`len(M) // 2\`. Il faut lui donner \`top_nodes\` (les sommets de S1), sinon il ne sait pas quel côté est lequel si le graphe n’est pas connexe. Complexité O(E·√V).

Couplage **pondéré** (minimiser un coût total, hors cours) : \`scipy.optimize.linear_sum_assignment(matrice_couts)\` (algorithme hongrois).`,
      },
      {
        id: 'cp-analyse',
        genre: 'metrique',
        titre: 'Analyser un couplage : qui n’est pas servi, pourquoi ?',
        explication: `Si le flot < |S1|, certains ne peuvent pas être affectés. La **coupe minimale** explique pourquoi (théorème de König/Hall : un groupe de k tâches qui n’ont que k − 1 personnes compétentes). Mesures utiles :
- taille du couplage / |S1| (taux de couverture) ;
- comparaison avec une méthode **gloutonne** (prendre la première personne libre) : le glouton donne un couplage **maximal** mais pas toujours **maximum** ;
- évolution du taux de couverture avec la densité p des compatibilités.`,
        exemple: {
          code: `def glouton(G, s1):
    pris, paires = set(), []
    for u in s1:
        for v in G[u]:
            if v not in pris:
                pris.add(v); paires.append((u, v)); break
    return paires

ecarts = []
for graine in range(200):
    G = nx.bipartite.random_graph(8, 8, 0.25, seed=graine)
    s1 = list(range(8))
    ecarts.append(len(nx.bipartite.hopcroft_karp_matching(G, top_nodes=s1)) // 2 - len(glouton(G, s1)))
print("le glouton rate en moyenne", round(np.mean(ecarts), 2), "affectation(s) ; dans", sum(e > 0 for e in ecarts), "cas sur 200")`,
          titre: 'glouton vs optimum',
        },
      },
    ],
  },

  /* =============================================================== VALEURS PROPRES */
  {
    id: 'valeurs-propres',
    court: 'λ',
    titre: 'Valeurs et vecteurs propres, puissances itérées',
    cours: 'Cours 3 · TP4',
    resume: 'Mv = λv : directions que la matrice ne fait qu’étirer. La plus grande valeur propre pilote le comportement à long terme (populations, chaînes de Markov, PageRank).',
    blocs: [
      {
        id: 'vp-def',
        genre: 'notion',
        titre: 'Définition et calcul avec numpy',
        explication: `v ≠ 0 est un **vecteur propre (à droite)** de M pour la **valeur propre** λ si **M v = λ v** : M ne change pas la direction de v, elle l’étire d’un facteur λ. À gauche : **u M = λ u**.

- Une matrice n × n a au plus n valeurs propres ; une matrice **diagonale** a ses coefficients diagonaux comme valeurs propres ; une matrice **symétrique réelle** a des valeurs propres réelles.
- Calcul algébrique : det(M − λI) = 0. En 2 × 2 : **somme = trace**, **produit = déterminant**.
- Exemples du cours : [[1, 2], [4, 3]] → 5 et −1 ; [[1, 6], [1, 2]] → 4 et −1.`,
        exemple: {
          code: `${IMPORTS}

M = np.array([[0, 1, 2], [2, 1, 0], [2, 2, 2]])
x = np.array([3, 2, 5])
print(M @ x, "= 4 *", x)                       # (3,2,5) est vecteur propre, λ = 4

def eigenvec2val(A, v, isLeft=False):
    produit = v @ A if isLeft else A @ v
    return produit[0] / v[0]

print("λ =", eigenvec2val(M, x), "| à gauche :", eigenvec2val(M, np.array([-6, -1, 4]), True))

A = np.array([[1, 6], [1, 2]])
valeurs, vecteurs = la.eig(A)                  # vecteurs propres = COLONNES
print("valeurs :", valeurs)
i = np.argmax(np.abs(valeurs))
v = vecteurs[:, i]
print("λ max =", valeurs[i], "| vérification :", np.allclose(A @ v, valeurs[i] * v))`,
          titre: 'TP4 : définitions',
        },
        plus: `Les pièges de \`la.eig\` :
- les vecteurs propres sont les **colonnes** : \`vecteurs[:, i]\`, **pas** \`vecteurs[i]\` ;
- les valeurs ne sont **pas triées** et peuvent être **complexes** (\`.real\` pour la partie réelle) ;
- pour une matrice **symétrique**, utiliser \`la.eigh\` : valeurs réelles **triées par ordre croissant** (indispensable pour le Laplacien).

Le quotient de Rayleigh \`v @ A @ v / (v @ v)\` donne λ à partir de v de façon plus stable que \`(A@v)[0]/v[0]\` (qui divise par zéro si v[0] = 0).`,
      },
      {
        id: 'vp-puissance',
        genre: 'code',
        titre: 'Méthode des puissances itérées',
        visuel: 'puissances',
        explication: `On part d’un vecteur aléatoire et on répète **v ← M v / ‖M v‖** jusqu’à ce que v ne bouge plus (‖v_{k+1} − v_k‖ < seuil). v converge vers le vecteur propre de la **plus grande valeur propre en module** λ₁.

Pourquoi ? En décomposant v sur les vecteurs propres, Mᵏv ≈ λ₁ᵏ (α₁v₁ + α₂(λ₂/λ₁)ᵏv₂ + …) : les autres directions s’écrasent en **(λ₂/λ₁)ᵏ**.`,
        exemple: {
          code: `def norm(v):
    return ((v ** 2).sum()) ** 0.5

def normalize(v):
    return v / norm(v)

def power_iteration(matrix, num_iter_max, t):
    v = normalize(np.random.rand(matrix.shape[1]))
    v1 = normalize(matrix @ v)
    compteur = 0
    while compteur < num_iter_max and norm(v - v1) > t:
        v = v1
        v1 = normalize(matrix @ v)
        compteur += 1
    return eigenvec2val(matrix, v1), v1, compteur

lam, vec, k = power_iteration(np.array([[1, 6], [1, 2]]), 100, 1e-10)
print(f"λ ≈ {lam:.6f} en {k} itérations, vecteur {vec}")
assert round(lam, 4) == 4.0                    # assert du TP4`,
          titre: 'TP4 : power_iteration',
        },
        plus: `Si λ₁ est **négative**, v change de signe à chaque itération : le test \`norm(v − v1)\` ne passe jamais. Il faut comparer aussi à −v1 (\`min(norm(v − v1), norm(v + v1))\`).

Si |λ₁| = |λ₂| (ex. λ = 3 et −3), la méthode ne converge pas : à signaler comme limite.`,
      },
      {
        id: 'vp-convergence',
        genre: 'metrique',
        titre: 'Vitesse de convergence',
        visuel: 'vitesse',
        explication: `L’erreur décroît comme **(λ₂/λ₁)ᵏ** : une **droite** en échelle logarithmique (\`plt.yscale('log')\`). Plus λ₂ est proche de λ₁, plus c’est lent. C’est la métrique à tracer pour justifier un nombre d’itérations ou un seuil.`,
        exemple: {
          code: `A = np.array([[1, 6], [1, 2]], float)
v = normalize(np.random.rand(2))
erreurs = []
for k in range(30):
    v = normalize(A @ v)
    erreurs.append(abs(eigenvec2val(A, v) - 4))
plt.plot([e for e in erreurs if e > 0], "o-")
plt.yscale("log"); plt.xlabel("itération"); plt.ylabel("|λ estimé − 4|")
plt.title("Convergence géométrique en (1/4)^k")
plt.show()
print("rapport moyen entre deux erreurs successives :", round(np.mean([erreurs[i + 1] / erreurs[i] for i in range(5, 15)]), 3))`,
          titre: 'convergence',
        },
      },
      {
        id: 'vp-deflation',
        genre: 'code',
        titre: 'Valeurs propres suivantes : déflation, Gram-Schmidt, QR',
        explication: `- **Déflation** (matrice symétrique) : B = A − λ₁ v₁v₁ᵀ (\`np.outer\`) a les mêmes valeurs propres que A sauf λ₁ remplacée par 0 → les puissances itérées sur B donnent λ₂.
- **Gram-Schmidt** : orthonormaliser des vecteurs (retirer à chacun ses projections sur les précédents) → Q orthogonale (QᵀQ = I).
- **Méthode QR** : répéter A ← R Q (où A = Q R) ; la diagonale converge vers les valeurs propres.`,
        exemple: {
          code: `def newmat(A, v, lamb):
    return A - lamb * np.outer(v, v)

S = np.array([[4., 1.], [1., 3.]])                 # symétrique
l1, v1, _ = power_iteration(S, 1000, 1e-12)
l2, _, _ = power_iteration(newmat(S, v1, l1), 1000, 1e-12)
print("puissances + déflation :", round(l1, 4), round(l2, 4), "| eigh :", np.round(la.eigh(S)[0], 4))

def factorQR(A):
    """Gram-Schmidt sur les colonnes de A."""
    n = A.shape[1]
    Q = np.zeros_like(A, dtype=float)
    for j in range(n):
        q = A[:, j].astype(float)
        for i in range(j):
            q = q - (Q[:, i] @ A[:, j]) * Q[:, i]   # on retire la projection sur q_i
        Q[:, j] = q / norm(q)
    R = Q.T @ A
    return Q, R

def methodeQR(A, T):
    Ak = A.astype(float)
    for _ in range(T):
        Q, R = factorQR(Ak)
        Ak = R @ Q
    return Ak

Q, R = factorQR(np.array([[1., 6.], [1., 2.]]))
print("Q orthogonale :", np.allclose(Q.T @ Q, np.eye(2)), "| A = QR :", np.allclose(Q @ R, [[1, 6], [1, 2]]))
print("diagonale après 30 itérations QR :", np.round(np.diag(methodeQR(np.array([[1., 6.], [1., 2.]]), 30)), 4))`,
          titre: 'TP4 : bonus QR',
        },
        plus: `La déflation \`A − λ₁ v₁v₁ᵀ\` suppose v₁ **normé** et A **symétrique** (vecteurs propres orthogonaux). Pour A = [[1, 6], [1, 2]] (non symétrique), le TP montre qu’on obtient quand même −1 dans ce cas, mais ce n’est pas garanti en général.`,
      },
      {
        id: 'vp-applications',
        genre: 'notion',
        titre: 'Applications : Leslie, Markov, PageRank',
        visuel: 'leslie',
        explication: `- **Matrice de Leslie** (populations par classes d’âge, sujet d’entraînement 5) : 1re ligne = fécondités, sous-diagonale = survies. xₜ₊₁ = L xₜ. **λ₁ > 1** : croissance de (λ₁ − 1) × 100 % par an ; **λ₁ < 1** : extinction. v₁ normalisé (somme 1) = **répartition stable par âge**.
- **Chaîne de Markov** (matrice P de lignes stochastiques) : la distribution stationnaire π vérifie π P = π → vecteur propre **à gauche** pour λ = 1, soit vecteur propre de **Pᵀ**, normalisé pour sommer à 1.
- **PageRank** : même principe sur le graphe du web (\`gds.pageRank\`, \`nx.pagerank\`).`,
        exemple: {
          code: `L = np.array([[0, 0.4, 0.9, 0.7],
              [0.75, 0, 0, 0],
              [0, 0.85, 0, 0],
              [0, 0, 0.9, 0.88]])
vals, vecs = la.eig(L)
i = np.argmax(np.abs(vals))
lam = vals[i].real
rep = np.abs(vecs[:, i].real); rep = rep / rep.sum()
print(f"λ1 = {lam:.4f} -> {'croissance' if lam > 1 else 'déclin'} de {abs(lam - 1) * 100:.1f} % par an")
print("répartition stable par âge :", np.round(rep, 3))

P = np.array([[0.9, 0.1], [0.5, 0.5]])            # chaîne de Markov à 2 états
w, V = la.eig(P.T)
pi = V[:, np.argmin(np.abs(w - 1))].real
pi = pi / pi.sum()
print("distribution stationnaire :", np.round(pi, 4), "| vérif π P = π :", np.allclose(pi @ P, pi))`,
          titre: 'applications',
        },
        plus: `Question type « quelle action de protection est la plus efficace ? » : faire varier chaque coefficient (survie juvéniles, survie adultes, fécondité) de +10 % et comparer le **nouveau λ₁**. Pour le seuil qui stoppe le déclin, chercher par **dichotomie** la valeur du paramètre telle que λ₁ = 1.`,
      },
    ],
  },

  /* =============================================================== SPECTRAL */
  {
    id: 'spectral',
    court: 'Spectral',
    titre: 'Clustering spectral',
    cours: 'Cours 3 · TP5',
    resume: 'Découper un graphe en communautés grâce aux vecteurs propres de son Laplacien L = D − A : signe du vecteur de Fiedler pour 2 groupes, k-means pour k groupes.',
    blocs: [
      {
        id: 'sp-laplacien',
        genre: 'notion',
        titre: 'Le Laplacien et ses propriétés',
        visuel: 'composantes',
        explication: `**L = D − A** où A est la matrice d’adjacence et D la matrice diagonale des **degrés**. Propriétés :
- L est symétrique, ses valeurs propres sont **≥ 0** ;
- **la multiplicité de la valeur propre 0 = le nombre de composantes connexes** ;
- le vecteur propre de la **2e plus petite** valeur propre (vecteur de **Fiedler**) découpe le graphe en 2 en coupant le moins d’arêtes possible (la vache coupée « au cou »).`,
        exemple: {
          code: `${IMPORTS}

def adjTolaplacian(A):
    D = np.diag(np.diag(A @ A))      # (A @ A)[i, i] = degré de i pour un graphe simple
    return D - A

A = np.array([[0, 1, 0, 0, 1], [1, 0, 1, 1, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 1], [1, 0, 0, 1, 0]])
L = adjTolaplacian(A)
print(L)
assert (L == [[2, -1, 0, 0, -1], [-1, 3, -1, -1, 0], [0, -1, 1, 0, 0], [0, -1, 0, 2, -1], [-1, 0, 0, -1, 2]]).all()

G = nx.disjoint_union_all([nx.complete_graph(4), nx.cycle_graph(5), nx.path_graph(3)])
vals = la.eigvalsh(adjTolaplacian(nx.to_numpy_array(G)))
print("plus petites valeurs propres :", np.round(vals[:5], 4))
print("composantes connexes :", np.sum(np.abs(vals) < 1e-10), "| networkx :", nx.number_connected_components(G))`,
          titre: 'TP5 : adjTolaplacian',
        },
        plus: `Pourquoi \`np.diag(np.diag(A @ A))\` ? (A²)[i, i] = nombre de chemins de longueur 2 de i à i = nombre de voisins de i = degré (graphe simple non pondéré). Plus direct : \`np.diag(A.sum(axis=1))\`, qui marche aussi avec des **poids**.

Seuil \`abs(v) < 1e-10\` : numériquement les zéros valent ±1e-15, jamais exactement 0.`,
      },
      {
        id: 'sp-fiedler',
        genre: 'code',
        titre: 'Deux groupes : le signe du vecteur de Fiedler',
        explication: `1. A = \`nx.to_numpy_array(G)\` ; L = D − A.
2. Valeurs et vecteurs propres de L, **triés par valeur croissante** (\`eigh\`, ou \`eig\` + \`argsort\`).
3. Fiedler = \`w[:, 1]\` (la colonne 0 correspond à λ = 0, vecteur constant).
4. Groupe 0 si la composante est < 0, groupe 1 sinon.`,
        exemple: {
          code: `def spectralCluster(G, ordr=0):
    A = nx.to_numpy_array(G)
    L = adjTolaplacian(A)
    v, w = np.linalg.eig(L)
    w = w[:, np.argsort(v)]                    # colonnes triées par valeur propre croissante
    fiedler = np.real(w[:, ordr + 1])
    for i, noeud in enumerate(G.nodes):
        G.nodes[noeud]["cluster"] = 0 if fiedler[i] < 0 else 1
    return G

G = nx.random_partition_graph([10, 20], 0.5, 0.02, seed=13)
spectralCluster(G)
trouves = [G.nodes[u]["cluster"] for u in G]
verite = [0] * 10 + [1] * 20
prec = max(np.mean(np.array(trouves) == verite), np.mean(np.array(trouves) != verite))
print("précision :", prec)
nx.draw(G, node_color=trouves, cmap="coolwarm", node_size=60)
plt.show()`,
          titre: 'TP5 : spectralCluster',
        },
        plus: `La **précision** doit tenir compte de la permutation des étiquettes : l’algorithme peut appeler « 1 » le groupe que la vérité appelle « 0 ». Pour 2 groupes, prendre le max entre « égal » et « différent » ; pour k groupes, tester toutes les permutations (\`itertools.permutations\`) ou utiliser \`sklearn.metrics.adjusted_rand_score\`.

4 groupes avec deux vecteurs : \`2 * (u2 >= 0) + (u3 >= 0)\` donne 4 étiquettes (00, 01, 10, 11).`,
      },
      {
        id: 'sp-kmeans',
        genre: 'code',
        titre: 'k groupes : vecteurs propres + k-means',
        visuel: 'spectral',
        explication: `On place chaque sommet i dans l’espace des vecteurs propres u₁ … u_k (on saute u₀ constant) : le point yᵢ = (u₁[i], …, u_k[i]). Les sommets d’une même communauté sont proches ; **k-means** les regroupe.`,
        exemple: {
          code: `from sklearn.cluster import KMeans

def spectralClusteringKMeans(G, k):
    A = nx.to_numpy_array(G)
    L = adjTolaplacian(A)
    v, w = np.linalg.eig(L)
    w = w[:, np.argsort(v)]
    X = np.real(w[:, 1:k + 1])                 # on enlève u0, on garde u1 ... uk
    labels = KMeans(k, n_init=10, random_state=0).fit(X).labels_
    for i, noeud in enumerate(G.nodes):
        G.nodes[noeud]["cluster"] = int(labels[i])
    return G

G = nx.random_partition_graph([10, 15, 20], 0.5, 0.01, seed=13)
spectralClusteringKMeans(G, 3)
print("tailles des groupes trouvés :", np.bincount([G.nodes[u]["cluster"] for u in G]))`,
          titre: 'TP5 : spectralClusteringKMeans',
        },
        plus: `\`KMeans(k, n_init=10)\` : k-means dépend de l’initialisation ; \`n_init=10\` le relance 10 fois et garde le meilleur. \`random_state\` le rend reproductible. \`.labels_\` = groupe de chaque point, \`.cluster_centers_\` = centres.

Choisir k : regarder le **trou spectral** (eigengap) dans les petites valeurs propres de L (voir graphique ci-dessous).`,
      },
      {
        id: 'sp-eigengap',
        genre: 'metrique',
        titre: 'Choisir k : le trou spectral',
        visuel: 'spectre',
        explication: `Si le graphe a k communautés bien séparées, L a k valeurs propres proches de 0 puis un saut. Tracer les 10 plus petites valeurs propres (\`plt.bar\`) et repérer le trou est une analyse simple et convaincante.`,
      },
      {
        id: 'sp-robustesse',
        genre: 'metrique',
        titre: 'Quand la méthode échoue-t-elle ?',
        visuel: 'spectral_robustesse',
        explication: `Analyse attendue (sujet d’entraînement 6) : générer des graphes à communautés connues avec \`nx.random_partition_graph(tailles, p_in, p_out)\`, faire varier **p_out** (liens entre groupes), les **tailles** (déséquilibrées) et **k**, et mesurer la **précision**. Comparer à un découpage **aléatoire** (baseline ≈ 50 % pour 2 groupes).`,
        exemple: {
          code: `for pout in [0.02, 0.1, 0.2, 0.3]:
    precs = []
    for s in range(10):
        G = nx.random_partition_graph([20, 20], 0.4, pout, seed=s)
        A = nx.to_numpy_array(G)
        _, w = la.eigh(adjTolaplacian(A))
        lab = (w[:, 1] >= 0).astype(int)
        ver = np.array([0] * 20 + [1] * 20)
        precs.append(max(np.mean(lab == ver), np.mean(lab != ver)))
    print(f"p_out = {pout:.2f} : précision moyenne {np.mean(precs):.2f}")`,
          titre: 'robustesse',
        },
        plus: `Club de karaté de Zachary (\`nx.karate_club_graph()\`) : 34 membres, la vraie scission est dans l’attribut \`G.nodes[u]["club"]\` ("Mr. Hi" / "Officer"). Le signe de Fiedler retrouve presque tout le monde. Attention : la version récente de networkx ajoute un attribut \`weight\` aux arêtes ; \`nx.to_numpy_array(G, weight=None)\` pour l’ignorer, ou garder les poids et le dire.`,
      },
    ],
  },
]
