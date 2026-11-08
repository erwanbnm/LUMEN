# Fabrique la version « site installable » de Lumen dans docs/ (dossier publié par GitHub Pages).
# À lancer après build.py : python make_web.py
import json, os, shutil, hashlib
base = os.path.dirname(os.path.abspath(__file__))
site = os.path.join(base, "docs")
app = open(os.path.join(base, "dist", "lumen.html"), encoding="utf-8").read()
version = hashlib.sha1(app.encode("utf-8")).hexdigest()[:10]

head = """<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#241544">
<meta name="description" content="Lumen : la culture générale pour dormir moins bête le soir.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Lumen">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
"""
tail = """
<script>
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
</script>
</body></html>
"""
manifest = {
    "name": "Lumen", "short_name": "Lumen",
    "description": "La culture générale pour dormir moins bête le soir.",
    "lang": "fr", "start_url": "./", "scope": "./", "display": "standalone",
    "orientation": "portrait", "background_color": "#241544", "theme_color": "#241544",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
    ],
}
shutil.rmtree(site, ignore_errors=True)
os.makedirs(os.path.join(site, "icons"))
open(os.path.join(site, "index.html"), "w", encoding="utf-8").write(head + app + tail)
open(os.path.join(site, "manifest.webmanifest"), "w", encoding="utf-8").write(json.dumps(manifest, ensure_ascii=False, indent=2))
sw = open(os.path.join(base, "web", "sw.js"), encoding="utf-8").read().replace("__VERSION__", version)
open(os.path.join(site, "sw.js"), "w", encoding="utf-8").write(sw)
for f in os.listdir(os.path.join(base, "web", "icons")):
    shutil.copy(os.path.join(base, "web", "icons", f), os.path.join(site, "icons", f))
open(os.path.join(site, ".nojekyll"), "w").close()
print("docs/ prêt, version", version)
