import { useState } from "react";
import { X } from "lucide-react";
import { addPayment } from "../services/firestoreService";
import Toast from "./Toast";

export default function PaymentModal({ transaction, onClose }) {
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const remaining = transaction.amount - (transaction.paidAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || Number(amount) > remaining) return;
    try {
      await addPayment(transaction.id, amount);
      setToast({ message: "Pembayaran berhasil dicatat!", type: "success" });
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
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
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            type="number"
            placeholder="Jumlah pembayaran"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            max={remaining}
          />
          <button
            type="button"
            className="text-sm text-blue-600"
            onClick={() => setAmount(String(remaining))}
          >
            Langsung lunas
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
          >
            Simpan
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
