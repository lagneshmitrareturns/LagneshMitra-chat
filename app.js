import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  increment,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
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

/* =====================================================
   🔵 HALL OF FAME — STATE (SINGLE SOURCE OF TRUTH)
   ===================================================== */

let currentPostRef = null;
let currentPostId = null;

let expanded = false;
let viewCounted = false;
let isToggling = false;

/* =====================================================
   🔵 UTILS (EXPOSED)
   ===================================================== */

window.closeAllDropdowns = function () {
  document.querySelectorAll(".dropdown").forEach(d => {
    d.style.display = "none";
  });
};

function formatMinutesAgo(seconds) {
  const mins = Math.floor((Date.now() - seconds * 1000) / 60000);
  if (mins <= 0) return "just now";
  return `${mins} mins ago`;
}

/* =====================================================
   🔵 LOAD LATEST HALL OF FAME POST (SAFE)
   ===================================================== */

window.loadLatestPost = async function () {
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

  if (currentPostId && currentPostId !== newPostId) {
    expanded = false;
    viewCounted = false;

    const card = document.getElementById("postCard");
    const toggleBtn =
      document.getElementById("toggleBtn") ||
      document.getElementById("toggleBtnExpand");

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

  if (!expanded) {
    previewEl.innerText = preview;
    fullEl.innerText = post.content;
  }

  const timeText = post.updatedAt?.seconds
    ? formatMinutesAgo(post.updatedAt.seconds)
    : "just now";

  metaEl.innerText = `Updated ${timeText} • Views ${post.views || 0}`;
};

/* =====================================================
   🔵 TOGGLE EXPAND LOGIC (BUTTON SAFE)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("postCard");
  const toggleBtn =
    document.getElementById("toggleBtn") ||
    document.getElementById("toggleBtnExpand");

  if (!card || !toggleBtn) return;

  toggleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentPostRef || isToggling) return;

    isToggling = true;
    expanded = !expanded;

    card.classList.toggle("expanded", expanded);
    toggleBtn.innerText = expanded ? "Collapse" : "Expand";

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

    setTimeout(() => {
      isToggling = false;
    }, 700);
  });

  window.loadLatestPost();
});

/* =====================================================
   🔵 AUTO REFRESH (SAFE)
   ===================================================== */

setInterval(() => {
  window.loadLatestPost();
}, 60000);

/* =====================================================
   🔵 ADMIN MENU SAFETY HOOK
   ===================================================== */

["loadAdd", "loadEditLatest", "loadManage"].forEach(fn => {
  if (typeof window[fn] === "function") {
    const original = window[fn];
    window[fn] = function (...args) {
      window.closeAllDropdowns();
      return original.apply(this, args);
    };
  }
});

/* =====================================================
   🟣 PHASE-2: CASE / EMAIL RECEIVING ENGINE
   ===================================================== */

/* 🔹 SUBMIT CASE (customer side) */
window.submitCase = async function (payload) {
  try {
    await addDoc(collection(db, "cases"), {
      ...payload,
      status: "Query Submitted",
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.error("Case submit failed:", err);
    return { success: false };
  }
};

/* 🔹 ADMIN LIVE INBOX LISTENER */
window.listenCasesInbox = function (callback) {
  const q = query(
    collection(db, "cases"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const cases = [];
    snap.forEach(d => {
      cases.push({ id: d.id, ...d.data() });
    });
    callback(cases);
  });
};

/* 🔹 ADMIN STATUS UPDATE */
window.updateCaseStatus = async function (caseId, status) {
  try {
    await updateDoc(doc(db, "cases", caseId), { status });
  } catch (err) {
    console.error("Status update failed:", err);
  }
};
