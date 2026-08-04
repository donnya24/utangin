import { useState } from "react";
import { X } from "lucide-react";
import { addTransaction } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";
import { formatRupiahInput, parseRupiahInput } from "../utils/format";

export default function AddTransactionModal({ onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [txType, setTxType] = useState("piutang");
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState(null);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const numeric = rawValue.replace(/\D/g, "");
    if (numeric.length > 12) return;
    setDisplayAmount(formatRupiahInput(numeric));
  };

  const handleDescriptionChange = (e) => {
    // Batasi maksimal 200 karakter
    if (e.target.value.length <= 200) {
      setDescription(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawAmount = parseRupiahInput(displayAmount);
    if (!name || !phone || rawAmount <= 0) return;
    try {
      await addTransaction(
        user.uid,
        name,
        phone,
        rawAmount,
        txType,
        description,
      );
      setToast({ message: "Transaksi berhasil dicatat!", type: "success" });
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Tambah Transaksi</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Nama Pelanggan/Supplier"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Nomor WhatsApp (08xxx)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="flex space-x-3">
            <label
              className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer ${txType === "piutang" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
            >
              <input
                type="radio"
                value="piutang"
                checked={txType === "piutang"}
                onChange={() => setTxType("piutang")}
                className="hidden"
              />
              Piutang
            </label>
            <label
              className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer ${txType === "hutang" ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}
            >
              <input
                type="radio"
                value="hutang"
                checked={txType === "hutang"}
                onChange={() => setTxType("hutang")}
                className="hidden"
              />
              Hutang
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              Rp
            </span>
            <input
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-right"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              required
            />
          </div>
          <div>
            <textarea
              className="w-full border rounded-xl px-4 py-2.5 resize-none"
              placeholder="Keterangan (opsional, maks 200 karakter)"
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
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
          >
            Catat
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
