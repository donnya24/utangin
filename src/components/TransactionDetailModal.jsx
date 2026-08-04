import { useState, useEffect } from "react";
import { X, CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import PaymentModal from "./PaymentModal";
import {
  toggleTransactionStatus,
  deleteTransaction,
} from "../services/firestoreService";
import Toast from "./Toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

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
  const [showPay, setShowPay] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentTx, setCurrentTx] = useState(transaction);

  // Subscribe ke perubahan real-time dari Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "transactions", transaction.id),
      (snap) => {
        if (snap.exists()) {
          setCurrentTx({ id: snap.id, ...snap.data() });
        }
      },
    );
    return () => unsub();
  }, [transaction.id]);

  const isLunas = currentTx.status === "lunas";
  const remaining = currentTx.amount - (currentTx.paidAmount || 0);

  const handleToggle = async () => {
    try {
      await toggleTransactionStatus(currentTx.id, currentTx.status);
      setToast({
        message: isLunas ? "Ditandai belum lunas" : "Ditandai lunas",
        type: "success",
      });
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    try {
      await deleteTransaction(currentTx.id);
      onClose();
    } catch (err) {
      setToast({ message: "Gagal: " + err.message, type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Detail Transaksi</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Nama</span>
            <span className="font-medium">{currentTx.contactName}</span>
          </div>

          {currentTx.phone && (
            <div className="flex justify-between">
              <span className="text-slate-500">Telepon</span>
              <span>{currentTx.phone}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <b
              className={
                currentTx.type === "piutang"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }
            >
              Rp {currentTx.amount.toLocaleString("id")}
            </b>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Sudah Dibayar</span>
            <span>Rp {(currentTx.paidAmount || 0).toLocaleString("id")}</span>
          </div>

          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-500">Sisa</span>
            <b
              className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}
            >
              Rp {remaining.toLocaleString("id")}
            </b>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isLunas
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isLunas ? "Lunas" : "Belum Lunas"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal</span>
            <span>{formatDate(currentTx.createdAt)}</span>
          </div>

          {/* Keterangan lengkap */}
          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-500">Keterangan</span>
            <span className="text-right max-w-[60%] text-slate-700 whitespace-pre-wrap">
              {currentTx.description || "-"}
            </span>
          </div>
        </div>

        {!isLunas && currentTx.paidAmount > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-1">
              Progress:{" "}
              {Math.round((currentTx.paidAmount / currentTx.amount) * 100)}%
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(currentTx.paidAmount / currentTx.amount) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!isLunas && (
            <button
              onClick={() => setShowPay(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              Bayar / Cicilan
            </button>
          )}

          <button
            onClick={handleToggle}
            className={`w-full border-2 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              isLunas
                ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
            }`}
          >
            {isLunas ? (
              <RotateCcw size={18} className="text-blue-600" />
            ) : (
              <CheckCircle size={18} className="text-green-600" />
            )}
            {isLunas ? "Tandai Belum Lunas" : "Tandai Lunas"}
          </button>

          <button
            onClick={handleDelete}
            className="w-full border-2 border-rose-200 text-rose-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-rose-50"
          >
            <Trash2 size={18} /> Hapus Transaksi
          </button>
        </div>
      </div>

      {showPay && (
        <PaymentModal
          transaction={currentTx}
          onClose={() => setShowPay(false)}
        />
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
