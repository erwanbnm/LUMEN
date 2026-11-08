/* Créatures Chevet v2 : une silhouette par créature, ombrage en aplats + touche peinte (grain, bord vivant) */
let UID = 0;
const uid = p => p + (UID++);
const GLOBAL_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="paint" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="ng"/>
    <feComponentTransfer in="ng" result="nc"><feFuncR type="linear" slope=".28" intercept=".76"/><feFuncG type="linear" slope=".28" intercept=".76"/><feFuncB type="linear" slope=".28" intercept=".76"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
    <feComposite in="nc" in2="d" operator="in" result="g"/>
    <feBlend in="g" in2="d" mode="multiply"/>
  </filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
</defs></svg>`;

// Volume en aplats : couleur d'ombre, forme décalée en couleur de base, reflet flou, contour
function vol(d, c, hl, extra){
  const id = uid("c");
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>
  <path d="${d}" fill="${c.s}"/>
  <g clip-path="url(#${id})"><path d="${d}" fill="${c.b}" transform="translate(-5 -5)"/>${extra||""}
    <path d="${d}" fill="none" stroke="${c.l}" stroke-width="3" opacity=".4" transform="translate(-3.5 -3.5)"/>
    <path d="${d}" fill="none" stroke="rgba(20,8,40,.35)" stroke-width="7" filter="url(#soft)" transform="translate(3 4)"/>
    ${hl ? `<ellipse cx="${hl[0]}" cy="${hl[1]}" rx="${hl[2]}" ry="${hl[3]}" fill="${c.l}" opacity=".85" filter="url(#soft)"/>` : ""}</g>
  <path d="${d}" fill="none" stroke="${c.o}" stroke-width="2.3" stroke-linejoin="round"/>`;
}
const dotEye = (x, y, r, col) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.25}" fill="${col||"#1B1020"}"/><circle cx="${x-r*.35}" cy="${y-r*.5}" r="${r*.36}" fill="#fff"/>`;
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="2.4" fill="#FF7E98" opacity=".45" filter="url(#soft)"/>`;
const smile = (x, y, w, col) => `<path d="M${x-w} ${y} q${w} ${w*.8} ${w*2} 0" fill="none" stroke="${col||"#2A1418"}" stroke-width="1.8" stroke-linecap="round"/>`;
function starPts(cx, cy, n, R, r, rot){ let d = ""; for (let i=0;i<n*2;i++){ const a = Math.PI*i/n + (rot||0), rr = i%2 ? r : R; d += (i?"L":"M")+(cx+rr*Math.cos(a)).toFixed(1)+" "+(cy+rr*Math.sin(a)).toFixed(1); } return d+"Z"; }

