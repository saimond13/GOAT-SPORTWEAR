import { createClient } from "@/lib/supabase/server";
import type { PreventaRegistration } from "@/types/admin";
import { PreventaClient } from "./PreventaClient";

export default async function PreventaPage() {
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from("preventa_registrations")
    .select("*, campaigns(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (registrations ?? []).map((r: any) => ({
    ...r,
    campaign_title: (r.campaigns as { title: string } | null)?.title ?? undefined,
  })) as (PreventaRegistration & { campaign_title?: string })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Preventa / Reservas</h1>
        <p className="text-gray-500 text-sm mt-1">Reservas con seña de todos los drops</p>
      </div>
      <PreventaClient registrations={mapped} />
    </div>
  );
}
