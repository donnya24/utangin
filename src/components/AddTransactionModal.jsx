import { useState } from "react";
import { X } from "lucide-react";
import useContacts from "../hooks/useContacts";
import { addTransaction } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";

export default function AddTransactionModal({ onClose }) {
  const { user } = useAuth();
  const contacts = useContacts();
  const [contactId, setContactId] = useState("");
  const [txType, setTxType] = useState("piutang");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState(null);

  const selectedContact = contacts.find((c) => c.id === contactId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactId || !amount) return;
    try {
      await addTransaction(
        user.uid,
        contactId,
        selectedContact.name,
        amount,
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
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada kontak. Tambahkan di menu Kontak terlebih dahulu.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              className="w-full border rounded-xl px-4 py-2.5"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              required
            >
              <option value="">Pilih Kontak</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "customer" ? "Pelanggan" : "Supplier"})
                </option>
              ))}
            </select>
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
            <input
              className="w-full border rounded-xl px-4 py-2.5"
              type="number"
              placeholder="Nominal (Rp)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              className="w-full border rounded-xl px-4 py-2.5"
              placeholder="Keterangan (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Catat
            </button>
          </form>
        )}
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
