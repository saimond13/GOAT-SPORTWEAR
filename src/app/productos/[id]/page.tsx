import { notFound } from "next/navigation";
import { ProductDetail } from "./ProductDetail";
import { CrossSelling } from "@/components/storefront/CrossSelling";
import { ProductsProvider } from "@/context/ProductsContext";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: Product | null = null;
  let allProducts: Product[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const [productRes, allRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).eq("is_active", true).single(),
      supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
    ]);
    product = productRes.data as Product;
    allProducts = (allRes.data as Product[]) ?? [];
  } catch {
    // supabase not configured
  }

  if (!product) return notFound();

  return (
    <ProductsProvider products={allProducts}>
      <ProductDetail product={product} />
      <CrossSelling currentProduct={product} allProducts={allProducts} />
    </ProductsProvider>
  );
}
