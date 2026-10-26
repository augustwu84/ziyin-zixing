const FB_VERSION = "10.14.1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MODE_LABEL = { practice: "🌱 練習", timed: "⏱️ 計時", mistakes: "📒 錯題本" };

const cfg = window.FIREBASE_CONFIG;
if (!cfg) {
  $("noConfig").hidden = false;
} else {
  start();
}

async function start() {
  const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const isAdmin = (u) => u && u.uid === window.ADMIN_UID;

  A.onAuthStateChanged(auth, (user) => {
    const ok = isAdmin(user);
    $("loginPanel").hidden = ok;
    $("dash").hidden = !ok;
    $("logoutBtn").hidden = !ok;
    if (ok) { loadSessions(); loadReviews(); }
  });

  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = $("loginUser").value.trim();
    const pass = $("loginPass").value;
    $("loginMsg").textContent = "";
    try {
      const cred = await A.signInWithEmailAndPassword(auth, user, pass);
      $("loginPass").value = "";
      if (!isAdmin(cred.user)) {
        await A.signOut(auth);
        $("loginMsg").textContent = "這個帳號沒有後台權限";
      }
    } catch (err) {
      $("loginMsg").textContent = err.code === "auth/too-many-requests" ? "嘗試太多次，請稍後再試" : "帳號或密碼不正確";
    }
  });

  $("logoutBtn").addEventListener("click", () => A.signOut(auth));

  $("pwForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("pwMsg");
    msg.className = "form-msg";
    const oldPw = $("pwOld").value;
    const newPw = $("pwNew").value;
    if (newPw !== $("pwNew2").value) { msg.textContent = "兩次輸入的新密碼不一樣"; return; }
    if (newPw.length < 6) { msg.textContent = "新密碼至少要 6 個字"; return; }
    try {
      const cred = A.EmailAuthProvider.credential(auth.currentUser.email, oldPw);
      await A.reauthenticateWithCredential(auth.currentUser, cred);
      await A.updatePassword(auth.currentUser, newPw);
      e.target.reset();
      msg.className = "form-msg ok";
      msg.textContent = "✅ 密碼已更新，下次登入請用新密碼";
    } catch (err) {
      msg.textContent = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "目前密碼不正確" : "更新失敗，請稍後再試";
    }
  });

  async function loadReviews() {
    try {
      const snap = await F.getDocs(F.collection(db, "reviews"));
      const docs = {};
      snap.forEach((d) => (docs[d.id] = d.data()));
      renderReviews(docs);
    } catch (err) {
      console.error(err);
      $("reviews").innerHTML = `<div class="empty">讀取失敗</div>`;
    }
  }

  async function loadSessions() {
    $("sessions").innerHTML = `<div class="empty">讀取中…</div>`;
    try {
      const q = F.query(F.collection(db, "sessions"), F.orderBy("ts", "desc"), F.limit(200));
      const snap = await F.getDocs(q);
      render(snap.docs.map((d) => d.data()));
    } catch (err) {
      console.error(err);
      $("sessions").innerHTML = `<div class="empty">讀取失敗，請確認 Firestore 規則已經設定</div>`;
    }
  }
}

