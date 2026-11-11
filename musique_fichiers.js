/* ---------- Musiques en fichiers (choisies par Erwan, novembre 2026) ----------
   web/musique/ (copié dans docs/musique/) : monde1.mp3 à monde5.mp3 pour l'Aventure, tour1.mp3 à tour3.mp3 pour la Tour (enchaînées).
   Pendant qu'un fichier joue, la musique générée de l'appli (music.js) se tait ; si le fichier manque, elle reprend.
   main.js appelle MusiqueFichier.set(liste) à chaque affichage : la même liste ne relance pas le morceau. */
const MusiqueFichier = (() => {
  let audio = null, cur = "", list = [], idx = 0;
  const bad = {};
  const vol = () => Math.min(1, ((S.settings && S.settings.vol) || 55) / 100);
  const gen = on => { try { on ? (S.settings.music && Music.start()) : Music.stop(); } catch(e){} };
  function set(tracks){
    const want = tracks && S.settings && S.settings.music ? tracks.filter(t => !bad[t]) : [];
    const key = want.join("|");
    if (key === cur) { if (audio) audio.volume = vol(); return; }
    const had = !!audio; cur = key; if (audio) { audio.pause(); audio = null; }
    if (!want.length) { if (had) gen(true); return; }
    list = want; idx = Math.floor(Math.random() * list.length); play();
  }
  function play(){
    const src = list[idx], a = new Audio(src); audio = a; a.volume = vol(); a.loop = list.length === 1;
    a.addEventListener("playing", () => { if (audio === a) gen(false); });
    a.addEventListener("ended", () => { if (audio !== a) return; idx = (idx + 1) % list.length; play(); });
    a.addEventListener("error", () => { if (audio !== a) return; bad[src] = 1; list = list.filter(x => x !== src);
      if (list.length) { idx = idx % list.length; play(); } else { audio = null; cur = ""; gen(true); } });
    a.play().catch(() => {});
  }
  return {set, playing:() => !!audio};
})();
const TOUR_TRACKS = ["musique/tour1.mp3", "musique/tour2.mp3", "musique/tour3.mp3"];
