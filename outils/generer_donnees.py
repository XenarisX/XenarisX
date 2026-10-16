"""Génère les données des graphiques du site en exécutant le code du cours R5.A.12.

Chaque bloc reprend les fonctions des TP corrigés (mêmes noms, même logique) :
les courbes du site sont donc les vraies mesures obtenues avec ce code.
"""
import copy
import json
import random
import time
from collections import deque

import networkx as nx
import numpy as np
import numpy.linalg as la
from sklearn.cluster import KMeans

random.seed(42)
np.random.seed(42)
OUT = {}

# ------------------------------------------------------------------ mariages stables
def prefer(pref, c1, c2):
    if c1 not in pref:
        return False
    if c2 not in pref:
        return True
    return pref.index(c1) < pref.index(c2)


def marriedTo(marriage, e, isP1):
    if isP1:
        return marriage.get(e, -1)
    for i in marriage:
        if marriage[i] == e:
            return i
    return -1


def galeShapley(p1Pref, p2Pref, compter=False):
    mariage, suivant, celib, nb = {}, {i: 0 for i in p1Pref}, list(p1Pref), 0
    while celib:
        e = celib.pop(0)
        f = p1Pref[e][suivant[e]]
        suivant[e] += 1
        nb += 1
        rival = marriedTo(mariage, f, False)
        if rival == -1:
            mariage[e] = f
        elif prefer(p2Pref[f], e, rival):
            del mariage[rival]
            mariage[e] = f
            celib.append(rival)
        else:
            celib.append(e)
    return (mariage, nb) if compter else mariage


def dicoPrefGenerator(n):
    d = {}
    for i in range(n):
        l = list(range(n))
        random.shuffle(l)
        d[i] = l
    return d


def regrets(mariage, p1Pref, p2Pref):
    r1 = {e: p1Pref[e].index(mariage[e]) for e in p1Pref}
    inv = {f: e for e, f in mariage.items()}
    r2 = {f: p2Pref[f].index(inv[f]) for f in p2Pref}
    return [r1, r2]


def mariageAleatoire(n):
    p = random.sample(range(n), n)
    return {i: p[i] for i in range(n)}


def bornesSupInfGS(p1Pref, p2Pref):
    m1 = galeShapley(p1Pref, p2Pref)
    m2 = galeShapley(p2Pref, p1Pref)
    p1inf, p2sup = regrets(m1, p1Pref, p2Pref)
    p2inf, p1sup = regrets(m2, p2Pref, p1Pref)
    return p1inf, p1sup, p2inf, p2sup


def individuRegretMax(i1, s1, i2, s2):
    isP1, ind, mx = False, -1, -1
    for e in s1:
        if s1[e] != i1[e] and s1[e] > mx:
            mx, ind, isP1 = s1[e], e, True
    for e in s2:
        if s2[e] != i2[e] and s2[e] > mx:
            mx, ind, isP1 = s2[e], e, False
    return ind, isP1


def selkow(p1Pref, p2Pref):
    pref1, pref2 = copy.deepcopy(p1Pref), copy.deepcopy(p2Pref)
    final = {}
    while pref1:
        m1 = galeShapley(pref1, pref2)
        m2 = galeShapley(pref2, pref1)
        i1, s1, i2, s2 = bornesSupInfGS(pref1, pref2)
        for e in list(pref1.keys()):
            if i1[e] == s1[e]:
                p = m1[e]
                final[e] = p
                del pref1[e]
                del pref2[p]
                for l in pref1.values():
                    if p in l:
                        l.remove(p)
                for l in pref2.values():
                    if e in l:
                        l.remove(e)
        if pref1:
            i1 = {k: v for k, v in i1.items() if k in pref1}
            s1 = {k: v for k, v in s1.items() if k in pref1}
            i2 = {k: v for k, v in i2.items() if k in pref2}
            s2 = {k: v for k, v in s2.items() if k in pref2}
            e, isP1 = individuRegretMax(i1, s1, i2, s2)
            if e == -1:
                for x in pref1:
                    final[x] = m1[x]
                break
            if isP1:
                p = m2_inv(m2, e)
                pref1[e].remove(p)
                pref2[p].remove(e)
            else:
                p = marriedTo(m1, e, False)
                pref2[e].remove(p)
                pref1[p].remove(e)
    return final


