// js/loan.js
import { auth, db, storage } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const amountSelect = document.getElementById("loanAmount");
  const rateField = document.getElementById("interestRateDisplay");
  
  amountSelect.addEventListener("change", () => {
    let amount = parseInt(amountSelect.value);
    if (isNaN(amount)) rateField.value = "";
    else if (amount <= 1000) rateField.value = "10% APR";
    else if (amount <= 5000) rateField.value = "15% APR";
    else rateField.value = "20% APR";
  });

  const form = document.getElementById("loanApplicationForm");
  const msg = document.getElementById("loanAppMessage");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      msg.innerText = "Please login first";
      window.location.href = "login.html";
      return;
    }
    const userId = auth.currentUser.uid;
    const loanAmount = parseInt(amountSelect.value);
    let interestRate = "";
    if (loanAmount <= 1000) interestRate = "10%";
    else if (loanAmount <= 5000) interestRate = "15%";
    else interestRate = "20%";
    
    const files = {
      bank: document.getElementById("bankStatement").files[0],
      payslip: document.getElementById("payslip").files[0],
      id: document.getElementById("idDocument").files[0]
    };
    if (!files.bank || !files.payslip || !files.id) {
      msg.innerText = "Please upload all required documents";
      return;
    }
    
    msg.innerText = "Uploading documents...";
    msg.className = "message";
    
    // upload files to storage
    const uploadFile = async (file, type) => {
      const fileRef = ref(storage, `loanDocuments/${userId}/${Date.now()}_${type}_${file.name}`);
      await uploadBytesResumable(fileRef, file);
      return await getDownloadURL(fileRef);
    };
    
    try {
      const [bankURL, payslipURL, idURL] = await Promise.all([
        uploadFile(files.bank, "bank_statement"),
        uploadFile(files.payslip, "payslip"),
        uploadFile(files.id, "id_copy")
      ]);
      
      const loanData = {
        userId,
        loanAmount,
        interestRate,
        status: "pending",
        documents: {
          bankStatement: bankURL,
          payslip: payslipURL,
          idDocument: idURL
        },
        createdAt: serverTimestamp(),
        adminComment: "",
        disbursed: false
      };
      
      await addDoc(collection(db, "loanApplications"), loanData);
      msg.innerText = "✅ Application submitted successfully! Await approval.";
      msg.className = "message success";
      form.reset();
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
    } catch (error) {
      msg.innerText = "Upload failed: " + error.message;
      msg.className = "message error";
    }
  });
});