import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔐 Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyCX8yGRJc5AcxSEaaC6AzNLZzxtOCz83Sk",
  authDomain: "lagneshmitra-e57b8.firebaseapp.com",
  projectId: "lagneshmitra-e57b8",
  storageBucket: "lagneshmitra-e57b8.firebasestorage.app",
  messagingSenderId: "420798143606",
  appId: "1:420798143606:web:ace6aec7d195492a415357"
};

/* 🚀 Init */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🧠 Helpers */
function getValue(id) {
  return document.getElementById(id).value.trim();
}

function clearForm() {
  ["name","mobile","gender","dob","tob","pob"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

function getUserId() {
  return getValue("mobile"); // mobile = unique ID
}

/* 👤 Add User */
async function addUser() {
  const userId = getUserId();
  if (!userId) return alert("Mobile number required");

  await setDoc(doc(db, "users", userId), {
    name: getValue("name"),
    mobile: userId,
    gender: getValue("gender"),
    dob: getValue("dob"),
    tob: getValue("tob"),
    pob: getValue("pob"),
    hasActiveOrder: true,
    createdAt: serverTimestamp()
  });

  clearForm();
  document.getElementById("output").innerText = "✅ User added";

  loadData(); // 🔥 auto refresh table
}

/* 💬 Add Chat */
async function addChat() {
  const userId = getUserId();
  if (!userId) return alert("Mobile required");

  await setDoc(doc(db, "chats", userId), {
    userId,
    lastMessage: "Namaste! I want advanced analysis",
    lastMessageAt: serverTimestamp(),
    unread: true,
    status: "new",
    paymentStatus: "not_received"
  });

  document.getElementById("output").innerText = "✅ Chat added";
  loadData(); // 🔥 auto refresh table
}

/* 📥 Load Firestore Data */
async function loadData() {
  // USERS
  const usersSnap = await getDocs(collection(db, "users"));
  let usersHTML = `
    <table border="1" width="100%">
      <tr><th>Mobile</th><th>Name</th><th>DOB</th><th>POB</th></tr>
  `;

  usersSnap.forEach(doc => {
    const d = doc.data();
    usersHTML += `
      <tr>
        <td>${d.mobile}</td>
        <td>${d.name}</td>
        <td>${d.dob}</td>
        <td>${d.pob}</td>
      </tr>`;
  });

  usersHTML += "</table>";
  document.getElementById("usersTable").innerHTML = usersHTML;

  // CHATS
  const chatsSnap = await getDocs(collection(db, "chats"));
  let chatsHTML = `
    <table border="1" width="100%">
      <tr><th>User</th><th>Last Message</th><th>Status</th><th>Payment</th></tr>
  `;

  chatsSnap.forEach(doc => {
    const d = doc.data();
    chatsHTML += `
      <tr>
        <td>${d.userId}</td>
        <td>${d.lastMessage || "-"}</td>
        <td>${d.status}</td>
        <td>${d.paymentStatus}</td>
      </tr>`;
  });

  chatsHTML += "</table>";
  document.getElementById("chatsTable").innerHTML = chatsHTML;
}

/* 🔘 Bind buttons */
window.addUser = addUser;
window.addChat = addChat;
window.loadData = loadData;