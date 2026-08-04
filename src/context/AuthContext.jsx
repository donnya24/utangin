import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Sign In with Google (auto create jika belum ada)
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Cek apakah user sudah terdaftar di Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Auto daftarkan user baru
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        });
      }

      setIsGuest(false);
      return result;
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Login dibatalkan.");
      }
      throw error;
    }
  };

  // Guest mode
  const signInAsGuest = () => {
    setUser({
      uid: "guest_" + Date.now(),
      displayName: "Tamu",
      email: null,
      photoURL: null,
      isGuest: true,
    });
    setIsGuest(true);
  };

  const logout = async () => {
    if (isGuest) {
      setUser(null);
      setIsGuest(false);
    } else {
      await signOut(auth);
    }
  };

  const deleteAccount = async () => {
    if (!user || isGuest) return;
    try {
      // Hapus semua data transaksi user
      const { deleteAllTransactions } =
        await import("../services/firestoreService");
      await deleteAllTransactions(user.uid);

      // Hapus data user di Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await deleteDoc(userRef);
      }

      // Hapus akun auth
      await firebaseDeleteUser(user);
    } catch (error) {
      console.error("Gagal menghapus akun:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        signInWithGoogle,
        signInAsGuest,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
