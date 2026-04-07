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
          className="flex items-center gap-2 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm">Sin suscriptores aún. Cuando alguien se anote desde la tienda, aparece acá.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Email", "Nombre", "Fuente", "Fecha", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3 text-white text-sm font-medium">{e.email}</td>
                  <td className="px-5 py-3 text-gray-400 text-sm">{e.name ?? "-"}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{e.source}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(e.created_at)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(e.id)}
                      className="w-7 h-7 bg-white/5 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
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
