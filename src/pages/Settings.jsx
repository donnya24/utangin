import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import useContacts from "../hooks/useContacts";
import useTransactions from "../hooks/useTransactions";

export default function Settings() {
  const { user, logout } = useAuth();
  const contacts = useContacts();
  const transactions = useTransactions();

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Pengaturan</h1>
      <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            className="w-16 h-16 rounded-full"
            alt="Avatar"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
            {getInitials(user?.displayName)}
          </div>
        )}
        <div>
          <h3 className="font-semibold">{user?.displayName}</h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-5 grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
          <p className="text-xs text-slate-500">Kontak</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">
            {transactions.length}
          </p>
          <p className="text-xs text-slate-500">Transaksi</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600">
            {transactions.filter((t) => t.status === "lunas").length}
          </p>
          <p className="text-xs text-slate-500">Lunas</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">
            {transactions.filter((t) => t.status === "belum_lunas").length}
          </p>
          <p className="text-xs text-slate-500">Belum Lunas</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <LogOut size={18} /> Keluar
      </button>
    </div>
  );
}
