import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG */
const app = initializeApp({
  apiKey:"AIzaSyCX8yGRJc5AcxSEaaC6AzNLZzxtOCz83Sk",
  authDomain:"lagneshmitra-e57b8.firebaseapp.com",
  projectId:"lagneshmitra-e57b8"
});

const db = getFirestore(app);

/* ================= DOM BINDINGS (FIX) ================= */
const form = document.getElementById("caseForm");
const statusMsg = document.getElementById("statusMsg");

const nameInput = document.getElementById("name");
const whatsappInput = document.getElementById("whatsapp");
const queryTypeInput = document.getElementById("queryType");
const messageInput = document.getElementById("message");
const dobInput = document.getElementById("dob");
const tobInput = document.getElementById("tob");
const pobInput = document.getElementById("pob");

/* ================= SUBMIT HANDLER ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.style.display = "block";
  statusMsg.innerText = "Submitting your case...";

  try {
    await addDoc(collection(db, "cases"), {
      name: nameInput.value,
      whatsapp: whatsappInput.value,
      queryType: queryTypeInput.value,
      message: messageInput.value,
      dob: dobInput.value,
      tob: tobInput.value,
      pob: pobInput.value,
      status: "Query Submitted",
      createdAt: serverTimestamp()
    });

    form.reset();
    statusMsg.innerText =
      "Your query has been submitted successfully. Please allow time for review.";

  } catch (err) {
    console.error(err);
    statusMsg.innerText =
      "Error submitting query. Please try again later.";
  }
});
