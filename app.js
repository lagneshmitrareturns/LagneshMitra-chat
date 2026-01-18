import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FIREBASE INIT ================= */
const app = initializeApp({
  apiKey: "AIzaSyCX8yGRJc5AcxSEaaC6AzNLZzxtOCz83Sk",
  authDomain: "lagneshmitra-e57b8.firebaseapp.com",
  projectId: "lagneshmitra-e57b8"
});
const db = getFirestore(app);

/* ================= DOM ================= */
const metaEl = document.getElementById("postMeta");
const previewEl = document.getElementById("postPreview");
const fullEl = document.getElementById("postFull");
const cardEl = document.getElementById("postCard");
const toggleBtn = document.getElementById("toggleBtn");

/* ================= STATE ================= */
let FULL_TEXT = "";
const PREVIEW_LIMIT = 260;

/* ================= LOAD HOF ================= */
async function loadHallOfFame() {
  let snap = null;

  // 1️⃣ Try featured post
  const featuredQ = query(
    collection(db, "posts"),
    where("featured", "==", true),
    limit(1)
  );
  const featuredSnap = await getDocs(featuredQ);

  if (!featuredSnap.empty) {
    snap = featuredSnap.docs[0];
  } else {
    // 2️⃣ Fallback to latest updated
    const latestQ = query(
      collection(db, "posts"),
      orderBy("updatedAt", "desc"),
      limit(1)
    );
    const latestSnap = await getDocs(latestQ);
    if (latestSnap.empty) return;
    snap = latestSnap.docs[0];
  }

  renderPost(snap);
}

/* ================= RENDER ================= */
async function renderPost(docSnap) {
  const data = docSnap.data();
  FULL_TEXT = data.content || "";

  // Meta
  metaEl.innerText = data.featured
    ? "🏆 Featured Transmission"
    : "🕯 Latest Transmission";

  // Preview + full separation
  previewEl.innerText =
    FULL_TEXT.slice(0, PREVIEW_LIMIT) +
    (FULL_TEXT.length > PREVIEW_LIMIT ? "…" : "");

  fullEl.innerText = FULL_TEXT;
  fullEl.style.display = "none"; // default collapsed

  toggleBtn.style.display =
    FULL_TEXT.length > PREVIEW_LIMIT ? "inline-block" : "none";

  // Silent view increment
  try {
    await updateDoc(doc(db, "posts", docSnap.id), {
      views: (data.views || 0) + 1
    });
  } catch {
    // ignore
  }
}

/* ================= EXPAND / COLLAPSE ================= */
toggleBtn.addEventListener("click", () => {
  const expanded = cardEl.classList.toggle("expanded");

  if (expanded) {
    previewEl.style.display = "none";
    fullEl.style.display = "block";
    toggleBtn.innerText = "Collapse";
  } else {
    previewEl.style.display = "block";
    fullEl.style.display = "none";
    toggleBtn.innerText = "Expand";
  }
});

/* ================= INIT ================= */
loadHallOfFame();
