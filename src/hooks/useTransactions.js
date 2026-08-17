import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function useTransactions() {
  const { user, isGuest } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    if (isGuest) {
      // Load dari localStorage
      const loadGuestData = () => {
        const guestTx = JSON.parse(
          localStorage.getItem("utangin_guest_tx") || "[]",
        );
        setTransactions(guestTx);
      };
      loadGuestData();

      // Listen storage event untuk update antar tab
      const handleStorage = (e) => {
        if (e.key === "utangin_guest_tx") {
          loadGuestData();
        }
      };
      window.addEventListener("storage", handleStorage);

      // Polling untuk update dalam tab yang sama
      const interval = setInterval(loadGuestData, 1000);

      return () => {
        window.removeEventListener("storage", handleStorage);
        clearInterval(interval);
      };
    }

    // Firebase user
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user, isGuest]);

  return transactions;
}
