import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Settings, Plus } from "lucide-react";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTxModal, setShowTxModal] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { path: "/", icon: FileText, label: "Dashboard" },
    { path: "/transactions", icon: FileText, label: "Transaksi" },
    { path: "/settings", icon: Settings, label: "Pengaturan" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/icon-512.png"
              alt="Utangin"
              className="w-8 h-8 rounded-lg shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-sm items-center justify-center hidden">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              Utangin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">
              {user?.displayName?.split(" ")[0] || "Toko"}
            </span>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
                alt="Avatar"
              />
            ) : (
              <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {user?.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : "T"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-28">
        <Outlet />
      </main>

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

      {showTxModal && (
        <AddTransactionModal onClose={() => setShowTxModal(false)} />
      )}
    </div>
  );
}