def m2_inv(m2, e):
    # m2 = mariage P2 -> P1 ; partenaire de e (P1) dans GS(P2, P1)
    for f, x in m2.items():
        if x == e:
            return f
    return -1


def regretMaximal(m, p1, p2):
    r = regrets(m, p1, p2)
    return max(max(r[0].values()), max(r[1].values()))


# Complexité en pratique de Gale-Shapley
taille, mes = [], []
for n in range(10, 201, 10):
    tot = sum(galeShapley(dicoPrefGenerator(n), dicoPrefGenerator(n), True)[1] for _ in range(10))
    taille.append(n)
    mes.append(tot / 10)
OUT["gs_complexite"] = [
    {"n": n, "mesure": round(m, 1), "nlogn": round(n * np.log(n), 1), "n2": n * n} for n, m in zip(taille, mes)
]

# Regrets moyens GS vs aléatoire
rows = []
for n in range(5, 101, 5):
    acc = np.zeros(4)
    for _ in range(20):
        p1, p2 = dicoPrefGenerator(n), dicoPrefGenerator(n)
        r = regrets(galeShapley(p1, p2), p1, p2)
        ra = regrets(mariageAleatoire(n), p1, p2)
        acc += [np.mean(list(r[0].values())), np.mean(list(r[1].values())), np.mean(list(ra[0].values())), np.mean(list(ra[1].values()))]
    acc /= 20
    rows.append({"n": n, "gs_p1": round(acc[0], 2), "gs_p2": round(acc[1], 2), "alea_p1": round(acc[2], 2), "alea_p2": round(acc[3], 2)})
OUT["gs_regrets"] = rows

# Selkow vs GS : regret max, regrets moyens, temps
rows = []
for n in range(2, 13):
    acc = np.zeros(7)
    N = 120
    for _ in range(N):
        p1, p2 = dicoPrefGenerator(n), dicoPrefGenerator(n)
        t = time.perf_counter(); mg = galeShapley(p1, p2); tg = time.perf_counter() - t
        t = time.perf_counter(); ms = selkow(p1, p2); ts = time.perf_counter() - t
        rg, rs = regrets(mg, p1, p2), regrets(ms, p1, p2)
        acc += [regretMaximal(mg, p1, p2), regretMaximal(ms, p1, p2), regretMaximal(mariageAleatoire(n), p1, p2),
                np.mean(list(rg[1].values())), np.mean(list(rs[1].values())), tg * 1e3, ts * 1e3]
    acc /= N
    rows.append({"n": n, "gs": round(acc[0], 2), "selkow": round(acc[1], 2), "alea": round(acc[2], 2),
                 "gs_p2_moy": round(acc[3], 2), "selkow_p2_moy": round(acc[4], 2), "t_gs_ms": round(acc[5], 3), "t_selkow_ms": round(acc[6], 3)})
OUT["selkow"] = rows

# ------------------------------------------------------------------ flots
def bfs(graph, source):
    visited = [False] * len(graph)
    parent = [-1] * len(graph)
    q = deque([source])
    visited[source] = True
    while q:
        u = q.popleft()
        for v, c in enumerate(graph[u]):
            if not visited[v] and c > 0:
                q.append(v); visited[v] = True; parent[v] = u
    return parent


def shortest_augmenting_path(g, s, t):
    parent = bfs(g, s)
    if parent[t] == -1:
        return [], 0
    path, x = [], t
    while x != -1:
        path.append(x); x = parent[x]
    path.reverse()
    return path, min(g[path[i]][path[i + 1]] for i in range(len(path) - 1))


def edmonds_karp(C, s, t, trace=None):
    F = np.zeros_like(C)
    total = 0
    path, c = shortest_augmenting_path(C - F, s, t)
    while path:
        for u, v in zip(path, path[1:]):
            F[u][v] += c; F[v][u] -= c
        total += c
        if trace is not None:
            trace.append({"chemin": [int(x) for x in path], "capacite": int(c), "total": int(total)})
        path, c = shortest_augmenting_path(C - F, s, t)
    return total, F


