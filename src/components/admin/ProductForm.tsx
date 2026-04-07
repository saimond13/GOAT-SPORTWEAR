"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORIES, SIZES, BADGES } from "@/types/product";
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleSize = (s: string) => {
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("La imagen no puede superar 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
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
    let image_url = product?.image_url ?? null;
    let image_path = product?.image_path ?? null;

    // Upload image if new one selected
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, imageFile, { upsert: true });
      if (uploadError) { setError("Error al subir imagen"); setSaving(false); return; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      image_url = data.publicUrl;
      image_path = path;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      sizes: form.sizes,
      badge: form.badge || null,
      is_active: form.is_active,
      image_url,
      image_path,
    };

    if (isEdit) {
      await supabase.from("products").update(payload).eq("id", product.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    router.push("/admin/products");
    router.refresh();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Image */}
      <div>
        <label className={labelClass}>Imagen del producto</label>
        <div className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden hover:border-green-600/50 transition-colors">
          {imagePreview ? (
            <div className="relative">
              {/* Molde fijo 3:4 — mismo que la tarjeta de producto */}
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600/80 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
              <label className="absolute bottom-3 right-3 cursor-pointer bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                Cambiar
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-44 cursor-pointer">
              <Upload className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-gray-500 text-sm font-medium">Clic para subir imagen</span>
              <span className="text-gray-700 text-xs mt-1">JPG, PNG, WebP · Sin límite de tamaño</span>
              <span className="text-gray-700 text-xs">Se recorta automáticamente a 3:4</span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className={labelClass}>Nombre *</label>
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass} placeholder="Ej: Remera Oversize Premium" required />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass + " resize-none"} rows={2} placeholder="Describí el producto brevemente" />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio * ($)</label>
          <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputClass} placeholder="15000" required min="0" step="0.01" />
        </div>
        <div>
          <label className={labelClass}>Precio original ($) <span className="text-gray-600">opcional</span></label>
          <input type="number" value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
            className={inputClass} placeholder="20000" min="0" step="0.01" />
        </div>
      </div>

      {/* Category + Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass + " cursor-pointer"}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <select value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            className={inputClass + " cursor-pointer"}>
            {BADGES.map((b) => <option key={b} value={b}>{b || "Sin badge"}</option>)}
          </select>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className={labelClass}>Talles * (seleccioná los disponibles)</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button type="button" key={s} onClick={() => toggleSize(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                form.sizes.includes(s)
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-green-600/50"
              }`}>{s}
            </button>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-green-600" : "bg-white/10"}`}
          onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
        </div>
        <span className="text-gray-300 text-sm font-medium">Visible en la tienda</span>
      </label>

      {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2.5 rounded-xl">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}
