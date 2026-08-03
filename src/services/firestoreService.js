import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addContact(userId, name, phone, type) {
  return addDoc(collection(db, "contacts"), {
    userId,
    name,
    phone,
    type,
    createdAt: serverTimestamp(),
  });
}

export async function deleteContact(contactId) {
  return deleteDoc(doc(db, "contacts", contactId));
}

export async function addTransaction(
  userId,
  contactId,
  contactName,
  amount,
  type,
  description,
) {
  return addDoc(collection(db, "transactions"), {
    userId,
    contactId,
    contactName,
    amount: Number(amount),
    paidAmount: 0,
    type,
    status: "belum_lunas",
    description,
    createdAt: serverTimestamp(),
  });
}

export async function addPayment(transactionId, paymentAmount) {
  const txRef = doc(db, "transactions", transactionId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) throw new Error("Transaksi tidak ditemukan");
  const tx = txSnap.data();
  const newPaid = (tx.paidAmount || 0) + Number(paymentAmount);
  const newStatus = newPaid >= tx.amount ? "lunas" : "belum_lunas";
  return updateDoc(txRef, { paidAmount: newPaid, status: newStatus });
}

export async function toggleTransactionStatus(transactionId, currentStatus) {
  const txRef = doc(db, "transactions", transactionId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) throw new Error("Transaksi tidak ditemukan");
  const tx = txSnap.data();
  const newStatus = currentStatus === "lunas" ? "belum_lunas" : "lunas";
  const updateData = { status: newStatus };
  if (newStatus === "lunas") updateData.paidAmount = tx.amount;
  else updateData.paidAmount = 0;
  return updateDoc(txRef, updateData);
}

export async function deleteTransaction(transactionId) {
  return deleteDoc(doc(db, "transactions", transactionId));
}
