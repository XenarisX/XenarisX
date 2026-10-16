"""Exécute le code du site et enregistre les sorties réelles (src/contenu/sorties.json)."""
import contextlib, io, json, sys, time, traceback
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os
FIG_DIR = "public/assets/mpl"
os.makedirs(FIG_DIR, exist_ok=True)
for f in os.listdir(FIG_DIR):
    os.remove(os.path.join(FIG_DIR, f))
figures, courant = {}, {"cle": None, "actif": False}

def enregistrer(*a, **k):
    """plt.show remplacé : sur les pages « figures », chaque figure ouverte devient un PNG."""
    if courant["actif"]:
        for num in plt.get_fignums():
            liste = figures.setdefault(courant["cle"], [])
            nom = f"{courant['cle'].replace(':', '-')}-{len(liste)}.png"
            chemin = os.path.join(FIG_DIR, nom)
            plt.figure(num).savefig(chemin, dpi=110, bbox_inches="tight", facecolor="white")
            from PIL import Image
            with Image.open(chemin) as im:
                liste.append([nom, im.width, im.height])   # taille réservée dans la page
    plt.close("all")

plt.show = enregistrer

pages = json.load(open("outils/codes.json"))
sorties, erreurs = {}, []
for p in pages:
    ns = {"__name__": "__main__"}
    t0 = time.time()
    for it in p["items"]:
        if not p["partage"]:
            ns = {"__name__": "__main__"}
        buf = io.StringIO()
        courant["cle"] = f"{it['id']}:{it['kind']}:{it['idx']}"
        courant["actif"] = p.get("figures", False)
        try:
            with contextlib.redirect_stdout(buf):
                exec(compile(it["code"], f"{p['page']}/{it['id']}", "exec"), ns)
        except Exception:
            erreurs.append((p["page"], it["id"], traceback.format_exc(limit=3)))
        enregistrer()
        out = buf.getvalue().rstrip()
        cle = f"{it['id']}:{it['kind']}:{it['idx']}"
        if out:
            sorties[cle] = out[:3000]
    print(f"{p['page']:<18} {time.time() - t0:6.1f} s", flush=True)
json.dump(figures, open("src/contenu/figures.json", "w"), indent=0)
print(sum(map(len, figures.values())), "figures enregistrées")
json.dump(sorties, open("src/contenu/sorties.json", "w"), ensure_ascii=False, indent=0)
print(len(sorties), "sorties ;", len(erreurs), "erreurs")
for e in erreurs:
    print("=" * 60); print(e[0], e[1]); print(e[2])
sys.exit(1 if erreurs else 0)
