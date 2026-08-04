import { useState } from "react";
import { Plus, Inbox } from "lucide-react";
import useTransactions from "../hooks/useTransactions";
import TransactionDetailModal from "../components/TransactionDetailModal";
import AddTransactionModal from "../components/AddTransactionModal";
import { useAuth } from "../context/AuthContext";
import { formatRupiah } from "../utils/format";

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDateShort(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return days + " hari lalu";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function Dashboard() {
  const transactions = useTransactions();
  const { user } = useAuth();
  const [selectedTx, setSelectedTx] = useState(null);
  const [showAddTx, setShowAddTx] = useState(false);

  const unpaidPiutang = transactions.filter(
    (t) => t.type === "piutang" && t.status === "belum_lunas",
  );
  const unpaidHutang = transactions.filter(
    (t) => t.type === "hutang" && t.status === "belum_lunas",
  );
  const totalPiutang = unpaidPiutang.reduce(
    (s, t) => s + (t.amount - (t.paidAmount || 0)),
    0,
  );
  const totalHutang = unpaidHutang.reduce(
    (s, t) => s + (t.amount - (t.paidAmount || 0)),
    0,
  );

  const totalLunas = transactions.filter((t) => t.status === "lunas").length;
  const totalBelumLunas = transactions.filter(
    (t) => t.status === "belum_lunas",
  ).length;
  const totalTransaksi = transactions.length;

  // Hanya 5 transaksi terbaru
  const recentTx = transactions.slice(0, 5);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">
            Halo, {user?.displayName?.split(" ")[0] || "Pemilik"} 👋
          </h1>
          <p className="text-sm text-slate-500">Ringkasan keuangan Anda.</p>
        </div>
        <button
          onClick={() => setShowAddTx(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Plus size={16} />{" "}
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total Piutang (Belum Lunas)
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatRupiah(totalPiutang)}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total Hutang (Belum Lunas)
          </p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {formatRupiah(totalHutang)}
          </h3>
        </div>
      </div>

      {/* Statistik kecil */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl border text-center">
          <p className="text-xs text-slate-400">T. Transaksi</p>
          <p className="text-xl font-bold text-blue-600">{totalTransaksi}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border text-center">
          <p className="text-xs text-slate-400">Lunas</p>
          <p className="text-xl font-bold text-emerald-600">{totalLunas}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border text-center">
          <p className="text-xs text-slate-400">Belum Lunas</p>
          <p className="text-xl font-bold text-amber-600">{totalBelumLunas}</p>
        </div>
      </div>

      {/* Recent Transactions (max 5) */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Aktivitas Terbaru</h2>
        </div>
        <div className="divide-y">
          {recentTx.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500">Belum ada transaksi</p>
            </div>
          ) : (
            recentTx.map((tx) => {
              const remaining = tx.amount - (tx.paidAmount || 0);
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(tx.contactName)} flex items-center justify-center font-bold text-sm`}
                    >
                      {getInitials(tx.contactName)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {tx.contactName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {tx.description || "Tanpa keterangan"} ·{" "}
                        {formatDateShort(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`block font-bold text-sm ${tx.type === "piutang" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {formatRupiah(remaining)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        tx.status === "lunas"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tx.status === "lunas" ? "Lunas" : "Belum Lunas"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
      {showAddTx && <AddTransactionModal onClose={() => setShowAddTx(false)} />}
    </div>
  );
}
