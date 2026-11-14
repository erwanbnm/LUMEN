import json, glob, os, sys
base = os.path.dirname(os.path.abspath(__file__))
Q = {}
for path in sorted(glob.glob(os.path.join(base, "content", "*.txt"))):
    th = os.path.basename(path)[:-4]
    lines = [l for l in open(path, encoding="utf-8").read().splitlines() if l.strip()]
    for i, l in enumerate(lines):
        p = l.split("|")
        if len(p) == 7:
            lvl, q, a, w1, w2, w3, exp = p; choices = [a, w1, w2, w3]
        elif len(p) == 5:
            lvl, q, a, w1, exp = p; choices = [a, w1]
        else:
            sys.exit(f"Ligne invalide {path}:{i+1}")
        assert len(set(choices)) == len(choices), (path, i+1, "choix en double")
        Q[f"{th}{i+1:02d}"] = [th, int(lvl), choices, exp.strip(), q.strip()]
for path in sorted(glob.glob(os.path.join(base, "content", "anec", "*.txt"))):
    th = os.path.basename(path)[:-4]
    for l in open(path, encoding="utf-8").read().splitlines():
        if not l.strip(): continue
        n, txt = l.split("|", 1); qid = f"{th}{int(n):02d}"
        assert qid in Q, qid
        Q[qid].append(txt.strip())
# --- Questions en images : drapeaux (Capitales & drapeaux) et silhouettes (Géographie)
import random, re
sys.path.insert(0, os.path.join(base, "content")); from geo_meta import META
GEO = json.loads(re.search(r"const GEO = (.*);", open(os.path.join(base, "content", "geodata.js"), encoding="utf-8").read(), re.S).group(1))
NOTE = {"il":"Capitale : Jérusalem, que la plupart des pays ne reconnaissent pas comme telle : leurs ambassades sont à Tel-Aviv.",
        "ci":"Capitale politique : Yamoussoukro. La plus grande ville, Abidjan, reste le cœur économique du pays.",
        "ua":"Capitale : Kiev (Kyiv en ukrainien).", "za":"L'Afrique du Sud a trois capitales : Pretoria, Le Cap et Bloemfontein.",
        "ch":"Capitale fédérale : Berne. Zurich et Genève sont plus grandes.", "au":"Capitale : Canberra, pas Sydney, créée pour départager Sydney et Melbourne.",
        "ca":"Capitale : Ottawa, pas Toronto ni Montréal.", "br":"Capitale : Brasilia, ville construite de toutes pièces dans les années 1950.",
        "tr":"Capitale : Ankara. Istanbul est la plus grande ville.", "ma":"Capitale : Rabat. Casablanca est la plus grande ville.",
        "ng":"Capitale : Abuja depuis 1991. Lagos est la plus grande ville.", "pk":"Capitale : Islamabad. Karachi est la plus grande ville."}
nm = lambda g: re.sub(r"^(la |le |les |l')", "", g["n"])
nm = lambda g, f=nm: f(g)[0].upper() + f(g)[1:]
def expl(g):
    cont = "Amérique" if g["k"] == "Amériques" else g["k"]
    return NOTE.get(g["c"], f"Capitale : {META[g['c']][0]}.") + f" Continent : {cont}."
rnd = random.Random(1789)
def de(n):
    if n.startswith("le "): return "du " + n[3:]
    if n.startswith("les "): return "des " + n[4:]
    return "de " + n
def opts(g, pool):
    same = [x for x in pool if x is not g and x["k"] == g["k"]]; other = [x for x in pool if x is not g and x["k"] != g["k"]]
    rnd.shuffle(same); rnd.shuffle(other); w = (same[:2] + other)[:3]
    return [nm(g)] + [nm(x) for x in w]
flags = [g for g in GEO if g["flag"]]
by = {g["c"]: g for g in GEO}
# Une petite sélection seulement : 15 drapeaux, 5 « quel drapeau ? », 10 silhouettes
FLAG_Q = ["gb","us","br","jp","ca","ch","kr","in","za","gr","se","ar","tr","ie","ng"]
PICK_Q = ["fr","it","de","be","nl"]
SHAPE_Q = ["fr","it","gb","jp","au","br","in","cl","ma","is"]
for i, c in enumerate(FLAG_Q):
    g = by[c]; Q[f"capi{i+1:02d}"] = ["cap", META[c][1], opts(g, flags), expl(g), "À quel pays appartient ce drapeau ?", "", {"t":"flag", "c":c}]
for i, c in enumerate(PICK_Q):
    g = by[c]; Q[f"capf{i+1:02d}"] = ["cap", min(3, META[c][1]+1), opts(g, flags), expl(g), f"Quel est le drapeau {de(g['n'])} ?", "", {"t":"pick"}]
for i, c in enumerate(SHAPE_Q):
    g = by[c]; Q[f"geoi{i+1:02d}"] = ["geo", min(3, META[c][1]+1), opts(g, GEO), expl(g), "Quel pays a cette forme ?", "", {"t":"shape", "c":c}]
# --- Citations « Qui a dit ? »
for i, l in enumerate(open(os.path.join(base, "content", "extra", "qad.txt"), encoding="utf-8").read().splitlines()):
    if not l.strip(): continue
    th, lvl, cit, a1, w1, w2, w3, exp = l.split("|")
    assert len({a1, w1, w2, w3}) == 4, l
    Q[f"qad{i+1:02d}"] = [th, int(lvl), [a1, w1, w2, w3], exp.strip(), cit.strip(), "", {"t":"quote"}]
