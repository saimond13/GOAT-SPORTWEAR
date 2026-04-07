"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import type { Order } from "@/types/order";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/types/product";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pendiente",   color: "bg-yellow-600/20 text-yellow-400" },
  confirmed: { label: "Confirmado",  color: "bg-blue-600/20 text-blue-400" },
  shipped:   { label: "Enviado",     color: "bg-purple-600/20 text-purple-400" },
  delivered: { label: "Entregado",   color: "bg-green-600/20 text-green-400" },
  cancelled: { label: "Cancelado",   color: "bg-red-600/20 text-red-400" },
};

const PAY_LABELS: Record<string, string> = {
  unpaid: "bg-red-600/20 text-red-400",
  paid:   "bg-green-600/20 text-green-400",
  refunded: "bg-gray-600/20 text-gray-400",
};

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_address: "",
    payment_method: "", total: "", notes: "",
    payment_status: "unpaid" as "unpaid" | "paid",
    status: "pending" as Order["status"],
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.total) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("orders").insert({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone || null,
      customer_address: form.customer_address || null,
      payment_method: form.payment_method || null,
      payment_status: form.payment_status,
      status: form.status,
      total: parseFloat(form.total),
      notes: form.notes || null,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ customer_name: "", customer_phone: "", customer_address: "", payment_method: "", total: "", notes: "", payment_status: "unpaid", status: "pending" });
    startTransition(() => router.refresh());
  };

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", id);
    startTransition(() => router.refresh());
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1";

  return (
    <>
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nuevo pedido
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">No hay pedidos aún. Registrá los pedidos que recibís por WhatsApp.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Total", "Estado", "Pago", "Fecha", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const s = STATUS_LABELS[o.status];
                  return (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3">
                        <p className="text-white font-bold text-sm">{o.customer_name}</p>
                        {o.customer_phone && <p className="text-gray-500 text-xs">{o.customer_phone}</p>}
                      </td>
                      <td className="px-5 py-3 text-white font-bold text-sm">{formatPrice(o.total)}</td>
                      <td className="px-5 py-3">
                        <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer ${s.color} bg-transparent`}>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k} className="bg-black">{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAY_LABELS[o.payment_status]}`}>
                          {o.payment_status === "paid" ? "Pagado" : o.payment_status === "refunded" ? "Reembolsado" : "Sin pagar"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-3">
                        {o.notes && <span title={o.notes} className="text-gray-600 text-xs cursor-help">📝</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New order modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black text-lg">Nuevo pedido</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className={labelClass}>Nombre del cliente *</label>
                <input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} className={inputClass} placeholder="Juan Pérez" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input value={form.customer_phone} onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))} className={inputClass} placeholder="3404 123456" />
                </div>
                <div>
                  <label className={labelClass}>Total * ($)</label>
                  <input type="number" value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} className={inputClass} placeholder="15000" required min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Método de pago</label>
                  <select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))} className={inputClass + " cursor-pointer"}>
                    <option value="">Seleccionar</option>
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estado pago</label>
                  <select value={form.payment_status} onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value as "unpaid" | "paid" }))} className={inputClass + " cursor-pointer"}>
                    <option value="unpaid">Sin pagar</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={inputClass + " resize-none"} rows={2} placeholder="Detalles del pedido..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
