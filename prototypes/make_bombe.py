# Construit le prototype « Salons privés + La Bombe » (prototypes/bombe.html) à partir de dist/lumen.html.
# Amis simulés, aucune connexion au vrai serveur, sauvegarde séparée. Jamais publié dans l'appli.
import os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(base, "dist", "lumen.html"), encoding="utf-8").read()
proto = open(os.path.join(base, "prototypes", "bombe_proto.js"), encoding="utf-8").read()
for a, b in [('for (const m of ["app", "auth", "firestore"])', 'for (const m of [])'),
             ('const KEY = "chevet.v2"', 'const KEY = "lumen.proto.bombe"')]:
    if a not in html: raise SystemExit("introuvable : " + a)
    html = html.replace(a, b, 1)
html = html.replace("<title>Lumen</title>", "<title>La Bombe Lumen</title>", 1)
html = "<script>window.__noPortal = true;</script>\n" + html + "\n<script>\n" + proto + "\n</script>\n"
open(os.path.join(base, "prototypes", "bombe.html"), "w", encoding="utf-8").write(html)
print("prototypes/bombe.html prêt")