const CREATURES = [
{ n:"Caillou", e:"Roche", tag:"rocher sur pattes", draw(){
  const o = "#4A3A30";
  const legs = [[38,90,"#8A8178"],[52,93,"#6E655C"],[70,93,"#6E655C"],[86,89,"#8A8178"]].map(([x,y,f])=>`<rect x="${x-6}" y="${y}" width="12" height="12" rx="5" fill="${f}" stroke="${o}" stroke-width="2"/>`).join("");
  return legs + `<polygon points="30,42 54,24 84,30 98,58 90,90 60,96 38,94 22,72" fill="#9C9288" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>
  <polygon points="30,42 54,24 84,30 72,46 42,52" fill="#C4BAAE"/><polygon points="84,30 98,58 90,90 74,82 72,46" fill="#7A7068"/><polygon points="22,72 30,42 42,52 40,80 38,94" fill="#8E847A"/>
  <polygon points="30,42 54,24 84,30 98,58 90,90 60,96 38,94 22,72" fill="none" stroke="${o}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M72 46 L74 82 M42 52 L72 46" stroke="${o}" stroke-width="1" opacity=".5"/><path d="M58 52 l4 8 l-3 6" stroke="${o}" stroke-width="1.2" fill="none"/>
  <ellipse cx="54" cy="36" rx="11" ry="4" fill="#fff" opacity=".35" filter="url(#soft)"/>
  <path d="M30 42 C34 32 44 26 54 24 C58 30 52 36 46 38 C42 46 34 46 30 42Z" fill="#6FAE4A" stroke="#3F6E2A" stroke-width="1.5"/><path d="M88 44 c4 2 6 8 4 12 c-3 -2 -6 -6 -4 -12z" fill="#6FAE4A" stroke="#3F6E2A" stroke-width="1.2"/>
  <path d="M48 30 C48 22 50 18 52 14" stroke="#3F6E2A" stroke-width="2" fill="none"/><path d="M52 15 C58 8 66 10 66 14 C60 18 55 17 52 15Z M51 16 C46 10 40 11 40 15 C44 18 48 18 51 16Z" fill="#8ED06A" stroke="#3F6E2A" stroke-width="1.3"/>
  ${dotEye(50,66,3.2)}${dotEye(70,64,3.2)}${blush(43,74)}${blush(77,72)}${smile(57,73,3.5)}`; } },

{ n:"Plouf", e:"Eau", tag:"goutte gélatineuse", draw(){
  const c = {b:"#4FA8EE", s:"#2D6FC8", l:"#D2F2FF", o:"#1E4E8E"};
  const d = "M12 94 C8 64 32 42 62 42 C92 42 114 64 108 94 C94 100 26 100 12 94Z";
  return vol("M4 88 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0Z", c, [10,84,3,2]) + vol("M104 82 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0Z", c, [109,79,2,1.5])
  + vol(d, c, [44,58,16,8], `<path d="M22 90 C40 97 80 97 100 88" stroke="#9FDCFF" stroke-width="3" fill="none" opacity=".75"/><circle cx="40" cy="82" r="3" fill="none" stroke="#CFF0FF" stroke-width="1.2"/><circle cx="88" cy="78" r="2" fill="none" stroke="#CFF0FF" stroke-width="1.2"/>`)
  + `<path d="M30 66 C34 55 46 49 58 48" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="66" cy="49" r="2.4" fill="#fff"/>
  ${dotEye(50,72,2.8,"#10264A")}${dotEye(76,72,2.8,"#10264A")}${blush(42,80)}${blush(84,80)}<path d="M60 80 l3 3 l3 -3" stroke="#10264A" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; } },

{ n:"Braise", e:"Feu", tag:"flamme flottante", float:true, draw(){
  const d = "M24 98 C8 84 12 62 28 56 C26 66 32 72 38 66 C34 48 44 32 58 18 C58 34 64 40 72 34 C74 46 82 50 88 42 C104 58 106 82 94 98 C78 104 40 104 24 98Z";
  return `<ellipse cx="60" cy="74" rx="44" ry="34" fill="#FF9A3D" opacity=".45" filter="url(#glow)"/>`
  + vol(d, {b:"#FF7A3D", s:"#D8401C", l:"#FFD36A", o:"#8A2410"}, [50,54,9,15],
    `<path d="M38 100 C30 86 38 74 48 72 C46 80 52 82 56 76 C58 66 64 60 68 56 C70 66 78 70 80 64 C90 76 88 92 82 100Z" fill="#FFB43A"/><path d="M48 100 C44 92 50 86 54 86 C56 90 60 90 62 84 C66 88 70 92 70 100Z" fill="#FFEFA0"/>`)
  + `<circle cx="76" cy="16" r="2.4" fill="#FFB13B"/><circle cx="88" cy="26" r="1.6" fill="#FFD36A"/><circle cx="64" cy="8" r="1.4" fill="#FFD36A"/>
  ${dotEye(50,80,3,"#4A1206")}${dotEye(70,80,3,"#4A1206")}${blush(42,88)}${blush(78,88)}<ellipse cx="60" cy="89" rx="2.4" ry="1.8" fill="#4A1206"/>`; } },

{ n:"Nimbus", e:"Ciel", tag:"nuage boudeur", float:true, draw(){
  const C = [[34,70,16],[52,58,20],[74,56,19],[92,72,15],[62,80,22],[40,84,14],[84,86,13]];
  return C.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+2.4}" fill="#5E6A82"/>`).join("")
  + C.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#BCC6D6"/>`).join("")
  + C.map(([x,y,r])=>`<circle cx="${x-2}" cy="${y-3}" r="${r-3}" fill="#F6F8FC"/>`).join("")
  + `<ellipse cx="54" cy="48" rx="13" ry="6" fill="#fff" filter="url(#soft)"/>
  <path d="M47 72 q4 3 8 0 M67 71 q4 3 8 0" stroke="#3A4258" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M56 82 q4 -3 8 0" stroke="#3A4258" stroke-width="1.8" fill="none" stroke-linecap="round"/>${blush(44,80)}${blush(80,79)}
  <path d="M100 66 l8 -3 M101 72 l9 0" stroke="#5E6A82" stroke-width="1.5" stroke-linecap="round"/>
  ${[[44,104],[64,110],[82,104]].map(([x,y])=>`<path d="M${x} ${y-7} q4 5 0 8 q-4 -3 0 -8z" fill="#7FC4F0" stroke="#3E7FB0" stroke-width="1"/>`).join("")}`; } },

