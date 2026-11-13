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
  TOWER: { 30:"fifty" },                        // palier de la Tour qui donne un jeton 50/50 (une seule fois par compte ; potions : REW.tour)
  BOSS_MIN: 5,                                  // PV de dégâts minimum sur un boss vaincu pour gagner un jeton (une fois par semaine)
  CAL: {}, CAL_SWAP: 100,                       // ancien calendrier (les cases sont maintenant dans REW.cal)
  // Quêtes de l'Aventure qui donnent une potion (une seule fois par compte ; déjà possédée = ADVQ_SWAP pièces)
  ADVQ: { f1_chrono:"fifty", d2_chrono:"fifty", a3_chrono:"fifty", g4_chrono:"fifty", m5_chrono:"fifty" }, ADVQ_SWAP: 100,
  DAY_MAX: 300,                                 // tirages de fragments au plus par jour et par joueur

  /* ---------- Potions à raretés (novembre 2026) : LA table unique des potions et de leurs récompenses ----------
     Effet toujours ×2 ; la rareté donne la durée. On en garde jusqu'à MAX par case (effet + rareté) ; case pleine = FULL pièces.
     Activer une potion ajoute sa durée à l'effet en cours, sans dépasser CAP minutes d'avance. Les potions ne périment jamais.
     Récompenses : p = potion « effet:rareté » (effet « ? » = au choix du joueur), c = pièces (versées par l'appli).
     Pour changer une récompense : modifier REW ici (appli et serveur la lisent tous les deux), puis envoyer le serveur et l'appli. */
  POT: { RAR:{ c:{n:"Commune", dur:30}, r:{n:"Rare", dur:60}, e:{n:"Épique", dur:120} },
    FX:{ xp:"Double XP", coin:"Double pièces" },
    MAX:20, CAP:180, FULL:{ c:100, r:250, e:600 }, PRICE:1000,
    DROP:{ rate:0.02, day:3, odds:[["c", 0.85], ["r", 0.13], ["e", 0.02]] },   // 2 % par bonne réponse, 3 par jour, une fois par question et par jour
    SURV_DAY:3 },                                                              // parties de Survie récompensées en potions par jour (épique : 1 par semaine)
  REW: {
    qd:{ 2:{p:"xp:c"}, 4:{p:"coin:c"} },                                       // quêtes du jour réussies (2e, 4e)
    qw:{ 3:{p:"xp:r"}, 5:{p:"coin:r"}, chest:{p:"?:e"} },                      // défis de la semaine réussis (3e, 5e) et coffre légendaire
    cal:{ 1:{c:100}, 2:{p:"xp:c"}, 3:{c:150}, 4:{p:"coin:c"}, 5:{c:150}, 6:{p:"xp:r"}, 7:{c:400}, 8:{p:"coin:c"}, 9:{c:150}, 10:{p:"xp:c"},
          11:{c:200}, 12:{p:"coin:r"}, 13:{c:250}, 14:{p:"xp:e", c:500} },
    surv:{ 5:{c:20}, 10:{p:"xp:c"}, 15:{c:50}, 20:{p:"coin:r"}, 30:{p:"xp:e"} },        // bonnes réponses dans une partie de Survie
    boss:{ 5:{p:"coin:c"}, 10:{p:"xp:c"}, 15:{c:200} },                                 // dégâts du combat du jour
    tour:{ 10:{p:"xp:c"}, 25:{p:"coin:c", c:150}, 50:{p:"xp:r"}, 75:{p:"coin:r"}, 100:{p:"xp:e"} },
    atl:{ 10:{c:50}, 25:{p:"xp:c"}, 50:{p:"coin:c", c:150}, 100:{p:"xp:r"}, 150:{p:"coin:r"}, 197:{p:"xp:e", c:500} },   // pays trouvés
    atc:{ 10:{c:50}, 25:{p:"coin:c"}, 50:{p:"xp:r"}, 100:{p:"coin:r"}, 150:{p:"xp:r", c:300}, 196:{p:"coin:e"} },        // capitales
    adv:{ f1_0:{p:"xp:c"}, f1_1:{p:"coin:c"}, f1_boss:{p:"xp:r"}, f1_stars:{p:"coin:r"},
          d2_0:{p:"xp:c"}, d2_1:{p:"coin:c"}, d2_boss:{p:"xp:r"}, d2_stars:{p:"coin:r"},
          a3_0:{p:"xp:c"}, a3_1:{p:"coin:c"}, a3_boss:{p:"xp:r"}, a3_stars:{p:"coin:r"},
          g4_0:{p:"xp:c"}, g4_1:{p:"coin:c"}, g4_boss:{p:"xp:r"}, g4_stars:{p:"coin:r"},
          m5_0:{p:"xp:c"}, m5_1:{p:"coin:c"}, m5_boss:{p:"xp:r"}, m5_stars:{p:"coin:e"} },     // quêtes de l'Aventure (monde 5 à 100 % = épique)
    bdg:{ all500:{p:"xp:r"}, all1000:{p:"coin:r"}, all2000:{p:"xp:e"}, all5000:{p:"coin:e"} },    // badges de bonnes réponses
    mst:{ 3:{p:"coin:c"}, 4:{p:"xp:r"}, 5:{p:"coin:r"}, 6:{p:"xp:e"}, 7:{p:"coin:e"} }           // rangs de maîtrise (Or… Légende), dans chaque domaine
  }
};
if (typeof module !== "undefined") module.exports = EV_DATA;
