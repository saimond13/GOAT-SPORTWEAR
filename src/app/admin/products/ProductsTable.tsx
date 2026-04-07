"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    startTransition(() => router.refresh());
    setDeleting(null);
  };

  if (!products.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <p className="text-gray-500 font-medium mb-3">No hay productos aún</p>
        <Link href="/admin/products/new" className="text-green-500 hover:text-green-400 text-sm font-bold">
          Crear el primer producto →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Producto</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Categoría</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Precio</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-12 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">👕</div>
                    )}
                    <div>
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      {p.badge && <span className="text-[10px] bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded font-bold">{p.badge}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400 text-sm hidden md:table-cell">{p.category}</td>
                <td className="px-5 py-3">
                  <p className="text-white font-bold text-sm">{formatPrice(p.price)}</p>
                  {p.original_price && <p className="text-gray-600 text-xs line-through">{formatPrice(p.original_price)}</p>}
                </td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <button onClick={() => handleToggle(p.id, p.is_active)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                      p.is_active ? "bg-green-600/20 text-green-400 hover:bg-red-600/20 hover:text-red-400" : "bg-white/10 text-gray-400 hover:bg-green-600/20 hover:text-green-400"
                    }`}>
                    {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {p.is_active ? "Visible" : "Oculto"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/products/${p.id}`}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-gray-300" />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      className="w-8 h-8 bg-white/10 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
