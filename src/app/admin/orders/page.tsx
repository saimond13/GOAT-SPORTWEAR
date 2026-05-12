import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "./OrdersClient";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#111111] font-black text-2xl">Pedidos</h1>
        <p className="text-[#B8B8B8] text-sm mt-1">Registrá y administrá los pedidos recibidos por WhatsApp</p>
      </div>
      <OrdersClient orders={orders ?? []} />
    </div>
  );
}
