import { useState } from "react";
import { X } from "lucide-react";
import { addPayment } from "../services/firestoreService";
import Toast from "./Toast";
import { formatRupiahInput, parseRupiahInput } from "../utils/format";

export default function PaymentModal({ transaction, onClose }) {
  const [displayAmount, setDisplayAmount] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const remaining = transaction.amount - (transaction.paidAmount || 0);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    const numeric = rawValue.replace(/\D/g, "");
    if (numeric.length > 12) return;
    setDisplayAmount(formatRupiahInput(numeric));
    setError(""); // hapus error saat mengetik
  };

  const numericAmount = parseRupiahInput(displayAmount);
  const isValid = numericAmount > 0 && numericAmount <= remaining;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await addPayment(transaction.id, numericAmount);
      setToast({ message: "Pembayaran berhasil dicatat!", type: "success" });
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const handleLangsungLunas = () => {
    setDisplayAmount(formatRupiahInput(remaining.toString()));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Catat Pembayaran</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl text-sm space-y-1">
          <p>
            Total: <b>Rp {transaction.amount.toLocaleString("id")}</b>
          </p>
          <p>
            Sudah dibayar:{" "}
            <b>Rp {(transaction.paidAmount || 0).toLocaleString("id")}</b>
          </p>
          <p>
            Sisa:{" "}
            <b className="text-amber-600">
              Rp {remaining.toLocaleString("id")}
            </b>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 block mb-1">
              Jumlah Pembayaran
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-right ${
                  error ? "border-red-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {numericAmount > remaining && (
              <p className="text-red-500 text-xs mt-1">
                Jumlah melebihi sisa (maks. Rp {remaining.toLocaleString("id")})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLangsungLunas}
            className="text-sm text-blue-600 hover:underline"
          >
            Langsung lunas
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-xl font-medium transition ${
              isValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            Simpan Pembayaran
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
