"use client";
import { useState } from "react";
import { UserPlus, X, Loader2, Crown, Shield } from "lucide-react";
import type { AdminProfile, AdminRole } from "@/types/admin";
import { formatDate } from "@/lib/utils";

export function UsersClient({ admins, currentRole, currentUserId }: { admins: AdminProfile[]; currentRole: string; currentUserId: string }) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOwner = currentRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name, role }),
      });
      const data = await res.json();
      if (res.ok) { setMessage("✓ Invitación enviada a " + email); setEmail(""); setName(""); }
      else setMessage("Error: " + (data.error ?? "No se pudo enviar la invitación"));
    } catch { setMessage("Error de red"); }
    setLoading(false);
  };

  return (
    <>
      {isOwner && (
        <div className="flex justify-end">
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <UserPlus className="w-4 h-4" /> Invitar admin
          </button>
        </div>
      )}

      <div className="bg-white border border-[#111111]/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#111111]/8">
              {["Admin", "Rol", "Estado", "Desde", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-[#111111]/8 hover:bg-[#111111]/5">
                <td className="px-5 py-3">
                  <p className="text-[#111111] font-bold text-sm">{a.full_name ?? a.email}</p>
                  <p className="text-[#B8B8B8] text-xs">{a.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${a.role === "owner" ? "bg-yellow-600/20 text-yellow-600" : "bg-blue-600/20 text-blue-600"}`}>
                    {a.role === "owner" ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {a.role === "owner" ? "Owner" : "Editor"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.is_active ? "bg-[#556B5D]/20 text-[#556B5D]" : "bg-[#111111]/8 text-[#B8B8B8]"}`}>
                    {a.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#B8B8B8] text-xs">{formatDate(a.created_at)}</td>
                <td className="px-5 py-3">
                  {a.id === currentUserId && <span className="text-[10px] text-[#556B5D] font-bold">Vos</span>}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#B8B8B8] text-sm">Sin administradores registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!isOwner && (
        <p className="text-[#B8B8B8] text-xs text-center">Solo el Owner puede invitar nuevos administradores</p>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowInvite(false)} />
          <div className="relative bg-[#F5F5F3] border border-[#111111]/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#111111] font-black text-lg">Invitar administrador</h3>
              <button onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-[#B8B8B8]" /></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white border border-[#111111]/10 rounded-xl px-3 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D] placeholder-[#B8B8B8]"
                  placeholder="admin@ejemplo.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Nombre</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#111111]/10 rounded-xl px-3 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D] placeholder-[#B8B8B8]"
                  placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Rol</label>
                <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full bg-white border border-[#111111]/10 rounded-xl px-3 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D] cursor-pointer">
                  <option value="editor">Editor - Puede gestionar productos y pedidos</option>
                  <option value="owner">Owner - Acceso completo</option>
                </select>
              </div>
              {message && <p className={`text-xs font-medium px-3 py-2 rounded-xl ${message.startsWith("✓") ? "bg-[#556B5D]/20 text-[#556B5D]" : "bg-red-600/20 text-red-500"}`}>{message}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading} className="flex-1 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Enviar invitación
                </button>
                <button type="button" onClick={() => setShowInvite(false)} className="px-4 border border-[#111111]/10 text-[#2B2B2B] rounded-xl text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
