import Link from "next/link";
import { Zap } from "lucide-react";
import { FeaturedDropCountdown } from "./FeaturedDropCountdown";

interface ProductStock {
  id: string;
  product_id: string;
  stock_limit: number;
  available: number;
  name: string;
  image?: string;
}

export async function FeaturedDropSection() {
  let campaign: {
    id: string;
    title: string;
    description?: string;
    images?: string[];
    image_url?: string;
    countdown_ends_at?: string;
    deposit_percentage?: number;
  } | null = null;
  let products: ProductStock[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title, description, images, image_url, countdown_ends_at, deposit_percentage")
      .eq("is_active", true)
      .eq("is_preventa", true)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(1);

    if (!campaigns?.length) return null;
    campaign = campaigns[0];

    const { data: cp, error: cpErr } = await supabase
      .from("campaign_products")
      .select("id, product_id, stock_limit, sort_order, products(id, name, images, image_url)")
      .eq("campaign_id", campaign.id)
      .order("sort_order");

    if (cpErr || !cp?.length) return null;

    const { data: regs } = await supabase
      .from("preventa_registrations")
      .select("product_id, quantity")
      .eq("campaign_id", campaign.id)
      .neq("status", "cancelled");

    const reserved: Record<string, number> = {};
    for (const r of regs ?? []) {
      if (r.product_id) {
        reserved[r.product_id] = (reserved[r.product_id] ?? 0) + (r.quantity ?? 1);
      }
    }

    products = (cp as any[]).map((item) => {
      const p = item.products as { id: string; name: string; images?: string[]; image_url?: string } | null;
      const reservedCount = reserved[item.product_id] ?? 0;
      return {
        id: item.id,
        product_id: item.product_id,
        stock_limit: item.stock_limit,
        available: Math.max(0, item.stock_limit - reservedCount),
        name: p?.name ?? "",
        image: p?.images?.[0] ?? p?.image_url,
      };
    });
  } catch {
    return null;
  }

  if (!campaign || !products.length) return null;

  const heroImage = campaign.images?.[0] ?? campaign.image_url;

  return (
    <section className="relative bg-[#09090b] overflow-hidden border-b border-white/5">
      {heroImage && (
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/60 via-transparent to-[#09090b]" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Label */}
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-green-500 fill-green-500" />
          <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.5em]">
            Nuevo Drop
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-[48px] sm:text-[72px] md:text-[96px] text-white leading-none tracking-tight mb-4"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {campaign.title}
        </h2>

        {campaign.description && (
          <p className="text-gray-400 text-base max-w-lg mb-8 leading-relaxed">
            {campaign.description}
          </p>
        )}

        {campaign.countdown_ends_at && (
          <div className="mb-10">
            <FeaturedDropCountdown target={campaign.countdown_ends_at} />
          </div>
        )}

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {products.slice(0, 8).map((p) => {
            const pct = Math.round((p.available / p.stock_limit) * 100);
            const urgency =
              p.available === 0
                ? "agotado"
                : p.available <= 3
                ? "critical"
                : p.available <= 8
                ? "low"
                : "ok";

            return (
              <div
                key={p.id}
                className="bg-white/[0.04] border border-white/10 overflow-hidden group"
              >
                <div className="aspect-square bg-white/5 overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>

                <div className="p-2.5 sm:p-3">
                  <p className="text-white text-xs font-bold truncate">{p.name}</p>

                  {/* Stock bar */}
                  <div className="mt-2">
                    <div className="h-0.5 bg-white/10 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          urgency === "ok"
                            ? "bg-green-500"
                            : urgency === "low"
                            ? "bg-yellow-500"
                            : urgency === "critical"
                            ? "bg-red-500"
                            : "bg-gray-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p
                      className={`text-[10px] font-black mt-1.5 ${
                        urgency === "ok"
                          ? "text-green-500"
                          : urgency === "low"
                          ? "text-yellow-500"
                          : urgency === "critical"
                          ? "text-red-400"
                          : "text-gray-600"
                      } ${urgency === "critical" ? "animate-pulse" : ""}`}
                    >
                      {urgency === "agotado"
                        ? "AGOTADO"
                        : `Quedan ${p.available}/${p.stock_limit}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href={`/drop/${campaign.id}`}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-[0.15em] px-8 py-4 transition-colors"
          >
            VER DROP COMPLETO
            <span className="text-base">→</span>
          </Link>
          {campaign.deposit_percentage && (
            <span className="text-gray-600 text-xs hidden sm:block">
              Reservá con solo {campaign.deposit_percentage}% de seña
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
