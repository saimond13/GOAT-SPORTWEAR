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
  total_reservations: number;
}

export async function FeaturedDropSection() {
  let drop: DropCampaign | null = null;

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
    const campaign = campaigns[0];

    // Conteo total de reservas activas
    const { count } = await supabase
      .from("preventa_registrations")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .neq("status", "cancelled");

    drop = { ...campaign, total_reservations: count ?? 0 };
  } catch {
    return null;
  }

  if (!drop) return null;

  const images = drop.images?.length ? drop.images : drop.image_url ? [drop.image_url] : [];
  const heroImg = images[0];
  const depositPct = drop.deposit_percentage ?? 50;

  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      {/* Background image with strong overlay */}
      {heroImg && (
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-[#09090b]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/60" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 md:py-36">
        <div className="max-w-xl">
          {/* Label */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.5em]">
              Drop activo · Reservas abiertas
            </span>
          </div>

          {/* Title */}
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

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{drop.total_reservations}</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">reservas<br />confirmadas</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-green-400">{depositPct}%</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">de seña<br />para reservar</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">15</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">unidades<br />por modelo</span>
            </div>
          </div>

          {/* Countdown */}
          {drop.countdown_ends_at && (
            <div className="mb-8">
              <FeaturedDropCountdown target={drop.countdown_ends_at} />
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={`/drop/${drop.id}`}
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-[0.2em] px-8 py-4 transition-colors"
            >
              RESERVAR AHORA
              <span className="text-lg">→</span>
            </Link>
            <span className="text-gray-600 text-xs">
              Stock limitado · Sin restock
            </span>
          </div>
        </div>
      </div>

      {/* Right-side image gallery — desktop only */}
      {images.length > 1 && (
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[42%] gap-1 overflow-hidden">
          {images.slice(1, 3).map((src, i) => (
            <div key={i} className="flex-1 relative">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#09090b]/30" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
