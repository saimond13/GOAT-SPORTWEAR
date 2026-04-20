import { createClient } from "@/lib/supabase/server";
import { StockClient } from "./StockClient";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: movements }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <StockClient
      products={(products as Product[]) ?? []}
      movements={movements ?? []}
    />
  );
}
