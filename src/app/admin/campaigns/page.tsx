import { createClient } from "@/lib/supabase/server";
import { CampaignsClient } from "./CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Campañas</h1>
        <p className="text-gray-500 text-sm mt-1">Gestioná lanzamientos y drops especiales</p>
      </div>
      <CampaignsClient campaigns={campaigns ?? []} />
    </div>
  );
}
