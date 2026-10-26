// Firebase 雲端設定
// 到 Firebase 主控台 →「專案設定」→「你的應用程式」複製 firebaseConfig，貼到下面取代 null。
// 這些值是公開的網站設定，不是密碼；資料安全由 firestore.rules 控管。
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDc7nmz0wv1NopO88OLTV6xnyA1bGM4KUI",
  authDomain: "ziyin-zixing.firebaseapp.com",
  projectId: "ziyin-zixing",
  storageBucket: "ziyin-zixing.firebasestorage.app",
  messagingSenderId: "276258069946",
  appId: "1:276258069946:web:4b42122db64f9ca2815183",
};

// 後台帳號的 Firebase 使用者 UID（要和 firestore.rules 裡的一致）
// 登入信箱不寫在這裡，登入時由家長自己輸入
window.ADMIN_UID = "loS5SRuAQ9fD0oBkSUR7cLoe92B3";
