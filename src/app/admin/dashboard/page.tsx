import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: orders },
    { count: waitlistCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total, payment_status, created_at").order("created_at"),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
  ]);

  const paidOrders = (orders ?? []).filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);

  // Monthly revenue for chart
  const monthlyMap: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const month = new Date(o.created_at).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(o.total);
  });
  const chartData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  return (
    <DashboardClient
      stats={{
        totalProducts: totalProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        totalRevenue,
        waitlistCount: waitlistCount ?? 0,
      }}
      chartData={chartData}
    />
  );
}
