import { useState } from "react";
import { X } from "lucide-react";
import { addContact } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";

export default function AddContactModal({ onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("customer");
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await addContact(user.uid, name, phone, type);
      setToast({ message: "Kontak berhasil ditambahkan!", type: "success" });
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Tambah Kontak</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="No WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="flex space-x-3">
            <label
              className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer ${type === "customer" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
            >
              <input
                type="radio"
                value="customer"
                checked={type === "customer"}
                onChange={() => setType("customer")}
                className="hidden"
              />
              Pelanggan
            </label>
            <label
              className={`flex-1 p-3 text-center border-2 rounded-xl cursor-pointer ${type === "supplier" ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}
            >
              <input
                type="radio"
                value="supplier"
                checked={type === "supplier"}
                onChange={() => setType("supplier")}
                className="hidden"
              />
              Supplier
            </label>
          </div>
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
