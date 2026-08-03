import { useState } from "react";
import { Users, UserPlus, MessageCircle, Trash2 } from "lucide-react";
import useContacts from "../hooks/useContacts";
import { deleteContact } from "../services/firestoreService";
import AddContactModal from "../components/AddContactModal";
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

export default function Contacts() {
  const contacts = useContacts();
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Hapus kontak ini?")) return;
    try {
      await deleteContact(id);
      setToast({ message: "Kontak dihapus", type: "success" });
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const openWA = (phone) => {
    let num = phone.replace(/[\s\-\(\)]/g, "");
    if (num.startsWith("0")) num = "62" + num.substring(1);
    if (num.startsWith("+")) num = num.substring(1);
    if (!num.startsWith("62")) num = "62" + num;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  const customers = contacts.filter((c) => c.type === "customer");
  const suppliers = contacts.filter((c) => c.type === "supplier");

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Daftar Kontak</h1>
          <p className="text-sm text-slate-500">{contacts.length} kontak</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <UserPlus size={16} />{" "}
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-lg">Belum Ada Kontak</h3>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            + Tambah Kontak
          </button>
        </div>
      ) : (
        <>
          {customers.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                🧑 Pelanggan ({customers.length})
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(c.name)} flex items-center justify-center font-bold text-sm`}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{c.name}</h4>
                        <p className="text-xs text-slate-400">📱 {c.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openWA(c.phone)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suppliers.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase text-slate-400 mb-3">
                🏭 Supplier ({suppliers.length})
              </h2>
              <div className="bg-white rounded-2xl border divide-y shadow-sm">
                {suppliers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(c.name)} flex items-center justify-center font-bold text-sm`}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{c.name}</h4>
                        <p className="text-xs text-slate-400">📱 {c.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openWA(c.phone)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
