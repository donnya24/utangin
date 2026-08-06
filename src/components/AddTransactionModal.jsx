import { useState } from "react";
import { X } from "lucide-react";
import { addTransaction, updateTransaction } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";
import { formatRupiahInput, parseRupiahInput } from "../utils/format";

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateString = (ts) => {
  if (!ts) return getTodayDateString();
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return getTodayDateString();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddTransactionModal({ transaction = null, onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState(transaction ? transaction.contactName : "");
  const [phone, setPhone] = useState(transaction ? (transaction.phone || "") : "");
  const [txType, setTxType] = useState(transaction ? transaction.type : "piutang");
  const [displayAmount, setDisplayAmount] = useState(transaction ? formatRupiahInput(String(transaction.amount)) : "");
  const [description, setDescription] = useState(transaction ? (transaction.description || "") : "");
  const [date, setDate] = useState(transaction ? getDateString(transaction.createdAt) : getTodayDateString());
  const [toast, setToast] = useState(null);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const numeric = rawValue.replace(/\D/g, "");
    if (numeric.length > 12) return;
    setDisplayAmount(formatRupiahInput(numeric));
  };

  const handleDescriptionChange = (e) => {
    if (e.target.value.length <= 200) {
      setDescription(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawAmount = parseRupiahInput(displayAmount);
    if (!name || rawAmount <= 0) {
      setToast({ message: "Nama dan nominal wajib diisi.", type: "error" });
      return;
    }
    try {
      if (transaction) {
        await updateTransaction(
          transaction.id,
          name,
          phone,
          rawAmount,
          txType,
          description,
          date,
        );
        setToast({ message: "Transaksi berhasil diperbarui!", type: "success" });
      } else {
        await addTransaction(
          user.uid,
          name,
          phone,
          rawAmount,
          txType,
          description,
          date,
        );
        setToast({ message: "Transaksi berhasil dicatat!", type: "success" });
      }
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {transaction ? "Edit Transaksi" : "Tambah Transaksi"}
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama - Wajib */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Nama Pelanggan/Supplier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Nomor WhatsApp - Opsional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nomor WhatsApp{" "}
              <span className="text-slate-400 text-xs">(opsional)</span>
            </label>
            <input
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="0812-3456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Tipe Transaksi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <label
                className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer transition ${
                  txType === "piutang"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  value="piutang"
                  checked={txType === "piutang"}
                  onChange={() => setTxType("piutang")}
                  className="hidden"
                />
                <span className="text-sm font-medium">📥 Piutang</span>
              </label>
              <label
                className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer transition ${
                  txType === "hutang"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  value="hutang"
                  checked={txType === "hutang"}
                  onChange={() => setTxType("hutang")}
                  className="hidden"
                />
                <span className="text-sm font-medium">📤 Hutang</span>
              </label>
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nominal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                Rp
              </span>
              <input
                className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
                required
              />
            </div>
          </div>

          {/* Keterangan - Opsional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Keterangan{" "}
              <span className="text-slate-400 text-xs">(opsional)</span>
            </label>
            <textarea
              className="w-full border rounded-xl px-4 py-2.5 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Contoh: Belanja sembako tempo"
              value={description}
              onChange={handleDescriptionChange}
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-slate-400 text-right mt-1">
              {description.length}/200
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3 rounded-xl transition shadow-sm"
          >
            {transaction ? "Simpan Perubahan" : "Catat Transaksi"}
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
