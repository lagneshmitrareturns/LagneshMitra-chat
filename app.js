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

/* ================= STATE ================= */
let currentPostRef = null;
let expanded = false;
let viewCounted = false;

/* 🔒 HARD LOCK (PREVENT DOUBLE TOGGLE) */
let isToggling = false;

/* ================= TIME FORMAT ================= */
function formatMinutesAgo(seconds) {
  const mins = Math.floor((Date.now() - seconds * 1000) / 60000);
  if (mins <= 0) return "just now";
  return `${mins} mins ago`;
}

/* ================= LOAD LATEST POST =================
   ⚠️ DOES NOT TOUCH expand / collapse state
*/
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

/* ================= CLICK BIND (SINGLE SOURCE) ================= */
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("postCard");
  if (!card) return;

  card.addEventListener("click", async (e) => {
    e.stopPropagation();

    /* 🚫 block phantom / double clicks */
    if (isToggling) return;
    if (!currentPostRef) return;

    isToggling = true;

    expanded = !expanded;
    card.classList.toggle("expanded", expanded);

    /* 👁 Count view ONLY first real expand */
    if (expanded && !viewCounted) {
      await updateDoc(currentPostRef, {
        views: increment(1)
      });
      viewCounted = true;
    }

    /* 🔓 release lock AFTER CSS animation finishes */
    setTimeout(() => {
      isToggling = false;
    }, 650); // must be > CSS transition time
  });
});

/* ================= INIT ================= */
loadLatestPost();

/* ================= AUTO REFRESH =================
   SAFE: no collapse, no expand reset
*/
setInterval(loadLatestPost, 60000);
