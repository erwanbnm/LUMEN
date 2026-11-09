# Lumen — guide du projet pour Claude Code

Lumen est une appli de culture générale en français : « dormir moins bête le soir ».
Elle est utilisée par Erwan (le client et directeur du projet) et moins de 10 amis.
Réponds toujours en français. Erwan n'est pas développeur : explique simplement, et termine chaque réponse par un tout petit résumé de la méthode utilisée.

## Règles produit (à respecter)
- Pas de pub, pas de système d'énergie, gratuit. Aucun achat en argent réel : les pièces sont virtuelles (quiz, boutique, parc, casino).
- Personnages originaux uniquement : aucun personnage, logo ou mascotte existants. Pas de photos de vraies personnalités.
- Musique générée par le code ou libre de droits.
- Les erreurs ne reviennent pas le lendemain : elles vont dans « Revoir mes erreurs ».
- Le joker n'existe qu'en Survie et en Chrono. Il n'y a pas de deuxième amélioration du joker.
- L'âge est demandé : en dessous de 13 ans, on affiche moins de questions pointues.
- Peu de questions en images (drapeaux, silhouettes) : ne pas en ajouter en masse.
- Méthode de travail : toute grosse nouveauté ou gros changement visuel est d'abord montré sur une page à part (prototype). Erwan valide, puis on intègre.
- **Mode admin** (7 touches sur « À propos », pièces infinies) : Erwan a choisi de le garder pour lui dans la version partagée (novembre 2026). Ne pas le retirer sans qu'il le demande, ne pas le rendre plus visible. Il ne doit jamais influencer le classement ni les duels.
- **JcJ (mode en ligne)** : pas de système de demandes d'ami. Tous les joueurs inscrits se voient automatiquement (choix d'Erwan, novembre 2026 : petit groupe, plus simple). Les duels se jouent dans les vrais modes du jeu, avec les mêmes règles pour les deux joueurs (pas d'améliorations de boutique).

## Structure
- `app.html` : squelette, tout le CSS, le balisage. Contient les emplacements `/*__ART__*/`, etc., remplis par `build.py`.
- `main.js` : toute la logique de l'appli (état `S` sauvegardé dans localStorage sous `chevet.v2`, rendu, modes, missions, succès, boutique…).
- `amis.js` : mode en ligne (onglet Amis) avec Firebase : comptes pseudo + mot de passe, classement, défis personnalisés (ami, thème, 5/10/15/20 questions, en différé ou en direct), badges « En ligne ». `FIREBASE_CONFIG` en haut du fichier ; règles de sécurité dans `firestore.rules`. Ajouté après `main.js` par `build.py`.
- `salons.js` : salons privés de l'onglet JcJ (ajouté après `amis.js`, utilise `Amis.api`). Code de 4 lettres, invitations en pop-up, chat + émotes, 2 à 6 joueurs. Modes : **La Bombe** (3 cœurs, bonne réponse = on passe la bombe, mauvaise = la mèche brûle, la 4e erreur explose ; 10 s puis 8 s après 12 questions ; fin dès qu'un joueur n'a plus de cœur ou quitte ; l'hôte sert d'arbitre) et **Quiz à plusieurs** (10 à 50 questions, rythme commun calculé depuis l'heure de départ). Difficulté Facile/Normal/Difficile, tous les thèmes. Pas en solo (choix d'Erwan). Données : `rooms/{CODE}` + `rooms/{CODE}/chat` (règles dans `firestore.rules`). Firestore refuse les listes dans des listes. Badges `sl_*`.
- Duels : 10 s par question (`DUEL_Q` dans `main.js`), l'explication passe seule après 7 s. La couronne 👑 va au n°1 du classement « Cette semaine » (duels depuis lundi).
- `tour.js` : **La Tour** (7e et dernier onglet, choix d'Erwan). 100 étages, 1 question par étage, paliers tous les 10 (récompenses 20/50/100/100/100/100/300/300/300/1000, versées une seule fois : `S.tour.claimed`). Erreur ou temps écoulé : retour au dernier palier, sans vies. Recharger en pleine montée = chute. Classement de la semaine dans l'onglet (`st.tw` publié par `ping`). Questions : `content/extra/tour.txt` (tranche|thème|question|…, réservées à la Tour, ajouter à la fin) + questions des thèmes (niveau 1 → étages 1-20, 2 → 11-40, 3 → 31-60) ; les étages 61-100 n'ont que des questions de la Tour. Titre spécial « MAÎTRE DE LA TOUR » à l'étage 100. Musique `Music.mode("tower")`.
- `atelier/toy_halloween.js` : 4 skins d'Halloween (clins d'œil sans noms de marque), en vente du 1er octobre au 30 novembre.
- Notifications : `notifs/send.js` (firebase-admin), lancé toutes les 10 min par `.github/workflows/notifs.yml` avec le secret GitHub `FIREBASE_SA` (jamais dans le code). Défi du jour ~8 h, rappel ~16 h (texte « Viens te cultiver si tu veux pas finir comme Dwayne ! », voulu par Erwan), rappel envoyé à tout le monde, défis des amis avec quelques minutes de retard. L'appli enregistre les appareils dans `tokens/{uid}` (clé publique `VAPID` dans `amis.js`) ; `web/sw.js` affiche les notifications. Test : modifier et envoyer `notifs/test.txt` (ou Actions > Notifications > Run workflow). Annonce à tout le monde : écrire le titre (1re ligne) et le texte (2e ligne) dans `notifs/annonce.txt`, puis l'envoyer sur GitHub.
- `music.js` : musique et effets sonores générés (Web Audio).
- `splash.js`, `extra.js` : animation de lancement, données supplémentaires (faits du jour, événements datés…).
- `atelier/` : dessins SVG en code (personnages, skins, accessoires, badges, icônes `gicons.js` avec `GI` et les icônes en relief `GI3`).
  - `atelier/toy.js` : **style « jouet » validé par Erwan** pour les personnages (même recette que `GI3` : contour `#2B1D3A` épais, copie sombre décalée vers le bas, dégradés verticaux, reflets blancs nets, silhouette trapue et déguisée). Contient le kit (`toy`, `tEyes`, `tGlow`…), les 15 personnages de base redessinés (`TOY_DRAW`, mêmes noms et même ordre pour ne pas casser les sauvegardes) et Somni (ajouté à la fin de `CHARS`). Tout nouveau personnage ou skin doit suivre ce style.
  - Animations des personnages : classes CSS dans `app.html` (section « Personnages animés ») : `tblink` (clignement), `tbreath` (respiration), `ta-*` (pluie, flamme, queue qui remue…), `so-*` (Somni s'endort avec des zzz). Les effets animés sont exclus du calcul de placement des accessoires (`charBox` dans `acc.js`).
  - `atelier/toy_skins.js` : les 27 skins de boutique et secrets redessinés (mêmes id, prix et conditions). `atelier/toy_acc.js` : les accessoires redessinés (mêmes id et prix) + les nouveaux, ajoutés à la fin de `ACC`. Les anciens dessins de `creatures2.js`, `skins.js`, `acc.js` sont remplacés au chargement : ne plus les modifier, travailler dans les fichiers `toy*.js`.
- `parc/game.js` + `parc/games.js` : le parc 3D (Three.js r128 via CDN). `make_parc.py` les transforme en `parc_app.js`, qui est intégré à l'appli.
- `content/*.txt` : un fichier par thème (20 thèmes). Une ligne par question :
  - `niveau|question|bonne réponse|faux 1|faux 2|faux 3|explication` (7 champs), ou
  - `niveau|question|bonne réponse|faux|explication` (5 champs, vrai/faux).
  - Niveau 1 = facile, 2 = moyen, 3 = pointu. Chaque thème doit garder au moins 25 questions de niveau 1 et 25 de niveau 3 (mode difficulté).
  - L'identifiant d'une question dépend de son numéro de ligne : **ajouter les nouvelles questions à la fin du fichier, ne jamais en insérer au milieu ni en supprimer** (sinon la progression sauvegardée des joueurs est décalée).
- `content/anec/` : anecdotes « Le savais-tu ? » (`numéro|texte`). `content/extra/mots.txt` : mots du jour. `content/extra/qad.txt` : citations « Qui a dit ? ».
- `content/geodata.js`, `content/geo_meta.py` : formes et données des pays pour les questions en images.
- `dist/lumen.html` : l'appli construite, en un seul fichier.
- `docs/` : la version installable (PWA) publiée par GitHub Pages, fabriquée par `make_web.py` à partir de `dist/lumen.html` : `index.html`, `manifest.webmanifest`, `sw.js` (hors connexion, modèle dans `web/sw.js`) et les icônes. Ne pas modifier `docs/` à la main.
- `web/` : sources de la PWA. `web/icon.html` dessine l'icône « Lu », `node web/make_icons.js` la rend en PNG dans `web/icons/`.
- `prototypes/` : prototypes à valider avant intégration (ex. `duels.html`, multijoueur ; `make_duels.py` le construit).
- Aperçu local : `node serve.js` sert `docs/` sur http://localhost:5173.
- Sous Windows, `python3` peut manquer : utiliser `python` (ou le chemin complet de Python 3.12).

## Commandes
- Construire : `npm run build` (équivaut à `python3 make_parc.py && python3 build.py dist/lumen.html`).
- Vérifier les questions (format, doublons) : `npm run check`. Doit afficher `erreurs 0`.
- Tester : `npm install`, puis `npx playwright install chromium` (une seule fois), puis `npm test`.
  - `tests/robot.js` joue tous les modes (mix, survie, revoir, série, chrono). Il ne doit afficher aucune erreur (`[]`).
  - `tests/nouveautes.js` vérifie la difficulté Expert, les succès, « Qui a dit ? » et le mot du jour. Les captures vont dans `tests/out/`.
- Après chaque changement : construire, lancer `npm run check` et `npm test`, puis regarder une capture d'écran avant de dire que c'est fini.

## Style (voir aussi la direction artistique du projet)
- Look « Bonbon » validé : violet profond et rose acidulé (`--lamp:#FF5FA2`, `--accent2:#FFD23F`), en sombre par défaut, et une version claire.
- Interface « jeu mobile » : cartes et boutons en relief qui s'enfoncent, icônes en relief (`GI3`) animées au toucher, avec étincelles.
- Polices : Bricolage Grotesque (titres), Literata (texte), IBM Plex Mono (étiquettes).

## Prochaines étapes prévues
1. Transformer Lumen en PWA installable (manifest, icône, service worker hors ligne) et l'héberger gratuitement (GitHub Pages ou Netlify).
2. Ajouter un mode 1v1 entre amis : d'abord en différé (mêmes 10 questions, chacun joue quand il veut), puis en temps réel. Backend gratuit envisagé : Firebase ou Supabase, avec un compte par ami (pseudo + mot de passe).
3. Plus tard : un .apk Android, de nouveaux thèmes, de nouveaux mondes dans le parc.
