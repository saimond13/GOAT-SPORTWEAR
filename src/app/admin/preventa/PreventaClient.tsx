"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Download, Check, Loader2 } from "lucide-react";
import type { PreventaRegistration } from "@/types/admin";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-400", icon: Clock },
  deposit_paid: { label: "Seña pagada", color: "bg-green-500/10 text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelada", color: "bg-red-500/10 text-red-400", icon: XCircle },
};

interface Props {
  registrations: (PreventaRegistration & { campaign_title?: string })[];
}

export function PreventaClient({ registrations }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "deposit_paid" | "cancelled">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = filter === "all" ? registrations : registrations.filter((r) => r.status === filter);

  const totalDeposits = registrations
    .filter((r) => r.status === "deposit_paid")
    .reduce((sum, r) => sum + r.deposit_amount, 0);

  const updateStatus = async (id: string, status: "deposit_paid" | "cancelled") => {
    setLoadingId(id);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/preventa/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al actualizar");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setErrorMsg("Error de conexión");
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("¿Confirmar que se recibió la seña?")) return;
    await updateStatus(id, "deposit_paid");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    await updateStatus(id, "cancelled");
  };

  const exportCSV = () => {
    const header = "Nombre,WhatsApp,Email,Campaña,Talle,Cantidad,Seña,Total,Estado,Fecha\n";
    const rows = registrations.map((r) =>
      [
        r.customer_name,
        r.customer_phone,
        r.customer_email ?? "",
        r.campaign_title ?? r.campaign_id,
        r.size,
        r.quantity,
        r.deposit_amount,
        r.notes ?? "",
        r.status,
        formatDate(r.created_at),
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preventa-goat-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total reservas", value: registrations.length },
          { label: "Señas cobradas", value: registrations.filter((r) => r.status === "deposit_paid").length },
          { label: "Pendientes", value: registrations.filter((r) => r.status === "pending").length },
          { label: "$ Señas cobradas", value: formatPrice(totalDeposits) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{label}</p>
            <p className="text-white font-black text-xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(["all", "deposit_paid", "pending", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === s
                  ? "bg-green-600 text-white"
                  : "bg-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {s === "all" ? "Todas" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          disabled={registrations.length === 0}
          className="flex items-center gap-2 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {errorMsg && (
        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2.5 rounded-xl">{errorMsg}</p>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">Sin reservas en esta categoría.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Cliente", "Drop", "Talle", "Seña", "Estado", "Fecha", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="text-white text-sm font-bold">{r.customer_name}</p>
                      <p className="text-gray-500 text-xs">{r.customer_phone}</p>
                      {r.customer_email && (
                        <p className="text-gray-600 text-xs">{r.customer_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-sm max-w-[160px]">
                      <p className="truncate">{r.campaign_title ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {r.size} × {r.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white font-bold text-sm">
                      {formatPrice(r.deposit_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full w-fit ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      {loadingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : (
                        <div className="flex flex-col gap-1">
                          {r.status === "pending" && (
                            <button
                              onClick={() => handleConfirm(r.id)}
                              className="flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300 font-black uppercase tracking-wide transition-colors"
                            >
                              <Check className="w-3 h-3" /> Confirmar seña
                            </button>
                          )}
                          {r.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wide transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
