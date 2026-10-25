(() => {
  "use strict";

  // ---------- 常數 ----------
  const INITIALS = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ".split("");
  const MEDIALS = "ㄧㄨㄩ".split("");
  const FINALS = "ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ".split("");
  const TONES = [
    { mark: "ˉ", label: "一聲" },
    { mark: "ˊ", label: "二聲" },
    { mark: "ˇ", label: "三聲" },
    { mark: "ˋ", label: "四聲" },
    { mark: "˙", label: "輕聲" },
  ];
  const TIME_LIMIT = { yin: 25, xing: 12 };
  const STORE_KEY = "ziyin-zixing-v1";

  // ---------- 儲存 ----------
  const store = loadStore();
  function loadStore() {
    const fallback = { stars: 0, mistakes: {}, sound: true };
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? Object.assign(fallback, JSON.parse(raw)) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* 無痕模式等情況略過 */ }
  }

  // ---------- 小工具 ----------
  const $ = (id) => document.getElementById(id);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const roundById = (id) => ROUNDS.find((r) => r.id === id);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function wordHtml(item) {
    return [...item.w].map((c, k) => (k === item.i ? `<span class="hl">${esc(c)}</span>` : esc(c))).join("");
  }

  // ---------- 音效 ----------
  let audioCtx = null;
  function beep(notes, type = "sine", vol = 0.15) {
    if (!store.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      let t = audioCtx.currentTime;
      notes.forEach(([freq, dur]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur * 0.85;
      });
    } catch (e) { /* 不支援就安靜 */ }
  }
  const sfx = {
    tap: () => beep([[660, 0.06]], "triangle", 0.08),
    right: () => beep([[784, 0.12], [1047, 0.22]], "triangle"),
    wrong: () => beep([[220, 0.18], [180, 0.25]], "square", 0.08),
    fanfare: () => beep([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.35]], "triangle"),
    tick: () => beep([[1200, 0.04]], "sine", 0.05),
  };

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-TW";
    u.rate = 0.8;
    const voice = speechSynthesis.getVoices().find((v) => /zh[-_]TW/i.test(v.lang));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }

  // ---------- 吉祥物 ----------
  const MASCOT_SVG = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(74,59,53,.12)"/>
    <g class="body">
      <path d="M58 14 q4 -10 10 -4 q-6 2 -6 8z" fill="#ffb627"/>
      <ellipse cx="60" cy="66" rx="40" ry="42" fill="#ffd94a"/>
      <ellipse cx="60" cy="78" rx="26" ry="24" fill="#fff1b8"/>
      <ellipse cx="22" cy="70" rx="9" ry="16" fill="#ffc93c" transform="rotate(20 22 70)"/>
      <ellipse cx="98" cy="70" rx="9" ry="16" fill="#ffc93c" transform="rotate(-20 98 70)"/>
      <g class="eyes">
        <ellipse cx="45" cy="56" rx="6" ry="7.5" fill="#4a3b35"/>
        <ellipse cx="75" cy="56" rx="6" ry="7.5" fill="#4a3b35"/>
        <circle cx="47" cy="53" r="2.2" fill="#fff"/>
        <circle cx="77" cy="53" r="2.2" fill="#fff"/>
      </g>
      <ellipse cx="34" cy="68" rx="6" ry="3.5" fill="#ff9aa3" opacity=".7"/>
      <ellipse cx="86" cy="68" rx="6" ry="3.5" fill="#ff9aa3" opacity=".7"/>
      <path d="M53 66 L60 73 L67 66 Z" fill="#ff8a3d"/>
      <path d="M48 106 v6 M44 112 h8 M72 106 v6 M68 112 h8" stroke="#ff8a3d" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`;
  function mountMascot(el) { el.innerHTML = MASCOT_SVG; }
  function mascotMood(el, mood) {
    el.classList.remove("happy", "sad");
    void el.offsetWidth;
    if (mood) el.classList.add(mood);
  }

  // ---------- 畫面切換 ----------
  const screens = ["home", "setup", "quiz", "result", "mistakes"];
  function show(name) {
    screens.forEach((s) => ($("screen-" + s).hidden = s !== name));
    $("homeBtn").hidden = name === "home";
    window.scrollTo({ top: 0 });
    if (name === "home") renderHome();
  }

  function renderHome() {
    $("totalStars").textContent = store.stars;
    $("mistakeCount").textContent = Object.values(store.mistakes).reduce((n, a) => n + a.length, 0);
  }

  // ---------- 設定 ----------
  const setup = { type: "yin", roundId: null, count: "10" };

  function openSetup(type) {
    setup.type = type;
    $("setupTitle").textContent = type === "yin" ? "🗣️ 字音練習" : "✏️ 字形練習";
    $("timedDesc").textContent = `每題 ${TIME_LIMIT[type]} 秒，答得快多一顆星`;
    const rounds = ROUNDS.filter((r) => r.type === type);
    setup.roundId = rounds[0].id;
    $("roundChips").innerHTML = rounds
      .map((r) => `<button class="chip${r.id === setup.roundId ? " on" : ""}" data-round="${r.id}">${r.title}（${r.items.length} 題）</button>`)
      .join("");
    markChips("countChips", "count", setup.count);
    show("setup");
  }
  function markChips(containerId, key, value) {
    [...$(containerId).children].forEach((b) => b.classList.toggle("on", b.dataset[key] === value));
  }

  // ---------- 作答流程 ----------
  let quiz = null;

  function startQuiz({ roundId, indices, timed, fromMistakes }) {
    const round = roundById(roundId);
    quiz = {
      round, timed, fromMistakes,
      list: indices,
      pos: 0,
      correct: 0,
      stars: 0,
      wrongs: [],
      answered: false,
      timer: null,
      deadline: 0,
      lastSetup: { roundId, indices, timed, fromMistakes },
    };
    show("quiz");
    renderQuestion();
  }

  function pickIndices(round, count) {
    const all = round.items.map((_, k) => k);
    if (count === "all") return all;
    return shuffle(all).slice(0, Number(count));
  }

  function current() { return quiz.round.items[quiz.list[quiz.pos]]; }

  function renderQuestion() {
    const item = current();
    const total = quiz.list.length;
    quiz.answered = false;
    $("qCounter").textContent = `${quiz.pos + 1} / ${total}`;
    $("progressFill").style.width = `${(quiz.pos / total) * 100}%`;
    $("sessionStars").textContent = quiz.stars;

    const isYin = quiz.round.type === "yin";
    $("qPrompt").textContent = isYin ? "紅色框框裡的字，注音怎麼拼？" : "藍色框框裡應該填哪個字？";
    $("qWord").innerHTML = [...item.w]
      .map((c, k) => {
        if (k !== item.i) return `<span class="ch">${esc(c)}</span>`;
        if (isYin) return `<span class="ch target">${esc(c)}</span>`;
        return `<span class="ch"><span class="zy-tag">${item.z}</span><span class="ch blank">？</span></span>`;
      })
      .join("");

    $("yinInput").hidden = !isYin;
    $("choices").hidden = isYin;
    if (isYin) resetYinInput();
    else renderChoices(item);

    startTimer();
  }

  // ----- 計時 -----
  function startTimer() {
    stopTimer();
    $("timerWrap").hidden = !quiz.timed;
    if (!quiz.timed) return;
    const limit = TIME_LIMIT[quiz.round.type];
    quiz.limit = limit;
    quiz.deadline = Date.now() + limit * 1000;
    let lastSec = limit;
    const tick = () => {
      const left = Math.max(0, quiz.deadline - Date.now());
      const sec = Math.ceil(left / 1000);
      $("timerFill").style.width = `${(left / (limit * 1000)) * 100}%`;
      $("timerFill").classList.toggle("hurry", sec <= 5);
      $("timerText").textContent = `⏱️ ${sec} 秒`;
      if (sec < lastSec && sec <= 3 && sec > 0) sfx.tick();
      lastSec = sec;
      if (left <= 0) { stopTimer(); answer(null); }
    };
    tick();
    quiz.timer = setInterval(tick, 200);
  }
  function stopTimer() {
    if (quiz && quiz.timer) { clearInterval(quiz.timer); quiz.timer = null; }
  }

  // ----- 字音：注音鍵盤 -----
  const zy = { ini: "", med: "", fin: "", tone: "" };

  function buildKeyboard() {
    const groups = [
      { key: "ini", title: "聲母", keys: INITIALS },
      { key: "med", title: "介音", keys: MEDIALS },
      { key: "fin", title: "韻母", keys: FINALS },
    ];
    let html = groups
      .map((g) => `<div class="kb-group"><div class="kb-group-title">${g.title}</div><div class="kb-keys">${g.keys
        .map((k) => `<button class="key" data-slot="${g.key}" data-val="${k}">${k}</button>`)
        .join("")}</div></div>`)
      .join("");
    html += `<div class="kb-group tones"><div class="kb-group-title">聲調</div><div class="kb-keys">${TONES
      .map((t) => `<button class="key" data-slot="tone" data-val="${t.mark}">${t.mark}<small>${t.label}</small></button>`)
      .join("")}</div></div>`;
    $("keyboard").innerHTML = html;
  }

  function resetYinInput() {
    zy.ini = zy.med = zy.fin = zy.tone = "";
    renderSlot();
  }

  function composed() {
    const body = zy.ini + zy.med + zy.fin;
    if (!body) return "";
    if (zy.tone === "˙") return "˙" + body;
    if (zy.tone === "ˉ" || zy.tone === "") return body;
    return body + zy.tone;
  }

  function renderSlot() {
    const slot = $("answerSlot");
    const body = zy.ini + zy.med + zy.fin;
    if (!body && !zy.tone) {
      slot.innerHTML = `<span class="ph">點下面的注音拼拼看</span>`;
      slot.classList.remove("filled");
    } else {
      const tone = zy.tone === "ˉ" ? "" : zy.tone;
      const parts = zy.tone === "˙" ? ["˙", zy.ini, zy.med, zy.fin] : [zy.ini, zy.med, zy.fin, tone];
      slot.innerHTML = parts.filter(Boolean).map((p) => `<span class="part">${p}</span>`).join("");
      slot.classList.toggle("filled", !!body);
    }
    document.querySelectorAll("#keyboard .key").forEach((k) => {
      k.classList.toggle("on", zy[k.dataset.slot] === k.dataset.val);
    });
  }

  function pressKey(slot, val) {
    if (quiz.answered) return;
    sfx.tap();
    zy[slot] = zy[slot] === val ? "" : val;
    renderSlot();
  }

  function backspace() {
    if (quiz.answered) return;
    for (const k of ["tone", "fin", "med", "ini"]) {
      if (zy[k]) { zy[k] = ""; break; }
    }
    renderSlot();
  }

  function submitYin() {
    if (quiz.answered) return;
    const val = composed();
    if (!val) {
      const slot = $("answerSlot");
      slot.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 250 });
      return;
    }
    answer(val);
  }

  // ----- 字形：選項 -----
  function renderChoices(item) {
    const opts = shuffle([item.a, ...item.d]);
    $("choices").innerHTML = opts.map((c) => `<button class="choice" data-val="${c}">${c}</button>`).join("");
  }

  // ----- 判定 -----
  function answer(val) {
    if (quiz.answered) return;
    quiz.answered = true;
    const elapsed = quiz.timed ? quiz.limit - (quiz.deadline - Date.now()) / 1000 : 0;
    stopTimer();

    const item = current();
    const isYin = quiz.round.type === "yin";
    const accepted = isYin ? [item.a, ...(item.alt || [])] : [item.a];
    const ok = val !== null && accepted.includes(val);

    let earned = 0;
    if (ok) {
      quiz.correct++;
      earned = 1;
      if (quiz.timed && elapsed <= quiz.limit / 2) earned = 2;
      quiz.stars += earned;
      if (quiz.fromMistakes) removeMistake(quiz.round.id, quiz.list[quiz.pos]);
      sfx.right();
      burstConfetti(40);
    } else {
      quiz.wrongs.push({ item, given: val });
      addMistake(quiz.round.id, quiz.list[quiz.pos]);
      sfx.wrong();
    }

    if (!isYin) {
      document.querySelectorAll("#choices .choice").forEach((b) => {
        if (b.dataset.val === item.a) b.classList.add("right");
        else if (b.dataset.val === val) b.classList.add("wrong");
      });
    }
    $("sessionStars").textContent = quiz.stars;
    showFeedback(ok, item, val, earned);
  }

  const PRAISE = ["答對了！", "好厲害！", "太棒了！", "完全正確！", "你真聰明！"];
  function showFeedback(ok, item, val, earned) {
    const isYin = quiz.round.type === "yin";
    const card = $("fbCard");
    card.className = "fb-card " + (ok ? "ok" : "no");
    $("fbIcon").textContent = ok ? (earned > 1 ? "🌟" : "🎉") : val === null ? "⏰" : "💪";
    $("fbTitle").textContent = ok
      ? PRAISE[Math.floor(Math.random() * PRAISE.length)] + (earned > 1 ? " 速度好快，多一顆星！" : "")
      : val === null ? "時間到囉！" : "差一點點，再記一下！";
    $("fbWord").innerHTML = wordHtml(item);

    let detail = "";
    if (isYin) {
      detail = `「${esc(item.w[item.i])}」唸作 <b>${item.a}</b>`;
      if (item.alt) detail += `<br><small>（新版審訂音 ${item.alt.join("、")} 也算對）</small>`;
      if (!ok && val) detail += `<br>你拼的是 ${esc(val)}`;
    } else {
      detail = `${item.z} 要寫 <b>${esc(item.a)}</b>`;
      if (!ok && val) detail += `，不是「${esc(val)}」喔`;
    }
    $("fbDetail").innerHTML = detail;
    // 破音字容易被語音念錯，字音題不提供朗讀
    $("speakBtn").hidden = isYin || !("speechSynthesis" in window);
    $("nextBtn").textContent = quiz.pos + 1 >= quiz.list.length ? "看成績 🏆" : "下一題 ➜";
    $("feedback").hidden = false;

    const mascotPlace = $("mascotResult");
    mascotMood(mascotPlace, ok ? "happy" : "sad");
  }

  function next() {
    $("feedback").hidden = true;
    if (speechSynthesis && speechSynthesis.cancel) speechSynthesis.cancel();
    quiz.pos++;
    if (quiz.pos >= quiz.list.length) finish();
    else renderQuestion();
  }

  function finish() {
    stopTimer();
    const total = quiz.list.length;
    const ratio = quiz.correct / total;
    const rank = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    store.stars += quiz.stars;
    saveStore();
    $("totalStars").textContent = store.stars;

    $("resultTitle").textContent = ["再加油一下！", "不錯喔！", "好厲害！", "滿分大師！"][rank];
    $("resultStars").innerHTML = [0, 1, 2].map((k) => `<span class="${k < rank ? "" : "dim"}">⭐</span>`).join("");
    $("resultScore").textContent = `答對 ${quiz.correct} / ${total} 題`;
    $("resultEarned").textContent = `這次獲得 ${quiz.stars} 顆星星`;

    const review = $("reviewList");
    if (quiz.wrongs.length) {
      review.innerHTML =
        `<div class="review-title">要再記一下的題目（已收進錯題本）</div>` +
        quiz.wrongs
          .map(({ item, given }) => {
            const ans = quiz.round.type === "yin" ? item.a : `${item.z} → ${esc(item.a)}`;
            const yours = given === null ? "時間到" : `你答：${esc(given)}`;
            return `<div class="review-item"><span class="rw">${wordHtml(item)}</span><span class="ra"><b>${ans}</b><br>${yours}</span></div>`;
          })
          .join("");
    } else {
      review.innerHTML = `<div class="empty"><span class="big-emoji">🏅</span>全部答對，太神了！</div>`;
    }

    show("result");
    mascotMood($("mascotResult"), rank >= 2 ? "happy" : rank === 0 ? "sad" : null);
    if (rank >= 2) { sfx.fanfare(); burstConfetti(160); }
  }

  // ---------- 錯題本 ----------
  function addMistake(roundId, idx) {
    const list = store.mistakes[roundId] || (store.mistakes[roundId] = []);
    if (!list.includes(idx)) list.push(idx);
    saveStore();
  }
  function removeMistake(roundId, idx) {
    const list = store.mistakes[roundId];
    if (!list) return;
    const k = list.indexOf(idx);
    if (k >= 0) list.splice(k, 1);
    if (!list.length) delete store.mistakes[roundId];
    saveStore();
  }
  function renderMistakes() {
    const groups = Object.entries(store.mistakes).filter(([id, l]) => roundById(id) && l.length);
    if (!groups.length) {
      $("mistakeGroups").innerHTML = `<div class="empty"><span class="big-emoji">🎈</span>錯題本空空的，真棒！</div>`;
      return;
    }
    $("mistakeGroups").innerHTML = groups
      .map(([id, list]) => {
        const r = roundById(id);
        const tags = list.map((k) => `<span class="m-tag">${wordHtml(r.items[k])}</span>`).join("");
        return `<div class="m-group"><div class="m-group-head"><h3>${r.title}（${list.length} 題）</h3>
          <button class="m-practice" data-round="${id}">開始複習</button></div><div class="m-list">${tags}</div></div>`;
      })
      .join("");
  }

  // ---------- 彩帶 ----------
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  let pieces = [];
  let animating = false;
  const COLORS = ["#ff7a85", "#ffc93c", "#43c59e", "#6cb8ff", "#b79cff"];
  function burstConfetti(n) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    for (let k = 0; k < n; k++) {
      pieces.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        r: Math.random() * 6 + 4,
        c: COLORS[k % COLORS.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 90 + Math.random() * 40,
      });
    }
    if (!animating) { animating = true; requestAnimationFrame(drawConfetti); }
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter((p) => p.life > 0);
    pieces.forEach((p) => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 30);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    });
    if (pieces.length) requestAnimationFrame(drawConfetti);
    else { animating = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  // ---------- 事件 ----------
  function bind() {
    document.querySelectorAll(".mode-card").forEach((b) => b.addEventListener("click", () => { sfx.tap(); openSetup(b.dataset.type); }));
    $("roundChips").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      setup.roundId = b.dataset.round;
      markChips("roundChips", "round", setup.roundId);
    });
    $("countChips").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      setup.count = b.dataset.count;
      markChips("countChips", "count", setup.count);
    });
    document.querySelectorAll(".play-mode").forEach((b) =>
      b.addEventListener("click", () => {
        sfx.tap();
        const round = roundById(setup.roundId);
        startQuiz({ roundId: round.id, indices: pickIndices(round, setup.count), timed: b.dataset.mode === "timed", fromMistakes: false });
      })
    );

    $("keyboard").addEventListener("click", (e) => {
      const k = e.target.closest(".key");
      if (k) pressKey(k.dataset.slot, k.dataset.val);
    });
    $("kbClear").addEventListener("click", () => { if (!quiz.answered) { resetYinInput(); sfx.tap(); } });
    $("kbBack").addEventListener("click", backspace);
    $("kbSubmit").addEventListener("click", submitYin);
    $("choices").addEventListener("click", (e) => {
      const b = e.target.closest(".choice");
      if (b) answer(b.dataset.val);
    });
    $("nextBtn").addEventListener("click", next);
    $("speakBtn").addEventListener("click", () => speak(current().w));

    $("againBtn").addEventListener("click", () => {
      const s = quiz.lastSetup;
      if (s.fromMistakes) {
        const left = store.mistakes[s.roundId] || [];
        if (!left.length) { openMistakes(); return; }
        startQuiz({ ...s, indices: shuffle(left) });
      } else {
        const round = roundById(s.roundId);
        startQuiz({ ...s, indices: setup.count === "all" ? s.indices : pickIndices(round, s.indices.length) });
      }
    });
    $("backHomeBtn").addEventListener("click", () => show("home"));
    $("homeBtn").addEventListener("click", () => {
      stopTimer();
      $("feedback").hidden = true;
      show("home");
    });
    $("openMistakes").addEventListener("click", openMistakes);
    $("mistakeGroups").addEventListener("click", (e) => {
      const b = e.target.closest(".m-practice");
      if (!b) return;
      const list = store.mistakes[b.dataset.round] || [];
      startQuiz({ roundId: b.dataset.round, indices: shuffle(list), timed: false, fromMistakes: true });
    });

    $("soundBtn").addEventListener("click", () => {
      store.sound = !store.sound;
      saveStore();
      $("soundBtn").textContent = store.sound ? "🔊" : "🔇";
      sfx.tap();
    });

    // 實體鍵盤：Enter 送出／下一題，Backspace 退格，1~4 選字形選項
    document.addEventListener("keydown", (e) => {
      if ($("screen-quiz").hidden) return;
      if (!$("feedback").hidden) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
        return;
      }
      if (quiz.round.type === "yin") {
        if (e.key === "Enter") submitYin();
        else if (e.key === "Backspace") backspace();
      } else if (/^[1-4]$/.test(e.key)) {
        const btn = $("choices").children[Number(e.key) - 1];
        if (btn) answer(btn.dataset.val);
      }
    });
  }

  function openMistakes() {
    renderMistakes();
    show("mistakes");
  }

  // ---------- 啟動 ----------
  mountMascot($("mascotHome"));
  mountMascot($("mascotResult"));
  buildKeyboard();
  $("soundBtn").textContent = store.sound ? "🔊" : "🔇";
  bind();
  show("home");
})();
