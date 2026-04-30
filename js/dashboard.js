// js/dashboard.js
import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUserId = null;
let currentLoanId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  if (!user.emailVerified) { await auth.signOut(); alert("Email not verified"); window.location.href="login.html"; return; }
  currentUserId = user.uid;
  const userDoc = await getDoc(doc(db, "users", currentUserId));
  if (userDoc.exists()) {
    document.getElementById("userName").innerText = userDoc.data().fullName || user;
    document.getElementById("profileName").value = userDoc.data().fullName || "";
    document.getElementById("profilePhone").value = userDoc.data().phone || "";
  }
  loadDashboard();
});

async function loadDashboard() {
  const q = query(collection(db, "loanApplications"), where("userId", "==", currentUserId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    document.getElementById("loanDetails").innerHTML = `<p>No active loan found. <a href="apply-loan.html">Apply Now</a></p>`;
    return;
  }
  const loan = snapshot.docs[0];
  currentLoanId = loan.id;
  const data = loan.data();
  const statusClass = data.status === "approved" ? "approved" : (data.status === "rejected" ? "rejected" : "pending");
  document.getElementById("loanDetails").innerHTML = `
    <p><strong>Loan Amount:</strong> R${data.loanAmount}</p>
    <p><strong>Interest Rate:</strong> ${data.interestRate}</p>
    <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${data.status.toUpperCase()}</span></p>
    <p><strong>Admin comment:</strong> ${data.adminComment || "—"}</p>
    ${data.disbursed ? '<p>✅ Funds Disbursed</p>' : '<p>⏳ Awaiting disbursement</p>'}
  `;
  
  // payment history
  const paymentsQuery = query(collection(db, "payments"), where("loanId", "==", currentLoanId), orderBy("paymentDate", "desc"));
  const paymentsSnap = await getDocs(paymentsQuery);
  let historyHtml = "<ul>";
  paymentsSnap.forEach(p => { const pm = p.data(); historyHtml += `<li>R${pm.amount} - ${pm.paymentDate} (${pm.method})</li>`; });
  historyHtml += paymentsSnap.empty ? "<li>No payments recorded yet</li>" : "";
  historyHtml += "</ul>";
  document.getElementById("paymentHistory").innerHTML = historyHtml;
  
  // documents
  if (data.documents) {
    let docHtml = `<a href="${data.documents.bankStatement}" target="_blank" class="doc-link">📄 Bank Statement</a>
    <a href="${data.documents.payslip}" target="_blank" class="doc-link">📄 Payslip</a>
    <a href="${data.documents.idDocument}" target="_blank" class="doc-link">🆔 ID Copy</a>`;
    document.getElementById("documentsList").innerHTML = docHtml;
  }
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("profileName").value;
  const phone = document.getElementById("profilePhone").value;
  await updateDoc(doc(db, "users", currentUserId), { fullName: name, phone });
  document.getElementById("profileMsg").innerText = "Profile updated!";
  document.getElementById("userName").innerText = name;
});

document.getElementById("logoutBtn").addEventListener("click", async () => { await signOut(auth); window.location.href = "index.html"; });

// tab switching
document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active-tab"));
    btn.classList.add("active-tab");
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});