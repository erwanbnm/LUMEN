/* ---------- Musique d'ambiance générée ---------- */
const Music = (function(){
  let ctx = null, master = null, timer = null, next = 0, step = 0, mode = "calm", heat = 0;
  const SPB = 60/76/2, SPB_T = 60/140/2, SPB_S = 60/132/2;
  // Mode « espion » (Survie, dernière vie) : ostinato en 7/8, sol mineur, caisse claire et petites cordes piquées
  const SPY = [43,43,46,48,43,43,41], SPY_HI = [[79,78,74,null,null,null,null],[null,null,null,null,77,74,72]];
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
  // Bruit blanc court (caisse claire, souffle)
  function noise(t, dur, gain, hp){
    const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate*dur), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = "highpass"; f.frequency.value = hp || 1800; g.gain.value = gain;
    s.connect(f).connect(g).connect(master); s.start(t);
  }
  // Battement de cœur grave (deux coups)
  function thump(t, gain){ [0, .16].forEach((d, k) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(k ? 62 : 70, t+d); o.frequency.exponentialRampToValueAtTime(38, t+d+.14);
    g.gain.setValueAtTime(0, t+d); g.gain.linearRampToValueAtTime(gain*(k ? .7 : 1), t+d+.008); g.gain.exponentialRampToValueAtTime(.0008, t+d+.2);
    o.connect(g).connect(master); o.start(t+d); o.stop(t+d+.25); }); }
  function schedule(){
    while (next < ctx.currentTime + .25) {
      if (mode === "spy") {
        const i = step % 7, bar = Math.floor(step/7);
        tone(SPY[i]-12, next, SPB_S*.7, "sawtooth", .06, .003);
        tone(SPY[i], next, SPB_S*.45, "square", .018, .002);
        if (i === 0 || i === 3 || i === 5) noise(next, .09, i === 0 ? .09 : .05);
        if (i === 0) tone(31, next, SPB_S*7, "sine", .09, .02);
        const hi = SPY_HI[bar % 2][i]; if (hi && bar % 4 >= 2) tone(hi, next, .14, "triangle", .045, .003);
        if (i === 0 && bar % 2 === 0) thump(next, .18);
        next += SPB_S; step++; continue;
      }
      if (mode === "panic") {
        // Chrono, dernières secondes : le tempo et la hauteur montent avec la chaleur (heat 0 → 1)
        const spb = 60/(150 + 110*heat)/2, i = step % 8, up = Math.floor(heat*5);
        tone(45+up-12, next, spb*.8, "sawtooth", .05, .003);
        tone(i % 2 ? 98 : 91, next, .03, "square", .022 + .02*heat, .001);
        if (i % 4 === 0) thump(next, .16 + .12*heat);
        if (i === 0) [57, 60, 64].forEach(n => tone(n+up, next, spb*8, "triangle", .018 + .02*heat, .1));
        if (heat > .6 && i % 2) noise(next, .04, .03 + .05*heat, 4000);
        next += spb; step++; continue;
      }
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
      if (k === "tap") { blip(84, t, .05, "sine", .18); }
      else if (k && k.startsWith("tab")) { const n = 72 + (+k.slice(3) || 0) * 2; blip(n, t, .07, "triangle", .32); blip(n + 7, t + .045, .12, "sine", .26); }
      else if (k === "exact") { [76,80,83,88,91].forEach((n,i) => blip(n, t+i*.06, .22, "triangle", .45)); }
      else if (k === "ok") { blip(76, t, .14, "triangle", .5); blip(83, t+.08, .22, "triangle", .5); }
      else if (k === "combo") { blip(76, t, .12, "triangle", .5); blip(80, t+.06, .12, "triangle", .5); blip(83, t+.12, .14, "triangle", .5); blip(88, t+.18, .28, "sine", .55); }
      else if (k === "level") { [72,76,79,84].forEach((n,i) => blip(n, t+i*.09, .2, "triangle", .5)); [84,88,91].forEach(n => blip(n, t+.4, .9, "sine", .32)); blip(96, t+.55, .35, "sine", .22); blip(100, t+.68, .5, "sine", .2); }
      else if (k === "ko") { blip(52, t, .18, "square", .18); blip(47, t+.12, .3, "square", .18); }
    } catch(e){}
  }
  function setMode(m){ if (m === mode) return; mode = m; step = 0; }
  function setHeat(h){ heat = Math.max(0, Math.min(1, h)); }
  // Tension sans musique : si la musique est coupée mais les effets activés, on garde le cœur qui bat
  let pulseT = null;
  function pulse(rate){
    clearTimeout(pulseT); if (!rate) return;
    const beat = () => { try { if (!ctx) { start(); if (!(window.__app && window.__app.state().settings.music)) stop(); }
      if (!timer) { // musique coupée : le cœur bat quand même (la musique, elle, l'intègre déjà)
      const t = ctx.currentTime + .01, v = (window.__app ? window.__app.state().settings.vol : 55)/100*.6;
      [0, .17].forEach((d, k) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(k ? 62 : 70, t+d); o.frequency.exponentialRampToValueAtTime(38, t+d+.14);
        g.gain.setValueAtTime(0, t+d); g.gain.linearRampToValueAtTime(v*(k ? .5 : .75), t+d+.008); g.gain.exponentialRampToValueAtTime(.0008, t+d+.2); o.connect(g).connect(ctx.destination); o.start(t+d); o.stop(t+d+.25); }); }
    } catch(e){} pulseT = setTimeout(beat, rate()); };
    beat();
  }
  return {start, stop, volume, mode:setMode, heat:setHeat, pulse, sfx};
})();
