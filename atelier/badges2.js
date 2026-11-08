/* Badges v2 : chaque palier monte d'un cran, jusqu'au rang Maître façon prestige */
let BU = 0;
const bid = () => "x" + (BU++);
function iconAt(icon, size, fill, extra){ const s = size/40; return `<g transform="translate(${100-size/2} ${100-size/2}) scale(${s})" fill="${fill}" ${extra||""}>${ICONS[icon]}</g>`; }
function ring(n, R, r, rot){ let d = ""; for (let i=0;i<n;i++){ const a = 2*Math.PI*i/n + (rot||0); d += (i?"L":"M")+(100+R*Math.cos(a)).toFixed(1)+" "+(100+R*Math.sin(a)).toFixed(1); if (r) { const b = a + Math.PI/n; d += "L"+(100+r*Math.cos(b)).toFixed(1)+" "+(100+r*Math.sin(b)).toFixed(1); } } return d+"Z"; }
function arcSeg(r, a0, a1){ const p = a => [(100+r*Math.cos(a)).toFixed(1), (100+r*Math.sin(a)).toFixed(1)]; const [x0,y0] = p(a0), [x1,y1] = p(a1); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; }
const mirror = s => `${s}<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
function laurel(col, dark, from, to, r){
  let s = ""; const n = 9;
  for (let i=0;i<n;i++){ const a = (from + (to-from)*i/(n-1))*Math.PI/180, x = 100+r*Math.cos(a), y = 100+r*Math.sin(a), deg = a*180/Math.PI + 90;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="9" fill="${col}" stroke="${dark}" stroke-width="1" transform="rotate(${(deg-35).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
  return s;
}
function sparkle(x, y, s, cls){ return `<path class="${cls||""}" d="M${x} ${y-s} Q${x} ${y} ${x+s} ${y} Q${x} ${y} ${x} ${y+s} Q${x} ${y} ${x-s} ${y} Q${x} ${y} ${x} ${y-s}Z" fill="#fff"/>`; }
function ribbon(id, a, b, wide){
  const w = wide ? 1.3 : 1;
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
  <path d="M${100-18*w} 130 L${100-34*w} 186 L${100-20*w} 176 L${100-12*w} 192 L${100-2} 140Z M${100+18*w} 130 L${100+34*w} 186 L${100+20*w} 176 L${100+12*w} 192 L${100+2} 140Z" fill="url(#${id})" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`;
}

