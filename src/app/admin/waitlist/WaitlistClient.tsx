"use client";
import { Trash2, Download } from "lucide-react";
import type { WaitlistEntry } from "@/types/admin";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function WaitlistClient({ entries }: { entries: WaitlistEntry[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este suscriptor?")) return;
    const supabase = createClient();
    await supabase.from("waitlist").delete().eq("id", id);
    startTransition(() => router.refresh());
  };

  const exportCSV = () => {
    const header = "Email,Nombre,Fuente,Fecha\n";
    const rows = entries.map((e) => `${e.email},${e.name ?? ""},${e.source},${formatDate(e.created_at)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-goat-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex justify-end">
        <button onClick={exportCSV} disabled={entries.length === 0}
          className="flex items-center gap-2 border border-[#111111]/10 text-[#2B2B2B] hover:text-[#111111] hover:border-[#111111]/30 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-12 text-center">
          <p className="text-[#B8B8B8] text-sm">Sin suscriptores aún. Cuando alguien se anote desde la tienda, aparece acá.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#111111]/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#111111]/8">
                {["Email", "Nombre", "Fuente", "Fecha", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-[#111111]/8 hover:bg-[#111111]/5">
                  <td className="px-5 py-3 text-[#111111] text-sm font-medium">{e.email}</td>
                  <td className="px-5 py-3 text-[#2B2B2B] text-sm">{e.name ?? "-"}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] bg-[#111111]/8 text-[#2B2B2B] px-2 py-0.5 rounded-full">{e.source}</span>
                  </td>
                  <td className="px-5 py-3 text-[#B8B8B8] text-xs">{formatDate(e.created_at)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(e.id)}
                      className="w-7 h-7 bg-[#111111]/5 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3 h-3 text-[#B8B8B8] hover:text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
