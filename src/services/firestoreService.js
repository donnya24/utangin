import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addTransaction(
  userId,
  name,
  phone,
  amount,
  type,
  description,
) {
  // Jika guest, gunakan localStorage
  if (userId.startsWith("guest_")) {
    const tx = {
      id: "guest_" + Date.now(),
      userId,
      contactName: name.trim(),
      phone: phone.trim(),
      amount: Number(amount),
      paidAmount: 0,
      type,
      status: "belum_lunas",
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    const guestTx = JSON.parse(
      localStorage.getItem("utangin_guest_tx") || "[]",
    );
    guestTx.unshift(tx);
    localStorage.setItem("utangin_guest_tx", JSON.stringify(guestTx));
    return tx;
  }

  return addDoc(collection(db, "transactions"), {
    userId,
    contactName: name.trim(),
    phone: phone.trim(),
    amount: Number(amount),
    paidAmount: 0,
    type,
    status: "belum_lunas",
    description: description.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function addPayment(transactionId, paymentAmount) {
  // Untuk guest, update localStorage
  if (transactionId.startsWith("guest_")) {
    const guestTx = JSON.parse(
      localStorage.getItem("utangin_guest_tx") || "[]",
    );
    const txIndex = guestTx.findIndex((t) => t.id === transactionId);
    if (txIndex === -1) throw new Error("Transaksi tidak ditemukan");
    const tx = guestTx[txIndex];
    tx.paidAmount = (tx.paidAmount || 0) + Number(paymentAmount);
    tx.status = tx.paidAmount >= tx.amount ? "lunas" : "belum_lunas";
    localStorage.setItem("utangin_guest_tx", JSON.stringify(guestTx));
    return;
  }

  const txRef = doc(db, "transactions", transactionId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) throw new Error("Transaksi tidak ditemukan");
  const tx = txSnap.data();
  const newPaid = (tx.paidAmount || 0) + Number(paymentAmount);
  const newStatus = newPaid >= tx.amount ? "lunas" : "belum_lunas";
  return updateDoc(txRef, { paidAmount: newPaid, status: newStatus });
}

export async function toggleTransactionStatus(transactionId, currentStatus) {
  if (transactionId.startsWith("guest_")) {
    const guestTx = JSON.parse(
      localStorage.getItem("utangin_guest_tx") || "[]",
    );
    const txIndex = guestTx.findIndex((t) => t.id === transactionId);
    if (txIndex === -1) throw new Error("Transaksi tidak ditemukan");
    const tx = guestTx[txIndex];
    const newStatus = currentStatus === "lunas" ? "belum_lunas" : "lunas";
    tx.status = newStatus;
    if (newStatus === "lunas") tx.paidAmount = tx.amount;
    else tx.paidAmount = 0;
    localStorage.setItem("utangin_guest_tx", JSON.stringify(guestTx));
    return;
  }

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
  if (transactionId.startsWith("guest_")) {
    const guestTx = JSON.parse(
      localStorage.getItem("utangin_guest_tx") || "[]",
    );
    const filtered = guestTx.filter((t) => t.id !== transactionId);
    localStorage.setItem("utangin_guest_tx", JSON.stringify(filtered));
    return;
  }
  return deleteDoc(doc(db, "transactions", transactionId));
}

export async function deleteAllTransactions(userId) {
  if (userId.startsWith("guest_")) {
    localStorage.removeItem("utangin_guest_tx");
    return;
  }
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((doc) => batch.delete(doc.ref));
  return batch.commit();
}

export async function deleteMultipleTransactions(transactionIds) {
  // Pisahkan guest dan firestore
  const guestIds = transactionIds.filter((id) => id.startsWith("guest_"));
  const firestoreIds = transactionIds.filter((id) => !id.startsWith("guest_"));

  if (guestIds.length > 0) {
    const guestTx = JSON.parse(
      localStorage.getItem("utangin_guest_tx") || "[]",
    );
    const filtered = guestTx.filter((t) => !guestIds.includes(t.id));
    localStorage.setItem("utangin_guest_tx", JSON.stringify(filtered));
  }

  if (firestoreIds.length > 0) {
    const batch = writeBatch(db);
    firestoreIds.forEach((id) => {
      const ref = doc(db, "transactions", id);
      batch.delete(ref);
    });
    return batch.commit();
  }
}
