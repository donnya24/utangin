import { useEffect } from "react";
import { X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : type === "error"
            ? "bg-rose-600 text-white"
            : "bg-slate-800 text-white"
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}
