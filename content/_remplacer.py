# Réécrit des questions SUR PLACE (même numéro de ligne, donc même identifiant) : jamais d'insertion ni de suppression.
# Usage : python content/_remplacer.py theme fichier_de_remplacements   (lignes « numéro>nouvelle ligne »)
import io, os, sys
base = os.path.dirname(os.path.abspath(__file__))
th, src = sys.argv[1], sys.argv[2]
path = os.path.join(base, th + ".txt")
L = io.open(path, encoding="utf-8").read().splitlines()
n = 0
for line in io.open(src, encoding="utf-8").read().splitlines():
    if not line.strip() or line.startswith("#"): continue
    num, new = line.split(">", 1)
    f = len(new.split("|")); assert f in (5, 7), (num, f)
    L[int(num) - 1] = new.strip(); n += 1
io.open(path, "w", encoding="utf-8", newline="\n").write("\n".join(L) + "\n")
print(th, ":", n, "questions réécrites ;", len(L), "lignes (inchangé)")