{ n:"Luciole", e:"Nuit", tag:"luciole lumineuse", float:true, draw(){
  const o = "#1E1E44";
  return `<ellipse cx="60" cy="80" rx="34" ry="28" fill="#F2F27A" opacity=".55" filter="url(#glow)"/>
  <ellipse cx="38" cy="50" rx="13" ry="22" fill="rgba(230,245,255,.45)" stroke="#8AA0D8" stroke-width="1.4" transform="rotate(-35 38 50)"/>
  <ellipse cx="82" cy="50" rx="13" ry="22" fill="rgba(230,245,255,.45)" stroke="#8AA0D8" stroke-width="1.4" transform="rotate(35 82 50)"/>
  <path d="M40 50 C34 44 32 38 36 34 M80 50 C86 44 88 38 84 34" stroke="#8AA0D8" stroke-width="1" fill="none" opacity=".7"/>`
  + vol("M60 58 C80 58 90 72 88 86 C86 100 74 106 60 106 C46 106 34 100 32 86 C30 72 40 58 60 58Z", {b:"#F2F27A", s:"#C9C840", l:"#FFFFE0", o:"#6A6A1A"}, [52,72,10,6],
    `<path d="M34 78 C48 84 72 84 86 78 M33 90 C48 96 72 96 87 90" stroke="#B8B030" stroke-width="2.4" fill="none"/>`)
  + `<path d="M44 66 l-10 4 l-4 8 M76 66 l10 4 l4 8 M48 72 l-12 10 M72 72 l12 10" stroke="${o}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M50 30 C46 18 40 14 34 16 M70 30 C74 18 80 14 86 16" stroke="${o}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="16" r="3.4" fill="#F2F27A"/><circle cx="86" cy="16" r="3.4" fill="#F2F27A"/><circle cx="34" cy="16" r="7" fill="#F2F27A" opacity=".5" filter="url(#soft)"/><circle cx="86" cy="16" r="7" fill="#F2F27A" opacity=".5" filter="url(#soft)"/>`
  + vol("M60 26 a20 20 0 1 0 .1 0Z", {b:"#4A4A8C", s:"#2A2A5E", l:"#9A9AE0", o}, [52,34,6,4])
  + `<circle cx="52" cy="46" r="6" fill="#fff" stroke="${o}" stroke-width="1.2"/><circle cx="68" cy="46" r="6" fill="#fff" stroke="${o}" stroke-width="1.2"/><circle cx="53" cy="47" r="3" fill="#120A1E"/><circle cx="67" cy="47" r="3" fill="#120A1E"/><circle cx="51.6" cy="45.4" r="1.1" fill="#fff"/><circle cx="65.6" cy="45.4" r="1.1" fill="#fff"/>
  ${blush(46,54)}${blush(74,54)}${smile(57,55,3,"#F2F2FF")}`; } },

