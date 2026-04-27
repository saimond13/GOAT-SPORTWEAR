import { createClient } from "@/lib/supabase/server";
import { EnviosClient } from "./EnviosClient";

export default async function EnviosPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Envíos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configurá los precios de envío por zona — Correo Argentino
        </p>
      </div>
      <EnviosClient zones={zones ?? []} />
    </div>
  );
}