function render(list) {
  $("sessCount").textContent = `共 ${list.length} 回`;
  const total = list.reduce((n, s) => n + s.total, 0);
  const correct = list.reduce((n, s) => n + s.correct, 0);
  const latest = list[0];
  const dogs = latest ? Math.min(30, Math.floor((latest.completed || 0) / 10)) : 0;
  const stats = [
    ["練習回數", latest ? latest.completed || list.length : 0, "回"],
    ["平均答對率", total ? Math.round((correct / total) * 100) : 0, "%"],
    ["作答題數", total, "題"],
    ["耳耳收集", dogs, "／30"],
  ];
  $("stats").innerHTML = stats.map(([k, v, u]) => `<div class="stat"><div class="stat-k">${k}</div><div class="stat-v">${v}<small>${u}</small></div></div>`).join("")
    + `<div class="stat wide"><div class="stat-k">最近一次練習</div><div class="stat-v sm">${latest ? fmt(latest.ts) : "還沒有紀錄"}</div></div>`;

  // 常錯題
  const counter = new Map();
  list.forEach((s) => (s.wrongs || []).forEach((w) => {
    const key = `${w.w}|${w.i}`;
    const c = counter.get(key) || { ...w, n: 0 };
    c.n++;
    counter.set(key, c);
  }));
  const top = [...counter.values()].sort((a, b) => b.n - a.n).slice(0, 15);
  $("topWrong").innerHTML = top.length
    ? `<div class="m-list">${top.map((w) => `<span class="m-tag">${hl(w)} <small class="tw-ans">${esc(answerText(w))}</small> <b class="tw-n">×${w.n}</b></span>`).join("")}</div>`
    : `<div class="empty">還沒有答錯的題目 👍</div>`;

  // 練習紀錄
  $("sessions").innerHTML = list.length
    ? list.map((s) => {
        const pct = Math.round((s.correct / s.total) * 100);
        const wrongs = s.wrongs || [];
        return `<details class="sess">
          <summary>
            <span class="sess-date">${fmt(s.ts)}</span>
            <span class="sess-title">${esc(s.roundTitle || s.roundId)} <small>${MODE_LABEL[s.mode] || ""}</small></span>
            <span class="sess-score ${pct >= 90 ? "good" : pct >= 60 ? "mid" : "low"}">${s.correct}/${s.total}</span>
          </summary>
          <div class="sess-body">
            <div>答對率 ${pct}%・得到 ⭐ ${s.stars || 0}</div>
            ${wrongs.length
              ? `<div class="sess-wrongs">${wrongs.map((w) => `<div class="review-item"><span class="rw">${hl(w)}</span>
                  <span class="ra"><b>${esc(answerText(w))}</b><br>${w.given == null ? "時間到" : `答：${esc(w.given)}`}</span></div>`).join("")}</div>`
              : `<div class="sess-perfect">🏅 全部答對</div>`}
          </div>
        </details>`;
      }).join("")
    : `<div class="empty">還沒有練習紀錄</div>`;
}

const DECISION_LABEL = {
  keep: "用網站的寫法", paper: "改回原卷", other: "另外寫", ok: "網站內容正確", wrong: "不正確",
  both: "兩種都算對", new: "只算新版讀音",
};
function renderReviews(docs) {
  const items = REVIEW_ITEMS.map((it) => ({ it, r: docs[it.key] })).filter((x) => x.r && x.r.decision);
  const extras = Object.values(docs).filter((d) => d.extra);
  $("rvCount").textContent = `已確認 ${items.length}／${REVIEW_ITEMS.length} 題`;
  const label = (it, d) => (it.kind === "alt" && d === "paper" ? "只算卷上答案" : DECISION_LABEL[d] || d);
  let html = items.length
    ? items.map(({ it, r }) => `<div class="review-item"><span class="rw">${hl(it)}</span>
        <span class="ra">${esc(it.round)} 第 ${it.no} 題<br><b>${esc(label(it, r.decision))}</b>${r.answer ? `：${esc(r.answer)}` : ""}</span></div>`).join("")
    : `<div class="empty">老師還沒填寫</div>`;
  if (extras.length) html += `<div class="review-title">老師另外發現的錯誤</div>` + extras.map((x) => `<div class="review-item"><span>${esc(x.round)} 第 ${x.no} 題：${esc(x.problem)}</span><span class="ra">${x.correct ? `<b>${esc(x.correct)}</b>` : ""}</span></div>`).join("");
  if (docs._note && docs._note.note) html += `<div class="review-title">老師留言</div><div class="review-item"><span>${esc(docs._note.note)}</span></div>`;
  $("reviews").innerHTML = `<div class="sess-wrongs">${html}</div>`;
}

function hl(w) {
  return [...w.w].map((c, k) => (k === w.i ? `<span class="hl">${esc(c)}</span>` : esc(c))).join("");
}
function answerText(w) {
  return w.z ? `${w.z} → ${w.a}` : w.a;
}
function fmt(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