{ n:"Piquant", e:"Épines", tag:"oursin boule", draw(){
  return `<ellipse cx="50" cy="102" rx="7" ry="4" fill="#5E36A8" stroke="#2E1660" stroke-width="1.8"/><ellipse cx="70" cy="102" rx="7" ry="4" fill="#5E36A8" stroke="#2E1660" stroke-width="1.8"/>
  <path d="${starPts(60,66,26,40,30)}" fill="#5E36A8" stroke="#2E1660" stroke-width="2" stroke-linejoin="round"/>
  <path d="${starPts(58,63,26,35,27,.12)}" fill="#8E5BD8"/><path d="${starPts(56,60,20,24,19,.2)}" fill="#A77BEA"/>
  <ellipse cx="48" cy="48" rx="10" ry="6" fill="#E4D2FF" opacity=".7" filter="url(#soft)"/>
  <circle cx="50" cy="64" r="6" fill="#fff" stroke="#2E1660" stroke-width="1.4"/><circle cx="70" cy="64" r="6" fill="#fff" stroke="#2E1660" stroke-width="1.4"/><circle cx="51" cy="65" r="2.8" fill="#1B1020"/><circle cx="69" cy="65" r="2.8" fill="#1B1020"/><circle cx="50" cy="63.6" r="1" fill="#fff"/><circle cx="68" cy="63.6" r="1" fill="#fff"/>
  ${smile(57,74,3)}${blush(44,74)}${blush(76,74)}`; } },

{ n:"Poulpi", e:"Lagon", tag:"pieuvre", draw(){
  const tent = [[32,-7],[45,6],[60,-6],[75,6],[88,-7]].map(([x,d]) => `M${x} 60 C${x+d} 76 ${x-d} 88 ${x+d*.7} 98 c${-d*.5} 4 ${-d*1.1} 0 ${-d*.8} -4`).join(" ");
  return `<path d="${tent}" stroke="#23286A" stroke-width="12" fill="none" stroke-linecap="round"/><path d="${tent}" stroke="#555EC8" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="${tent}" stroke="#7880E8" stroke-width="2.5" fill="none" stroke-linecap="round" transform="translate(-1.5 -1.5)"/>`
  + vol("M28 66 C28 36 44 22 60 22 C76 22 92 36 92 66 C80 72 40 72 28 66Z", {b:"#6A72E0", s:"#444CB2", l:"#B4BAFF", o:"#23286A"}, [48,36,10,7],
    `<circle cx="74" cy="36" r="4" fill="#8C94F2"/><circle cx="82" cy="48" r="2.6" fill="#8C94F2"/><circle cx="40" cy="46" r="2" fill="#8C94F2"/>`)
  + `${dotEye(50,54,3.6)}${dotEye(70,54,3.6)}${blush(42,62)}${blush(78,62)}<path d="M56 61 q4 5 8 0z" fill="#8A1E3A"/>`; } },

{ n:"Hulotte", e:"Nuit", tag:"chouette aux grands yeux", draw(){
  const o = "#3A2618";
  const chev = [0,1,2].map(r=>[0,1,2].map(k=>`<path d="M${50+k*10-r*5+(r%2?0:0)} ${78+r*7} l3 3 l3 -3" stroke="#B89878" stroke-width="1.4" fill="none"/>`).join("")).join("");
  return `<path d="M50 100 l-3 5 M54 101 v5 M58 100 l3 5 M66 100 l-3 5 M70 101 v5 M74 100 l3 5" stroke="#E2902A" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M38 36 L28 12 L52 30Z M82 36 L92 12 L68 30Z" fill="#8A6A4C" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>`
  + vol("M60 24 C86 24 96 48 96 70 C96 92 82 102 60 102 C38 102 24 92 24 70 C24 48 34 24 60 24Z", {b:"#9C7A5C", s:"#6E5038", l:"#E2C8A4", o}, [46,36,10,6],
    `<ellipse cx="60" cy="86" rx="20" ry="16" fill="#E8D6BA"/>${chev}`)
  + `<path d="M26 64 C18 80 26 96 40 96 C34 86 32 74 26 64Z M94 64 C102 80 94 96 80 96 C86 86 88 74 94 64Z" fill="#7E5E42" stroke="${o}" stroke-width="1.8"/>
  <path d="M60 62 C54 44 34 40 32 56 C30 70 46 76 60 70 C74 76 90 70 88 56 C86 40 66 44 60 62Z" fill="#F2E2C8" stroke="${o}" stroke-width="1.6"/>
  <circle cx="47" cy="57" r="10" fill="#F2B23A" stroke="${o}" stroke-width="1.6"/><circle cx="73" cy="57" r="10" fill="#F2B23A" stroke="${o}" stroke-width="1.6"/>
  <circle cx="48" cy="58" r="6" fill="#120A1E"/><circle cx="72" cy="58" r="6" fill="#120A1E"/><circle cx="45" cy="54" r="2.4" fill="#fff"/><circle cx="69" cy="54" r="2.4" fill="#fff"/><circle cx="50.5" cy="61" r="1" fill="#fff"/><circle cx="74.5" cy="61" r="1" fill="#fff"/>
  <path d="M56 66 L60 74 L64 66Z" fill="#E2902A" stroke="${o}" stroke-width="1.4" stroke-linejoin="round"/>${blush(38,70)}${blush(82,70)}`; } },