# Questions de la Tour : tranche|thème|question|bonne réponse|faux 1|faux 2|faux 3|explication (tranche 1 = étages 1-10 … 10 = étages 91-100)
# Ajouter les nouvelles À LA FIN (l'identifiant tw001, tw002… dépend du numéro de ligne)
_tp = os.path.join(base, "content", "extra", "tour.txt")
# Niveau réel de chaque question de la Tour (A à E, X = retirée) : content/extra/tour_niveaux.txt, utilisé pour le tirage des étages
_tn = os.path.join(base, "content", "extra", "tour_niveaux.txt")
TWN = dict(l.split("|") for l in open(_tn, encoding="utf-8").read().splitlines() if l.strip() and not l.startswith("#")) if os.path.exists(_tn) else {}
if os.path.exists(_tp):
    for i, l in enumerate(l for l in open(_tp, encoding="utf-8").read().splitlines() if l.strip() and not l.startswith("#")):
        b, th, q, a1, w1, w2, w3, exp = l.split("|")
        assert 1 <= int(b) <= 10 and len({a1, w1, w2, w3}) == 4, l
        k = f"tw{i+1:03d}"; d = TWN.get(k, "C"); assert d in "ABCDEX", (k, d)
        Q[k] = [th, 3 if int(b) > 4 else 2 if int(b) > 2 else 1, [a1, w1, w2, w3], exp.strip(), q.strip(), "", {"t":"tower", "b":int(b), "d":d}]
# Questions très difficiles du Portail (événement) : jamais posées dans les autres modes
for i, l in enumerate(l for l in open(os.path.join(base, "content", "extra", "portail.txt"), encoding="utf-8").read().splitlines() if l.strip()):
    th, q, a1, w1, w2, w3, exp = l.split("|")
    Q[f"pt{i+1:03d}"] = [th, 3, [a1, w1, w2, w3], exp.strip(), q.strip(), "", {"t":"portal"}]
data = "const Q = " + json.dumps(Q, ensure_ascii=False, separators=(",", ":")) + ";\n"
data += open(os.path.join(base, "extra.js"), encoding="utf-8").read()
data += "\n" + open(os.path.join(base, "content", "geodata.js"), encoding="utf-8").read()
# Dates du mode « Plus ou moins » (salons privés) : thème|question|année|explication — ajouter à la fin
DATES = [l.split("|") for l in open(os.path.join(base, "content", "extra", "dates.txt"), encoding="utf-8").read().splitlines() if l.strip()]
assert all(len(d) == 4 and d[2].lstrip("-").isdigit() for d in DATES), "dates.txt : ligne invalide"
DATES = [[d[0], d[1], int(d[2]), d[3]] for d in DATES]
MOTS = [l.split("|") for l in open(os.path.join(base, "content", "extra", "mots.txt"), encoding="utf-8").read().splitlines() if l.strip()]
assert all(len(m) == 4 for m in MOTS)
data += "\nconst MOTS = " + json.dumps(MOTS, ensure_ascii=False) + ";\n"
data += "const DATES = " + json.dumps(DATES, ensure_ascii=False, separators=(",", ":")) + ";\n"
html = open(os.path.join(base, "app.html"), encoding="utf-8").read().replace("/*__DATA__*/", data)
rd = lambda p: open(os.path.join(base, p), encoding="utf-8").read()
html = html.replace("/*__ART__*/", rd("atelier/creatures2.js") + "\n" + rd("atelier/rixy.js") + "\n" + rd("atelier/badges.js") + "\n" + rd("atelier/badges2.js") + "\n" + rd("atelier/skins.js") + "\n" + rd("atelier/acc.js") + "\n" + rd("atelier/toy.js") + "\n" + rd("atelier/toy_skins.js") + "\n" + rd("atelier/toy_acc.js") + "\n" + rd("atelier/toy_stars.js") + "\n" + rd("atelier/toy_portail.js") + "\n" + rd("atelier/toy_halloween.js") + "\n" + rd("atelier/toy_legends.js") + chr(10) + rd("atelier/toy_events.js") + chr(10) + rd("atelier/toy_pets.js") + chr(10) + rd("atelier/gicons.js") + chr(10) + rd("atelier/profil_art.js") + chr(10) + rd("content/atlas_data.js"))
html = html.replace("/*__MUSIC__*/", rd("music.js")).replace("/*__SPLASH__*/", rd("splash.js"))
html = html.replace("/*__MAIN__*/", open(os.path.join(base, "main.js"), encoding="utf-8").read() + "\n" + open(os.path.join(base, "profil.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "atlas.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "amis.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "salons.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "tour.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "boss.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "quetes.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "guildes.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "boutique.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "calendrier.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "familiers.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "evenements_data.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "evenements.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "casino.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "musique_fichiers.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "tuto.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "aventure.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "aventure_m2.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "aventure_m3.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "aventure_m4.js"), encoding="utf-8").read() + chr(10) + open(os.path.join(base, "aventure_m5.js"), encoding="utf-8").read())
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(base, "chevet.html")
open(out, "w", encoding="utf-8").write(html)
print(len(Q), "questions ->", out, round(len(html)/1024), "Ko")