C = np.array([[0, 10, 0, 5, 0, 0], [0, 0, 9, 0, 0, 0], [0, 0, 0, 7, 10, 0], [0, 0, 0, 0, 0, 12], [0, 0, 0, 0, 0, 6], [0, 0, 0, 0, 0, 0]])
trace = []
val, F = edmonds_karp(C, 0, 5, trace)
res = C - F
S1 = [i for i, p in enumerate(bfs(res, 0)) if p != -1 or i == 0]
OUT["ek_cours"] = {
    "valeur": int(val),
    "etapes": trace,
    "arcs": [{"u": int(u), "v": int(v), "cap": int(C[u][v]), "flot": int(max(F[u][v], 0))} for u in range(6) for v in range(6) if C[u][v] > 0],
    "S1": S1,
    "coupe": [{"u": int(u), "v": int(v), "cap": int(C[u][v])} for u in S1 for v in range(6) if v not in S1 and C[u][v] > 0],
}

rows = []
for n in [10, 20, 40, 60, 80, 100, 130, 160]:
    ts = []
    for _ in range(5):
        G = nx.gnp_random_graph(n, 0.15, directed=True, seed=random.randint(0, 10**6))
        M = np.zeros((n, n), int)
        for u, v in G.edges:
            M[u][v] = random.randint(1, 20)
        t = time.perf_counter(); edmonds_karp(M, 0, n - 1); ts.append(time.perf_counter() - t)
        E = G.number_of_edges()
    rows.append({"n": n, "aretes": int(E), "temps_ms": round(1e3 * float(np.mean(ts)), 2)})
OUT["ek_complexite"] = rows

# Couplage biparti (bénévoles du TP3)
G = nx.bipartite.random_graph(8, 8, 0.25, seed=3)
M = nx.bipartite.hopcroft_karp_matching(G, top_nodes=range(8))
OUT["couplage"] = {
    "S1": list(range(8)), "S2": list(range(8, 16)),
    "aretes": [[int(u), int(v)] for u, v in G.edges],
    "couplage": [[int(u), int(v)] for u, v in M.items() if u < 8],
}

# ------------------------------------------------------------------ valeurs propres
def norm(v):
    return float(np.sqrt((v ** 2).sum()))


A = np.array([[1, 6], [1, 2]], float)
v = np.random.rand(2); v /= norm(v)
rows = []
for k in range(1, 26):
    w = A @ v; w /= norm(w)
    lam = (A @ w)[0] / w[0]
    rows.append({"k": k, "lambda": round(float(lam), 6), "erreur": float(abs(lam - 4)) or 1e-16})
    v = w
OUT["puissances"] = rows

def conv(lam2):
    B = np.diag([1.0, lam2])
    v = np.array([1.0, 1.0]) / np.sqrt(2)
    errs = []
    for k in range(1, 41):
        v = B @ v; v /= norm(v)
        errs.append(max(float(abs(v[1])), 1e-16))
    return errs
e1, e2, e3 = conv(0.5), conv(0.8), conv(0.95)
OUT["vitesse"] = [{"k": k + 1, "r05": e1[k], "r08": e2[k], "r095": e3[k]} for k in range(40)]

L = np.array([[0, 0.4, 0.9, 0.7], [0.75, 0, 0, 0], [0, 0.85, 0, 0], [0, 0, 0.9, 0.88]])
x = np.array([200, 150, 120, 300], float)
rows = []
for t in range(31):
    rows.append({"t": t, "juv": round(x[0], 1), "jeunes": round(x[1], 1), "adultes": round(x[2], 1), "ages": round(x[3], 1), "total": round(x.sum(), 1)})
    x = L @ x
vals, vecs = la.eig(L)
i = int(np.argmax(abs(vals)))
v1 = np.abs(vecs[:, i].real); v1 /= v1.sum()
OUT["leslie"] = {"serie": rows, "lambda": round(float(vals[i].real), 4), "repartition": [round(float(a), 4) for a in v1], "L": L.tolist()}

