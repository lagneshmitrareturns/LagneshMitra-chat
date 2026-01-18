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

/* ================= LOAD HOF ================= */
async function loadHallOfFame() {
  let snap;

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
    // 2️⃣ Fallback: latest updated post
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
  const content = data.content || "";

  // Meta line
  metaEl.innerText = data.featured
    ? "Featured Transmission"
    : "Latest Transmission";

  // Preview (first 240 chars)
  previewEl.innerText = content.slice(0, 240) + (content.length > 240 ? "…" : "");
  fullEl.innerText = content;

  // Increment views (silent)
  try {
    await updateDoc(doc(db, "posts", docSnap.id), {
      views: (data.views || 0) + 1
    });
  } catch (e) {
    console.warn("View update skipped");
  }
}

/* ================= INIT ================= */
loadHallOfFame();
