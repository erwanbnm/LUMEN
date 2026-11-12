# Contrôle d'un lot de nouvelles questions avant ajout : format, choix distincts, doublons proches avec toute la banque (thèmes, Tour, Portail) et dans le lot
# Usage : python ajout_questions.py lot.txt [--ignore=3,7] [--append]  (--ignore : faux positifs vérifiés à la main)   (lot.txt : lignes « th|niveau|question|bonne|faux1|faux2|faux3|explication » ou VF « th|niveau|question|Vrai/Faux|Faux/Vrai|explication »)
import sys, os, re, glob, collections
ROOT = os.path.dirname(os.path.abspath(__file__))
norm = lambda s: re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœæ]+", " ", s.lower()).strip()
STOP = set("le la les un une des de du d l à au aux en et est qui que quoi quel quelle quels quelles dans par pour sur avec ce cette ces son sa ses il elle on a été plus ne pas se s y comment combien où quand qu c n vrai faux ou était sont ont fait appelle appelait nom".split())
toks = lambda s: set(w for w in norm(s).split() if w not in STOP and len(w) > 2)
bank = []
for p in glob.glob(os.path.join(ROOT, "content", "*.txt")):
    th = os.path.basename(p)[:-4]
    for i, l in enumerate(open(p, encoding="utf-8").read().splitlines()):
        if l.strip(): f = l.split("|"); bank.append((th + ":" + str(i + 1), f[1], f[2]))
for p, qi, ai in [("tour.txt", 2, 3), ("portail.txt", 1, 2)]:
    for i, l in enumerate(open(os.path.join(ROOT, "content", "extra", p), encoding="utf-8").read().splitlines()):
        if l.strip() and not l.startswith("#"): f = l.split("|"); bank.append((p[:-4] + ":" + str(i + 1), f[qi], f[ai]))
THEMES = {os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, "content", "*.txt"))}
IGN = set(int(x) for a in sys.argv if a.startswith("--ignore=") for x in a[9:].split(","))
lot = [l for l in open(sys.argv[1], encoding="utf-8").read().splitlines() if l.strip() and not l.startswith("#")]
bad = 0; out = collections.defaultdict(list); seen = []
for k, l in enumerate(lot):
    f = l.split("|"); th = f[0]; rest = f[1:]
    err = []
    if th not in THEMES: err.append("thème")
    if len(rest) not in (5, 7): err.append(f"{len(rest)} champs")
    else:
        if rest[0] not in "123": err.append("niveau")
        ch = rest[2:6] if len(rest) == 7 else rest[2:4]
        if len(set(c.strip().lower() for c in ch)) != len(ch): err.append("choix identiques")
        if any(not c.strip() for c in rest): err.append("champ vide")
        if len(rest) == 5 and set(ch) != {"Vrai", "Faux"}: err.append("VF")
        if len(rest[-1]) < 25: err.append("explication courte")
    if err: print("ERREUR", k + 1, err, l[:90]); bad += 1; continue
    q, a = rest[1], rest[2]; t = toks(q); na = norm(a)
    for ref, bq, ba in bank + seen:
        bt = toks(bq); u = len(t | bt); j = len(t & bt) / u if u else 0
        same = norm(ba) == na and len(na) > 2
        if (k + 1) not in IGN and (j >= .5 or (same and j >= .25) or norm(bq) == norm(q)):
            print(f"PROCHE {k + 1} [{j:.2f}{' même réponse' if same else ''}] {q[:70]} => {a[:25]}  ||  {ref} {bq[:70]} => {ba[:25]}"); bad += 1
    seen.append((f"lot:{k + 1}", q, a)); out[th].append("|".join(rest))
print("lignes", len(lot), "problèmes", bad)
if "--append" in sys.argv:
    if bad: sys.exit("Pas d'ajout : corriger d'abord.")
    for th, L in out.items():
        p = os.path.join(ROOT, "content", th + ".txt"); s = open(p, encoding="utf-8", newline="").read()
        assert "\r\n" not in s; s = s if s.endswith("\n") or not s else s + "\n"
        open(p, "w", encoding="utf-8", newline="").write(s + "\n".join(L) + "\n")
        print("ajouté", th, len(L))
