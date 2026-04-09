import { notFound } from "next/navigation";
import { ProductDetail } from "./ProductDetail";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: Product | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    product = data as Product;
  } catch {
    // supabase not configured
  }

  if (!product) return notFound();

  return <ProductDetail product={product} />;
}
