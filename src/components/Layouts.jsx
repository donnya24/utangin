import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Wallet, Users, FileText, Settings, Plus } from "lucide-react";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import AddContactModal from "./AddContactModal";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTxModal, setShowTxModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const navItems = [
    { path: "/", icon: Wallet, label: "Dashboard" },
    { path: "/contacts", icon: Users, label: "Kontak" },
    { path: "/transactions", icon: FileText, label: "Transaksi" },
    { path: "/settings", icon: Settings, label: "Pengaturan" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Wallet size={20} />
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              CatatHutang
            </span>
          </div>
          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
            TO
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-28">
        <Outlet />
      </main>

      {/* FAB Mobile */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <button
          onClick={() => {
            if (location.pathname === "/contacts") setShowContactModal(true);
            else setShowTxModal(true);
          }}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-300 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-30 shadow-lg pb-safe">
        <div className="max-w-5xl mx-auto px-2 h-16 flex justify-around items-center">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center px-3 py-1 rounded-xl transition ${
                location.pathname === path
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      {showTxModal && (
        <AddTransactionModal onClose={() => setShowTxModal(false)} />
      )}
      {showContactModal && (
        <AddContactModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
}
