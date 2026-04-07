"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2, Edit2 } from "lucide-react";
import type { Campaign } from "@/types/admin";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const empty = { title: "", description: "", starts_at: "", ends_at: "", is_active: true, target_category: "" };

export function CampaignsClient({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description ?? "", starts_at: c.starts_at.slice(0, 16), ends_at: c.ends_at.slice(0, 16), is_active: c.is_active, target_category: c.target_category ?? "" });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.starts_at || !form.ends_at) return;
    setSaving(true);
    const supabase = createClient();
    const payload = { title: form.title, description: form.description || null, starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString(), is_active: form.is_active, target_category: form.target_category || null };
    if (editing) await supabase.from("campaigns").update(payload).eq("id", editing.id);
    else await supabase.from("campaigns").insert(payload);
    setSaving(false);
    setShowModal(false);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    const supabase = createClient();
    await supabase.from("campaigns").delete().eq("id", id);
    startTransition(() => router.refresh());
  };

  const now = new Date();
  const getStatus = (c: Campaign) => {
    if (!c.is_active) return { label: "Inactiva", color: "bg-white/10 text-gray-500" };
    if (now < new Date(c.starts_at)) return { label: "Próximamente", color: "bg-yellow-600/20 text-yellow-400" };
    if (now > new Date(c.ends_at)) return { label: "Finalizada", color: "bg-gray-600/20 text-gray-500" };
    return { label: "Activa", color: "bg-green-600/20 text-green-400" };
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1";

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nueva campaña
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">Sin campañas. Creá lanzamientos para mostrar en la tienda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const status = getStatus(c);
            return (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                    {c.target_category && <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{c.target_category}</span>}
                  </div>
                  <h3 className="text-white font-black text-base">{c.title}</h3>
                  {c.description && <p className="text-gray-500 text-sm mt-1">{c.description}</p>}
                  <p className="text-gray-600 text-xs mt-2">
                    {formatDate(c.starts_at)} → {formatDate(c.ends_at)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-gray-300" /></button>
                  <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-white/10 hover:bg-red-600/20 rounded-lg flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-gray-300" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black text-lg">{editing ? "Editar campaña" : "Nueva campaña"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={labelClass}>Título *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="Drop Summer 2025" required />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass + " resize-none"} rows={2} placeholder="Breve descripción del lanzamiento" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Inicio *</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Fin *</label>
                  <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} className={inputClass} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Categoría destacada</label>
                <input value={form.target_category} onChange={(e) => setForm((f) => ({ ...f, target_category: e.target.value }))} className={inputClass} placeholder="Ej: Remeras" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <div className={`w-10 h-5 rounded-full relative transition-colors ${form.is_active ? "bg-green-600" : "bg-white/10"}`} onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-gray-300 text-sm">Campaña activa</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? "Guardar" : "Crear"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 border border-white/10 text-gray-400 rounded-xl text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
