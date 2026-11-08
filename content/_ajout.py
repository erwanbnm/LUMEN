# Ajoute des questions À LA FIN des fichiers de thème (jamais au milieu : les identifiants dépendent du numéro de ligne).
# Usage : python content/_ajout.py lot.txt   (chaque ligne du lot : "theme>niveau|question|...")
import os, sys
base = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]
added = {}
for line in open(src, encoding="utf-8").read().splitlines():
    if not line.strip() or line.startswith("#"): continue
    th, q = line.split(">", 1)
    th = th.strip(); path = os.path.join(base, th + ".txt")
    assert os.path.exists(path), "thème inconnu : " + th
    f = len(q.split("|")); assert f in (5, 7), (th, f, q[:60])
    with open(path, "a", encoding="utf-8", newline="\n") as out: out.write(q.strip() + "\n")
    added[th] = added.get(th, 0) + 1
print("ajouté :", added)
