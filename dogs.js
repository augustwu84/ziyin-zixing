// 原創角色「耳耳」：白色小狗，焦糖色大垂耳、右眼一塊焦糖色斑、紅色項圈
// 每完成 10 回練習解鎖一隻，共 30 隻
// ears：down 垂耳｜fly 張開飛起｜perk 一邊翹起
// eyes：open 圓眼｜happy 笑眼｜wink 眨眼｜sleep 閉眼｜star 星星眼
// mouth：smile 微笑｜open 張嘴｜o 圓嘴

const DOGS = [
  { name: "打招呼", ears: "perk", eyes: "open", mouth: "open", prop: "wave", collar: "#ff6b6b" },
  { name: "愛讀書", ears: "down", eyes: "open", mouth: "smile", prop: "book", collar: "#4aa3ff" },
  { name: "認真寫字", ears: "down", eyes: "open", mouth: "o", prop: "pencil", collar: "#43c59e" },
  { name: "摘星星", ears: "perk", eyes: "star", mouth: "open", prop: "star", collar: "#ffb627" },
  { name: "呼呼大睡", ears: "down", eyes: "sleep", mouth: "smile", prop: "zzz", collar: "#b79cff" },
  { name: "吃餅乾", ears: "down", eyes: "happy", mouth: "open", prop: "cookie", collar: "#ff6b6b" },
  { name: "飛氣球", ears: "perk", eyes: "open", mouth: "smile", prop: "balloon", collar: "#ff8fb1" },
  { name: "小博士", ears: "down", eyes: "open", mouth: "smile", prop: "gradcap", collar: "#4aa3ff" },
  { name: "小國王", ears: "down", eyes: "happy", mouth: "smile", prop: "crown", collar: "#ffb627" },
  { name: "撐雨傘", ears: "down", eyes: "open", mouth: "o", prop: "umbrella", collar: "#43c59e" },
  { name: "送花花", ears: "perk", eyes: "happy", mouth: "smile", prop: "flower", collar: "#ff8fb1" },
  { name: "唱歌歌", ears: "fly", eyes: "happy", mouth: "open", prop: "music", collar: "#b79cff" },
  { name: "踢足球", ears: "fly", eyes: "open", mouth: "open", prop: "ball", collar: "#43c59e" },
  { name: "去游泳", ears: "down", eyes: "happy", mouth: "open", prop: "ring", collar: "#4aa3ff" },
  { name: "生日快樂", ears: "perk", eyes: "star", mouth: "open", prop: "cake", collar: "#ff6b6b" },
  { name: "小偵探", ears: "perk", eyes: "wink", mouth: "o", prop: "magnifier", collar: "#8a6a4a" },
  { name: "小畫家", ears: "down", eyes: "happy", mouth: "smile", prop: "palette", collar: "#ffb627" },
  { name: "看月亮", ears: "down", eyes: "open", mouth: "o", prop: "moon", collar: "#6a7bff" },
  { name: "好喜歡你", ears: "perk", eyes: "happy", mouth: "smile", prop: "heart", collar: "#ff6b6b" },
  { name: "拿獎盃", ears: "fly", eyes: "star", mouth: "open", prop: "trophy", collar: "#ffb627" },
  { name: "放風箏", ears: "fly", eyes: "happy", mouth: "open", prop: "kite", collar: "#43c59e" },
  { name: "冰淇淋", ears: "down", eyes: "wink", mouth: "open", prop: "icecream", collar: "#ff8fb1" },
  { name: "小魔法師", ears: "perk", eyes: "wink", mouth: "smile", prop: "wand", collar: "#b79cff" },
  { name: "聖誕快樂", ears: "down", eyes: "happy", mouth: "open", prop: "santa", collar: "#43c59e" },
  { name: "下雪了", ears: "down", eyes: "open", mouth: "o", prop: "scarf", collar: "#4aa3ff" },
  { name: "酷酷墨鏡", ears: "perk", eyes: "open", mouth: "smile", prop: "sunglasses", collar: "#ff6b6b" },
  { name: "耳朵飛行", ears: "fly", eyes: "happy", mouth: "open", prop: "cloud", collar: "#6cb8ff" },
  { name: "開心跳跳", ears: "fly", eyes: "star", mouth: "open", prop: "jump", collar: "#ffb627" },
  { name: "金牌選手", ears: "perk", eyes: "happy", mouth: "smile", prop: "medal", collar: "#ff6b6b" },
  { name: "彩虹耳耳", ears: "fly", eyes: "star", mouth: "open", prop: "rainbow", collar: "#b79cff" },
];

