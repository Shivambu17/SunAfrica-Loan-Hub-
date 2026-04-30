// js/login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase.js';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMessage");

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    // check email verification
    if (!user.emailVerified) {
      await auth.signOut();
      msg.innerText = "⚠️ Please verify your email first. Check your inbox.";
      msg.className = "message error";
      return;
    }
    // fetch user role
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "applicant";
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    msg.innerText = "❌ " + error.message;
    msg.className = "message error";
  }
});

document.getElementById("forgotPasswordLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  if (!email) {
    alert("Enter your email address first");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent to your email");
  } catch (err) {
    alert(err.message);
  }
});