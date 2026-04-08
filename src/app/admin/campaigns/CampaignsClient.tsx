"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2, Edit2, Upload, Image as ImageIcon, ExternalLink, Timer } from "lucide-react";
import type { Campaign } from "@/types/admin";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const empty = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
  target_category: "",
  cta_url: "",
  cta_label: "Ver más",
  countdown_ends_at: "",
};

export function CampaignsClient({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setPendingImages([]);
    setShowModal(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description ?? "",
      starts_at: c.starts_at.slice(0, 16),
      ends_at: c.ends_at.slice(0, 16),
      is_active: c.is_active,
      target_category: c.target_category ?? "",
      cta_url: c.cta_url ?? "",
      cta_label: c.cta_label ?? "Ver más",
      countdown_ends_at: c.countdown_ends_at ? c.countdown_ends_at.slice(0, 16) : "",
    });
    setPendingImages(c.images ?? []);
    setShowModal(true);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploadingImages(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `campaigns/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }

    setPendingImages((prev) => [...prev, ...uploaded]);
    setUploadingImages(false);
  };

  const removeImage = (url: string) => {
    setPendingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.starts_at || !form.ends_at) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      title: form.title,
      description: form.description || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_active: form.is_active,
      target_category: form.target_category || null,
      images: pendingImages,
      image_url: pendingImages[0] ?? null,
      cta_url: form.cta_url || null,
      cta_label: form.cta_label || "Ver más",
      countdown_ends_at: form.countdown_ends_at ? new Date(form.countdown_ends_at).toISOString() : null,
    };

    if (editing) {
      await supabase.from("campaigns").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("campaigns").insert(payload);
    }

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

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1";

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
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
              <div
                key={c.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  {(c.images?.[0] || c.image_url) && (
                    <img
                      src={c.images?.[0] ?? c.image_url!}
                      alt={c.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      {c.target_category && (
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          {c.target_category}
                        </span>
                      )}
                      {c.images && c.images.length > 0 && (
                        <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          {c.images.length} foto{c.images.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {c.countdown_ends_at && (
                        <span className="text-[10px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Timer className="w-2.5 h-2.5" /> Countdown
                        </span>
                      )}
                      {c.cta_url && (
                        <span className="text-[10px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5" /> {c.cta_label ?? "Ver más"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-black text-base truncate">{c.title}</h3>
                    {c.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{c.description}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      {formatDate(c.starts_at)} → {formatDate(c.ends_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-8 h-8 bg-white/10 hover:bg-red-600/20 rounded-lg flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black text-lg">
                {editing ? "Editar campaña" : "Nueva campaña"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  placeholder="DROP 001 — CARBÓN"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass + " resize-none"}
                  rows={2}
                  placeholder="Breve descripción del lanzamiento"
                />
              </div>

              {/* Images */}
              <div>
                <label className={labelClass}>Imágenes ({pendingImages.length})</label>
                <div
                  className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-green-500/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImages ? (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-500 text-xs">Clic para subir múltiples fotos</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
                {pendingImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {pendingImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/60 text-white rounded-b-lg py-0.5">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Inicio *</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Fin *</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Countdown */}
              <div>
                <label className={labelClass}>
                  <Timer className="w-3 h-3 inline mr-1" />
                  Countdown hasta (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={form.countdown_ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, countdown_ends_at: e.target.value }))}
                  className={inputClass}
                />
                <p className="text-[10px] text-gray-600 mt-1">
                  Si lo configurás, aparece un contador regresivo en la card del drop
                </p>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    URL del botón
                  </label>
                  <input
                    value={form.cta_url}
                    onChange={(e) => setForm((f) => ({ ...f, cta_url: e.target.value }))}
                    className={inputClass}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Texto del botón</label>
                  <input
                    value={form.cta_label}
                    onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                    className={inputClass}
                    placeholder="Ver más"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Categoría destacada</label>
                <input
                  value={form.target_category}
                  onChange={(e) => setForm((f) => ({ ...f, target_category: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej: Remeras"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${form.is_active ? "bg-green-600" : "bg-white/10"}`}
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      form.is_active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-gray-300 text-sm">Campaña activa</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Guardar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 border border-white/10 text-gray-400 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
