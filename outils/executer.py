"""Exécute le code du site et enregistre les sorties réelles (src/contenu/sorties.json)."""
import contextlib, io, json, sys, time, traceback
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.show = lambda *a, **k: plt.close("all")

pages = json.load(open("outils/codes.json"))
sorties, erreurs = {}, []
for p in pages:
    ns = {"__name__": "__main__"}
    t0 = time.time()
    for it in p["items"]:
        if not p["partage"]:
            ns = {"__name__": "__main__"}
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                exec(compile(it["code"], f"{p['page']}/{it['id']}", "exec"), ns)
        except Exception:
            erreurs.append((p["page"], it["id"], traceback.format_exc(limit=3)))
        out = buf.getvalue().rstrip()
        cle = f"{it['id']}:{it['kind']}:{it['idx']}"
        if out:
            sorties[cle] = out[:3000]
    print(f"{p['page']:<18} {time.time() - t0:6.1f} s", flush=True)
json.dump(sorties, open("src/contenu/sorties.json", "w"), ensure_ascii=False, indent=0)
print(len(sorties), "sorties ;", len(erreurs), "erreurs")
for e in erreurs:
    print("=" * 60); print(e[0], e[1]); print(e[2])
sys.exit(1 if erreurs else 0)