function renderDog(dog) {
  const EAR = "#e9b77a";
  const EAR_IN = "#f6d7ae";
  const INK = "#3d2e28";

  const ears = {
    down: [[-14, 0], [14, 0]],
    fly: [[52, 10], [-52, 10]],
    perk: [[-14, 0], [-150, 14, 0.72]],
  }[dog.ears];
  const ear = (side, [rot, dy, s = 1]) => {
    const x = side < 0 ? 33 : 87;
    return `<g transform="translate(${x} ${32 + dy}) rotate(${rot}) scale(${s})">
      <ellipse cx="0" cy="22" rx="11" ry="26" fill="${EAR}"/>
      <ellipse cx="0" cy="24" rx="6" ry="18" fill="${EAR_IN}"/>
    </g>`;
  };

  const eyes = {
    open: `<ellipse cx="49" cy="51" rx="4.2" ry="5.4" fill="${INK}"/><ellipse cx="71" cy="51" rx="4.2" ry="5.4" fill="${INK}"/>
      <circle cx="50.4" cy="49" r="1.6" fill="#fff"/><circle cx="72.4" cy="49" r="1.6" fill="#fff"/>`,
    happy: `<path d="M44 52 q5 -7 10 0 M66 52 q5 -7 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    wink: `<ellipse cx="49" cy="51" rx="4.2" ry="5.4" fill="${INK}"/><circle cx="50.4" cy="49" r="1.6" fill="#fff"/>
      <path d="M66 51 q5 4 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    sleep: `<path d="M44 51 q5 5 10 0 M66 51 q5 5 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    star: `${star(49, 51, 6, "#ffb627")}${star(71, 51, 6, "#ffb627")}`,
  }[dog.eyes];

  const mouth = {
    smile: `<path d="M54 63 q6 6 12 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    open: `<path d="M53 62 q7 11 14 0 z" fill="#7a3b3b"/><path d="M56 66 q4 4 8 0" fill="#ff8a9a"/>`,
    o: `<ellipse cx="60" cy="65" rx="3.2" ry="3.8" fill="#7a3b3b"/>`,
  }[dog.mouth];

  const p = PROPS[dog.prop] || {};
  const holding = p.hold;
  const lift = dog.prop === "jump" ? -8 : 0;

  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="耳耳：${dog.name}">
    <ellipse cx="60" cy="113" rx="${lift ? 22 : 30}" ry="4.5" fill="rgba(61,46,40,.12)"/>
    ${p.back || ""}
    <g transform="translate(0 ${lift})">
      <path d="M84 96 q14 -2 12 -16" stroke="${EAR}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="92" rx="25" ry="19" fill="#fff" stroke="#efe6dc" stroke-width="2"/>
      <ellipse cx="47" cy="108" rx="8" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>
      <ellipse cx="73" cy="108" rx="8" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>
      ${ear(-1, ears[0])}${ear(1, ears[1])}
      <circle cx="60" cy="52" r="30" fill="#fff" stroke="#efe6dc" stroke-width="2"/>
      <ellipse cx="72" cy="49" rx="9.5" ry="9" fill="${EAR_IN}"/>
      ${eyes}
      <ellipse cx="42" cy="61" rx="5" ry="3" fill="#ffb3bd" opacity=".75"/>
      <ellipse cx="78" cy="61" rx="5" ry="3" fill="#ffb3bd" opacity=".75"/>
      <ellipse cx="60" cy="58.5" rx="4" ry="3" fill="${INK}"/>
      ${mouth}
      <path d="M40 76 q20 9 40 0" stroke="${dog.collar}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="81" r="3.6" fill="#ffd34d" stroke="#e3a915" stroke-width="1"/>
      ${p.front || ""}
      ${holding ? `<ellipse cx="46" cy="90" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>
        <ellipse cx="74" cy="90" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>` : ""}
      ${p.top || ""}
    </g>
    ${p.over || ""}
  </svg>`;
}

function star(cx, cy, r, fill) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = (Math.PI / 5) * k - Math.PI / 2;
    const rr = k % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

const PROPS = {
  wave: {
    front: `<ellipse cx="91" cy="74" rx="6.5" ry="8" fill="#fff" stroke="#efe6dc" stroke-width="2" transform="rotate(-25 91 74)"/>
      <path d="M100 62 q4 -3 3 -8 M104 70 q5 -1 6 -6" stroke="#ffb627" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  },
  book: {
    hold: true,
    front: `<path d="M42 84 L60 88 L78 84 L78 100 L60 104 L42 100 Z" fill="#4aa3ff"/>
      <path d="M45 86 L60 89.5 L75 86 L75 98 L60 101.5 L45 98 Z" fill="#fff"/>
      <path d="M60 89.5 V101.5" stroke="#4aa3ff" stroke-width="1.5"/>`,
  },
  pencil: {
    hold: true,
    front: `<g transform="rotate(-35 76 88)"><rect x="70" y="70" width="8" height="30" rx="1.5" fill="#ffc93c"/>
      <path d="M70 100 L74 108 L78 100 Z" fill="#f6d7ae"/><path d="M73 105 L74 108 L75 105 Z" fill="#3d2e28"/>
      <rect x="70" y="67" width="8" height="5" fill="#ff8fb1"/></g>`,
  },
  star: {
    hold: true,
    front: star(60, 88, 13, "#ffc93c") + `<circle cx="56" cy="86" r="1.4" fill="#3d2e28"/><circle cx="64" cy="86" r="1.4" fill="#3d2e28"/>`,
    over: `${star(100, 22, 5, "#ffc93c")}${star(18, 30, 4, "#ffc93c")}`,
  },
  zzz: {
    over: `<text x="88" y="26" font-size="14" font-family="sans-serif" font-weight="bold" fill="#8fa8ff">Z</text>
      <text x="100" y="14" font-size="10" font-family="sans-serif" font-weight="bold" fill="#8fa8ff">z</text>`,
  },
  cookie: {
    hold: true,
    front: `<circle cx="60" cy="90" r="11" fill="#d9a066"/><path d="M68 82 a11 11 0 0 1 3 8 a5 5 0 0 1 -6 -5 z" fill="#fff"/>
      <circle cx="55" cy="87" r="1.8" fill="#6b4226"/><circle cx="61" cy="94" r="1.8" fill="#6b4226"/><circle cx="54" cy="94" r="1.5" fill="#6b4226"/>`,
  },
  balloon: {
    back: `<path d="M98 40 q-6 20 -10 46" stroke="#b08a7a" stroke-width="1.3" fill="none"/>
      <ellipse cx="98" cy="24" rx="13" ry="16" fill="#ff8fb1"/><ellipse cx="93" cy="18" rx="3" ry="5" fill="#ffd0de"/>
      <path d="M95 40 L101 40 L98 44 Z" fill="#ff8fb1"/>`,
    front: `<ellipse cx="86" cy="86" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>`,
  },
  gradcap: {
    top: `<path d="M34 26 L60 15 L86 26 L60 36 Z" fill="#3d2e28"/><rect x="48" y="28" width="24" height="8" fill="#3d2e28"/>
      <path d="M84 26 v12" stroke="#ffc93c" stroke-width="2"/><circle cx="84" cy="40" r="2.5" fill="#ffc93c"/>`,
  },
  crown: {
    top: `<path d="M44 26 L44 12 L52 20 L60 9 L68 20 L76 12 L76 26 Z" fill="#ffc93c" stroke="#e3a915" stroke-width="1.5"/>
      <circle cx="60" cy="21" r="2.4" fill="#ff6b6b"/><circle cx="50" cy="23" r="1.8" fill="#4aa3ff"/><circle cx="70" cy="23" r="1.8" fill="#43c59e"/>`,
  },
  umbrella: {
    back: `<path d="M92 32 V90" stroke="#8a6a4a" stroke-width="2.5"/>
      <path d="M62 34 Q92 0 122 34 Q114 28 107 34 Q99 28 92 34 Q85 28 77 34 Q70 28 62 34 Z" fill="#43c59e"/>`,
    front: `<ellipse cx="88" cy="86" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>`,
    over: `<path d="M14 40 v6 M24 56 v6 M10 70 v6" stroke="#8fc6ff" stroke-width="2.4" stroke-linecap="round"/>`,
  },
  flower: {
    hold: true,
    front: `<path d="M60 104 V86" stroke="#43c59e" stroke-width="3"/>
      <circle cx="60" cy="80" r="5" fill="#ff8fb1"/><circle cx="54" cy="84" r="5" fill="#ff8fb1"/><circle cx="66" cy="84" r="5" fill="#ff8fb1"/>
      <circle cx="56" cy="90" r="5" fill="#ff8fb1"/><circle cx="64" cy="90" r="5" fill="#ff8fb1"/><circle cx="60" cy="85.5" r="3.5" fill="#ffc93c"/>`,
  },
  music: {
    over: `<path d="M94 30 v-16 l10 -3 v15" stroke="#b79cff" stroke-width="2.5" fill="none"/>
      <ellipse cx="91" cy="31" rx="4" ry="3" fill="#b79cff"/><ellipse cx="101" cy="27" rx="4" ry="3" fill="#b79cff"/>
      <path d="M22 38 v-12" stroke="#ff8fb1" stroke-width="2.5"/><ellipse cx="19" cy="39" rx="4" ry="3" fill="#ff8fb1"/>`,
  },
  ball: {
    front: `<circle cx="96" cy="104" r="10" fill="#fff" stroke="#3d2e28" stroke-width="1.6"/>
      <path d="M96 99 l4.5 3.2 -1.7 5.3 h-5.6 l-1.7 -5.3 z" fill="#3d2e28"/>`,
  },
  ring: {
    front: `<ellipse cx="60" cy="95" rx="30" ry="11" fill="none" stroke="#ff6b6b" stroke-width="9"/>
      <path d="M33 92 l5 -5 M56 84 h6 M83 88 l5 5" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    back: `<path d="M8 112 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0" stroke="#8fd0ff" stroke-width="3" fill="none"/>`,
  },
  cake: {
    hold: true,
    front: `<rect x="44" y="86" width="32" height="16" rx="3" fill="#ffd0de"/><path d="M44 90 q4 4 8 0 t8 0 t8 0 t8 0" fill="#fff" stroke="#fff" stroke-width="2"/>
      <rect x="58" y="76" width="4" height="10" fill="#6cb8ff"/><path d="M60 70 q3 3 0 6 q-3 -3 0 -6" fill="#ffb627"/>`,
  },
  magnifier: {
    front: `<path d="M94 92 l10 12" stroke="#8a6a4a" stroke-width="5" stroke-linecap="round"/>
      <circle cx="88" cy="84" r="11" fill="rgba(180,220,255,.55)" stroke="#8a6a4a" stroke-width="3.5"/>`,
    top: `<path d="M38 28 Q60 6 82 28 Z" fill="#a07850"/><rect x="34" y="25" width="52" height="5" rx="2.5" fill="#8a6a4a"/>`,
  },
  palette: {
    front: `<path d="M84 80 q20 -4 22 10 q2 12 -14 12 q-6 0 -4 -5 q2 -5 -4 -6 q-8 -2 0 -11z" fill="#f6d7ae" stroke="#d9a066" stroke-width="1.5"/>
      <circle cx="94" cy="86" r="2.5" fill="#ff6b6b"/><circle cx="101" cy="90" r="2.5" fill="#4aa3ff"/><circle cx="99" cy="97" r="2.5" fill="#43c59e"/>`,
    top: `<ellipse cx="62" cy="24" rx="20" ry="7" fill="#ff6b6b"/><circle cx="62" cy="17" r="3" fill="#ff6b6b"/>`,
  },
  moon: {
    back: `<path d="M104 10 a14 14 0 1 0 8 24 a11 11 0 1 1 -8 -24z" fill="#ffd34d"/>
      ${star(18, 18, 4, "#ffd34d")}${star(30, 8, 3, "#ffd34d")}`,
  },
  heart: {
    hold: true,
    front: `<path d="M60 102 C40 90 46 76 55 80 Q60 82 60 87 Q60 82 65 80 C74 76 80 90 60 102 Z" fill="#ff6b6b"/>`,
    over: `<path d="M98 26 c-6 -4 -3 -9 0 -6 c3 -3 6 2 0 6z" fill="#ff8fb1"/><path d="M20 34 c-5 -3 -2 -7 0 -5 c2 -2 5 2 0 5z" fill="#ff8fb1"/>`,
  },
  trophy: {
    hold: true,
    front: `<path d="M48 78 h24 v6 q0 12 -12 12 q-12 0 -12 -12 z" fill="#ffc93c" stroke="#e3a915" stroke-width="1.5"/>
      <path d="M48 81 q-7 0 -6 6 q1 4 7 4 M72 81 q7 0 6 6 q-1 4 -7 4" stroke="#e3a915" stroke-width="2" fill="none"/>
      <rect x="57" y="96" width="6" height="5" fill="#e3a915"/><rect x="51" y="101" width="18" height="4" rx="1.5" fill="#e3a915"/>`,
    over: `${star(60, 72, 4, "#fff")}`,
  },
  kite: {
    back: `<path d="M100 8 L114 24 L100 42 L86 24 Z" fill="#43c59e"/><path d="M100 8 V42 M86 24 H114" stroke="#fff" stroke-width="1.5"/>
      <path d="M100 42 q-4 22 -12 46" stroke="#b08a7a" stroke-width="1.3" fill="none"/>
      <path d="M100 42 q4 6 0 10 q-4 4 0 9" stroke="#ff8fb1" stroke-width="2" fill="none"/>`,
    front: `<ellipse cx="87" cy="88" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>`,
  },
  icecream: {
    front: `<path d="M84 88 L92 108 L100 88 Z" fill="#e3b075"/><path d="M86 92 l12 0 M88 98 l8 0" stroke="#c48d50" stroke-width="1.2"/>
      <circle cx="92" cy="82" r="8" fill="#ff8fb1"/><circle cx="92" cy="73" r="6.5" fill="#bfe6ff"/><circle cx="93" cy="67" r="2.2" fill="#ff6b6b"/>
      <ellipse cx="84" cy="94" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>`,
  },
  wand: {
    front: `<path d="M86 100 L102 74" stroke="#3d2e28" stroke-width="3.5" stroke-linecap="round"/>
      ${star(104, 70, 9, "#ffc93c")}<ellipse cx="88" cy="96" rx="6" ry="5" fill="#fff" stroke="#efe6dc" stroke-width="2"/>`,
    top: `<path d="M44 28 L60 -6 L76 28 Z" fill="#b79cff"/>${star(60, 14, 4, "#ffc93c")}`,
    over: `${star(18, 26, 3.5, "#ffc93c")}${star(108, 44, 3, "#ffc93c")}`,
  },
  santa: {
    top: `<path d="M36 28 Q58 -4 86 22 L84 28 Z" fill="#ff5a5a"/><rect x="34" y="24" width="54" height="8" rx="4" fill="#fff"/>
      <circle cx="88" cy="20" r="5" fill="#fff"/>`,
    over: `<circle cx="16" cy="24" r="2" fill="#cfe5ff"/><circle cx="104" cy="50" r="2.4" fill="#cfe5ff"/><circle cx="22" cy="60" r="1.8" fill="#cfe5ff"/>`,
  },
  scarf: {
    front: `<path d="M38 74 q22 12 44 0 l1 8 q-23 12 -46 0 z" fill="#4aa3ff"/>
      <path d="M70 80 l6 18 l-8 2 l-4 -18 z" fill="#4aa3ff"/><path d="M68 92 l8 -2 M70 97 l7 -2" stroke="#fff" stroke-width="1.5"/>`,
    top: `<ellipse cx="60" cy="24" rx="22" ry="8" fill="#ffc93c"/><circle cx="60" cy="15" r="5" fill="#fff"/>`,
    over: `<circle cx="16" cy="30" r="2.4" fill="#cfe5ff"/><circle cx="104" cy="20" r="2.6" fill="#cfe5ff"/><circle cx="108" cy="60" r="2" fill="#cfe5ff"/><circle cx="12" cy="72" r="2" fill="#cfe5ff"/>`,
  },
  sunglasses: {
    top: `<rect x="40" y="45" width="17" height="11" rx="5" fill="#3d2e28"/><rect x="63" y="45" width="17" height="11" rx="5" fill="#3d2e28"/>
      <path d="M57 49 h6" stroke="#3d2e28" stroke-width="2.5"/><path d="M43 48 l5 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
    back: `<circle cx="104" cy="16" r="9" fill="#ffc93c"/><path d="M104 2 v-2 M118 16 h2 M114 6 l2 -2" stroke="#ffc93c" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  cloud: {
    back: `<g fill="#e4f2ff"><circle cx="28" cy="108" r="12"/><circle cx="46" cy="104" r="15"/><circle cx="72" cy="104" r="15"/><circle cx="92" cy="108" r="12"/><rect x="20" y="106" width="80" height="12" rx="6"/></g>`,
    over: `<path d="M8 40 h14 M4 52 h12 M100 46 h14" stroke="#cfe5ff" stroke-width="3" stroke-linecap="round"/>`,
  },
  jump: {
    over: `<path d="M30 116 l-6 3 M90 116 l6 3 M60 118 v3" stroke="#e3a915" stroke-width="2.4" stroke-linecap="round"/>
      ${star(16, 30, 4, "#ffc93c")}${star(104, 26, 5, "#ff8fb1")}`,
  },
  medal: {
    front: `<path d="M52 76 L58 92 M68 76 L62 92" stroke="#4aa3ff" stroke-width="5"/>
      <circle cx="60" cy="96" r="9" fill="#ffc93c" stroke="#e3a915" stroke-width="2"/>${star(60, 96, 4.5, "#fff3c2")}`,
  },
  rainbow: {
    back: `<g fill="none" stroke-width="5"><path d="M6 70 A54 54 0 0 1 114 70" stroke="#ff8a8a"/><path d="M12 70 A48 48 0 0 1 108 70" stroke="#ffc93c"/>
      <path d="M18 70 A42 42 0 0 1 102 70" stroke="#7ee0bf"/><path d="M24 70 A36 36 0 0 1 96 70" stroke="#8fc6ff"/></g>`,
    over: `${star(14, 20, 4, "#ffc93c")}${star(106, 14, 4, "#ff8fb1")}`,
  },
};
