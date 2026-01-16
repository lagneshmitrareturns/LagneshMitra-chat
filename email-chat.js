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

const form = document.getElementById("caseForm");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusMsg.style.display = "block";
  statusMsg.innerText = "Submitting your case...";

  try {
    await addDoc(collection(db, "cases"), {
      name: name.value,
      whatsapp: whatsapp.value,
      queryType: queryType.value,
      message: message.value,
      dob: dob.value,
      tob: tob.value,
      pob: pob.value,
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