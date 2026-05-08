import Link from "next/link";
import { Zap } from "lucide-react";

interface DropProduct {
  id: string;
  name: string;
  image?: string;
  price: number;
  drop_stock_limit: number;
  drop_available: number;
}

export async function FeaturedDropSection() {
  let drops: DropProduct[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data } = await supabase
      .from("products")
      .select("id, name, images, image_url, price, drop_stock_limit, drop_available")
      .eq("is_active", true)
      .not("drop_stock_limit", "is", null)
      .order("sort_order");

    drops = (data ?? []).map((p: {
      id: string;
      name: string;
      images?: string[];
      image_url?: string;
      price: number;
      drop_stock_limit: number;
      drop_available: number | null;
    }) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0] ?? p.image_url,
      price: p.price,
      drop_stock_limit: p.drop_stock_limit,
      drop_available: p.drop_available ?? p.drop_stock_limit,
    }));
  } catch {
    return null;
  }

  if (!drops.length) return null;

  return (
    <section className="bg-[#09090b] border-b border-white/5 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-green-500 fill-green-500" />
            <span
              className="text-white text-2xl sm:text-3xl tracking-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              NUEVO DROP
            </span>
            <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1 hidden sm:block">
              Stock limitado
            </span>
          </div>
          <span className="text-gray-600 text-xs uppercase tracking-widest">
            {drops.length} modelo{drops.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {drops.map((p) => {
            const available = p.drop_available;
            const limit = p.drop_stock_limit;
            const pct = Math.round((available / limit) * 100);
            const urgency =
              available === 0 ? "agotado"
              : available <= 3 ? "critical"
              : available <= 8 ? "low"
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
                href={`/productos/${p.id}`}
                className="group bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors overflow-hidden"
              >
                {/* Image */}
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

                {/* Info */}
                <div className="p-3">
                  <p className="text-white text-xs font-bold truncate">{p.name}</p>

                  {/* Stock bar */}
                  <div className="mt-2.5">
                    <div className="h-0.5 bg-white/10 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-[10px] font-black mt-1.5 ${stockColor} ${urgency === "critical" ? "animate-pulse" : ""}`}>
                      {urgency === "agotado"
                        ? "AGOTADO"
                        : `Quedan ${available}/${limit}`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
