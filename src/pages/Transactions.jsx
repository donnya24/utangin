import { useState, useMemo } from "react";
import { FileText, Plus, Check, RotateCcw, Trash2, Eye, Search } from "lucide-react";
import useTransactions from "../hooks/useTransactions";
import TransactionDetailModal from "../components/TransactionDetailModal";
import AddTransactionModal from "../components/AddTransactionModal";
import {
  toggleTransactionStatus,
  deleteMultipleTransactions,
} from "../services/firestoreService";
import { formatRupiah } from "../utils/format";
import Toast from "../components/Toast";

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

export default function Transactions() {
  const transactions = useTransactions();
  const [selectedTx, setSelectedTx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'piutang', 'hutang'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'lunas', 'belum_lunas'

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!tx.contactName || !tx.contactName.toLowerCase().includes(q))
          return false;
      }

      if (!tx.createdAt) return true;
      const date = tx.createdAt.toDate
        ? tx.createdAt.toDate()
        : new Date(tx.createdAt);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (date < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      if (filterMonth && filterYear) {
        const month = parseInt(filterMonth);
        const year = parseInt(filterYear);
        if (date.getMonth() !== month - 1 || date.getFullYear() !== year)
          return false;
      } else if (filterMonth) {
        if (date.getMonth() !== parseInt(filterMonth) - 1) return false;
      } else if (filterYear) {
        if (date.getFullYear() !== parseInt(filterYear)) return false;
      }

      // Tipe filter
      if (filterType === "piutang" && tx.type !== "piutang") return false;
      if (filterType === "hutang" && tx.type !== "hutang") return false;

      // Status filter
      if (filterStatus === "lunas" && tx.status !== "lunas") return false;
      if (filterStatus === "belum_lunas" && tx.status !== "belum_lunas")
        return false;

      return true;
    });
  }, [
    transactions,
    searchQuery,
    startDate,
    endDate,
    filterMonth,
    filterYear,
    filterType,
    filterStatus,
  ]);

  const piutang = filtered.filter((t) => t.type === "piutang");
  const hutang = filtered.filter((t) => t.type === "hutang");

  const handleToggleStatus = async (txId, currentStatus) => {
    try {
      await toggleTransactionStatus(txId, currentStatus);
      setToast({ message: "Status diperbarui", type: "success" });
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((t) => t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih?`,
      )
    )
      return;
    try {
      await deleteMultipleTransactions(selectedIds);
      setSelectedIds([]);
      setToast({
        message: `${selectedIds.length} transaksi dihapus`,
        type: "success",
      });
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const renderItem = (tx) => {
    const remaining = tx.amount - (tx.paidAmount || 0);
    const isSelected = selectedIds.includes(tx.id);
    return (
      <div
        key={tx.id}
        className="p-4 flex items-center justify-between hover:bg-slate-50"
      >
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={() => handleCheckboxToggle(tx.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => setSelectedTx(tx)}
          >
            <div
              className={`w-10 h-10 rounded-full ${getAvatarColor(tx.contactName)} flex items-center justify-center font-bold text-sm`}
            >
              {getInitials(tx.contactName)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{tx.contactName}</h4>
              <p className="text-xs text-slate-400">
                {tx.phone ? "📱 " + tx.phone + " · " : ""}
                {formatDateShort(tx.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <span
              className={`block font-bold text-sm ${tx.type === "piutang" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {formatRupiah(remaining)}
            </span>
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${tx.status === "lunas" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
            >
              {tx.status === "lunas" ? "Lunas" : "Belum Lunas"}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(tx.id, tx.status);
            }}
            className={`p-2 rounded-full ${tx.status === "lunas" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
            title={
              tx.status === "lunas" ? "Tandai belum lunas" : "Tandai lunas"
            }
          >
            {tx.status === "lunas" ? (
              <RotateCcw size={16} />
            ) : (
              <Check size={16} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTx(tx);
            }}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Semua Transaksi</h1>
          <p className="text-sm text-slate-500">{filtered.length} transaksi</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm mb-4 space-y-3">
        {/* Search by Name */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Cari berdasarkan nama pelanggan/supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipe</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="piutang">Piutang</option>
              <option value="hutang">Hutang</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="lunas">Lunas</option>
              <option value="belum_lunas">Belum Lunas</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Bulan</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Semua</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tahun</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="2026"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => {
            setSearchQuery("");
            setStartDate("");
            setEndDate("");
            setFilterMonth("");
            setFilterYear("");
            setFilterType("all");
            setFilterStatus("all");
          }}
          className="mt-3 text-xs text-blue-600 hover:underline"
        >
          Reset Filter
        </button>
      </div>

      {/* Multi-select actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              checked={selectedIds.length === filtered.length}
              onChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} dipilih
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 ml-2 hover:underline"
            >
              {selectedIds.length === filtered.length
                ? "Batal Semua"
                : "Pilih Semua"}
            </button>
          </div>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            <Trash2 size={14} /> Hapus Terpilih
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Tidak ada transaksi</p>
        </div>
      ) : (
        <>
          {filterType !== "hutang" && piutang.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                📥 Piutang (
                {piutang.filter((t) => t.status === "belum_lunas").length} belum
                lunas)
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {piutang.map((tx) => renderItem(tx))}
              </div>
            </div>
          )}
          {filterType !== "piutang" && hutang.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                📤 Hutang (
                {hutang.filter((t) => t.status === "belum_lunas").length} belum
                lunas)
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {hutang.map((tx) => renderItem(tx))}
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
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
