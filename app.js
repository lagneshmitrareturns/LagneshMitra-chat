import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  updateDoc,
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
  projectId: "lagneshmitra-e57b8"
};

/* 🚀 Init */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🔒 State (SINGLE SOURCE OF TRUTH) */
let currentPostRef = null;
let expanded = false;
let viewCounted = false;

/* ⏱ Time formatter */
function formatMinutesAgo(seconds) {
  const mins = Math.floor((Date.now() - seconds * 1000) / 60000);
  if (mins <= 0) return "just now";
  return `${mins} mins ago`;
}

/* 🏆 Load Latest Hall of Fame Post
   ⚠️ DOES NOT TOUCH EXPAND STATE */
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
  currentPostRef = doc(db, "posts", snapDoc.id);

  const preview =
    post.content.length > 260
      ? post.content.slice(0, 260) + "..."
      : post.content;

  document.getElementById("postPreview").innerText = preview;
  document.getElementById("postFull").innerText = post.content;

  const timeText = post.updatedAt?.seconds
    ? formatMinutesAgo(post.updatedAt.seconds)
    : "just now";

  document.getElementById("postMeta").innerText =
    `Updated ${timeText} • Views ${post.views || 0}`;
}

/* 🔘 Toggle Hall of Fame
   ✅ ONLY PLACE THAT CONTROLS EXPAND */
async function togglePost() {
  if (!currentPostRef) return;

  expanded = !expanded;

  const card = document.querySelector(".post-card");
  card.classList.toggle("expanded", expanded);

  /* 👁 Count view ONLY once */
  if (expanded && !viewCounted) {
    await updateDoc(currentPostRef, {
      views: increment(1)
    });
    viewCounted = true;
  }
}

/* 🌐 Expose globally */
window.togglePost = togglePost;

/* 🚀 Initial load */
loadLatestPost();

/* 🔁 Auto refresh (SAFE, no flicker, no collapse) */
setInterval(loadLatestPost, 60000);
