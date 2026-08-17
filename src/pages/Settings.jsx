import { useAuth } from "../context/AuthContext";
import { LogOut, Trash2, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Settings() {
  const { user, isGuest, logout, deleteAccount, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "PERINGATAN! Semua data transaksi Anda akan dihapus permanen. Akun ini juga akan dihapus. Lanjutkan?",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      setToast({
        message:
          "Gagal menghapus akun. Anda mungkin harus login ulang terlebih dahulu.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgradeToGoogle = async () => {
    setIsUpgrading(true);
    try {
      await signInWithGoogle();
      setToast({
        message:
          "Berhasil terhubung dengan Google! Data Anda sekarang tersimpan di cloud.",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: error.message || "Gagal menghubungkan akun Google.",
        type: "error",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Pengaturan</h1>

      {/* Peringatan Guest */}
      {isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle
            size={20}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <h3 className="font-semibold text-amber-800 text-sm">Mode Tamu</h3>
            <p className="text-xs text-amber-700 mt-1">
              Data Anda hanya tersimpan di perangkat ini dan akan hilang jika
              cache dibersihkan. Masuk dengan Google untuk menyimpan data secara
              permanen di cloud.
            </p>
            <button
              onClick={handleUpgradeToGoogle}
              disabled={isUpgrading}
              className="mt-3 flex items-center gap-2 bg-white border border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-100 transition disabled:opacity-50"
            >
              <Shield size={16} />
              {isUpgrading ? "Menghubungkan..." : "Masuk dengan Google"}
            </button>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
        <img
          src="/icon-512.png"
          alt="Utangin"
          className="w-16 h-16 rounded-2xl shadow-sm"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "flex";
          }}
        />
        <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-sm items-center justify-center hidden">
          <span className="text-white font-bold text-2xl">U</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Utangin</h3>
          <p className="text-sm text-slate-500">Pencatat hutang piutang</p>
          <p className="text-xs text-slate-400">Versi 1.0</p>
        </div>
      </div>

      {/* Profil */}
      <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
        {!isGuest && user?.photoURL ? (
          <img
            src={user.photoURL}
            className="w-16 h-16 rounded-full object-cover"
            alt="Avatar"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
            {isGuest ? "👤" : getInitials(user?.displayName)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg">
            {isGuest ? "Tamu" : user?.displayName || "Pengguna"}
          </h3>
          <p className="text-sm text-slate-500">
            {isGuest ? "Mode Tamu" : user?.email || ""}
          </p>
          {isGuest ? (
            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full mt-1">
              Data Lokal
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full mt-1">
              Akun Google
            </span>
          )}
        </div>
      </div>

      {/* Tombol Logout */}
      <button
        onClick={logout}
        className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
      >
        <LogOut size={18} /> Keluar
      </button>

      {/* Tombol Hapus Akun (hanya untuk Google user) */}
      {!isGuest && (
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition"
        >
          <Trash2 size={18} /> {isDeleting ? "Menghapus..." : "Hapus Akun"}
        </button>
      )}

      <p className="text-[10px] text-slate-400 text-center pb-4">
        © 2026 Utangin · Dibuat untuk UMKM Indonesia
      </p>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
