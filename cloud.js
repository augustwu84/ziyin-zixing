// 練習紀錄上傳到 Firebase Firestore。
// 紀錄先放進本機待上傳佇列，連得上雲端時再送出；還沒設定 Firebase 時也會先存著，設定好後自動補傳。
const FB_VERSION = "10.14.1";
const QUEUE_KEY = "ziyin-zixing-pending";
const QUEUE_MAX = 500;

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (e) { return []; }
}
function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_MAX))); } catch (e) { /* 略過 */ }
}

let ready = null;
let flushing = false;

async function connect() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg) return null;
  const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
  const [{ initializeApp }, { getAuth, signInAnonymously }, { getFirestore, collection, addDoc }] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  if (!auth.currentUser) await signInAnonymously(auth);
  const db = getFirestore(app);
  return (rec) => addDoc(collection(db, "sessions"), rec);
}

async function flush() {
  if (flushing) return;
  flushing = true;
  try {
    ready = ready || connect();
    const send = await ready;
    if (!send) return;
    let q = readQueue();
    while (q.length) {
      await send(q[0]);
      q = readQueue().slice(1);
      writeQueue(q);
    }
  } catch (e) {
    ready = null; // 下次重新連線
    console.warn("練習紀錄暫時無法上傳，稍後會再試", e);
  } finally {
    flushing = false;
  }
}

window.cloud = {
  saveSession(rec) {
    writeQueue([...readQueue(), rec]);
    flush();
  },
  pending: () => readQueue().length,
};

window.addEventListener("online", flush);
flush();
