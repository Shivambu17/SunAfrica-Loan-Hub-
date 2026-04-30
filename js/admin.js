// js/admin.js
import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, addDoc, query, where, getDoc, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "dashboard.html";
    return;
  }
  loadAllApplications();
  loadAllPayments();
});

async function loadAllApplications() {
  const snapshot = await getDocs(collection(db, "loanApplications"));
  const container = document.getElementById("applicationsList");
  if (snapshot.empty) { container.innerHTML = "<p>No applications yet</p>"; return; }
  let html = "";
  for (const loanDoc of snapshot.docs) {
    const data = loanDoc.data();
    let userInfo = "";
    try { const userSnap = await getDoc(doc(db, "users", data.userId)); if(userSnap.exists()) userInfo = userSnap.data().fullName + " (" + userSnap.data().email + ")"; } catch(e) { userInfo = data.userId; }
    html += `<div class="loan-card" data-id="${loanDoc.id}">
      <strong>${userInfo}</strong><br>
      Amount: R${data.loanAmount} | Interest: ${data.interestRate} | Status: <b>${data.status}</b><br>
      Documents: <a href="${data.documents?.bankStatement}" target="_blank" class="doc-link">Bank</a> <a href="${data.documents?.payslip}" target="_blank" class="doc-link">Payslip</a> <a href="${data.documents?.idDocument}" target="_blank" class="doc-link">ID</a><br>
      Admin comment: <span id="comment-${loanDoc.id}">${data.adminComment || "—"}</span><br>
      <input type="text" id="adminCommentInput-${loanDoc.id}" placeholder="Add comment" style="width:200px;">
      <button class="comment-btn" data-id="${loanDoc.id}">Add Comment</button>
      <button class="approve" data-id="${loanDoc.id}">✅ Approve</button>
      <button class="reject" data-id="${loanDoc.id}">❌ Reject</button>
      <button class="disburse" data-id="${loanDoc.id}" ${data.disbursed ? "disabled" : ""}>💰 Mark Disbursed</button>
    </div>`;
  }
  container.innerHTML = html;
  
  document.querySelectorAll(".approve").forEach(btn => btn.addEventListener("click", async () => { await updateDoc(doc(db, "loanApplications", btn.dataset.id), { status: "approved", adminComment: document.getElementById(`adminCommentInput-${btn.dataset.id}`).value || "Approved" }); loadAllApplications(); }));
  document.querySelectorAll(".reject").forEach(btn => btn.addEventListener("click", async () => { await updateDoc(doc(db, "loanApplications", btn.dataset.id), { status: "rejected", adminComment: document.getElementById(`adminCommentInput-${btn.dataset.id}`).value || "Rejected" }); loadAllApplications(); }));
  document.querySelectorAll(".disburse").forEach(btn => btn.addEventListener("click", async () => { await updateDoc(doc(db, "loanApplications", btn.dataset.id), { disbursed: true }); loadAllApplications(); }));
  document.querySelectorAll(".comment-btn").forEach(btn => btn.addEventListener("click", async () => { const comment = document.getElementById(`adminCommentInput-${btn.dataset.id}`).value; await updateDoc(doc(db, "loanApplications", btn.dataset.id), { adminComment: comment }); loadAllApplications(); }));
}

async function loadAllPayments() {
  const paymentsSnap = await getDocs(query(collection(db, "payments"), orderBy("paymentDate", "desc")));
  let paymentHtml = "<ul>";
  paymentsSnap.forEach(p => { const d = p.data(); paymentHtml += `<li>Loan ${d.loanId.substring(0,6)}: R${d.amount} on ${d.paymentDate} via ${d.method}</li>`; });
  document.getElementById("paymentTracking").innerHTML = paymentHtml + "</ul><button id="showPaymentBtn">➕ Record Payment</button>";
  document.getElementById("showPaymentBtn")?.addEventListener("click", () => { document.getElementById("addPaymentForm").style.display = "block"; });
  document.getElementById("recordPaymentBtn")?.addEventListener("click", async () => {
    const loanId = prompt("Enter Loan Application ID:");
    if (!loanId) return;
    const amount = document.getElementById("paymentAmount").value;
    const method = document.getElementById("paymentMethod").value;
    await addDoc(collection(db, "payments"), { loanId, amount: parseInt(amount), paymentDate: new Date().toISOString().split('T')[0], method, recordedBy: auth.currentUser?.uid });
    loadAllPayments();
    document.getElementById("addPaymentForm").style.display = "none";
  });
}

document.getElementById("adminLogout").addEventListener("click", async () => { await signOut(auth); window.location.href = "index.html"; });