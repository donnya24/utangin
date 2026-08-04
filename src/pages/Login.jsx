import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, User } from "lucide-react";
import Toast from "../components/Toast";

export default function Login() {
  const { user, signInWithGoogle, signInAsGuest } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setToast({
        message: "Berhasil masuk! Selamat datang 👋",
        type: "success",
      });
    } catch (error) {
      setToast({ message: error.message || "Gagal masuk.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    signInAsGuest();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6">
      <div className="w-full max-w-sm">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src="/icon-512.png"
              alt="Utangin Logo"
              className="w-20 h-20 rounded-2xl shadow-lg"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "inline-flex";
              }}
            />
            <div
              className="w-20 h-20 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 items-center justify-center"
              style={{ display: "none" }}
            >
              <Wallet size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Utangin
          </h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Pencatat hutang piutang <br />
            untuk toko & UMKM Indonesia
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-semibold text-slate-800 text-lg">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-400">Masuk untuk melanjutkan</p>
          </div>

          {/* Tombol Sign In with Google */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">atau</span>
            </div>
          </div>

          {/* Tombol Guest */}
          <button
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 px-4 rounded-xl transition-all duration-200"
          >
            <User size={20} />
            <span>Masuk sebagai Tamu</span>
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[10px] text-slate-400">
            Masuk dengan Google untuk menyimpan data Anda secara aman.
            <br />
            Mode tamu tidak menyimpan data ke cloud.
          </p>
          <p className="text-xs text-slate-300">
            © 2026 Utangin · Dibuat untuk UMKM Indonesia
          </p>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
