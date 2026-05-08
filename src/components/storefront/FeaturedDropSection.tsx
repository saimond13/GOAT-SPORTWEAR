import Link from "next/link";
import { Zap } from "lucide-react";

interface DropProduct {
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
    deposit_percentage?: number;
  } | null = null;
  let products: DropProduct[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Busca el drop de preventa activo más próximo
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title, description, images, image_url, deposit_percentage")
      .eq("is_active", true)
      .eq("is_preventa", true)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(1);

    if (!campaigns?.length) return null;
    campaign = campaigns[0];

    // Productos del drop con su stock
    const { data: cp, error: cpErr } = await supabase
      .from("campaign_products")
      .select("id, product_id, stock_limit, sort_order, products(id, name, images, image_url)")
      .eq("campaign_id", campaign.id)
      .order("sort_order");

    if (cpErr || !cp?.length) return null;

    // Conteo de reservas por producto
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
      return {
        id: item.id,
        product_id: item.product_id,
        stock_limit: item.stock_limit,
        available: Math.max(0, item.stock_limit - (reserved[item.product_id] ?? 0)),
        name: p?.name ?? "",
        image: p?.images?.[0] ?? p?.image_url,
      };
    });
  } catch {
    return null;
  }

  if (!campaign || !products.length) return null;

  return (
    <section className="bg-[#09090b] border-b border-white/5 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-500 fill-green-500" />
              <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.5em]">
                Nuevo Drop
              </span>
            </div>
            <h2
              className="text-[40px] sm:text-[56px] text-white leading-none tracking-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {campaign.title}
            </h2>
            {campaign.description && (
              <p className="text-gray-500 text-sm mt-2 max-w-md">{campaign.description}</p>
            )}
          </div>

          <Link
            href={`/drop/${campaign.id}`}
            className="hidden sm:flex items-center gap-2 border border-white/20 hover:border-green-500 text-white hover:text-green-400 text-xs font-black uppercase tracking-widest px-5 py-3 transition-colors flex-shrink-0"
          >
            Ver drop
            <span>→</span>
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {products.map((p) => {
            const pct = Math.round((p.available / p.stock_limit) * 100);
            const urgency =
              p.available === 0 ? "agotado"
              : p.available <= 3 ? "critical"
              : p.available <= 8 ? "low"
              : "ok";

            const stockColor =
              urgency === "ok" ? "text-green-500"
              : urgency === "low" ? "text-yellow-500"
              : urgency === "critical" ? "text-red-400"
              : "text-gray-600";

            const barColor =
              urgency === "ok" ? "bg-green-500"
              : urgency === "low" ? "bg-yellow-500"
              : urgency === "critical" ? "bg-red-500"
              : "bg-gray-600";

            return (
              <Link
                key={p.id}
                href={`/drop/${campaign!.id}`}
                className="group bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors overflow-hidden"
              >
                <div className="aspect-square bg-white/5 overflow-hidden relative">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                  {urgency === "critical" && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest animate-pulse">
                      ¡Últimas!
                    </div>
                  )}
                  {urgency === "agotado" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Agotado</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-white text-xs font-bold truncate">{p.name}</p>
                  <div className="mt-2.5">
                    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-[10px] font-black mt-1.5 ${stockColor} ${urgency === "critical" ? "animate-pulse" : ""}`}>
                      {urgency === "agotado" ? "AGOTADO" : `Quedan ${p.available}/${p.stock_limit}`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <Link
          href={`/drop/${campaign.id}`}
          className="sm:hidden flex items-center justify-center gap-2 border border-white/20 text-white text-xs font-black uppercase tracking-widest px-5 py-4 w-full transition-colors hover:border-green-500 hover:text-green-400"
        >
          Ver drop completo →
        </Link>

        {campaign.deposit_percentage && (
          <p className="text-gray-600 text-xs mt-4 hidden sm:block">
            Reservá tu unidad con solo {campaign.deposit_percentage}% de seña. Pagás el saldo cuando enviamos.
          </p>
        )}
      </div>
    </section>
  );
}