const DRAW = {
  bronze(icon){ const g = bid(), m = bid();
    return `<defs><radialGradient id="${g}" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#D49A6A"/><stop offset=".6" stop-color="#9A6238"/><stop offset="1" stop-color="#5A3418"/></radialGradient>
      <mask id="${m}"><rect width="200" height="200" fill="#fff"/><path d="M134 62 l14 -6 l-2 14 l-8 2z" fill="#000"/></mask></defs>
    ${ribbon(bid(), "#A0524A", "#6A2E28")}
    <g mask="url(#${m})"><circle cx="100" cy="100" r="46" fill="url(#${g})" stroke="#4A2A12" stroke-width="2.4"/>
      <circle cx="100" cy="100" r="38" fill="none" stroke="#5A3418" stroke-width="2" opacity=".7"/>
      <circle cx="78" cy="118" r="6" fill="#6E9A7A" opacity=".35"/><circle cx="124" cy="84" r="4" fill="#6E9A7A" opacity=".3"/>
      <path d="M70 80 l18 10 M112 124 l16 -6 M84 132 l8 -4" stroke="#E8B48A" stroke-width="1" opacity=".5"/></g>
    ${iconAt(icon, 40, "#4A2A12", 'opacity=".85"')}`; },

  argent(icon){ const g = bid(), r = bid();
    return `<defs><radialGradient id="${g}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#C9D1DC"/><stop offset="1" stop-color="#6E7A8C"/></radialGradient>
      <linearGradient id="${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F7FB"/><stop offset=".5" stop-color="#7D8899"/><stop offset="1" stop-color="#E4E9F0"/></linearGradient></defs>
    ${ribbon(bid(), "#5AA9F0", "#2A6AB8")}
    ${laurel("#D8DEE6", "#6E7A8C", 120, 200, 56)}${laurel("#D8DEE6", "#6E7A8C", 60, -20, 56)}
    <circle cx="100" cy="100" r="50" fill="url(#${r})" stroke="#5A6678" stroke-width="2"/>
    <circle cx="100" cy="100" r="49" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 3" opacity=".5"/>
    <circle cx="100" cy="100" r="40" fill="url(#${g})" stroke="#7D8899" stroke-width="1.5"/>
    ${iconAt(icon, 42, "rgba(255,255,255,.8)", 'transform-origin="0 0"').replace('translate(79 79)','translate(80.2 80.4)')}${iconAt(icon, 42, "#566274")}
    <path d="${arcSeg(44, 3.5, 4.6)}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>${sparkle(140, 62, 7)}`; },

  or(icon){ const g = bid(), r = bid(), ray = bid();
    let rays = ""; for (let i=0;i<24;i++){ const a = i*15*Math.PI/180, a2 = a + 5*Math.PI/180; rays += `M100 100 L${(100+92*Math.cos(a)).toFixed(1)} ${(100+92*Math.sin(a)).toFixed(1)} L${(100+92*Math.cos(a2)).toFixed(1)} ${(100+92*Math.sin(a2)).toFixed(1)}Z`; }
    return `<defs><radialGradient id="${g}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#FFF7C0"/><stop offset=".5" stop-color="#F2C440"/><stop offset="1" stop-color="#9A6A08"/></radialGradient>
      <linearGradient id="${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".5" stop-color="#B8820E"/><stop offset="1" stop-color="#FFE47A"/></linearGradient>
      <radialGradient id="${ray}"><stop offset=".3" stop-color="#FFE47A" stop-opacity=".8"/><stop offset="1" stop-color="#FFE47A" stop-opacity="0"/></radialGradient></defs>
    <path d="${rays}" fill="url(#${ray})" class="spin slow"/>
    ${ribbon(bid(), "#E2483E", "#8A1A14", true)}
    ${laurel("#F2C440", "#8A5A08", 115, 215, 62)}${laurel("#F2C440", "#8A5A08", 65, -35, 62)}
    <path d="${ring(16, 58, 50, -Math.PI/2)}" fill="url(#${r})" stroke="#7A5208" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="44" fill="#B8820E" stroke="#7A5208" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="39" fill="url(#${g})"/>
    ${iconAt(icon, 44, "#FFF4C0").replace(/translate\(78 78\)/,'translate(79.4 79.6)')}${iconAt(icon, 44, "#8A5A08")}
    <path d="M100 38 l7 9 l-7 9 l-7 -9z" fill="#E2323A" stroke="#7A0E18" stroke-width="1.4"/><path d="M100 38 l-7 9 h7z" fill="#FF8A8A"/>
    <path d="${arcSeg(34, 3.6, 4.6)}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
    ${sparkle(146, 58, 8, "tw")}${sparkle(54, 140, 5, "tw d2")}`; },

  platine(icon){ const g = bid(), fr = bid(), feather = bid(), face = bid();
    const wing = `<g>${[0,1,2,3,4].map(k => `<path d="M66 100 C46 ${82-k*2} ${24-k*3} ${70-k*7} ${6-k*2} ${70-k*10} C${22-k*2} ${84-k*6} ${40-k} ${94-k*3} 66 106Z" fill="url(#${feather})" stroke="#6A8CA0" stroke-width="1.2" opacity="${1-k*.08}"/>`).reverse().join("")}</g>`;
    const segs = [["#B8F0FF",0],["#C9A8FF",1],["#FFE6A8",2],["#B8F0FF",3],["#C9A8FF",4],["#FFE6A8",5]].map(([c,i]) => `<path d="${arcSeg(47, i*Math.PI/3+.06, (i+1)*Math.PI/3-.06)}" stroke="${c}" stroke-width="7" fill="none"/>`).join("");
    const gems = [0,1,2,3,4,5].map(i => { const a = i*Math.PI/3 - Math.PI/2, x = 100+64*Math.cos(a), y = 100+64*Math.sin(a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#B57CF2" stroke="#4A2A9A" stroke-width="1.2"/><circle cx="${(x-1.4).toFixed(1)}" cy="${(y-1.6).toFixed(1)}" r="1.4" fill="#fff"/>`; }).join("");
    return `<defs><linearGradient id="${feather}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#BFDDE8"/></linearGradient>
      <linearGradient id="${fr}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6FDFF"/><stop offset=".5" stop-color="#7EB4C8"/><stop offset="1" stop-color="#E4F6FC"/></linearGradient>
      <radialGradient id="${face}" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3A3A8A"/><stop offset="1" stop-color="#14123A"/></radialGradient></defs>
    <circle cx="100" cy="100" r="78" fill="#BFF4FF" opacity=".35" filter="url(#bglow)" class="pulse"/>
    ${ribbon(bid(), "#8E5BD8", "#3A1A7A", true)}
    ${mirror(wing)}
    <path d="M100 26 l6 10 h-12z M88 30 l4 8 h-6z M112 30 l2 8 h-6z" fill="url(#${fr})" stroke="#3E7A92" stroke-width="1.2"/>
    <path d="${ring(6, 70, 0, -Math.PI/2)}" fill="url(#${fr})" stroke="#2E5A6E" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="${ring(6, 60, 0, -Math.PI/2)}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>
    ${gems}
    <circle cx="100" cy="100" r="52" fill="#20204E"/>${segs}
    <circle cx="100" cy="100" r="42" fill="url(#${face})"/>
    ${iconAt(icon, 46, "#9FF2FF", 'filter="url(#bglow2)" opacity=".9"')}${iconAt(icon, 46, "#F2FEFF")}
    ${sparkle(150, 46, 8, "tw")}${sparkle(48, 60, 6, "tw d2")}${sparkle(156, 140, 5, "tw d3")}`; },

  diamant(icon){ const fr = bid(), face = bid(), ray = bid(), cr = bid(), seg = bid();
    let rays = ""; for (let i=0;i<16;i++){ const a = i*22.5*Math.PI/180, a2 = a + 3*Math.PI/180; rays += `M100 100 L${(100+100*Math.cos(a)).toFixed(1)} ${(100+100*Math.sin(a)).toFixed(1)} L${(100+100*Math.cos(a2)).toFixed(1)} ${(100+100*Math.sin(a2)).toFixed(1)}Z`; }
    const shards = [[-74,-46],[-90,-16],[-86,14],[-70,40],[-50,56]].map(([dx,dy],i) => `<polygon points="70,${94+i*3} ${(70+dx).toFixed(0)},${(100+dy).toFixed(0)} ${(80+dx*.4).toFixed(0)},${(104+dy*.3+6).toFixed(0)}" fill="url(#${cr})" stroke="#1E6AB0" stroke-width="1.2" stroke-linejoin="round" opacity=".92"/>`).join("");
    const facets = Array.from({length:8},(_,i)=>{ const a = 2*Math.PI*i/8 + Math.PI/8; return `<path d="M${(100+52*Math.cos(a)).toFixed(1)} ${(100+52*Math.sin(a)).toFixed(1)} L${(100+74*Math.cos(a)).toFixed(1)} ${(100+74*Math.sin(a)).toFixed(1)}" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>`; }).join("");
    const segs = Array.from({length:8},(_,i)=>`<path d="${arcSeg(50, i*Math.PI/4+.05, (i+1)*Math.PI/4-.05)}" stroke="${["#7FF2FF","#C9A8FF","#FFF0A8","#7FD3FF"][i%4]}" stroke-width="7" fill="none"/>`).join("");
    return `<defs><linearGradient id="${fr}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FBFF"/><stop offset=".35" stop-color="#7FD3FF"/><stop offset=".7" stop-color="#2C7FC0"/><stop offset="1" stop-color="#BFF0FF"/></linearGradient>
      <linearGradient id="${cr}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#4FB8F0" stop-opacity=".8"/></linearGradient>
      <radialGradient id="${face}" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#1E5AB0"/><stop offset="1" stop-color="#081A44"/></radialGradient>
      <radialGradient id="${ray}"><stop offset=".25" stop-color="#9FF2FF" stop-opacity=".9"/><stop offset="1" stop-color="#9FF2FF" stop-opacity="0"/></radialGradient></defs>
    <circle cx="100" cy="100" r="86" fill="#7FE6FF" opacity=".45" filter="url(#bglow)" class="pulse"/>
    <path d="${rays}" fill="url(#${ray})" class="spin"/>
    ${ribbon(bid(), "#3FD8C8", "#0A5A62", true)}
    ${mirror(shards)}
    <path d="M100 6 l12 20 l-12 12 l-12 -12z" fill="url(#${cr})" stroke="#1E6AB0" stroke-width="1.4"/><path d="M80 18 l8 14 l-8 8 l-6 -10z M120 18 l-8 14 l8 8 l6 -10z" fill="url(#${cr})" stroke="#1E6AB0" stroke-width="1.2"/>
    <path d="${ring(8, 76, 0, Math.PI/8)}" fill="url(#${fr})" stroke="#0E4A8A" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="${ring(8, 66, 0, Math.PI/8)}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>${facets}
    <circle cx="100" cy="100" r="56" fill="#0E2A60"/>${segs}
    <circle cx="100" cy="100" r="44" fill="url(#${face})"/>
    <circle cx="100" cy="100" r="26" fill="#7FE6FF" opacity=".35" filter="url(#bglow)"/>
    ${iconAt(icon, 48, "#7FF2FF", 'filter="url(#bglow2)"')}${iconAt(icon, 48, "#FFFFFF")}
    ${sparkle(158, 40, 10, "tw")}${sparkle(40, 54, 7, "tw d2")}${sparkle(166, 128, 6, "tw d3")}${sparkle(30, 140, 5, "tw")}`; },

  maitre(icon){ const fl = bid(), fl2 = bid(), wingG = bid(), gold = bid(), core = bid(), molten = bid();
    let flames = "", flames2 = "";
    for (let i=0;i<22;i++){ const a = i*2*Math.PI/22 - Math.PI/2, a2 = a + Math.PI/22, a3 = a + 2*Math.PI/22, len = 92 + (i%3)*8 - (i%2)*6;
      flames += `${i?"L":"M"}${(100+62*Math.cos(a)).toFixed(1)} ${(100+62*Math.sin(a)).toFixed(1)} Q${(100+(len-10)*Math.cos(a2-.05)).toFixed(1)} ${(100+(len-10)*Math.sin(a2-.05)).toFixed(1)} ${(100+len*Math.cos(a2+.04)).toFixed(1)} ${(100+len*Math.sin(a2+.04)).toFixed(1)} Q${(100+70*Math.cos(a2+.1)).toFixed(1)} ${(100+70*Math.sin(a2+.1)).toFixed(1)} ${(100+62*Math.cos(a3)).toFixed(1)} ${(100+62*Math.sin(a3)).toFixed(1)} `; }
    const wing = `<path d="M70 94 C52 58 22 40 0 44 C8 54 10 62 6 72 C18 66 24 72 22 82 C32 74 40 80 40 92 C46 84 56 88 62 104Z" fill="url(#${wingG})" stroke="#0A0004" stroke-width="1.6" stroke-linejoin="round"/><path d="M70 94 L4 48 M68 96 L8 70 M66 98 L24 82 M64 100 L40 92" stroke="#E2323A" stroke-width="1" opacity=".6"/>`;
    const horn = `<path d="M82 46 C74 26 60 14 42 12 C54 22 62 34 68 58Z" fill="url(#${gold})" stroke="#4A2A04" stroke-width="1.4"/><path d="M70 24 l4 6 M64 18 l3 6" stroke="#4A2A04" stroke-width="1"/>`;
    const embers = [[40,40],[160,36],[150,150],[54,160],[100,10],[176,96]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${2+i%2}" fill="#FFB13B" class="ember d${i%3+1}"/>`).join("");
    return `<defs><radialGradient id="${fl}" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#FFD36A"/><stop offset=".75" stop-color="#FF5A1E"/><stop offset="1" stop-color="#8A0A0A"/></radialGradient>
      <radialGradient id="${fl2}" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#FFF2A0"/><stop offset="1" stop-color="#FF8A2A"/></radialGradient>
      <linearGradient id="${wingG}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A0E18"/><stop offset="1" stop-color="#14020A"/></linearGradient>
      <linearGradient id="${gold}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".5" stop-color="#E0A21A"/><stop offset="1" stop-color="#6A4004"/></linearGradient>
      <radialGradient id="${core}" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#FF5A3A"/><stop offset=".6" stop-color="#9A0A14"/><stop offset="1" stop-color="#2A0208"/></radialGradient>
      <linearGradient id="${molten}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB13B"/><stop offset=".5" stop-color="#E2323A"/><stop offset="1" stop-color="#FFD36A"/></linearGradient></defs>
    <circle cx="100" cy="100" r="92" fill="#E2323A" opacity=".55" filter="url(#bglow)" class="pulse"/>
    ${mirror(wing)}
    <g class="flick"><path d="${flames}Z" fill="url(#${fl})"/></g>
    <g class="flick d2"><path d="${flames}Z" fill="url(#${fl2})" transform="translate(100 100) scale(.8) translate(-100 -100)" opacity=".7"/></g>
    ${mirror(horn)}
    <path d="${ring(12, 72, 56, -Math.PI/2)}" fill="#1A0408" stroke="#E2323A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="56" fill="url(#${gold})" stroke="#4A2A04" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="51" fill="none" stroke="#4A2A04" stroke-width="2" stroke-dasharray="6 3 1 3"/>
    <circle cx="100" cy="100" r="46" fill="none" stroke="url(#${molten})" stroke-width="6"/>
    <circle cx="100" cy="100" r="42" fill="url(#${core})"/>
    <circle cx="100" cy="100" r="22" fill="#FF3A2A" opacity=".55" filter="url(#bglow)" class="pulse"/>
    ${iconAt(icon, 48, "#FFB13B", 'filter="url(#bglow2)"')}${iconAt(icon, 48, "#1A0408", 'stroke="#FFD36A" stroke-width="1.4"')}
    <path d="M60 176 L140 176 L132 190 L140 204 L60 204 L68 190Z" fill="#1A0408" stroke="url(#${gold})" stroke-width="2"/>
    <text x="100" y="195" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="14" letter-spacing="3" fill="#FFD36A">MAÎTRE</text>
    ${embers}`; }
};
const BADGE_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="bglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="bglow2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs></svg>`;
function badge2(tier, icon, size){ return `<svg viewBox="-6 -6 212 216" width="${size}" height="${size*216/212}" class="bdg" aria-hidden="true" overflow="visible">${DRAW[tier](icon)}</svg>`; }
