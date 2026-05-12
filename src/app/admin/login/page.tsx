"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoatLogo } from "@/components/ui/GoatLogo";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <GoatLogo size={64} variant="white" />
          <div className="mt-3 text-center">
            <p className="font-black text-2xl text-white tracking-tight">GOAT</p>
            <p className="text-[#556B5D] text-xs font-bold tracking-[0.3em] uppercase">Admin Panel</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-white font-black text-lg mb-1">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-6">Acceso restringido a administradores</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#556B5D] placeholder-gray-600"
                placeholder="admin@goatsportwear.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#556B5D] pr-10"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#556B5D] hover:bg-[#4a5f52] disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          © 2025 GOAT SPORTWEAR · Panel Administrativo
        </p>
      </div>
    </div>
  );
}
