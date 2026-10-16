// Méthode du TP noté : tirée de Methodo_TP_note.md, de la fiche récap et du corrigé 2024.

export const CHECKLIST = [
  { phase: 'Avant de commencer', items: ['Noms du binôme en haut du notebook', 'Imports en première cellule (random, numpy, matplotlib, networkx, copy, time)', 'random.seed(…) et np.random.seed(…) pour reproduire', 'Exécuter les fonctions fournies (dummy, rand_list, resultat) pour voir leur sortie'] },
  { phase: 'Comprendre (0:00 → 0:15)', items: ['Entrées / sorties exactes de la fonction imposée', 'Contraintes (définitif ? futur inconnu ? capacités ?)', 'Lire le code fourni : c’est le banc d’essai', 'Repérer les pièges de l’énoncé (bornes « de l’an passé », indices vs jours)', 'Reconnaître la famille de problème (arbre de décision)'] },
  { phase: 'Modéliser (0:15 → 0:35)', items: ['Reformulation en 3–5 lignes dans une cellule markdown', 'Structure de données justifiée (dict, liste, matrice, graphe)', 'Baseline naïve codée et mesurée', 'Au moins 2 indicateurs (moyenne + pire cas)', 'Tests assert sur les cas limites'] },
  { phase: 'Algorithmes (0:35 → 1:30)', items: ['v1 simple et défendable', 'v2 = une seule amélioration à la fois', 'Même signature pour toutes les versions', 'Cas limites gérés (dernier jour, liste vide, égalités)'] },
  { phase: 'Expériences (1:30 → 2:15)', items: ['Banc d’essai 1000+ répétitions', 'Courbe métrique = f(paramètre) avec titre, axes, légende', 'Grille 2D si 2 paramètres', 'Robustesse : autre n, autre distribution', '2–3 phrases d’analyse sous CHAQUE graphe'] },
  { phase: 'Conclure (2:15 → 2:30)', items: ['Tableau comparatif des versions', '« On recommande X car … » avec un chiffre et une limite', 'Kernel → Restart & Run All sans erreur', 'Enregistrer et rendre le notebook'] },
]

