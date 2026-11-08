/* ---------- Musique d'ambiance générée ---------- */
const Music = (function(){
  let ctx = null, master = null, timer = null, next = 0, step = 0, mode = "calm";
  const SPB = 60/76/2, SPB_T = 60/140/2;
  // Mode tension : la mineur, basse pulsée, tic-tac d'horloge
  const TCH = [[45,48,52],[45,48,52],[41,45,48],[40,44,47]];
  const CH = [[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,55]];
  const ARP = [0,1,2,3,2,1,3,2];
  const MEL = [72,null,71,null,67,null,69,null, 69,null,67,64,null,null,64,null, 65,null,64,null,60,null,62,null, 62,64,null,67,null,null,null,null];
  const hz = n => 440*Math.pow(2,(n-69)/12);
  const vol = () => (window.__app ? window.__app.state().settings.vol : 55) / 100 * .8;
  function tone(n, t, dur, type, gain, attack){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = hz(n);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t+(attack||.01)); g.gain.exponentialRampToValueAtTime(.0008, t+dur);
    o.connect(g).connect(master); o.start(t); o.stop(t+dur+.05);
  }
  function schedule(){
    while (next < ctx.currentTime + .25) {
      if (mode === "tense") {
        const c = TCH[Math.floor(step/8) % 4], i = step % 8;
        tone(c[0]-12, next, SPB_T*.9, "sawtooth", .045, .004);
        if (i % 2 === 0) tone(c[(i/2) % 3]+24, next, .16, "square", .02, .004);
        else tone(c[1]+36, next, .07, "triangle", .018, .002);
        tone(i % 2 ? 100 : 93, next, .035, "sine", i % 2 ? .02 : .04, .001);
        if (i === 0) c.forEach(n => tone(n+12, next, SPB_T*8, "triangle", .02, .15));
        next += SPB_T; step++; continue;
      }
      const c = CH[Math.floor(step/8) % 4], i = step % 8;
      tone(c[ARP[i]]+12, next, 1.1, "sine", .07);
      if (i === 0) { c.forEach(n => tone(n, next, SPB*8, "triangle", .025, .4)); tone(c[0]-12, next, SPB*7, "sine", .12, .05); }
      if (i === 4) tone(c[2]-12, next, SPB*3.5, "sine", .07, .05);
      const m = MEL[step % 32]; if (m && Math.floor(step/32) % 2 === 1) tone(m, next, .9, "sine", .06, .02);
      next += SPB; step++;
    }
  }
  function start(){
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0;
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400; const dl = ctx.createDelay(); dl.delayTime.value = SPB*3; const fb = ctx.createGain(); fb.gain.value = .25;
        master.connect(lp); lp.connect(ctx.destination); lp.connect(dl); dl.connect(fb).connect(dl); dl.connect(ctx.destination); }
      if (navigator.audioSession) navigator.audioSession.type = "playback";
      ctx.resume(); master.gain.setTargetAtTime(vol(), ctx.currentTime, .4);
      if (!timer) { next = ctx.currentTime + .05; timer = setInterval(schedule, 60); schedule(); }
    } catch(e){}
  }
  function stop(){ if (!ctx) return; master.gain.setTargetAtTime(0, ctx.currentTime, .3); clearInterval(timer); timer = null; }
  function volume(v){ if (ctx && timer) master.gain.setTargetAtTime(v/100*.8, ctx.currentTime, .05); }
  // La musique démarre au premier geste, si elle est activée
  const first = () => { document.removeEventListener("pointerdown", first); if (window.__app && window.__app.state().settings.music) start(); };
  document.addEventListener("pointerdown", first);
  // Petits effets : bonne réponse, combo, erreur
  function sfx(k){
    try {
      if (!ctx) { start(); if (!(window.__app && window.__app.state().settings.music)) stop(); }
      if (!ctx) return; ctx.resume();
      const t = ctx.currentTime + .01, out = ctx.destination, v = (window.__app ? window.__app.state().settings.vol : 55)/100*.5;
      const blip = (n, at, dur, type, gain) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = hz(n);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(gain*v, at+.008); g.gain.exponentialRampToValueAtTime(.0005, at+dur); o.connect(g).connect(out); o.start(at); o.stop(at+dur+.05); };
      if (k === "ok") { blip(76, t, .14, "triangle", .5); blip(83, t+.08, .22, "triangle", .5); }
      else if (k === "combo") { blip(76, t, .12, "triangle", .5); blip(80, t+.06, .12, "triangle", .5); blip(83, t+.12, .14, "triangle", .5); blip(88, t+.18, .28, "sine", .55); }
      else if (k === "level") { [72,76,79,84].forEach((n,i) => blip(n, t+i*.09, .2, "triangle", .5)); [84,88,91].forEach(n => blip(n, t+.4, .9, "sine", .32)); blip(96, t+.55, .35, "sine", .22); blip(100, t+.68, .5, "sine", .2); }
      else if (k === "ko") { blip(52, t, .18, "square", .18); blip(47, t+.12, .3, "square", .18); }
    } catch(e){}
  }
  function setMode(m){ if (m === mode) return; mode = m; step = 0; }
  return {start, stop, volume, mode:setMode, sfx};
})();
