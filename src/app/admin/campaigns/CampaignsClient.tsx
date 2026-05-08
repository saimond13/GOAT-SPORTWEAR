"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2, Edit2, Upload, Image as ImageIcon, ExternalLink, Timer, Tag, ChevronLeft, ChevronRight, Ruler, Package } from "lucide-react";
import type { Campaign } from "@/types/admin";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

type SizeChartRow = { talle: string; largo: string; ancho: string };
type CampaignProductEntry = { product_id: string; name: string; image?: string; stock_limit: number };

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
  is_preventa: false,
  unit_price: 0,
  deposit_percentage: 30,
  preventa_closes_at: "",
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
  const [sizeChart, setSizeChart] = useState<SizeChartRow[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<CampaignProductEntry[]>([]);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; name: string; image?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newStockLimit, setNewStockLimit] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProductsForModal = async (campaignId?: string) => {
    setLoadingProducts(true);
    const supabase = createClient();
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, images, image_url")
        .eq("is_active", true)
        .order("name");
      setAllProducts(
        (products ?? []).map((p: { id: string; name: string; images?: string[]; image_url?: string }) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0] ?? p.image_url,
        }))
      );

      if (campaignId) {
        const { data: cp } = await supabase
          .from("campaign_products")
          .select("product_id, stock_limit, products(id, name, images, image_url)")
          .eq("campaign_id", campaignId)
          .order("sort_order");
        setCampaignProducts(
          (cp ?? []).map((item: { product_id: string; stock_limit: number; products: { id: string; name: string; images?: string[]; image_url?: string } | null }) => ({
            product_id: item.product_id,
            name: item.products?.name ?? "",
            image: item.products?.images?.[0] ?? item.products?.image_url,
            stock_limit: item.stock_limit,
          }))
        );
      } else {
        setCampaignProducts([]);
      }
    } catch {
      // campaign_products table may not exist yet
      setCampaignProducts([]);
    }
    setLoadingProducts(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setPendingImages([]);
    setSizeChart([]);
    setSelectedProductId("");
    setNewStockLimit(15);
    loadProductsForModal();
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
      is_preventa: c.is_preventa ?? false,
      unit_price: c.unit_price ?? 0,
      deposit_percentage: c.deposit_percentage ?? 30,
      preventa_closes_at: c.preventa_closes_at ? c.preventa_closes_at.slice(0, 16) : "",
    });
    setPendingImages(c.images ?? []);
    setSizeChart(c.size_chart ?? []);
    setSelectedProductId("");
    setNewStockLimit(15);
    loadProductsForModal(c.id);
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
      is_preventa: form.is_preventa,
      unit_price: form.is_preventa ? form.unit_price : null,
      deposit_percentage: form.is_preventa ? form.deposit_percentage : null,
      preventa_closes_at: form.is_preventa && form.preventa_closes_at ? new Date(form.preventa_closes_at).toISOString() : null,
      size_chart: sizeChart.length > 0 ? sizeChart.filter((r) => r.talle) : null,
    };

    let campaignId: string;
    if (editing) {
      await supabase.from("campaigns").update(payload).eq("id", editing.id);
      campaignId = editing.id;
    } else {
      const { data: created } = await supabase.from("campaigns").insert(payload).select("id").single();
      campaignId = created?.id ?? "";
    }

    // Sync campaign products
    if (campaignId) {
      try {
        await supabase.from("campaign_products").delete().eq("campaign_id", campaignId);
        if (campaignProducts.length > 0) {
          await supabase.from("campaign_products").insert(
            campaignProducts.map((p, i) => ({
              campaign_id: campaignId,
              product_id: p.product_id,
              stock_limit: p.stock_limit,
              sort_order: i,
            }))
          );
        }
      } catch {
        // campaign_products table may not exist yet
      }
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
                      {c.is_preventa && (
                        <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> Preventa {c.deposit_percentage}%
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
                        {/* Reorder arrows */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => setPendingImages((prev) => {
                                const arr = [...prev];
                                [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                                return arr;
                              })}
                              className="bg-black/70 rounded-bl-lg px-1 py-0.5"
                            >
                              <ChevronLeft className="w-3 h-3 text-white" />
                            </button>
                          )}
                          {i < pendingImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setPendingImages((prev) => {
                                const arr = [...prev];
                                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                                return arr;
                              })}
                              className="bg-black/70 rounded-br-lg px-1 py-0.5 ml-auto"
                            >
                              <ChevronRight className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                        {i === 0 && (
                          <span className="absolute top-0 left-0 right-0 text-[8px] text-center bg-black/60 text-white rounded-t-lg py-0.5">
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

              {/* Preventa / Seña */}
              <div className="border border-white/10 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-5 rounded-full relative transition-colors ${form.is_preventa ? "bg-green-600" : "bg-white/10"}`}
                    onClick={() => setForm((f) => ({ ...f, is_preventa: !f.is_preventa }))}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_preventa ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <div>
                    <span className="text-white text-sm font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-green-400" /> Modo preventa / seña
                    </span>
                    <p className="text-gray-600 text-[10px]">Registra compras con seña parcial</p>
                  </div>
                </label>

                {form.is_preventa && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className={labelClass}>Precio del producto (ARS) *</label>
                      <input
                        type="number"
                        min={0}
                        value={form.unit_price || ""}
                        onChange={(e) => setForm((f) => ({ ...f, unit_price: parseFloat(e.target.value) || 0 }))}
                        className={inputClass}
                        placeholder="Ej: 45000"
                        required={form.is_preventa}
                      />
                      {form.unit_price > 0 && (
                        <p className="text-[10px] text-green-500 mt-1">
                          Seña ({form.deposit_percentage}%): ${Math.round(form.unit_price * form.deposit_percentage / 100).toLocaleString("es-AR")}
                          {" · "}Saldo: ${Math.round(form.unit_price * (1 - form.deposit_percentage / 100)).toLocaleString("es-AR")}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>% de seña</label>
                        <select
                          value={form.deposit_percentage}
                          onChange={(e) => setForm((f) => ({ ...f, deposit_percentage: parseInt(e.target.value) }))}
                          className={inputClass + " cursor-pointer"}
                        >
                          <option value={30}>30%</option>
                          <option value={40}>40%</option>
                          <option value={50}>50%</option>
                          <option value={60}>60%</option>
                          <option value={70}>70%</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Cierre de preventa</label>
                        <input
                          type="datetime-local"
                          value={form.preventa_closes_at}
                          onChange={(e) => setForm((f) => ({ ...f, preventa_closes_at: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      Las reservas con seña quedan registradas en la sección de campañas para control interno.
                    </p>
                  </div>
                )}
              </div>

              {/* Size chart editor */}
              <div className="border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Ruler className="w-3 h-3" /> Tabla de talles
                  </p>
                  <button
                    type="button"
                    onClick={() => setSizeChart((prev) => [...prev, { talle: "", largo: "", ancho: "" }])}
                    className="text-[10px] text-green-400 hover:text-green-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar fila
                  </button>
                </div>
                {sizeChart.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1">
                      <span>Talle</span><span>Largo (cm)</span><span>Ancho (cm)</span><span />
                    </div>
                    {sizeChart.map((row, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                        <input
                          value={row.talle}
                          onChange={(e) => setSizeChart((prev) => prev.map((r, j) => j === i ? { ...r, talle: e.target.value } : r))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-green-500"
                          placeholder="1"
                        />
                        <input
                          value={row.largo}
                          onChange={(e) => setSizeChart((prev) => prev.map((r, j) => j === i ? { ...r, largo: e.target.value } : r))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-green-500"
                          placeholder="70"
                        />
                        <input
                          value={row.ancho}
                          onChange={(e) => setSizeChart((prev) => prev.map((r, j) => j === i ? { ...r, ancho: e.target.value } : r))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-green-500"
                          placeholder="52"
                        />
                        <button
                          type="button"
                          onClick={() => setSizeChart((prev) => prev.filter((_, j) => j !== i))}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {sizeChart.length === 0 && (
                  <p className="text-[10px] text-gray-600">Sin tabla de talles. Agregá filas si el drop tiene medidas específicas.</p>
                )}
              </div>

              {/* Campaign Products */}
              <div className="border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Productos del drop
                  </p>
                  {loadingProducts && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
                </div>

                {campaignProducts.map((entry, i) => (
                  <div key={entry.product_id} className="flex items-center gap-2">
                    {entry.image && (
                      <img src={entry.image} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
                    )}
                    <span className="flex-1 text-white text-xs truncate">{entry.name}</span>
                    <input
                      type="number"
                      min={1}
                      value={entry.stock_limit}
                      onChange={(e) =>
                        setCampaignProducts((prev) =>
                          prev.map((p, j) => j === i ? { ...p, stock_limit: parseInt(e.target.value) || 15 } : p)
                        )
                      }
                      className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-green-500"
                    />
                    <span className="text-[9px] text-gray-600 w-5">uds</span>
                    <button
                      type="button"
                      onClick={() => setCampaignProducts((prev) => prev.filter((_, j) => j !== i))}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add product row */}
                <div className="flex gap-2 pt-1">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={inputClass + " flex-1 cursor-pointer"}
                  >
                    <option value="">— Agregar producto —</option>
                    {allProducts
                      .filter((p) => !campaignProducts.some((e) => e.product_id === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={newStockLimit}
                    onChange={(e) => setNewStockLimit(parseInt(e.target.value) || 15)}
                    className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-white text-xs text-center focus:outline-none focus:border-green-500"
                    placeholder="15"
                  />
                  <button
                    type="button"
                    disabled={!selectedProductId}
                    onClick={() => {
                      const product = allProducts.find((p) => p.id === selectedProductId);
                      if (!product) return;
                      setCampaignProducts((prev) => [
                        ...prev,
                        { product_id: product.id, name: product.name, image: product.image, stock_limit: newStockLimit },
                      ]);
                      setSelectedProductId("");
                      setNewStockLimit(15);
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {campaignProducts.length === 0 && !loadingProducts && (
                  <p className="text-[10px] text-gray-600">
                    Sin productos. Agregá los artículos de este drop para mostrar el stock en la home.
                  </p>
                )}
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
