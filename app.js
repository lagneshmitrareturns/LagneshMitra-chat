import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  increment,
  query,
  orderBy,
  limit
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

/* ⏱ Minutes-only formatter */
function formatMinutesAgo(timestampSeconds) {
  const diffMs = Date.now() - timestampSeconds * 1000;
  const mins = Math.floor(diffMs / 60000);
  if (mins <= 0) return "just now";
  return `${mins} mins ago`;
}

/* 👤 Add / Update User */
async function addUser() {
  if (!uid()) return alert("Mobile number required");

  await setDoc(
    doc(db, "users", uid()),
    {
      name: val("name"),
      mobile: uid(),
      gender: val("gender"),
      dob: val("dob"),
      tob: val("tob"),
      pob: val("pob"),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  document.getElementById("output").innerText = "✅ Details submitted";
}

/* 💬 Send Chat Message */
async function sendMessage() {
  if (!uid()) return alert("Mobile required");
  if (!val("message")) return alert("Type your concern");

  await setDoc(
    doc(db, "chats", uid()),
    {
      userId: uid(),
      lastMessage: val("message"),
      lastMessageAt: serverTimestamp(),
      status: "new",
      unread: true
    },
    { merge: true }
  );

  document.getElementById("message").value = "";
  document.getElementById("output").innerText = "📨 Message sent";
}

/* 🏆 Load Latest Hall of Fame Post */
async function loadLatestPost() {
  const q = query(
    collection(db, "posts"),
    orderBy("updatedAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const snapDoc = snap.docs[0];
  const post = snapDoc.data();
  const postRef = doc(db, "posts", snapDoc.id);

  /* 🔢 Increment views (temporary logic) */
  await updateDoc(postRef, {
    views: increment(1)
  });

  /* ⏱ Minutes ago text */
  const timeText = post.updatedAt?.seconds
    ? formatMinutesAgo(post.updatedAt.seconds)
    : "just now";

  /* ✂️ Preview */
  const preview =
    post.content.length > 300
      ? post.content.slice(0, 300) + "..."
      : post.content;

  /* 🪄 Render */
  document.getElementById("postPreview").innerText = preview;
  document.getElementById("postFull").innerText = post.content;
  document.getElementById("postMeta").innerText =
    `Updated ${timeText} • Views ${(post.views || 0) + 1}`;
}

/* 🔘 Expose */
window.addUser = addUser;
window.sendMessage = sendMessage;
window.loadLatestPost = loadLatestPost;

/* 🚀 Initial load */
loadLatestPost();

/* 🔁 Auto refresh every 1 minute */
setInterval(loadLatestPost, 60000);
