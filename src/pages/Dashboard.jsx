import { useState } from "react";
import { Plus, ChevronRight, Inbox } from "lucide-react";
import useTransactions from "../hooks/useTransactions";
import TransactionDetailModal from "../components/TransactionDetailModal";
import AddTransactionModal from "../components/AddTransactionModal";

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

function formatRupiah(angka) {
  return "Rp " + Math.abs(angka).toLocaleString("id-ID");
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
  const recentTx = transactions.slice(0, 8);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Halo, Pemilik Toko 👋</h1>
          <p className="text-sm text-slate-500">Ringkasan keuangan toko Anda</p>
        </div>
        <button
          onClick={() => setShowAddTx(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
        >
          <Plus size={16} />{" "}
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total Piutang
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatRupiah(totalPiutang)}
          </h3>
          <div className="mt-3 pt-3 border-t flex justify-between text-xs text-slate-500">
            <span>
              Dari {new Set(unpaidPiutang.map((t) => t.contactId)).size}{" "}
              pelanggan
            </span>
            <span className="text-blue-600 flex items-center">
              Lihat detail <ChevronRight size={12} />
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total Hutang
          </p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {formatRupiah(totalHutang)}
          </h3>
          <div className="mt-3 pt-3 border-t flex justify-between text-xs text-slate-500">
            <span>
              Kepada {new Set(unpaidHutang.map((t) => t.contactId)).size}{" "}
              supplier
            </span>
            <span className="text-blue-600 flex items-center">
              Lihat detail <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold">Aktivitas Terakhir</h2>
          <span className="text-sm text-blue-600">Semua Transaksi</span>
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
                      {tx.type === "piutang" ? "+" : "-"}{" "}
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