{ n:"Mousseline", e:"Forêt", tag:"tortue de mousse", draw(){
  const o = "#3A3020";
  const legs = [[30,"#8AAA6C"],[48,"#7A9A5C"],[74,"#7A9A5C"],[92,"#8AAA6C"]].map(([x,f])=>`<rect x="${x-6}" y="86" width="12" height="16" rx="5" fill="${f}" stroke="${o}" stroke-width="2"/>`).join("");
  return legs
  + vol("M22 63 a13 13 0 1 0 .1 0Z", {b:"#A8C88A", s:"#7A9A5C", l:"#E0F2C8", o}, null)
  + vol("M26 84 C24 52 42 32 66 32 C92 32 108 52 106 84 C88 92 44 92 26 84Z", {b:"#8A6A48", s:"#5E4428", l:"#C8A47A", o}, null,
    `<path d="M26 66 C36 48 50 36 66 34 C86 34 102 48 108 66 C100 70 92 64 86 70 C78 64 70 72 62 66 C54 72 46 64 40 70 C34 64 30 70 26 66Z" fill="#6FAE4A"/>
     <path d="M30 60 C42 44 56 38 72 38" stroke="#A8E07A" stroke-width="3" fill="none" opacity=".8"/>
     <path d="M30 80 C50 86 82 86 104 80 M48 70 l-4 12 M70 72 l0 12 M90 70 l4 12" stroke="#5E4428" stroke-width="1.4" fill="none" opacity=".7"/>`)
  + `<path d="M58 34 C58 24 60 18 64 14 M76 36 C78 28 82 24 86 22" stroke="#3F6E2A" stroke-width="2" fill="none"/>
  <path d="M64 15 C70 8 78 10 78 14 C72 18 67 17 64 15Z M63 16 C58 10 52 11 52 15 C56 18 60 18 63 16Z" fill="#8ED06A" stroke="#3F6E2A" stroke-width="1.2"/>
  <circle cx="86" cy="22" r="3.4" fill="#F27BA8" stroke="#9A2A5E" stroke-width="1"/><circle cx="86" cy="22" r="1.2" fill="#FFE36A"/>
  <circle cx="44" cy="44" r="2.4" fill="#F2E27A"/>
  ${dotEye(16,74,2.6)}${dotEye(28,72,2.6)}${blush(12,81)}${blush(31,79)}${smile(19,80,3)}`; } },

{ n:"Morille", e:"Champignon", tag:"champignon à chapeau", draw(){
  const o = "#6A4A2E";
  return `<ellipse cx="50" cy="102" rx="8" ry="4" fill="#D8C2A0" stroke="${o}" stroke-width="1.8"/><ellipse cx="70" cy="102" rx="8" ry="4" fill="#D8C2A0" stroke="${o}" stroke-width="1.8"/>`
  + vol("M40 56 C38 74 40 94 46 100 H74 C80 94 82 74 80 56Z", {b:"#F4E6CC", s:"#D4BC96", l:"#FFFFFF", o}, [50,70,6,10])
  + `<ellipse cx="37" cy="82" rx="4" ry="6" fill="#F4E6CC" stroke="${o}" stroke-width="1.8" transform="rotate(20 37 82)"/><ellipse cx="83" cy="82" rx="4" ry="6" fill="#F4E6CC" stroke="${o}" stroke-width="1.8" transform="rotate(-20 83 82)"/>`
  + vol("M12 58 C12 30 36 16 60 16 C84 16 108 30 108 58 C92 64 28 64 12 58Z", {b:"#D9483A", s:"#A82A22", l:"#FF9A84", o:"#5A140E"}, [44,30,14,6],
    `<ellipse cx="40" cy="38" rx="7" ry="4.5" fill="#FFF4E2"/><ellipse cx="64" cy="26" rx="7.5" ry="4.5" fill="#FFF4E2"/><ellipse cx="86" cy="40" rx="5.5" ry="3.5" fill="#FFF4E2"/><ellipse cx="24" cy="50" rx="3.5" ry="2.4" fill="#FFF4E2"/><ellipse cx="98" cy="52" rx="3" ry="2" fill="#FFF4E2"/>`)
  + `${dotEye(52,76,3)}${dotEye(68,76,3)}${blush(46,84)}${blush(74,84)}${smile(57,84,3)}`; } },

