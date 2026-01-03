import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyCX8yGRJc5AcxSEaaC6AzNLZzxtOCz83Sk",
  authDomain: "lagneshmitra-e57b8.firebaseapp.com",
  projectId: "lagneshmitra-e57b8",
  storageBucket: "lagneshmitra-e57b8.firebasestorage.app",
  messagingSenderId: "420798143606",
  appId: "1:420798143606:web:ace6aec7d195492a415357"
};

/* 🚀 Init */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🧠 Helpers */
const val = id => document.getElementById(id)?.value.trim() || "";
const uid = () => val("mobile");

/* 👤 Add / Update User */
async function addUser() {
  if (!uid()) return alert("Mobile number required");

  await setDoc(doc(db, "users", uid()), {
    name: val("name"),
    mobile: uid(),
    gender: val("gender"),
    dob: val("dob"),
    tob: val("tob"),
    pob: val("pob"),
    createdAt: serverTimestamp()
  }, { merge: true });

  document.getElementById("output").innerText = "✅ Details submitted";
}

/* 💬 Send Chat Message */
async function sendMessage() {
  if (!uid()) return alert("Mobile required");
  if (!val("message")) return alert("Type your concern");

  await setDoc(doc(db, "chats", uid()), {
    userId: uid(),
    lastMessage: val("message"),
    lastMessageAt: serverTimestamp(),
    status: "new",
    unread: true
  }, { merge: true });

  document.getElementById("message").value = "";
  document.getElementById("output").innerText = "📨 Message sent";
}

/* 🏆 Load Latest Post (Hall of Fame) */
async function loadLatestPost() {
  const snap = await getDocs(collection(db, "posts"));
  let latest = null;

  snap.forEach(d => {
    const data = d.data();
    if (!latest || (data.updatedAt?.seconds || 0) > (latest.updatedAt?.seconds || 0)) {
      latest = { id: d.id, ...data };
    }
  });

  if (!latest) return;

  // increment views (basic)
  await updateDoc(doc(db, "posts", latest.id), {
    views: increment(1)
  });

  const now = Date.now() / 1000;
  const hrs = latest.updatedAt?.seconds
    ? Math.floor((now - latest.updatedAt.seconds) / 3600)
    : 0;

  document.getElementById("postPreview").innerText =
    latest.content.substring(0, 300) + (latest.content.length > 300 ? "..." : "");

  document.getElementById("postFull").innerText = latest.content;
  document.getElementById("postMeta").innerText =
    `Updated ${hrs} hrs ago • Views ${(latest.views || 0) + 1}`;
}

/* 🔘 Expose to window */
window.addUser = addUser;
window.sendMessage = sendMessage;
window.loadLatestPost = loadLatestPost;

/* 🚀 Auto load post on page open */
loadLatestPost();
