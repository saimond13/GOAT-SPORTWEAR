"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORIES, SIZES, BADGES, PAYMENT_METHODS } from "@/types/product";
import { createClient } from "@/lib/supabase/client";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    original_price: product?.original_price?.toString() ?? "",
    category: product?.category ?? CATEGORIES[0],
    sizes: product?.sizes ?? [],
    badge: product?.badge ?? "",
    is_active: product?.is_active ?? true,
  });

  // Stock por talle: { S: 5, M: 3, ... }
  const [stockBySize, setStockBySize] = useState<Record<string, number>>(
    product?.stock_by_size ?? {}
  );

  // Métodos de pago habilitados (null = todos)
  const [enabledPayments, setEnabledPayments] = useState<string[]>(
    product?.payment_methods ?? PAYMENT_METHODS
  );

  // All product images: images[] array takes priority, fallback to image_url
  const initialImages = product?.images?.length
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : [];

  const [images, setImages] = useState<string[]>(initialImages);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSize = (s: string) => {
    setForm((f) => {
      const hasSz = f.sizes.includes(s);
      if (hasSz) {
        // Remove size and its stock entry
        setStockBySize((prev) => { const n = { ...prev }; delete n[s]; return n; });
      }
      return { ...f, sizes: hasSz ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] };
    });
  };

  const togglePayment = (m: string) => {
    setEnabledPayments((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (file.size > 15 * 1024 * 1024) {
      setError("La imagen no puede superar 15MB");
      return null;
    }
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setError("Error al subir imagen");
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddImages = async (files: FileList) => {
    setError("");
    for (const file of Array.from(files)) {
      setUploadingIdx(-1); // show global spinner
      const url = await uploadImage(file);
      if (url) setImages((prev) => [...prev, url]);
    }
    setUploadingIdx(null);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFirst = (idx: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      return [item, ...arr];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || form.sizes.length === 0) {
      setError("Completá nombre, precio y al menos un talle");
      return;
    }
    setSaving(true);
    setError("");

    const supabase = createClient();

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      sizes: form.sizes,
      badge: form.badge || null,
      is_active: form.is_active,
      image_url: images[0] ?? null,
      images: images,
      stock_by_size: stockBySize,
      payment_methods: enabledPayments.length > 0 ? enabledPayments : PAYMENT_METHODS,
    };

    if (isEdit) {
      await supabase.from("products").update(payload).eq("id", product.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    router.push("/admin/products");
    router.refresh();
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600";
  const labelClass =
    "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">

      {/* ── Images ── */}
      <div>
        <label className={labelClass}>
          Fotos del producto ({images.length}) — la primera es la principal
        </label>

        {/* Existing images grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((url, i) => (
              <div key={url + i} className="relative group aspect-[3/4] bg-[#1a1a1e] overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />

                {/* Primary badge */}
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 uppercase">
                    Principal
                  </span>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => moveFirst(i)}
                      className="text-[9px] font-bold text-white bg-white/20 px-2 py-1 rounded"
                    >
                      Hacer principal
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add more slot */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-white/10 hover:border-green-500/40 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              {uploadingIdx === -1 ? (
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 text-[10px]">Agregar</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state upload area */}
        {images.length === 0 && (
          <div
            className="border-2 border-dashed border-white/10 rounded-2xl hover:border-green-600/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center h-44">
              {uploadingIdx === -1 ? (
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-gray-500 text-sm font-medium">Subir fotos</span>
                  <span className="text-gray-700 text-xs mt-1">JPG, PNG, WebP · hasta 15MB c/u</span>
                  <span className="text-gray-700 text-xs">Podés subir varias a la vez</span>
                </>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleAddImages(e.target.files)}
        />
        <p className="text-gray-700 text-xs mt-2">
          Hacé hover en una foto para eliminarla o hacerla principal
        </p>
      </div>

      {/* Name */}
      <div>
        <label className={labelClass}>Nombre *</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Ej: Remera Oversize Premium"
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
          placeholder="Describí el producto brevemente"
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio * ($)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputClass}
            placeholder="15000"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className={labelClass}>
            Precio original ($) <span className="text-gray-600">opcional</span>
          </label>
          <input
            type="number"
            value={form.original_price}
            onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
            className={inputClass}
            placeholder="20000"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Category + Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass + " cursor-pointer"}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <select
            value={form.badge}
            onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            className={inputClass + " cursor-pointer"}
          >
            {BADGES.map((b) => <option key={b} value={b}>{b || "Sin badge"}</option>)}
          </select>
        </div>
      </div>

      {/* Sizes + stock */}
      <div>
        <label className={labelClass}>Talles y stock *</label>
        <div className="space-y-2">
          {SIZES.map((s) => {
            const active = form.sizes.includes(s);
            return (
              <div key={s} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`w-14 py-1.5 rounded-lg text-xs font-bold border transition-colors flex-shrink-0 ${
                    active
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-green-600/50"
                  }`}
                >
                  {s}
                </button>
                {active && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={stockBySize[s] ?? ""}
                      onChange={(e) =>
                        setStockBySize((prev) => ({
                          ...prev,
                          [s]: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                        }))
                      }
                      placeholder="Stock"
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-green-500 placeholder-gray-600"
                    />
                    <span className="text-gray-600 text-xs">
                      {(stockBySize[s] ?? 0) === 0
                        ? "sin stock"
                        : `${stockBySize[s]} unidades`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-gray-600 text-xs mt-2">Stock = 0 deshabilita el talle en la tienda</p>
      </div>

      {/* Payment methods */}
      <div>
        <label className={labelClass}>Métodos de pago habilitados *</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => togglePayment(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                enabledPayments.includes(m)
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-green-600/50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-green-600" : "bg-white/10"}`}
          onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              form.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
        <span className="text-gray-300 text-sm font-medium">Visible en la tienda</span>
      </label>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2.5 rounded-xl">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
