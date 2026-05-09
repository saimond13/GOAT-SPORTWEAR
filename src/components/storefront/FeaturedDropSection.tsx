import Link from "next/link";
import { FeaturedDropCountdown } from "./FeaturedDropCountdown";

interface DropCampaign {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  image_url?: string;
  countdown_ends_at?: string;
  deposit_percentage?: number;
  reservations: number;
}

export async function FeaturedDropSection() {
  let drops: DropCampaign[] = [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title, description, images, image_url, countdown_ends_at, deposit_percentage")
      .eq("is_active", true)
      .eq("is_preventa", true)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at");

    if (!campaigns?.length) return null;

    // Contar reservas por campaña
    const counts = await Promise.all(
      campaigns.map((c) =>
        supabase
          .from("preventa_registrations")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", c.id)
          .neq("status", "cancelled")
          .then(({ count }) => ({ id: c.id, count: count ?? 0 }))
      )
    );
    const countMap: Record<string, number> = {};
    counts.forEach(({ id, count }) => { countMap[id] = count; });

    drops = campaigns.map((c) => ({ ...c, reservations: countMap[c.id] ?? 0 }));
  } catch {
    return null;
  }

  if (!drops.length) return null;

  const hero = drops[0];

  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.5em]">
            Drop activo · Reservas abiertas
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-[48px] sm:text-[68px] md:text-[84px] text-white leading-none tracking-tight mb-4"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          DROP 001
        </h2>


        {/* Countdown (primer drop que tenga) */}
        {hero.countdown_ends_at && (
          <div className="mb-8">
            <FeaturedDropCountdown target={hero.countdown_ends_at} />
          </div>
        )}

        {/* Drop cards — una por remera */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
          {drops.map((drop) => {
            const img = drop.images?.[0] ?? drop.image_url;
            return (
              <Link
                key={drop.id}
                href={`/drop/${drop.id}`}
                className="group flex gap-4 bg-black/50 border border-white/10 hover:border-green-500/50 transition-all p-3 backdrop-blur-sm"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-white/5">
                  {img ? (
                    <img
                      src={img}
                      alt={drop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <p className="text-white text-sm font-bold leading-tight line-clamp-2">{drop.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-[10px]">
                      {drop.reservations} {drop.reservations === 1 ? "reserva" : "reservas"}
                    </span>
                    <span className="text-green-400 text-[10px] font-black uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      Reservar →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Main CTA */}
        <Link
          href={`/drop/${hero.id}`}
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-[0.2em] px-8 py-4 transition-colors"
        >
          RESERVAR AHORA
          <span className="text-lg">→</span>
        </Link>
      </div>
    </section>
  );
}