# ------------------------------------------------------------------ clustering spectral
def adjTolaplacian(A):
    return np.diag(np.diag(A @ A)) - A


G = nx.random_partition_graph([10, 15, 20], 0.5, 0.02, seed=13)
A = nx.to_numpy_array(G)
Lp = adjTolaplacian(A)
vals, w = la.eigh(Lp)
X = w[:, 1:4]
labels = KMeans(3, n_init=10, random_state=0).fit(X).labels_
fied = w[:, 1]
pos = nx.spring_layout(G, seed=7)
verite = [0] * 10 + [1] * 15 + [2] * 20
OUT["spectral"] = {
    "noeuds": [{"id": int(u), "x": round(float(pos[u][0]), 3), "y": round(float(pos[u][1]), 3), "kmeans": int(labels[u]), "fiedler": round(float(fied[u]), 4), "verite": verite[u]} for u in G.nodes],
    "aretes": [[int(u), int(v)] for u, v in G.edges],
    "valeurs": [round(float(x), 4) for x in vals[:10]],
}
G2 = nx.disjoint_union_all([nx.complete_graph(5), nx.cycle_graph(6), nx.path_graph(4)])
v2 = la.eigvalsh(adjTolaplacian(nx.to_numpy_array(G2)))
OUT["composantes"] = {"valeurs": [round(float(x), 4) for x in v2[:6]], "nb": int(np.sum(np.abs(v2) < 1e-10))}

rows = []
for pout in [0.0, 0.02, 0.05, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3]:
    accs = []
    for s in range(10):
        Gs = nx.random_partition_graph([20, 20], 0.4, pout, seed=s)
        As = nx.to_numpy_array(Gs)
        vv, ww = la.eigh(adjTolaplacian(As))
        lab = (ww[:, 1] >= 0).astype(int)
        ver = np.array([0] * 20 + [1] * 20)
        accs.append(max(np.mean(lab == ver), np.mean(lab != ver)))
    rows.append({"pout": pout, "precision": round(float(np.mean(accs)), 3)})
OUT["spectral_robustesse"] = rows

# ------------------------------------------------------------------ arrêt optimal (TP noté 2024)
def simule(n, q, m, T, low=0, high=5000, dist="uniforme", rng=None):
    """Version vectorisée de resultat(liste, choice) pour la stratégie (q, m).
    Jours 1..k : exploration ; ensuite accepter si x >= m * max(exploration) ; dernier jour : obligé."""
    rng = rng or np.random.default_rng(0)
    if dist == "uniforme":
        X = rng.integers(low, high + 1, size=(T, n)).astype(float)
    elif dist == "normale":
        X = np.clip(rng.normal(2500, 600, size=(T, n)), 0, None)
    else:
        X = rng.exponential(800, size=(T, n))
    k = int(n * q)
    if k == 0:
        idx = np.zeros(T, int)
    else:
        mk = X[:, :k].max(axis=1, keepdims=True)
        ok = X[:, k:] >= m * mk
        ok[:, -1] = True  # dernier jour : on accepte
        idx = k + ok.argmax(axis=1)
    choisi = X[np.arange(T), idx]
    rang = 1 + (X > choisi[:, None]).sum(axis=1)
    mn, mx = X.min(axis=1), X.max(axis=1)
    ratio = (choisi - mn) / np.where(mx > mn, mx - mn, 1)
    return rang, ratio, idx


rng = np.random.default_rng(1)
n, T = 30, 20000
qs = [round(x, 2) for x in np.arange(0.05, 1.0, 0.05)]
rows = []
for q in qs:
    r, ra, _ = simule(n, q, 1.0, T, rng=rng)
    rows.append({"q": q, "rang": round(float(r.mean()), 2), "ratio": round(float(ra.mean()), 3), "pmeilleur": round(float((r == 1).mean()), 3)})
OUT["secretaire_q"] = rows

ms = [round(x, 2) for x in np.arange(0.5, 1.3, 0.05)]
grid = []
best = (99, None, None)
for q in qs:
    for m in ms:
        r, ra, _ = simule(n, q, m, 4000, rng=rng)
        val = float(r.mean())
        grid.append({"q": q, "m": m, "rang": round(val, 2), "ratio": round(float(ra.mean()), 3)})
        if val < best[0]:
            best = (val, q, m)
