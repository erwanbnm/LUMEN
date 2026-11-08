# Construit le prototype Lumen Duels (prototypes/duels.html) avec les questions d'un thème.
import json, os, sys
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
th = sys.argv[1] if len(sys.argv) > 1 else "gas"
Q = []
lines = [l for l in open(os.path.join(base, "content", th + ".txt"), encoding="utf-8").read().splitlines() if l.strip()]
for i, l in enumerate(lines):
    p = l.split("|")
    if len(p) != 7: continue  # le prototype garde les questions à 4 choix
    Q.append({"id": f"{th}{i+1:02d}", "l": int(p[0]), "q": p[1].strip(), "a": p[2], "w": p[3:6], "e": p[6].strip()})
tpl = open(os.path.join(base, "prototypes", "duels_template.html"), encoding="utf-8").read()
out = tpl.replace("/*__Q__*/[]", json.dumps(Q, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
open(os.path.join(base, "prototypes", "duels.html"), "w", encoding="utf-8").write(out)
print(len(Q), "questions -> prototypes/duels.html")
