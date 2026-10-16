// Les 6 sujets d'entraînement du dossier « Sujets entraînement » (énoncé + corrigé), résumés pour l'entraînement.

export const SUJETS = [
  {
    id: 's1',
    titre: 'Affectation des stages avec capacités',
    famille: 'Mariages stables',
    ton: 'bleu',
    chapitre: 'gale-shapley',
    contexte: `Moins d’entreprises que d’étudiants : chaque entreprise f a \`cap[f]\` places. Préférences complètes, parfois **corrélées** (une entreprise « à la mode » demandée par tous). Demandé : \`affectation(etuPref, entPref, cap)\` **sans paire bloquante**, puis qui est avantagé, effet de la corrélation et des places en trop, qui doit proposer.`,
    modele: `Gale-Shapley **généralisé aux capacités** (problème des hôpitaux/résidents) : une entreprise garde ses \`cap[f]\` meilleures propositions ; quand elle est pleine et reçoit mieux, elle libère son **pire** stagiaire. Paire bloquante redéfinie : e préfère f **et** f a une place libre **ou** préfère e à l’un de ses stagiaires.`,
    fonctions: ['genere_instance(n, places, correlation, seed)', 'affectation_premier_arrive (baseline)', 'paires_bloquantes(aff, …)', 'gs_etudiants / gs_entreprises', 'indicateurs(aff, …)', 'experience(n, places, correlation, nbEx)'],
    metriques: ['nombre de paires bloquantes (0 = stable)', 'regret moyen et max des étudiants et des entreprises', 'taux de placement', 'effet de la corrélation (0 → 1)', 'effet de places en trop', 'nombre de propositions (complexité)'],
    code: `def gs_etudiants(etuPref, entPref, cap):
    stagiaires = {f: [] for f in entPref}           # f -> liste de ses étudiants
    suivant = {e: 0 for e in etuPref}
    libres = list(etuPref)
    while libres:
        e = libres.pop(0)
        if suivant[e] >= len(etuPref[e]):            # a tout essayé : non placé
            continue
        f = etuPref[e][suivant[e]]; suivant[e] += 1
        stagiaires[f].append(e)
        if len(stagiaires[f]) > cap[f]:              # trop plein : on renvoie le moins aimé
            pire = max(stagiaires[f], key=lambda x: entPref[f].index(x))
            stagiaires[f].remove(pire)
            libres.append(pire)
    aff = {e: -1 for e in etuPref}
    for f, l in stagiaires.items():
        for e in l:
            aff[e] = f
    return aff

etuPref = {0: ["A", "B"], 1: ["A", "B"], 2: ["A", "B"]}
entPref = {"A": [2, 0, 1], "B": [0, 1, 2]}
print(gs_etudiants(etuPref, entPref, {"A": 1, "B": 2}))`,
  },
  {
    id: 's2',
    titre: 'Binômes de tutorat équitables',
    famille: 'Mariages stables équitables',
    ton: 'bleu',
    chapitre: 'selkow',
    contexte: `Tuteurs (P1) ↔ tutorés (P2), n de chaque côté. GS l’an dernier : tuteurs contents, tutorés mécontents. Demandé : une affectation **stable** et **la plus équitable possible**, définir « équitable » (plusieurs indicateurs), et comparer à l’**optimum** obtenu par énumération pour n ≤ 7.`,
    modele: `Indicateurs d’équité : **regret max**, **somme des regrets** (égalitaire), **écart entre les regrets moyens** des deux populations. Méthodes : GS tuteurs, GS tutorés, **Selkow**. Optimum : énumérer les n! mariages (\`itertools.permutations\`), garder les stables, prendre le meilleur pour chaque indicateur.`,
    fonctions: ['indicateurs(m, p1Pref, p2Pref)', 'estStable(m, p1Pref, p2Pref)', 'mariagesStables(p1Pref, p2Pref) (énumération)', 'bornesSupInfGS, individuRegretMax, selkow', 'gs_tutores', 'experience(n, nbEx, seed)'],
    metriques: ['distance à l’optimal pour chaque indicateur', 'nombre de mariages stables d’une instance', 'coût de l’énumération (n! → explose)', 'temps GS vs Selkow'],
    code: `import itertools

def estStable(m, p1Pref, p2Pref):
    inv = {f: e for e, f in m.items()}
    for e in p1Pref:
        for f in p1Pref[e][:p1Pref[e].index(m[e])]:        # ceux que e préfère à son partenaire
            if p2Pref[f].index(e) < p2Pref[f].index(inv[f]):
                return False
    return True

def mariagesStables(p1Pref, p2Pref):
    P1, P2 = list(p1Pref), list(p2Pref)
    for perm in itertools.permutations(P2):
        m = dict(zip(P1, perm))
        if estStable(m, p1Pref, p2Pref):
            yield m

p1 = {0: [1, 0, 2], 1: [2, 1, 0], 2: [0, 2, 1]}
p2 = {0: [1, 0, 2], 1: [2, 1, 0], 2: [0, 2, 1]}
print(list(mariagesStables(p1, p2)))`,
  },
  {
    id: 's3',
    titre: 'Plan d’évacuation du campus',
    famille: 'Flot maximal',
    ton: 'orange',
    chapitre: 'flots',
    contexte: `Graphe orienté bâtiments → couloirs → 3 sorties, capacités en personnes/minute. 3 bâtiments occupés (300, 180, 120 personnes). Demandé : **débit maximal** et **temps d’évacuation**, **goulots**, quel passage élargir de +20/min, passages **critiques** (bloqués par le feu), coût sur de plus grands réseaux.`,
    modele: `**Super-source** reliée aux 3 bâtiments, **super-puits** relié aux 3 sorties → flot max = débit. **Coupe minimale** = goulots. Temps ≈ plus petit t tel que les effectifs passent en t minutes (recherche par dichotomie avec des capacités de source = effectif / t). Élargir : tester chaque arc de la coupe. Critique : capacité 0 et mesurer la chute.`,
    fonctions: ['bfs, shortest_augmenting_path, edmonds_karp', 'avec_super_noeuds(capacite, cap_sources)', 'coupe_min(C, flow, s)', 'evacuable(t, capacite)', 'temps_evacuation(capacite, precision) (dichotomie)', 'dessiner(capacite, flot, titre)'],
    metriques: ['débit max (pers/min)', 'temps d’évacuation (min)', 'arcs de la coupe minimale', 'gain de débit pour chaque arc élargi', 'chute de débit pour chaque arc bloqué', 'temps de calcul selon la taille'],
    code: `def temps_evacuation(debit_max_pour, total, precision=1e-3):
    """Dichotomie : plus petit t tel que la capacité sur t minutes couvre tout le monde.
    debit_max_pour(t) renvoie le nombre de personnes évacuables en t minutes."""
    bas, haut = 0.0, 1.0
    while debit_max_pour(haut) < total:          # on cherche une borne haute qui marche
        haut *= 2
    while haut - bas > precision:
        mil = (bas + haut) / 2
        if debit_max_pour(mil) >= total:
            haut = mil
        else:
            bas = mil
    return haut

# exemple simplifié : débit constant de 40 pers/min, 600 personnes
print(round(temps_evacuation(lambda t: 40 * t, 600), 3), "minutes")`,
  },
  {
    id: 's4',
    titre: 'Planning des bénévoles du festival',
    famille: 'Couplage avec capacités (flot)',
    ton: 'orange',
    chapitre: 'couplage',
    contexte: `5 créneaux × 5 postes avec un besoin en personnes ; chaque bénévole a des compétences, des disponibilités et un nombre max de créneaux (1 à 3), **un seul poste par créneau**. Demandé : \`planning(benevoles, besoins)\` couvrant **le plus de besoins possible**, prouver l’optimalité, comparer à la méthode « à la main » (glouton), conseiller le recrutement.`,
    modele: `Réseau à 4 niveaux : **source → bénévole** (capacité = nb max de créneaux) → **(bénévole, créneau)** (capacité 1 : un poste par créneau) → **(poste, créneau)** si compétent et disponible (1) → **puits** (capacité = besoin). Flot max = besoins couverts, et c’est **prouvé optimal** (aucun planning ne peut dépasser le flot max).`,
    fonctions: ['genere_festival(nb_benevoles, p_dispo, seed)', 'planning_glouton (baseline « à la main »)', 'verifier(planning, benevoles, besoins)', 'ajoute_arc, edmonds_karp_dict (listes d’adjacence)', 'planning_flot(benevoles, besoins)', 'vers_matrice, edmonds_karp_matrice'],
    metriques: ['besoins couverts / besoins totaux', 'écart glouton vs flot selon la disponibilité', 'besoins non couverts par poste (profils manquants)', 'nombre de bénévoles nécessaire pour tout couvrir', 'temps : matrice vs dictionnaire'],
    code: `import networkx as nx

def planning_flot(benevoles, besoins):
    """benevoles = {nom: (competences, dispos, max_creneaux)} ; besoins = {(poste, creneau): k}"""
    G = nx.DiGraph()
    for b, (comp, dispo, mx) in benevoles.items():
        G.add_edge("S", b, capacity=mx)
        for c in dispo:
            G.add_edge(b, (b, c), capacity=1)                       # un poste par créneau
            for p in comp:
                if (p, c) in besoins:
                    G.add_edge((b, c), (p, c), capacity=1)
    for (p, c), k in besoins.items():
        G.add_edge((p, c), "T", capacity=k)
    valeur, flot = nx.maximum_flow(G, "S", "T")
    affect = [(b, p, c) for b in benevoles for c in benevoles[b][1] if (b, c) in flot
              for (p, c2), f in flot[(b, c)].items() if f == 1]
    return valeur, affect

benevoles = {"Jules": ({"son", "bar"}, {1, 2}, 2), "Léa": ({"bar"}, {1}, 1), "Tom": ({"accueil", "bar"}, {2}, 1)}
besoins = {("son", 1): 1, ("bar", 1): 1, ("bar", 2): 1, ("accueil", 2): 1}
print(planning_flot(benevoles, besoins))`,
  },
  {
    id: 's5',
    titre: 'Avenir d’une colonie de phoques (Leslie)',
    famille: 'Valeurs propres',
    ton: 'violet',
    chapitre: 'valeurs-propres',
    contexte: `4 classes d’âge, xₜ₊₁ = L xₜ (1re ligne : fécondités ; sous-diagonale : survies ; dernier coefficient diagonal : survie des âgés). Demandé : croissance ou extinction, rythme, répartition par âge ; lien avec valeurs/vecteurs propres ; méthode maison vs numpy ; action de protection la plus efficace ; seuil de survie des juvéniles pour stopper le déclin.`,
    modele: `**λ₁** (plus grande valeur propre) = taux de croissance annuel à long terme ; **v₁ normalisé** = répartition stable. Méthode maison : **puissances itérées**. Actions : modifier un coefficient, recalculer λ₁, comparer. Seuil : **dichotomie** sur la survie juvénile jusqu’à λ₁ = 1. Population initiale : n’influence pas λ₁ (seulement le transitoire).`,
    fonctions: ['simuler(L, x0, T)', 'puissances_iterees(M, tol, nmax)', 'lambda_dominante(M)', 'lambda_avec(s0) (survie juvénile modifiée)'],
    metriques: ['λ₁ (croissance si > 1)', 'répartition stable par âge', 'erreur puissances itérées vs numpy', 'gain de λ₁ par action', 'seuil de survie juvénile', 'convergence de la répartition selon x₀'],
    code: `import numpy as np

def lambda_dominante(M):
    v = np.ones(len(M))
    for _ in range(2000):
        w = M @ v
        lam = np.linalg.norm(w) / np.linalg.norm(v)
        v = w / np.linalg.norm(w)
    return lam

def seuil_survie(L, lo=0.0, hi=1.0, tol=1e-6):
    """Dichotomie sur L[1, 0] (survie des juvéniles) pour obtenir lambda1 = 1."""
    while hi - lo > tol:
        mid = (lo + hi) / 2
        M = L.copy(); M[1, 0] = mid
        if lambda_dominante(M) < 1: lo = mid
        else: hi = mid
    return hi

L = np.array([[0, 0.2, 0.5, 0.4], [0.5, 0, 0, 0], [0, 0.8, 0, 0], [0, 0, 0.85, 0.8]])
print("λ1 =", round(lambda_dominante(L), 4), "| survie juvénile pour λ1 = 1 :", round(seuil_survie(L), 3))`,
  },
  {
    id: 's6',
    titre: 'Communautés dans un réseau social',
    famille: 'Clustering spectral',
    ton: 'vert',
    chapitre: 'spectral',
    contexte: `Graphe « qui parle à qui » du BDE ; validation sur le **club de karaté de Zachary** (34 membres, scission connue « Mr. Hi » / « Officer »). Demandé : \`communautes(G, k)\`, qualité sur le karaté, conditions d’échec (liens entre groupes, tailles déséquilibrées, k qui augmente).`,
    modele: `Laplacien L = D − A, **vecteur de Fiedler** pour 2 groupes, **k-means** sur u₁…u_k pour k groupes. Qualité = **précision** (bien classés, en tenant compte de la permutation des étiquettes). Baseline : découpage aléatoire. Attention aux **poids** des arêtes du graphe de karaté dans networkx.`,
    fonctions: ['graphe_communautes(tailles, p_in, p_out, seed)', 'decoupage_aleatoire(G, k) (baseline)', 'precision(clusters, verite)', 'laplacienne, fiedler, spectral_2', 'kmeans(X, k) (maison)', 'communautes(G, k)'],
    metriques: ['précision sur le karaté', 'précision selon p_out', 'précision selon le déséquilibre des tailles', 'précision selon k', 'arêtes coupées'],
    code: `import itertools
import numpy as np
import networkx as nx

def precision(clusters, verite):
    """Meilleure correspondance entre étiquettes trouvées et vraies (permutations)."""
    c, v = np.array(clusters), np.array(verite)
    k = max(c.max(), v.max()) + 1
    return max(np.mean(np.array([p[x] for x in c]) == v) for p in itertools.permutations(range(k)))

G = nx.karate_club_graph()
verite = [0 if G.nodes[u]["club"] == "Mr. Hi" else 1 for u in G]
A = nx.to_numpy_array(G, weight=None)                  # sans les poids
L = np.diag(A.sum(axis=1)) - A
_, w = np.linalg.eigh(L)
clusters = (w[:, 1] >= 0).astype(int)
print("précision sur le club de karaté :", round(precision(clusters, verite), 3))`,
  },
]
