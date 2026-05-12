"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Save, History } from "lucide-react";
import type { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface StockMovement {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  type: "venta_web" | "venta_local" | "ajuste";
  notes?: string;
  created_at: string;
}

export function StockClient({
  products,
  movements,
}: {
  products: Product[];
  movements: StockMovement[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProductChange = (id: string) => {
    const p = products.find((x) => x.id === id) ?? null;
    setSelectedProduct(p);
    setSelectedSize("");
    setQty(1);
  };

  const sizes = selectedProduct
    ? (selectedProduct.has_sizes !== false && selectedProduct.sizes?.length
        ? selectedProduct.sizes
        : ["Único"])
    : [];

  const currentStock = selectedProduct && selectedSize
    ? (selectedProduct.stock_by_size?.[selectedSize] ?? null)
    : null;

  const handleDeduct = async () => {
    if (!selectedProduct || !selectedSize || qty <= 0) return;
    if (currentStock !== null && qty > currentStock) {
      setError(`Stock insuficiente. Disponible: ${currentStock}`);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    const supabase = createClient();

    const newStock = currentStock !== null ? Math.max(0, currentStock - qty) : null;

    const updatedStockBySize = {
      ...(selectedProduct.stock_by_size ?? {}),
      ...(newStock !== null ? { [selectedSize]: newStock } : {}),
    };

    const { error: updateErr } = await supabase
      .from("products")
      .update({ stock_by_size: updatedStockBySize })
      .eq("id", selectedProduct.id);

    if (updateErr) { setError("Error al actualizar stock"); setSaving(false); return; }

    await supabase.from("stock_movements").insert({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      size: selectedSize,
      quantity: -qty,
      type: "venta_local",
      notes: notes || null,
    });

    setSuccess(`✓ Descontadas ${qty} ud. de "${selectedProduct.name}" — ${selectedSize}`);
    setQty(1);
    setNotes("");
    setSaving(false);
    startTransition(() => router.refresh());
  };

  const handleManualEdit = async (productId: string, size: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const supabase = createClient();
    const updatedStockBySize = { ...(product.stock_by_size ?? {}), [size]: newQty };
    await supabase.from("products").update({ stock_by_size: updatedStockBySize }).eq("id", productId);
    await supabase.from("stock_movements").insert({
      product_id: productId,
      product_name: product.name,
      size,
      quantity: newQty - (product.stock_by_size?.[size] ?? 0),
      type: "ajuste",
      notes: "Ajuste manual",
    });
    startTransition(() => router.refresh());
  };

  const inputClass = "w-full bg-white border border-[#111111]/10 rounded-xl px-3 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#111111] font-black text-2xl">Gestión de Stock</h1>
        <p className="text-[#B8B8B8] text-sm mt-1">Registrá ventas locales y editá stock rápidamente</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick deduct - venta local */}
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-[#111111] font-black text-base flex items-center gap-2">
            <Minus className="w-4 h-4 text-orange-400" />
            Registrar venta local
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Producto</label>
            <select
              value={selectedProduct?.id ?? ""}
              onChange={(e) => handleProductChange(e.target.value)}
              className={inputClass + " cursor-pointer"}
            >
              <option value="">Seleccioná un producto…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Talle</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const stock = selectedProduct.stock_by_size?.[s] ?? null;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                          selectedSize === s
                            ? "bg-[#556B5D] border-[#556B5D] text-white"
                            : "border-[#111111]/10 text-[#2B2B2B] hover:border-[#111111]/30"
                        }`}
                      >
                        {s}
                        {stock !== null && (
                          <span className={`ml-1.5 text-[9px] ${stock <= 3 ? "text-red-400" : "text-[#B8B8B8]"}`}>
                            ({stock})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSize && (
                <>
                  {currentStock !== null && (
                    <p className="text-xs text-[#B8B8B8]">
                      Stock actual: <strong className={`${currentStock <= 3 ? "text-orange-400" : "text-[#111111]"}`}>{currentStock} unidades</strong>
                    </p>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Cantidad vendida</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-9 h-9 border border-[#111111]/10 rounded-lg flex items-center justify-center text-[#2B2B2B] hover:border-[#111111]/30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-[#111111] text-lg w-6 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="w-9 h-9 border border-[#111111]/10 rounded-lg flex items-center justify-center text-[#2B2B2B] hover:border-[#111111]/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-1">Nota (opcional)</label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Venta mostrador, reserva cliente…"
                      className={inputClass}
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  {success && <p className="text-[#556B5D] text-sm">{success}</p>}

                  <button
                    onClick={handleDeduct}
                    disabled={saving}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Descontar {qty} unidad{qty !== 1 ? "es" : ""} del stock
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Stock overview — quick inline edit */}
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-[#111111] font-black text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#556B5D]" />
            Stock por producto
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {products.map((p) => {
              if (!p.stock_by_size || Object.keys(p.stock_by_size).length === 0) return null;
              const totalStock = Object.values(p.stock_by_size as Record<string, number>).reduce((s, v) => s + v, 0);
              return (
                <div key={p.id} className="border border-[#111111]/8 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {p.image_url && <img src={p.image_url} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111111] text-xs font-bold truncate">{p.name}</p>
                      <p className="text-[#B8B8B8] text-[10px]">Total: {totalStock} ud.</p>
                    </div>
                    {totalStock === 0 && <span className="text-[10px] text-red-400 font-bold">AGOTADO</span>}
                    {totalStock > 0 && totalStock <= 5 && <span className="text-[10px] text-orange-400 font-bold">BAJO</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(p.stock_by_size as Record<string, number>).map(([size, stock]) => (
                      <div key={size} className="flex items-center gap-1">
                        <span className="text-[10px] text-[#B8B8B8] font-bold w-8 text-center">{size}</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={stock}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value);
                            if (!isNaN(v) && v !== stock) handleManualEdit(p.id, size, v);
                          }}
                          className="w-14 bg-[#E7E7E4] border border-[#111111]/10 rounded px-2 py-1 text-[#111111] text-xs text-center focus:outline-none focus:border-[#556B5D]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Movement log */}
      <div className="bg-white border border-[#111111]/10 rounded-2xl p-5">
        <h2 className="text-[#111111] font-black text-base mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-[#B8B8B8]" />
          Historial de movimientos
        </h2>
        {movements.length === 0 ? (
          <p className="text-[#B8B8B8] text-sm text-center py-8">Sin movimientos registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#111111]/8">
                  {["Fecha", "Producto", "Talle", "Cantidad", "Tipo", "Nota"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-[#111111]/8 hover:bg-[#111111]/5">
                    <td className="px-3 py-2 text-[#B8B8B8] text-xs whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-2 text-[#111111] text-xs font-bold">{m.product_name}</td>
                    <td className="px-3 py-2 text-[#2B2B2B] text-xs">{m.size}</td>
                    <td className={`px-3 py-2 text-xs font-black ${m.quantity < 0 ? "text-red-400" : "text-[#556B5D]"}`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.type === "venta_web" ? "bg-blue-500/20 text-blue-500"
                        : m.type === "venta_local" ? "bg-orange-500/20 text-orange-500"
                        : "bg-[#111111]/8 text-[#B8B8B8]"
                      }`}>
                        {m.type === "venta_web" ? "Web" : m.type === "venta_local" ? "Local" : "Ajuste"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#B8B8B8] text-xs">{m.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
