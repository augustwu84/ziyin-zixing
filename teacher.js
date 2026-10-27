// 老師確認單：每題的選擇存到 Firestore 的 reviews 集合，一題一份文件，改了就自動儲存
const FB_VERSION = "10.14.1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hl = (w, i) => [...w].map((c, k) => (k === i ? `<span class="hl">${esc(c)}</span>` : esc(c))).join("");

const OPTIONS = {
  text: [["keep", "用網站的寫法"], ["paper", "改回原卷"], ["other", "都不對，另外寫"]],
  unsure: [["ok", "網站內容正確"], ["wrong", "不正確，另外寫"]],
  alt: [["both", "兩種都算對"], ["paper", "只算卷上答案"], ["new", "只算辭典讀音"]],
};
const NEEDS_TEXT = new Set(["other", "wrong"]);

const state = {}; // key -> {decision, answer}
let saveDoc = null; // (id, data) => Promise
let removeDoc = null;

function renderItems() {
  for (const kind of ["text", "unsure", "alt"]) {
    const items = REVIEW_ITEMS.filter((it) => it.kind === kind);
    // 已經確認完、從清單拿掉的區塊就整段隱藏
    $(`list-${kind}`).closest(".rv-section").hidden = items.length === 0;
    $(`list-${kind}`).innerHTML = items.map((it) => {
      const ch = [...it.w][it.i];
      const cmp = kind === "alt"
        ? `<dt>卷上答案</dt><dd>「${esc(ch)}」唸 <b>${esc(it.paper)}</b></dd><dt>教育部辭典</dt><dd>${esc(it.alt)}</dd>`
        : `<dt>卷面</dt><dd>${esc(it.paper)}</dd><dt>網站目前</dt><dd>${esc(it.site)}</dd>`;
      return `<article class="rv-item" id="item-${it.key}" data-key="${it.key}">
        <div class="rv-head">
          <span class="rv-ref">${esc(it.round)} 第 ${it.no} 題</span>
          <span class="rv-word">${hl(it.w, it.i)}</span>
          ${it.ans ? `<span class="rv-ans">${esc(it.ans)}</span>` : ""}
        </div>
        <dl class="rv-cmp">${cmp}</dl>
        ${it.why ? `<p class="rv-why">${esc(it.why)}</p>` : ""}
        <div class="rv-opts" role="radiogroup" aria-label="${esc(it.round)} 第 ${it.no} 題">
          ${OPTIONS[kind].map(([v, label]) => `<label class="rv-opt"><input type="radio" name="d-${it.key}" id="d-${it.key}-${v}" value="${v}"><span>${label}</span></label>`).join("")}
        </div>
        <div class="rv-text" hidden>
          <input id="a-${it.key}" placeholder="請寫正確的內容，例如正確的詞語或注音">
        </div>
      </article>`;
    }).join("");
  }
  $("totalCount").textContent = REVIEW_ITEMS.length;
  $("introCount").textContent = REVIEW_ITEMS.length;
  $("exRound").innerHTML = ROUND_NAMES.map((n) => `<option>${n}</option>`).join("");
}

function paintItem(key) {
  const el = $(`item-${key}`);
  const s = state[key] || {};
  el.querySelectorAll("input[type=radio]").forEach((r) => (r.checked = r.value === s.decision));
  const box = el.querySelector(".rv-text");
  box.hidden = !NEEDS_TEXT.has(s.decision);
  const inp = $(`a-${key}`);
  if (document.activeElement !== inp) inp.value = s.answer || "";
  el.classList.toggle("done", isDone(s));
}
const isDone = (s) => !!s.decision && (!NEEDS_TEXT.has(s.decision) || !!(s.answer || "").trim());

function paintProgress() {
  const n = REVIEW_ITEMS.filter((it) => isDone(state[it.key] || {})).length;
  $("doneCount").textContent = n;
  $("doneBar").style.width = `${(n / REVIEW_ITEMS.length) * 100}%`;
}

