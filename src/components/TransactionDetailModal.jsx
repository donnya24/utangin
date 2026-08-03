import { useState } from "react";
import { X, MessageCircle, CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import PaymentModal from "./PaymentModal";
import {
  toggleTransactionStatus,
  deleteTransaction,
} from "../services/firestoreService";
import useContacts from "../hooks/useContacts";
import Toast from "./Toast";

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionDetailModal({ transaction, onClose }) {
  const contacts = useContacts();
  const [showPay, setShowPay] = useState(false);
  const [toast, setToast] = useState(null);
  const contact = contacts.find((c) => c.id === transaction.contactId);
  const phone = contact?.phone || "";
  const isLunas = transaction.status === "lunas";
  const remaining = transaction.amount - (transaction.paidAmount || 0);

  const handleToggle = async () => {
    try {
      await toggleTransactionStatus(transaction.id, transaction.status);
      setToast({
        message: isLunas ? "Ditandai belum lunas" : "Ditandai lunas",
        type: "success",
      });
      setTimeout(onClose, 1000);
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const openWA = () => {
    let num = phone.replace(/[\s\-\(\)]/g, "");
    if (num.startsWith("0")) num = "62" + num.substring(1);
    if (num.startsWith("+")) num = num.substring(1);
    if (!num.startsWith("62")) num = "62" + num;
    const msg = `Halo ${transaction.contactName},%0A%0APengingat transaksi:%0A📋 ${transaction.description || "Transaksi"}%0A💰 Rp ${remaining.toLocaleString("id")}%0A%0AMohon diselesaikan ya. Terima kasih!`;
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Detail Transaksi</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <b
              className={
                transaction.type === "piutang"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }
            >
              Rp {transaction.amount.toLocaleString("id")}
            </b>
          </div>
          <div className="flex justify-between">
            <span>Sudah Dibayar</span>
            <span>Rp {(transaction.paidAmount || 0).toLocaleString("id")}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Sisa</span>
            <b
              className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}
            >
              Rp {remaining.toLocaleString("id")}
            </b>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isLunas ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
            >
              {isLunas ? "Lunas" : "Belum Lunas"}
            </span>
          </div>
          {transaction.description && (
            <div className="flex justify-between">
              <span>Ket</span>
              <span className="text-right max-w-[60%]">
                {transaction.description}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>
        </div>
        {!isLunas && transaction.paidAmount > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${(transaction.paidAmount / transaction.amount) * 100}%`,
              }}
            ></div>
          </div>
        )}
        <div className="space-y-2">
          {!isLunas && (
            <button
              onClick={() => setShowPay(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Bayar / Cicilan
            </button>
          )}
          <button
            onClick={openWA}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} /> Kirim Pengingat WA
          </button>
          <button
            onClick={handleToggle}
            className={`w-full border-2 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${isLunas ? "border-amber-300 text-amber-700" : "border-emerald-300 text-emerald-700"}`}
          >
            {isLunas ? <RotateCcw size={18} /> : <CheckCircle size={18} />}
            {isLunas ? "Tandai Belum Lunas" : "Tandai Lunas"}
          </button>
          <button
            onClick={handleDelete}
            className="w-full border-2 border-rose-200 text-rose-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Hapus
          </button>
        </div>
      </div>
      {showPay && (
        <PaymentModal
          transaction={transaction}
          onClose={() => setShowPay(false)}
        />
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