export const blocs = [
  {
    id: 'm-principe',
    genre: 'methode',
    titre: 'Ce qui est noté (et donc où mettre son temps)',
    source: 'Sujet 2024 · « Notation »',
    explication: `Le sujet 2024 note trois choses : **la pertinence des propositions**, **l’exhaustivité des analyses** et **la clarté des explications**. Ce n’est pas un concours d’algorithme : un algorithme moyen **bien mesuré et bien commenté** rapporte plus qu’un algorithme brillant sans analyse.

Le rendu attendu est le **notebook complété**, avec :
- une ou plusieurs versions de la fonction demandée ;
- une **analyse des résultats** (texte, courbes, métriques) ;
- si plusieurs versions : **une comparaison** et un **choix final justifié**.

Conditions 2024 : 2 h 30 en binôme, documents de cours autorisés, internet autorisé, **IA générative interdite**, pas de communication entre binômes.`,
    exemple: {
      libelle: 'Squelette de rendu qui coche toutes les cases',
      texte: 'Les titres markdown à créer dès la première minute, puis à remplir :',
      code: `# 0. Noms du binôme, imports, graine aléatoire
# 1. Reformulation du problème (markdown) + modélisation (variables, structure de données)
# 2. Fonctions fournies : test rapide pour comprendre leur sortie
# 3. Indicateurs (au moins 2) + baseline (dummy / aléatoire) mesurée sur 1000+ essais
# 4. Version 1 : idée, code, tests assert, mesures
# 5. Version 2 : une amélioration, code, mesures, comparaison avec v1
# 6. Optimisation des paramètres (courbe 1D puis grille 2D)
# 7. Robustesse (autre n, autre distribution, autres bornes)
# 8. Tableau comparatif final + recommandation chiffrée + limites
# 9. Restart & Run All`,
      langage: 'python',
      titre: 'plan du notebook',
    },
    plus: `Pourquoi cet ordre ? Parce que chaque section produit **des points même si la suivante échoue**. Si tu bloques sur la v2, tu as déjà la reformulation, les indicateurs, la baseline et la v1 mesurée.

Astuce binôme : dès la 20e minute, **l’un code les algorithmes** pendant que **l’autre prépare le banc d’essai et les fonctions de tracé** (elles prennent une fonction de choix en paramètre, donc elles marchent avec n’importe quelle version). Vous fusionnez à 1 h 15.`,
  },
  {
    id: 'm-budget',
    genre: 'methode',
    titre: 'Budget temps : le plan de bataille',
    visuel: 'budget',
    explication: `Découpe les 2 h 30 avant de commencer et **tiens les horaires**. La phase d’expériences (graphes + analyses) est celle qui rapporte le plus de points et celle qu’on sacrifie le plus souvent : on la protège.`,
    plus: `Si vous avez un tiers-temps (3 h 20), ajoutez le temps surtout à la phase « Simulations, graphes, analyses ».

Signal d’alarme : si à 0:45 vous n’avez **aucune mesure chiffrée**, arrêtez tout et faites tourner la baseline sur 1000 essais. Un chiffre, même mauvais, structure toute la suite.`,
  },
  {
    id: 'm-lire',
    genre: 'methode',
    titre: 'Phase 1 : lire le sujet comme un détective (10 min)',
    explication: `Surligne quatre choses dans l’énoncé :
1. **Entrées / sorties exactes** : la signature imposée (ex. \`choice(n, seen) -> bool\`). Ne change jamais la signature attendue : ajoute des paramètres par défaut si besoin (\`def choice(n, seen, q=0.35, m=0.9)\`).
2. **Contraintes** : ce qu’on connaît, ce qu’on ne connaît pas, ce qui est définitif.
3. **Ce qui est fourni** : \`dummy_choice\`, \`rand_list\`, \`resultat\`… C’est le banc d’essai du correcteur : le lire, c’est savoir comment ton travail sera mesuré.
4. **Les pièges** : une phrase du type « ces bornes sont celles de l’année passée, rien ne dit que ce seront les mêmes » veut dire **ne code jamais de valeur en dur**, utilise des seuils relatifs.`,
    exemple: {
      libelle: 'Exemple 2024 : ce que dit vraiment la fonction resultat',
      code: `def resultat(listeScores, fonctionChoix):
    i = 0
    choice = False
    while i < len(listeScores) and not(choice):
        i = i + 1
        choice = fonctionChoix(n, listeScores[:i])   # seen = les i premiers scores
    chosen = listeScores[i-1]
    return chosen, i        # i = numéro du JOUR (1..n), pas un indice !`,
      titre: 'fourni par le sujet',
    },
    plus: `Ce qu’on déduit de ce code :
- \`seen\` a une longueur \`i\` qui va de 1 à n : le jour 1, \`len(seen) == 1\` ; le dernier jour, \`len(seen) == n\`.
- \`resultat\` utilise une variable **globale** \`n\` : si tu changes n dans une boucle sans redéfinir n, tu as un bug silencieux. Passe n explicitement ou redéfinis-le avant chaque série d’essais.
- Si ta fonction ne renvoie jamais True, \`resultat\` prend quand même le dernier score (la boucle s’arrête à \`len(listeScores)\`).
- Le corrigé 2024 renvoie \`i-1\` (un indice) alors que le sujet renvoie \`i\` (un jour) : vérifie toujours ce que renvoie la version que tu as sous les yeux.`,
  },
  {
    id: 'm-reconnaitre',
    genre: 'methode',
    titre: 'Phase 2 : reconnaître la famille du problème',
    explication: `Pose-toi trois questions : **qu’est-ce qui est aléatoire ? qu’est-ce que je décide ? qu’est-ce que je mesure ?** Puis compare aux indices de l’énoncé :

| Indice dans l’énoncé | Famille | Outil du cours |
|---|---|---|
| deux groupes, listes de préférences, « vœux » | Mariage stable | Gale-Shapley, regret, Selkow |
| « équitable », « le plus malheureux » | Mariage stable équitable | Selkow (regret max) |
| réseau, capacités, « maximum qui passe », goulot | Flot | Edmonds-Karp, coupe min |
| affecter 1 à 1, tâches ↔ personnes, compétences | Couplage biparti | flot de capacité 1, Hopcroft-Karp |
| matrice, évolution d’année en année, long terme | Valeurs propres | puissances itérées, eig |
| graphe à découper, communautés, groupes d’amis | Clustering spectral | Laplacien, Fiedler, k-means |
| décision au fil de l’eau, hasard, « accepter ou attendre » | Arrêt optimal | stratégie à seuil + Monte Carlo |`,
    plus: `Si rien ne colle : c’est un problème de **simulation + stratégie**. Démarche universelle : baseline aléatoire → stratégie gloutonne → amélioration par paramètre → mesure par simulation.

Les sujets d’entraînement du dossier sont construits exactement sur ce tableau : stages avec capacités (Gale-Shapley généralisé), tutorat équitable (Selkow), évacuation du campus (flot + coupe min), planning des bénévoles (couplage = flot), colonie de phoques (Leslie), communautés du club de karaté (spectral).`,
  },
  {
    id: 'm-modeliser',
    genre: 'methode',
    titre: 'Phase 3 : reformuler et modéliser (à écrire en markdown)',
    explication: `Avant tout code, écris une cellule markdown de 3 à 5 lignes avec **tes mots** :
- le problème (« on a n jours, un score par jour, on veut maximiser le score accepté ») ;
- les **variables** et paramètres (n, scores, q, m…) ;
- la **structure de données** et pourquoi (dict pour des préférences par identifiant, matrice numpy pour des capacités, graphe networkx pour dessiner…) ;
- l’**objectif chiffré** : quelle métrique dit qu’une solution est bonne.`,
    exemple: {
      libelle: 'Exemple de cellule de modélisation (sujet 2024)',
      texte: `**Modélisation.** La période dure n jours ; le jour i on observe un score sᵢ ≥ 0 et on décide immédiatement d’accepter (définitif) ou d’attendre. On ne connaît ni les scores futurs ni leurs bornes. C’est un problème d’**arrêt optimal** (problème du secrétaire).
Données : \`seen\` est la liste des scores déjà vus (le dernier est celui du jour).
Objectif : choisir un score le plus proche possible du meilleur score de la période. Nous le mesurons par le **rang** du score choisi (1 = meilleur), le **ratio** (c − min)/(max − min) et la **probabilité de choisir le meilleur**, en moyenne sur 1000+ listes aléatoires.`,
    },
    plus: `Le correcteur lit cette cellule en premier : elle prouve que vous avez compris. Elle sert aussi d’introduction à votre conclusion (« notre objectif était… ; la version X l’atteint le mieux car… »).`,
  },
  {
    id: 'm-baseline',
    genre: 'methode',
    titre: 'Phase 4 : baseline + indicateurs AVANT l’algorithme malin',
    explication: `1. **Baseline** : la stratégie la plus bête possible (celle fournie, l’aléatoire, le premier élément). Elle donne le **plancher à battre**.
2. **Indicateurs**, toujours **plusieurs** (un seul ment) : une moyenne, une médiane, un **pire cas** (max ou 90e percentile), une probabilité de succès.
3. **Banc d’essai** : 1000 répétitions minimum, graine fixée, moyenne et écart-type.
4. **Tests** : quelques \`assert\` sur les cas limites, pour éviter les bugs bêtes (\`max([])\`, dernier jour oublié).`,
    exemple: {
      code: `import random
import numpy as np

random.seed(0)

def rand_list(n, bas=0, haut=5000):
    return [random.randint(bas, haut) for _ in range(n)]

def dummy_choice(n, seen):
    return len(seen) == 3          # accepte toujours le 3e jour

def jouer(liste, choix):
    """Rejoue une stratégie sur une liste : renvoie (score choisi, indice du jour 0..n-1)."""
    n = len(liste)
    for i in range(1, n + 1):
        if choix(n, liste[:i]) or i == n:
            return liste[i - 1], i - 1

def rang(liste, i):
    """1 = meilleur score de la liste."""
    return 1 + sum(1 for x in liste if x > liste[i])

rangs = []
for _ in range(1000):
    l = rand_list(30)
    c, i = jouer(l, dummy_choice)
    rangs.append(rang(l, i))
print("baseline : rang moyen", round(np.mean(rangs), 2), "| médiane", np.median(rangs), "| p90", np.percentile(rangs, 90))`,
      titre: 'baseline mesurée',
    },
    plus: `Pourquoi la baseline vaut ≈ 15,5 sur 30 ? Choisir un jour fixe revient à choisir au hasard : le rang moyen d’un élément pris au hasard parmi n est (n + 1)/2 = 15,5. Écrire ce calcul dans le notebook montre que vous comprenez vos chiffres.

La fonction \`jouer\` ci-dessus ne dépend pas d’une variable globale \`n\` (contrairement à \`resultat\` fourni) : c’est plus sûr pour les boucles sur plusieurs n.`,
  },
  {
    id: 'm-versions',
    genre: 'methode',
    titre: 'Phase 5 : construire les algorithmes par échelons',
    explication: `Ne saute jamais de marche :
- **v0** : la baseline ;
- **v1** : une idée simple et défendable (ex. explorer une part q des jours puis accepter le premier score qui bat le max exploré) ;
- **v2** : améliorer **un seul ingrédient** (ex. accepter dès m × max avec m < 1) ;
- **v3** si le temps le permet : optimiser les paramètres **ensemble** (grille 2D).

Chaque version a **la même signature**, pour passer dans la même boucle de mesure.`,
    exemple: {
      code: `def choice_v1(n, seen, q=0.37):
    k = int(n * q)              # nombre de jours d'exploration
    i = len(seen)               # numéro du jour (1..n)
    if i == n:                  # dernier jour : obligé d'accepter
        return True
    if i <= k or k == 0:        # phase d'exploration (et cas k = 0)
        return k == 0
    return seen[-1] >= max(seen[:k])

def choice_v2(n, seen, q=0.35, m=0.9):
    k = int(n * q)
    i = len(seen)
    if i == n:
        return True
    if k == 0:
        return True
    if i <= k:
        return False
    return seen[-1] >= m * max(seen[:k])`,
      titre: 'deux versions, même signature',
    },
    plus: `Les trois cas limites à toujours traiter :
- **le dernier jour** (\`len(seen) == n\`) : sinon on peut finir sans rien accepter ;
- **le début** (\`k == 0\` quand n·q < 1) : \`max([])\` lève une erreur ;
- **les égalités** (\`>=\` ou \`>\` ?) : avec des scores entiers, des égalités arrivent, choisis et dis-le.

Paramètres par défaut (\`q=0.35\`) : la signature \`choice(n, seen)\` reste respectée, et tu peux quand même balayer q dans tes expériences avec \`lambda n, s: choice_v2(n, s, q=x)\`.`,
  },
  {
    id: 'm-experiences',
    genre: 'methode',
    titre: 'Phase 6 : expérimenter, c’est ce qui fait la note',
    explication: `1. **Courbe** : métrique en fonction d’un paramètre (q de 0 à 1). Toujours \`xlabel\`, \`ylabel\`, \`title\`, \`legend\`, \`grid\`.
2. **Grille 2D** si deux paramètres : \`np.meshgrid\`, carte de chaleur ou surface 3D, \`np.unravel_index(np.argmin(...))\` pour l’optimum.
3. **Robustesse** : changer n (10, 30, 100), la plage des scores, la distribution.
4. **Sous CHAQUE graphe, 2–3 phrases** : *ce qu’on voit → pourquoi → ce que ça implique.*`,
    plus: `Gabarits de phrases d’analyse (à adapter avec tes chiffres) :
- « On observe que le rang moyen est minimal pour q ≈ 0,35 (rang 3,8 contre 15,5 pour la baseline). »
- « Au-delà de q = 0,5, la performance se dégrade : on explore trop et il reste trop peu de jours pour trouver mieux. »
- « La version B bat A de 25 % en moyenne mais son 90e percentile est plus élevé : elle est plus risquée. »
- « Les deux objectifs ne coïncident pas : maximiser P(meilleur) donne q = 1/e, minimiser le rang moyen donne q ≈ 0,35 avec m = 0,9. »
- « Limite : ces résultats supposent des scores uniformes ; avec une loi normale, le seuil m doit être revu. »`,
  },
  {
    id: 'm-conclure',
    genre: 'methode',
    titre: 'Phase 7 : conclure et sécuriser',
    explication: `- **Tableau comparatif** des versions : moyenne, médiane, pire cas, probabilité de succès, temps.
- **Recommandation** en un paragraphe : « Nous recommandons la version X car … (chiffre) ; elle est robuste à … ; sa limite est … ».
- **Kernel → Restart & Run All** : le notebook doit tourner de haut en bas sans erreur. Une cellule qui plante à la relecture coûte cher.`,
    exemple: {
      libelle: 'Paragraphe de conclusion type (sujet 2024)',
      texte: `**Conclusion.** Sur 20 000 simulations avec n = 30, la stratégie « explorer 35 % des jours puis accepter dès 90 % du meilleur score exploré » donne un rang moyen de **3,8** (top 3 dans plus de la moitié des cas), contre 15,5 pour la stratégie fournie et 7,0 pour la stratégie classique du secrétaire (q = 1/e, m = 1). Cette dernière trouve plus souvent le meilleur (38 % contre 20 %), mais quand elle échoue, elle échoue lourdement. ParcourSup cherchant une bonne affectation **en moyenne**, nous recommandons q = 0,35 et m = 0,9, avec un seuil relatif min + m·(max − min) si les bornes de scores changent. Limite : paramètres optimisés pour des scores uniformes.`,
    },
  },
  {
    id: 'm-secours',
    genre: 'methode',
    titre: 'Si vous bloquez : l’échelle de secours',
    explication: `1. Écris l’énoncé en 3 phrases + la baseline + 1 graphe : tu as déjà des points.
2. Décris l’idée en markdown même si le code ne marche pas : la **pertinence** est notée.
3. Teste à la main sur un mini-exemple (n = 3 ou 4) avant de coder.
4. Débloque-toi avec la question : *« si j’avais toute l’information, que ferais-je ? Quelle information me manque ? Comment l’estimer ? »* (en 2024 : il manque le meilleur score → on l’estime avec le max des premiers jours).
5. Un algorithme moyen **bien analysé** vaut plus qu’un bon algorithme sans analyse.`,
    plus: `Debug express :
- \`print\` des variables dans la boucle sur **un** exemple, pas sur 1000 ;
- \`assert\` sur la taille des listes et les types ;
- vérifier la variable globale \`n\` ;
- \`copy.deepcopy\` si une fonction modifie un dictionnaire de préférences (sinon les essais suivants sont faussés).`,
  },
]