{ n:"Quartz", e:"Cristal", tag:"golem de cristaux", draw(){
  const o = "#3A3644";
  const legs = [[40,"#7A7682"],[52,"#5F5B68"],[68,"#5F5B68"],[80,"#7A7682"]].map(([x,f])=>`<rect x="${x-5}" y="92" width="10" height="12" rx="4" fill="${f}" stroke="${o}" stroke-width="2"/>`).join("");
  const shard = (x, y, w, h, t, col) => `<g transform="rotate(${t} ${x} ${y})"><polygon points="${x-w/2},${y} ${x-w/2},${y-h*.7} ${x},${y-h} ${x+w/2},${y-h*.7} ${x+w/2},${y}" fill="${col}" stroke="#3A4A7A" stroke-width="1.4" stroke-linejoin="round"/><polygon points="${x},${y} ${x},${y-h} ${x+w/2},${y-h*.7} ${x+w/2},${y}" fill="rgba(40,20,90,.25)"/><path d="M${x-w/4} ${y-4} L${x-w/4} ${y-h*.66}" stroke="#fff" stroke-width="1.6" opacity=".7"/></g>`;
  return legs + `<ellipse cx="60" cy="30" rx="26" ry="20" fill="#B8A4FF" opacity=".45" filter="url(#glow)"/>`
  + shard(84,62,8,18,28,"#C8F2FF") + shard(44,60,12,34,-14,"#9FE0F5") + shard(74,60,12,30,16,"#9FE0F5") + shard(59,58,16,46,2,"#B8A4FF")
  + vol("M30 66 C30 58 40 54 60 54 C80 54 90 58 90 66 L91 92 C91 98 84 100 60 100 C36 100 29 98 29 92Z", {b:"#8E8A96", s:"#67636F", l:"#C2BECA", o}, [46,62,10,4],
    `<path d="M70 70 l4 6 l-2 6 M40 86 l6 -3" stroke="${o}" stroke-width="1.1" fill="none" opacity=".6"/>`)
  + `${dotEye(50,78,3.1)}${dotEye(70,78,3.1)}${blush(43,86)}${blush(77,86)}${smile(57,86,3)}`; } },

{ n:"Ocelle", e:"Mystère", tag:"boule à cinq yeux", draw(){
  const o = "#0E1A30";
  const eye = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFC93C" stroke="${o}" stroke-width="1.5"/><circle cx="${x+r*.15}" cy="${y+r*.12}" r="${r*.46}" fill="${o}"/><circle cx="${x-r*.3}" cy="${y-r*.35}" r="${r*.26}" fill="#fff"/>`;
  return `<ellipse cx="48" cy="100" rx="8" ry="4.5" fill="#1A3054" stroke="${o}" stroke-width="1.8"/><ellipse cx="72" cy="100" rx="8" ry="4.5" fill="#1A3054" stroke="${o}" stroke-width="1.8"/>
  <path d="M60 33 C58 24 62 18 67 16" stroke="${o}" stroke-width="2" fill="none"/><circle cx="67" cy="15" r="3.4" fill="#FFC93C" stroke="${o}" stroke-width="1.4"/>`
  + vol("M60 32 a34 34 0 1 0 .1 0Z", {b:"#2E5288", s:"#1A3054", l:"#6A8CC4", o}, [46,46,11,7])
  + eye(46,54,8) + eye(73,50,10) + eye(58,74,6) + eye(84,72,5.5) + eye(36,74,4.5)
  + `<path d="M48 86 q12 9 24 0 q-12 3 -24 0z" fill="${o}"/><path d="M53 87.6 l2 3.4 l2 -3 M63 87.6 l2 3 l2 -3.4" fill="#fff"/>`; } },

