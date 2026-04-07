import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/storefront/Header";
import { Hero } from "@/components/storefront/Hero";
import { ProductsSection } from "@/components/storefront/ProductsSection";
import { CampaignsBanner } from "@/components/storefront/CampaignsBanner";
import { WaitlistSection } from "@/components/storefront/WaitlistSection";
import { Footer } from "@/components/storefront/Footer";
import { Cart } from "@/components/storefront/Cart";
import type { Product } from "@/types/product";
import type { Campaign } from "@/types/admin";

export const revalidate = 60;

export default async function StorePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: campaigns }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
    supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at"),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <ProductsSection products={(products as Product[]) ?? []} />
        <CampaignsBanner campaigns={(campaigns as Campaign[]) ?? []} />
        <WaitlistSection />
      </main>
      <Footer />
      <Cart />
    </div>
  );
}
