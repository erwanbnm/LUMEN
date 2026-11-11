/* ---------- Réglages des événements temporaires et des jetons rares (novembre 2026) ----------
   Ce fichier est lu à la fois par l'appli et par le serveur (functions/, copié au moment de l'envoi
   avec « npm run deploy-fn »). Pour lancer un nouvel événement : ajouter une entrée à la fin de EVENTS
   (nouvel id, dates, personnages, taux, fragments nécessaires), dessiner ses personnages dans
   atelier/toy_events.js, puis envoyer le serveur et l'appli. Les fragments déjà obtenus restent
   enregistrés par événement (id) : relancer un événement = réutiliser le même id avec de nouvelles dates. */
const EV_DATA = {
  EVENTS: [
    { id:"hw26", n:"La Nuit des Ombres", kicker:"Événement Halloween",
      d:"Halloween joue les prolongations ! Chaque bonne réponse peut te faire trouver un fragment de l'un des 4 personnages de la nuit. Réunis-en 6 du même pour l'adopter pour toujours.",
      start:"2026-11-11T00:00:00+01:00", end:"2026-11-30T23:59:59+01:00",
      rate:0.03, need:6, chars:["campeur", "zombie", "ev_pomme", "ev_carnet"], look:"halloween" }
  ],
  // Événements à défis (familiers) : progression comptée par le serveur ; à la fin, ce qui n'est pas fini s'arrête.
  // Pour les refaire revenir : ajouter une entrée avec un nouvel id (ou le même pour garder la progression) et de nouvelles dates.
  CHALLENGES: [
    { id:"fam1", n:"La Semaine des Familiers", kicker:"Événement de la semaine",
      d:"Deux défis, deux familiers exclusifs. Ils ne s'achètent pas : relève les défis avant la fin de la semaine !",
      start:"2026-11-11T00:00:00+01:00", end:"2026-11-18T23:59:59+01:00",
      goals:[ {k:"q", n:2000, pet:"pet_scie", t:"Répondre à 2 000 questions", u:"questions"},
              {k:"spend", n:10000, pet:"pet_renne", t:"Dépenser 10 000 pièces", u:"pièces"} ] }
  ],
  DAY_ANS: 800,                                 // réponses comptées au plus par jour et par joueur
  SPEND_ONE: 10000, SPEND_DAY: 25000,           // plafonds des dépenses comptées (par achat, par jour)
  BETS: [25, 50, 100],                          // mises possibles en duel 1 contre 1
  // Jetons rares : un exemplaire maximum de chaque type
  TOKENS: { coin:{n:"Double pièces", dur:30}, xp:{n:"Double XP", dur:30}, fifty:{n:"Jeton 50/50"} },
  PRICE: 1000,                                  // prix en boutique de chaque jeton
  SWAP: 300,                                    // pièces données à la place d'un jeton déjà possédé
  TOWER: { 30:"fifty", 60:"xp", 90:"coin" },    // paliers de la Tour qui donnent un jeton (une seule fois par compte)
  BOSS_MIN: 5,                                  // PV de dégâts minimum sur un boss vaincu pour gagner un jeton (une fois par semaine)
  CAL: { 3:"xp", 4:"coin" }, CAL_SWAP: 100,     // cases du calendrier de connexion qui donnent un jeton
  DAY_MAX: 300                                  // tirages de fragments au plus par jour et par joueur
};
if (typeof module !== "undefined") module.exports = EV_DATA;