{ n:"Voile", e:"Esprit", tag:"esprit à capuche", float:true, draw(){
  const o = "#4A4038";
  return vol("M60 16 C84 16 92 40 92 60 C92 80 98 94 102 100 L90 96 L82 102 L72 96 L62 102 L52 96 L42 102 L32 96 L18 100 C24 92 28 80 28 60 C28 40 36 16 60 16Z", {b:"#DCD3C8", s:"#A99E92", l:"#FFFAF2", o}, [46,30,9,7],
    `<path d="M36 90 c-4 -8 6 -12 8 -6 c1 4 -4 5 -5 2 M80 88 c4 -8 -6 -12 -8 -6 c-1 4 4 5 5 2 M60 96 c-3 -6 5 -9 6 -4" stroke="#7A5AB0" stroke-width="2" fill="none" stroke-linecap="round"/>`)
  + `<ellipse cx="60" cy="52" rx="21" ry="17" fill="#1A1222"/><ellipse cx="60" cy="52" rx="21" ry="17" fill="none" stroke="${o}" stroke-width="1.6"/>
  <ellipse cx="52" cy="52" rx="7" ry="8" fill="#9FF2E4" opacity=".55" filter="url(#soft)"/><ellipse cx="68" cy="52" rx="7" ry="8" fill="#9FF2E4" opacity=".55" filter="url(#soft)"/>
  <ellipse cx="52" cy="52" rx="3.8" ry="5.4" fill="#F2FFFB"/><ellipse cx="68" cy="52" rx="3.8" ry="5.4" fill="#F2FFFB"/>
  <path d="M30 72 C46 80 74 80 90 72 L90 79 C74 87 46 87 30 79Z" fill="#3E9E8C" stroke="#1E5A4E" stroke-width="1.6"/><path d="M76 80 l6 15 l-8 -3 l-4 4z" fill="#3E9E8C" stroke="#1E5A4E" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M60 17 C60 10 64 6 70 5 C70 11 66 15 60 17Z" fill="#7FC456" stroke="#2F5E22" stroke-width="1.3"/>`; } },

{ n:"Dino", e:"Préhistoire", tag:"petit dinosaure assis", draw(){
  const o = "#23426A";
  const spikes = [[45,36],[40,48],[37,60],[34,72]].map(([x,y])=>`<path d="M${x} ${y} l-10 2 l7 8z" fill="#FFCB3C" stroke="${o}" stroke-width="1.6" stroke-linejoin="round"/>`).join("");
  return `<path d="M34 90 C16 94 8 84 14 76 C20 84 28 84 36 82Z" fill="#6AA2D6" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>` + spikes
  + vol("M44 100 C30 98 28 78 36 66 C40 58 40 48 44 40 C48 28 60 22 72 26 C88 30 92 44 86 54 C82 62 84 70 88 80 C92 94 82 100 68 100Z", {b:"#7FB4E2", s:"#4E84BE", l:"#CDE8FF", o}, [62,34,9,6], `<ellipse cx="66" cy="82" rx="14" ry="15" fill="#DDEFFF"/>`)
  + `<ellipse cx="46" cy="100" rx="9" ry="4.5" fill="#6AA2D6" stroke="${o}" stroke-width="1.8"/><ellipse cx="80" cy="100" rx="9" ry="4.5" fill="#6AA2D6" stroke="${o}" stroke-width="1.8"/>
  <path d="M56 70 q-7 3 -5 9 M84 66 q6 4 4 10" stroke="${o}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  ${dotEye(66,42,3)}${dotEye(80,44,3)}${blush(62,52)}${blush(86,54)}${smile(70,53,3.5)}`; } }
];

function creatureSVG(c, size){
  return `<svg viewBox="0 0 120 116" width="${size}" height="${size*116/120}" role="img" aria-label="${c.n}">
  <ellipse cx="60" cy="${c.float?110:106}" rx="${c.float?22:32}" ry="4.5" fill="rgba(10,6,24,.28)"/>
  <g class="${c.float?"fl":""}"><g filter="url(#paint)">${c.draw()}</g></g></svg>`;
}
