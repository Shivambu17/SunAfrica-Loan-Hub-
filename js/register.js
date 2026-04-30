// js/register.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const msgDiv = document.getElementById("message");

  if (password !== confirm) {
    msgDiv.innerText = "❌ Passwords do not match";
    msgDiv.className = "message error";
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    // send email verification
    await sendEmailVerification(user);
    // save user data (role = applicant)
    await setDoc(doc(db, "users", user.uid), {
      fullName: name,
      email: email,
      phone: phone,
      role: "applicant",
      emailVerified: false,
      createdAt: new Date().toISOString()
    });
    msgDiv.innerText = "✅ Verification email sent! Please verify your email before logging in.";
    msgDiv.className = "message success";
    setTimeout(() => { window.location.href = "login.html"; }, 3000);
  } catch (error) {
    msgDiv.innerText = `⚠️ ${error.message}`;
    msgDiv.className = "message error";
  }
});