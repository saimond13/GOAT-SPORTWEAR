import { Header } from "@/components/storefront/Header";
import { GoatHero } from "@/components/storefront/GoatHero";
import { ProductsSection } from "@/components/storefront/ProductsSection";
import { FeaturedDropSection } from "@/components/storefront/FeaturedDropSection";
import { CampaignsBanner } from "@/components/storefront/CampaignsBanner";
import { WaitlistSection } from "@/components/storefront/WaitlistSection";
import { Footer } from "@/components/storefront/Footer";
import { Cart } from "@/components/storefront/Cart";
import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { ProductsProvider } from "@/context/ProductsContext";
import type { Product } from "@/types/product";
import type { Campaign } from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  let products: Product[] = [];
  let campaigns: Campaign[] = [];
  let activeDrop: { id: string; title: string; depositPercentage?: number } | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [productsRes, campaignsRes] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
      supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .order("starts_at"),
    ]);

    products = (productsRes.data as Product[]) ?? [];
    campaigns = (campaignsRes.data as Campaign[]) ?? [];

    const drop = campaigns.find((c) => c.is_preventa);
    if (drop) {
      activeDrop = { id: drop.id, title: drop.title, depositPercentage: drop.deposit_percentage };
    }
  } catch {
    // Supabase not configured yet — show empty state
  }

  const heroImage = products.find((p) => p.image_url)?.image_url;

  return (
    <ProductsProvider products={products}>
      <AnnouncementBar activeDrop={activeDrop} />
      <div className="min-h-screen bg-[#09090b]">
        <Header />
        <main>
          <GoatHero imageSrc={heroImage} activeDrop={activeDrop} />
          <FeaturedDropSection />
          <ProductsSection products={products} />
          <CampaignsBanner campaigns={campaigns} />
          <WaitlistSection />
        </main>
        <Footer />
        <Cart />
      </div>
    </ProductsProvider>
  );
}
