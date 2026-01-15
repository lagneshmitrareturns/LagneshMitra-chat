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

/* ================= STATE (SINGLE SOURCE OF TRUTH) ================= */
let currentPostRef = null;
let currentPostId = null;

let expanded = false;
let viewCounted = false;

/* 🔒 HARD LOCK — kills ghost / double click */
let isToggling = false;

/* ================= UTILS ================= */

/* ⬇️ CLOSE ALL DROPDOWNS (ADMIN MENU SAFETY) */
function closeAllDropdowns() {
  document.querySelectorAll(".dropdown").forEach(d => {
    d.style.display = "none";
  });
}

/* ================= TIME FORMAT ================= */
function formatMinutesAgo(seconds) {
  const mins = Math.floor((Date.now() - seconds * 1000) / 60000);
  if (mins <= 0) return "just now";
  return `${mins} mins ago`;
}

/* ================= LOAD LATEST POST =================
   🔥 SAFE:
   - does NOT collapse expanded card
   - resets view counter ONLY if post changes
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
  const newPostId = snapDoc.id;

  /* 🧠 If new post arrived → reset counters */
  if (currentPostId && currentPostId !== newPostId) {
    viewCounted = false;
    expanded = false;

    const card = document.getElementById("postCard");
    const toggleBtn = document.getElementById("toggleBtn");

    if (card && toggleBtn) {
      card.classList.remove("expanded");
      toggleBtn.innerText = "Expand";
    }
  }

  currentPostId = newPostId;
  currentPostRef = doc(db, "posts", newPostId);

  const preview =
    post.content.length > 260
      ? post.content.slice(0, 260) + "..."
      : post.content;

  const previewEl = document.getElementById("postPreview");
  const fullEl = document.getElementById("postFull");
  const metaEl = document.getElementById("postMeta");

  if (!previewEl || !fullEl || !metaEl) return;

  /* 🛡 If expanded → don’t disturb content */
  if (!expanded) {
    previewEl.innerText = preview;
    fullEl.innerText = post.content;
  }

  const timeText = post.updatedAt?.seconds
    ? formatMinutesAgo(post.updatedAt.seconds)
    : "just now";

  metaEl.innerText = `Updated ${timeText} • Views ${post.views || 0}`;
}

/* ================= TOGGLE LOGIC (BUTTON ONLY) ================= */
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("postCard");
  const toggleBtn = document.getElementById("toggleBtn");

  if (!card || !toggleBtn) return;

  toggleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentPostRef) return;
    if (isToggling) return;

    isToggling = true;

    expanded = !expanded;
    card.classList.toggle("expanded", expanded);
    toggleBtn.innerText = expanded ? "Collapse" : "Expand";

    /* 👁 Count view ONLY on first expand */
    if (expanded && !viewCounted) {
      try {
        await updateDoc(currentPostRef, {
          views: increment(1)
        });
        viewCounted = true;
      } catch (err) {
        console.error("View increment failed:", err);
      }
    }

    /* 🔓 unlock AFTER CSS transition */
    setTimeout(() => {
      isToggling = false;
    }, 700);
  });
});

/* ================= ADMIN MENU HOOKS =================
   🔥 Any admin action auto-closes dropdown
*/
["loadAdd", "loadEditLatest", "loadManage"].forEach(fn => {
  if (window[fn]) {
    const original = window[fn];
    window[fn] = function (...args) {
      closeAllDropdowns();
      return original.apply(this, args);
    };
  }
});

/* ================= INIT ================= */
loadLatestPost();

/* ================= AUTO REFRESH =================
   🧠 SAFE:
   - no expand reset
   - no click rebinding
*/
setInterval(() => {
  loadLatestPost();
}, 60000);
