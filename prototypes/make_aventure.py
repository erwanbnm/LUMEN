# Construit la maquette du mode Aventure (prototypes/aventure.html), en un seul fichier :
# dessins des personnages (atelier), CSS des animations et quelques vraies questions faciles.
import json, os, random
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(base, p), encoding="utf-8").read()
random.seed(7)
Q = []
for th in ["his", "geo", "sci", "spo", "cin", "mus", "jeu", "ani", "bdm", "gas"]:
    lines = [l for l in rd(f"content/{th}.txt").splitlines() if l.strip()]
    ok = [l.split("|") for l in lines if l.split("|")[0] == "1" and len(l.split("|")) == 7]
    for p in random.sample(ok, 4):
        Q.append({"q": p[1].strip(), "a": p[2].strip(), "w": [x.strip() for x in p[3:6]]})
random.shuffle(Q)
css = "\n".join(rd("app.html").splitlines()[117:200])
art = "\n".join(rd(f) for f in ["atelier/creatures2.js", "atelier/rixy.js", "atelier/toy.js", "atelier/toy_pets.js"])
tpl = rd("prototypes/aventure_template.html")
out = (tpl.replace("/*__CSS__*/", css).replace("/*__ART__*/", art.replace("</", "<\\/"))
          .replace("/*__Q__*/[]", json.dumps(Q, ensure_ascii=False).replace("</", "<\\/")))
open(os.path.join(base, "prototypes", "aventure.html"), "w", encoding="utf-8").write(out)
print(len(Q), "questions -> prototypes/aventure.html")