OUT["secretaire_grille"] = {"qs": qs, "ms": ms, "cases": grid, "meilleur": {"rang": round(best[0], 2), "q": best[1], "m": best[2]}}

def strat(nom, q, m):
    r, ra, _ = simule(n, q, m, T, rng=rng)
    return {"nom": nom, "q": q, "m": m, "rang": round(float(r.mean()), 2), "rang_med": float(np.median(r)), "ratio": round(float(ra.mean()), 3),
            "pmeilleur": round(float((r == 1).mean()), 3), "pire_rang_p90": float(np.percentile(r, 90))}

def dummy():
    rr = []
    ratios = []
    X = rng.integers(0, 5001, size=(T, n)).astype(float)
    ch = X[:, 2]
    r = 1 + (X > ch[:, None]).sum(axis=1)
    ra = (ch - X.min(1)) / (X.max(1) - X.min(1))
    return {"nom": "dummy (3e jour)", "q": None, "m": None, "rang": round(float(r.mean()), 2), "rang_med": float(np.median(r)), "ratio": round(float(ra.mean()), 3),
            "pmeilleur": round(float((r == 1).mean()), 3), "pire_rang_p90": float(np.percentile(r, 90))}

OUT["secretaire_comparatif"] = [
    dummy(),
    strat("q = 0,5 ; m = 1", 0.5, 1.0),
    strat("q = 0,2 ; m = 1", 0.2, 1.0),
    strat("q = 0,2 ; m = 0,9 (optimisés un par un)", 0.2, 0.9),
    strat(f"q = {best[1]} ; m = {best[2]} (grille 2D)", best[1], best[2]),
    strat("q = 1/e ; m = 1 (secrétaire classique)", 1 / np.e, 1.0),
]

r, _, idx = simule(n, best[1], best[2], T, rng=rng)
h = np.bincount(r, minlength=n + 1)[1:]
OUT["secretaire_hist"] = [{"rang": i + 1, "freq": round(float(c) / T, 4)} for i, c in enumerate(h[:15])]
h2 = np.bincount(idx, minlength=n)
OUT["secretaire_jour"] = [{"jour": i + 1, "freq": round(float(c) / T, 4)} for i, c in enumerate(h2)]

rows = []
for nn in [5, 10, 20, 30, 50, 100, 200]:
    r1, _, _ = simule(nn, best[1], best[2], 8000, rng=rng)
    r2, _, _ = simule(nn, 1 / np.e, 1.0, 8000, rng=rng)
    rows.append({"n": nn, "grille_rang_rel": round(float(r1.mean()) / nn, 4), "classique_rang_rel": round(float(r2.mean()) / nn, 4),
                 "grille_p1": round(float((r1 == 1).mean()), 3), "classique_p1": round(float((r2 == 1).mean()), 3)})
OUT["secretaire_n"] = rows

rows = []
for nom, kw in [("Uniforme 0–5000", {}), ("Uniforme 230–788", {"low": 230, "high": 788}), ("Normale", {"dist": "normale"}), ("Exponentielle", {"dist": "exp"})]:
    r, ra, _ = simule(n, best[1], best[2], 8000, rng=rng, **kw)
    rows.append({"distribution": nom, "rang": round(float(r.mean()), 2), "ratio": round(float(ra.mean()), 3), "pmeilleur": round(float((r == 1).mean()), 3)})
OUT["secretaire_distributions"] = rows

json.dump(OUT, open("/home/claude/exams-data/donnees.json", "w"), ensure_ascii=False)
print("ok", list(OUT))
print("meilleur grille", OUT["secretaire_grille"]["meilleur"])
print(json.dumps(OUT["secretaire_comparatif"], ensure_ascii=False, indent=0)[:1500])
print("ek", OUT["ek_cours"]["valeur"], OUT["ek_cours"]["coupe"], "leslie", OUT["leslie"]["lambda"], "comp", OUT["composantes"])
print(OUT["selkow"][-1])
