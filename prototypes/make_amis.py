# Construit le prototype de l'onglet Amis (prototypes/amis.html) à partir de dist/lumen.html,
# avec un faux serveur et des amis simulés (prototypes/amis_fake.js). Jamais publié.
import os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(base, "dist", "lumen.html"), encoding="utf-8").read()
fake = open(os.path.join(base, "prototypes", "amis_fake.js"), encoding="utf-8").read()
import re
html = re.sub(r"const FIREBASE_CONFIG = (null|\{[^;]*?\});", "const FIREBASE_CONFIG = {}; // prototype : faux serveur", html, count=1)
for a, b in [
             ('for (const m of ["app", "auth", "firestore"])', 'for (const m of [])'),
             ('const KEY = "chevet.v2"', 'const KEY = "lumen.proto.amis"')]:
    if a not in html: raise SystemExit("introuvable : " + a)
    html = html.replace(a, b, 1)
html = html.replace("<script>", "<script>\n" + fake + "\n</script>\n<script>", 1)
open(os.path.join(base, "prototypes", "amis.html"), "w", encoding="utf-8").write(html)
print("prototypes/amis.html prêt")
