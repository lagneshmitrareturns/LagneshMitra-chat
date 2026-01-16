import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCX8yGRJc5AcxSEaaC6AzNLZzxtOCz83Sk",
  authDomain: "lagneshmitra-e57b8.firebaseapp.com",
  projectId: "lagneshmitra-e57b8"
};

/* 🚀 INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   📩 EMAIL / CASE SUBMISSION
   =============================== */

const form = document.getElementById("caseForm");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.innerText = "Submitting your case...";
  statusMsg.style.color = "#c4b5fd";

  const payload = {
    name: document.getElementById("name").value.trim(),
    whatsapp: document.getElementById("whatsapp").value.trim(),
    queryType: document.getElementById("queryType").value,
    message: document.getElementById("message").value.trim(),
    dob: document.getElementById("dob").value.trim(),
    tob: document.getElementById("tob").value.trim(),
    pob: document.getElementById("pob").value.trim(),

    /* SYSTEM FIELDS */
    status: "Query Submitted",
    zenoScore: 1,
    isPaid: false,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "cases"), payload);

    statusMsg.innerText = "✅ Case submitted successfully. Data has reached our system.";
    statusMsg.style.color = "#4ade80";

    form.reset();
  } catch (err) {
    console.error("Case submit error:", err);
    statusMsg.innerText = "❌ Submission failed. Please try again.";
    statusMsg.style.color = "#f87171";
  }
});