import Link from "next/link";
import { FeaturedDropCountdown } from "./FeaturedDropCountdown";

interface DropProduct {
  id: string;
  name: string;
  image?: string;
  price: number;
  stock_by_size?: Record<string, number>;
}

interface DropCampaign {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  image_url?: string;
  countdown_ends_at?: string;
  deposit_percentage?: number;
  target_category?: string;
  total_reservations: number;
}

export async function FeaturedDropSection() {
  let drop: DropCampaign | null = null;
  let products: DropProduct[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title, description, images, image_url, countdown_ends_at, deposit_percentage, target_category")
      .eq("is_active", true)
      .eq("is_preventa", true)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(1);

    if (!campaigns?.length) return null;
    const campaign = campaigns[0];

    const { count } = await supabase
      .from("preventa_registrations")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .neq("status", "cancelled");

    drop = { ...campaign, total_reservations: count ?? 0 };

    // Traer productos de la categoría del drop
    if (campaign.target_category) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, images, image_url, price, stock_by_size")
        .eq("is_active", true)
        .eq("category", campaign.target_category)
        .order("sort_order");
      products = ((prods ?? []) as any[]).map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0] ?? p.image_url,
        price: p.price,
        stock_by_size: p.stock_by_size,
      }));
    }
  } catch {
    return null;
  }

  if (!drop) return null;

  const images = drop.images?.length ? drop.images : drop.image_url ? [drop.image_url] : [];
  const heroImg = images[0];
  const depositPct = drop.deposit_percentage ?? 50;

  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      {/* Background */}
      {heroImg && (
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/60" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.5em]">
            Drop activo · Reservas abiertas
          </span>
        </div>

        <h2
          className="text-[52px] sm:text-[72px] md:text-[88px] text-white leading-none tracking-tight mb-4"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {drop.title}
        </h2>

        {drop.description && (
          <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
            {drop.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 flex-wrap">
          <div>
            <span className="text-2xl font-black text-white">{drop.total_reservations}</span>
            <span className="text-gray-500 text-xs uppercase tracking-widest ml-2">reservas</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-2xl font-black text-green-400">{depositPct}%</span>
            <span className="text-gray-500 text-xs uppercase tracking-widest ml-2">de seña</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock limitado · Sin restock</span>
          </div>
        </div>

        {/* Countdown */}
        {drop.countdown_ends_at && (
          <div className="mb-8">
            <FeaturedDropCountdown target={drop.countdown_ends_at} />
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {products.map((p) => {
              const totalStock = p.stock_by_size
                ? Object.values(p.stock_by_size).reduce((a, b) => a + b, 0)
                : null;

              return (
                <Link
                  key={p.id}
                  href={`/drop/${drop!.id}`}
                  className="group bg-black/40 border border-white/10 hover:border-green-500/40 transition-colors overflow-hidden backdrop-blur-sm"
                >
                  <div className="aspect-square overflow-hidden bg-white/5">
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
                  <div className="p-3">
                    <p className="text-white text-xs font-bold truncate">{p.name}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">
                      {totalStock !== null && totalStock > 0
                        ? `${totalStock} disponibles`
                        : "Stock limitado"}
                    </p>
                    <p className="text-green-400 text-[10px] font-black mt-1 uppercase tracking-wider">
                      Reservar →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/drop/${drop.id}`}
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-[0.2em] px-8 py-4 transition-colors"
        >
          RESERVAR AHORA
          <span className="text-lg">→</span>
        </Link>
      </div>
    </section>
  );
}
