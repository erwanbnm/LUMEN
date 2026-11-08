/* Rixy : petit boxer assis */
const RIXY = { n:"Rixy", e:"Chien", tag:"petit boxer assis", draw(){
  const o = "#3A2414", fawn = {b:"#D9944E", s:"#A86A30", l:"#F6C892", o}, white = "#FFF6EC";
  return `<path d="M84 88 C94 84 98 76 96 70" stroke="${o}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M84 88 C94 84 98 76 96 70" stroke="#C98440" stroke-width="4" fill="none" stroke-linecap="round"/>`
  + vol("M30 96 a11 9 0 1 0 22 0 a11 9 0 1 0 -22 0Z", fawn, [36,92,4,3])
  + vol("M68 96 a11 9 0 1 0 22 0 a11 9 0 1 0 -22 0Z", fawn, [74,92,4,3])
  + vol("M38 102 C32 94 34 78 40 70 C46 62 52 60 60 60 C68 60 74 62 80 70 C86 78 88 94 82 102Z", fawn, [50,72,7,5],
    `<path d="M54 62 C51 74 51 90 55 104 H65 C69 90 69 74 66 62 C62 66 58 66 54 62Z" fill="${white}"/>`)
  + vol("M46 78 C46 74 54 74 54 78 V98 H46Z", fawn, null) + vol("M66 78 C66 74 74 74 74 78 V98 H66Z", fawn, null)
  + `<ellipse cx="50" cy="100" rx="7" ry="4.5" fill="${white}" stroke="${o}" stroke-width="2"/><ellipse cx="70" cy="100" rx="7" ry="4.5" fill="${white}" stroke="${o}" stroke-width="2"/>
  <path d="M47 101 v2 M50 101.5 v2 M53 101 v2 M67 101 v2 M70 101.5 v2 M73 101 v2" stroke="#C9B8A6" stroke-width="1" stroke-linecap="round"/>
  <path d="M40 64 C50 70 70 70 80 64 L80 70 C70 76 50 76 40 70Z" fill="#D8343A" stroke="#7A1418" stroke-width="1.6"/>
  <path d="M60 72 c-3 -3 -7 0 -4 4 l4 4 l4 -4 c3 -4 -1 -7 -4 -4z" fill="#F2C440" stroke="#8A5A08" stroke-width="1.2"/>
  <path d="M38 20 C30 16 20 18 14 24 C14 32 18 40 24 42 C26 36 30 30 36 30Z" fill="#8A5424" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M82 20 C90 16 100 18 106 24 C106 32 102 40 96 42 C94 36 90 30 84 30Z" fill="#8A5424" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M18 26 C22 22 30 21 34 23" stroke="#B87038" stroke-width="2" fill="none" opacity=".7"/><path d="M102 26 C98 22 90 21 86 23" stroke="#B87038" stroke-width="2" fill="none" opacity=".7"/>`
  + vol("M60 14 C82 14 94 28 94 44 C94 60 82 70 60 70 C38 70 26 60 26 44 C26 28 38 14 60 14Z", fawn, [44,24,10,6],
    `<path d="M57 14 C56 24 56 32 55 42 H65 C64 32 64 24 63 14Z" fill="${white}"/>
     <ellipse cx="46" cy="38" rx="10" ry="8" fill="#6A3E1E" opacity=".45"/><ellipse cx="74" cy="38" rx="10" ry="8" fill="#6A3E1E" opacity=".45"/>`)
  + `<path d="M46 26 q4 -3 8 0 M66 26 q4 -3 8 0 M52 21 q8 -4 16 0" stroke="#8A5424" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M40 50 C40 42 48 39 60 39 C72 39 80 42 80 50 C81 58 76 66 66 67 C63 67 61 65 60 64 C59 65 57 67 54 67 C44 66 39 58 40 50Z" fill="#2A1A14" stroke="${o}" stroke-width="1.6"/>
  <path d="M42 54 C40 62 44 68 50 68 M78 54 C80 62 76 68 70 68" stroke="#1A0E0A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="66" rx="7" ry="3.4" fill="${white}"/>
  <ellipse cx="60" cy="47" rx="7.5" ry="5.2" fill="#120A08"/><ellipse cx="57.6" cy="45.4" rx="2.4" ry="1.4" fill="#fff" opacity=".7"/>
  <path d="M60 52 v4 M52 57 q8 6 16 0" stroke="#7A6A60" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M56 58.5 l1.2 2.6 l1.2 -2.6z M61.6 58.5 l1.2 2.6 l1.2 -2.6z" fill="#fff"/>
  <path d="M58 61 q2 4 4 0z" fill="#F2788E"/>
  <circle cx="46" cy="37" r="6.4" fill="#2A160C"/><circle cx="74" cy="37" r="6.4" fill="#2A160C"/>
  <circle cx="46.6" cy="37.6" r="3.6" fill="#120A08"/><circle cx="74.6" cy="37.6" r="3.6" fill="#120A08"/>
  <circle cx="44" cy="34.4" r="2.2" fill="#fff"/><circle cx="72" cy="34.4" r="2.2" fill="#fff"/><circle cx="48.4" cy="39.6" r=".9" fill="#fff"/><circle cx="76.4" cy="39.6" r=".9" fill="#fff"/>
  <path d="M40 30 q6 -4 11 -1 M69 29 q5 -3 11 1" stroke="${o}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  ${blush(34,52)}${blush(86,52)}`; } };
