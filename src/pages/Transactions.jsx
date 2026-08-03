import { useState } from "react";
import { FileText, Plus } from "lucide-react";
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

function TransactionItem({ tx, onClick }) {
  const remaining = tx.amount - (tx.paidAmount || 0);
  return (
    <div
      onClick={() => onClick(tx)}
      className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full ${getAvatarColor(tx.contactName)} flex items-center justify-center font-bold text-sm`}
        >
          {getInitials(tx.contactName)}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{tx.contactName}</h4>
          <p className="text-xs text-slate-400">
            {tx.description || "Tanpa keterangan"} ·{" "}
            {formatDateShort(tx.createdAt)}
          </p>
          {tx.status !== "lunas" && tx.paidAmount > 0 && (
            <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5 max-w-[120px]">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.round((tx.paidAmount / tx.amount) * 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <span
          className={`block font-bold text-sm ${tx.type === "piutang" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {tx.type === "piutang" ? "+" : "-"} {formatRupiah(remaining)}
        </span>
        <span
          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
            tx.status === "lunas"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {tx.status === "lunas"
            ? "Lunas"
            : tx.paidAmount > 0
              ? "Cicilan"
              : "Belum Lunas"}
        </span>
      </div>
    </div>
  );
}

export default function Transactions() {
  const transactions = useTransactions();
  const [selectedTx, setSelectedTx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const piutang = transactions.filter((t) => t.type === "piutang");
  const hutang = transactions.filter((t) => t.type === "hutang");

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Semua Transaksi</h1>
          <p className="text-sm text-slate-500">
            {transactions.length} transaksi
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-lg">Belum Ada Transaksi</h3>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            + Tambah Transaksi
          </button>
        </div>
      ) : (
        <>
          {piutang.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                📥 Piutang (
                {piutang.filter((t) => t.status === "belum_lunas").length} belum
                lunas)
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {piutang.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onClick={setSelectedTx}
                  />
                ))}
              </div>
            </div>
          )}

          {hutang.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                📤 Hutang (
                {hutang.filter((t) => t.status === "belum_lunas").length} belum
                lunas)
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {hutang.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onClick={setSelectedTx}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
