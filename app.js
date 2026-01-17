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
   🔵 HALL OF FAME — UNCHANGED
   ===================================================== */

let currentPostRef = null;
let currentPostId = null;
let expanded = false;
let viewCounted = false;
let isToggling = false;

/* =====================================================
   🔵 UTILS
   ===================================================== */

window.closeAllDropdowns = function () {
  document.querySelectorAll(".dropdown").forEach(d => d.style.display = "none");
};

function formatMinutesAgo(seconds) {
  const mins = Math.floor((Date.now() - seconds * 1000) / 60000);
  return mins <= 0 ? "just now" : `${mins} mins ago`;
}

/* =====================================================
   🔵 LOAD LATEST POST (SAFE)
   ===================================================== */

window.loadLatestPost = async function () {
  const q = query(collection(db, "posts"), orderBy("updatedAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const d = snap.docs[0];
  const post = d.data();

  currentPostId = d.id;
  currentPostRef = doc(db, "posts", d.id);

  const preview = post.content.length > 260
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

  metaEl.innerText =
    `Updated ${post.updatedAt?.seconds ? formatMinutesAgo(post.updatedAt.seconds) : "just now"} • Views ${post.views || 0}`;
};

/* =====================================================
   🟣 CASE / MAILBOX ENGINE — FINAL
   ===================================================== */

/* 🔹 SUBMIT CASE (CUSTOMER SIDE) */
window.submitCase = async function (payload) {
  try {
    await addDoc(collection(db, "cases"), {
      name: payload.name || "",
      whatsapp: payload.whatsapp || "",
      email: payload.email || "",
      queryType: payload.queryType || "",
      message: payload.message || "",

      dob: payload.dob || "",
      tob: payload.tob || "",
      pob: payload.pob || "",

      attachmentUrl: payload.attachmentUrl || "",
      chartUrl: payload.chartUrl || "",

      status: "Query Submitted",
      stage: "Inbox",
      isRead: false,

      priority: "Normal",
      assignedTo: "Unassigned",

      zenoScore: payload.zenoScore || 1,
      riskFlag: payload.riskFlag || false,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Case submit failed:", err);
    return { success: false };
  }
};

/* =====================================================
   📥 ADMIN INBOX — STAGE AWARE LISTENER
   ===================================================== */

window.listenCasesInbox = function (callback) {
  const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));

  return onSnapshot(q, snap => {
    const buckets = {
      inbox: [],
      sent: [],
      drafts: [],
      archive: []
    };

    snap.forEach(d => {
      const data = { id: d.id, ...d.data() };

      /* 🔧 BACKWARD COMPAT FIX */
      if (!data.stage) data.stage = "Inbox";

      switch (data.stage) {
        case "Sent":
          buckets.sent.push(data);
          break;
        case "Draft":
          buckets.drafts.push(data);
          break;
        case "Archive":
          buckets.archive.push(data);
          break;
        default:
          buckets.inbox.push(data);
      }
    });

    callback({
      inbox: buckets.inbox,
      sent: buckets.sent,
      drafts: buckets.drafts,
      archive: buckets.archive,
      unreadCount: buckets.inbox.filter(c => !c.isRead).length
    });
  });
};

/* =====================================================
   ✉️ OPEN CASE (MARK READ)
   ===================================================== */

window.openCase = async function (caseId) {
  try {
    await updateDoc(doc(db, "cases", caseId), {
      isRead: true,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Open case failed", e);
  }
};

/* =====================================================
   🔁 STATUS + STAGE CONTROLLER (CRITICAL)
   ===================================================== */

window.updateCaseStatus = async function (caseId, action) {
  let status = "Query Submitted";
  let stage = "Inbox";

  switch (action) {
    case "reply":
      status = "Replied";
      stage = "Sent";
      break;

    case "draft":
      status = "Draft";
      stage = "Draft";
      break;

    case "archive":
      status = "Closed";
      stage = "Archive";
      break;

    case "restore":
      status = "Query Submitted";
      stage = "Inbox";
      break;
  }

  try {
    await updateDoc(doc(db, "cases", caseId), {
      status,
      stage,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Status update failed:", err);
  }
};

/* =====================================================
   🔔 NEW CASE NOTIFICATION HOOK
   ===================================================== */

window.onNewCaseNotify = function (handler) {
  const q = query(
    collection(db, "cases"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, snap => {
    snap.forEach(d => {
      const data = d.data();
      if (data.stage === "Inbox" && !data.isRead) {
        handler(data);
      }
    });
  });
};
