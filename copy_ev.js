// Copie les réglages des événements dans functions/ avant chaque envoi du serveur
require("fs").copyFileSync(__dirname + "/evenements_data.js", __dirname + "/functions/evenements_data.js");