let pending = 0;
function setSave(kind) {
  const el = $("saveState");
  el.className = "rv-save " + (kind === "ok" ? "ok" : kind === "err" ? "err" : "");
  el.textContent = kind === "busy" ? "儲存中…" : kind === "ok" ? "✓ 已儲存" : kind === "err" ? "儲存失敗" : "";
}
async function save(id, data) {
  if (!saveDoc) { setSave("err"); return; }
  pending++; setSave("busy");
  try { await saveDoc(id, { ...data, ts: Date.now() }); if (--pending === 0) setSave("ok"); }
  catch (e) { pending--; console.error(e); setSave("err"); }
}

const timers = {};
function saveLater(id, data, ms = 600) {
  clearTimeout(timers[id]);
  timers[id] = setTimeout(() => save(id, data), ms);
}

function bind() {
  document.addEventListener("change", (e) => {
    const r = e.target;
    if (r.type !== "radio" || !r.name.startsWith("d-")) return;
    const key = r.name.slice(2);
    state[key] = { ...(state[key] || {}), decision: r.value };
    paintItem(key); paintProgress();
    save(key, { decision: r.value, answer: state[key].answer || "" });
    if (NEEDS_TEXT.has(r.value)) $(`a-${key}`).focus();
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id && t.id.startsWith("a-")) {
      const key = t.id.slice(2);
      state[key] = { ...(state[key] || {}), answer: t.value };
      $(`item-${key}`).classList.toggle("done", isDone(state[key]));
      paintProgress();
      saveLater(key, { decision: state[key].decision || "", answer: t.value });
    } else if (t.id === "teacherNote") {
      saveLater("_note", { note: t.value }, 900);
    }
  });
  $("extraForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = { extra: true, round: $("exRound").value, no: Number($("exNo").value), problem: $("exProblem").value.trim(), correct: $("exCorrect").value.trim() };
    if (!data.problem || !(data.no >= 1)) return;
    const id = "extra-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await save(id, data);
    extras[id] = data; paintExtras();
    $("exNo").value = ""; $("exProblem").value = ""; $("exCorrect").value = "";
  });
  $("extraList").addEventListener("click", async (e) => {
    const b = e.target.closest(".rv-del");
    if (!b || !removeDoc) return;
    if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "確定刪除？"; return; }
    const id = b.dataset.id;
    try { await removeDoc(id); delete extras[id]; paintExtras(); setSave("ok"); } catch (err) { console.error(err); setSave("err"); }
  });
}

const extras = {};
function paintExtras() {
  const rows = Object.entries(extras).sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0));
  $("extraList").innerHTML = rows.map(([id, x]) => `<div class="rv-extra-row">
      <div><b>${esc(x.round)} 第 ${x.no} 題</b>：${esc(x.problem)}${x.correct ? `<br><small>正確應為：${esc(x.correct)}</small>` : ""}</div>
      <button class="rv-del" type="button" data-id="${esc(id)}">刪除</button>
    </div>`).join("");
}

async function connect() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg) throw new Error("no config");
  const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`), import(`${base}/firebase-firestore.js`),
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  await auth.authStateReady();
  if (!auth.currentUser) await A.signInAnonymously(auth);
  const db = F.getFirestore(app);
  saveDoc = (id, data) => F.setDoc(F.doc(db, "reviews", id), data, { merge: true });
  removeDoc = (id) => F.deleteDoc(F.doc(db, "reviews", id));
  const snap = await F.getDocs(F.collection(db, "reviews"));
  snap.forEach((d) => {
    const v = d.data();
    if (d.id === "_note") $("teacherNote").value = v.note || "";
    else if (v.extra) extras[d.id] = v;
    else state[d.id] = { decision: v.decision, answer: v.answer };
  });
}

renderItems();
bind();
connect()
  .then(() => { REVIEW_ITEMS.forEach((it) => paintItem(it.key)); paintProgress(); paintExtras(); })
  .catch((e) => { console.error(e); $("offline").hidden = false; });
