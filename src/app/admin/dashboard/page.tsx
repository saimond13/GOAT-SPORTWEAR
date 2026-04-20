import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: orders },
    { count: waitlistCount },
    { data: orderItems },
    { data: allProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total, payment_status, created_at").order("created_at"),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
    supabase.from("order_items").select("product_name, quantity, unit_price").order("created_at", { ascending: false }).limit(500),
    supabase.from("products").select("id, name, stock_by_size, has_sizes, category, image_url").eq("is_active", true),
  ]);

  const paidOrders = (orders ?? []).filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgTicket = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Monthly revenue for chart
  const monthlyMap: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const month = new Date(o.created_at).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(o.total);
  });
  const chartData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  // Best-selling products
  const salesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const item of orderItems ?? []) {
    if (!salesMap[item.product_name]) salesMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
    salesMap[item.product_name].qty += item.quantity;
    salesMap[item.product_name].revenue += item.unit_price * item.quantity;
  }
  const bestSelling = Object.values(salesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Low stock alerts
  const lowStockProducts = (allProducts ?? []).filter((p) => {
    if (!p.stock_by_size || Object.keys(p.stock_by_size).length === 0) return false;
    const total = Object.values(p.stock_by_size as Record<string, number>).reduce((s, v) => s + v, 0);
    return total <= 5 && total > 0;
  }).slice(0, 8);

  const outOfStockProducts = (allProducts ?? []).filter((p) => {
    if (!p.stock_by_size || Object.keys(p.stock_by_size).length === 0) return false;
    const total = Object.values(p.stock_by_size as Record<string, number>).reduce((s, v) => s + v, 0);
    return total <= 0;
  }).slice(0, 8);

  return (
    <DashboardClient
      stats={{
        totalProducts: totalProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        totalRevenue,
        waitlistCount: waitlistCount ?? 0,
        avgTicket,
      }}
      chartData={chartData}
      bestSelling={bestSelling}
      lowStock={lowStockProducts.map((p) => ({
        name: p.name,
        total: Object.values(p.stock_by_size as Record<string, number>).reduce((s, v) => s + v, 0),
        image: p.image_url,
      }))}
      outOfStock={outOfStockProducts.map((p) => ({ name: p.name, image: p.image_url }))}
    />
  );
}
