import { createClient } from "@/lib/supabase/server";
import { WaitlistClient } from "./WaitlistClient";

export default async function WaitlistPage() {
  const supabase = await createClient();
  const { data: entries, count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#111111] font-black text-2xl">Waitlist</h1>
        <p className="text-[#B8B8B8] text-sm mt-1">{count ?? 0} suscriptores registrados</p>
      </div>
      <WaitlistClient entries={entries ?? []} />
    </div>
  );
}
