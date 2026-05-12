"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Package, Truck, CreditCard, MapPin, Share2 } from "lucide-react";
import Link from "next/link";

type GoatHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  logoWatermarkSrc?: string;
  activeDrop?: { id: string; title: string; depositPercentage?: number; reservationPct?: number } | null;
};

const BENEFITS = [
  { icon: Package, label: "Diseños exclusivos" },
  { icon: Truck, label: "Envíos a todo el país" },
  { icon: CreditCard, label: "Pagos online" },
  { icon: MapPin, label: "Retiro en local" },
];

const fadeUp = (delay: number, duration = 0.6) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function GoatHero({
  title = "BUILT\nDIFFERENT.",
  subtitle = "Oversize gymwear de calidad premium. Drops limitados y exclusivos.",
  primaryCtaLabel = "VER CATÁLOGO",
  primaryCtaHref = "#products",
  secondaryCtaLabel = "DROPS",
  secondaryCtaHref = "#drops",
  imageSrc = "/hero-model.png",
  imageAlt = "GOAT Sportwear",
  logoWatermarkSrc = "/logo.jpg",
  activeDrop,
}: GoatHeroProps) {
  const eyebrow = activeDrop
    ? "DROP ACTIVO · RESERVAS ABIERTAS"
    : "GYMWEAR · TEMPORADA 2026";

  const resolvedPrimaryHref = activeDrop ? `/drop/${activeDrop.id}` : primaryCtaHref;
  const resolvedPrimaryLabel = activeDrop ? "VER DROP" : primaryCtaLabel;

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleShare = () => {
    if (!activeDrop) return;
    const url = window.location.origin + `/drop/${activeDrop.id}`;
    if (navigator.share) {
      navigator.share({ title: activeDrop.title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert("¡Link copiado!"));
    }
  };

  const lines = title.split("\n");

  return (
    <section
      id="hero"
      className="relative bg-[#09090b] overflow-hidden flex flex-col"
      style={{ minHeight: "calc(100vh - 2.25rem)" }}
    >
      {/* ── Background layer ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] rounded-full bg-[#556B5D]/[0.07] blur-[160px]" />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[300px] rounded-full bg-[#556B5D]/[0.05] blur-[100px]" />
        <div className="absolute right-0 bottom-0 w-1/2 h-full"
          style={{ background: "radial-gradient(ellipse 70% 55% at 65% 90%, rgba(255,255,255,0.045) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 opacity-[0.013]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 64px),
              repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 64px)
            `,
          }}
        />
      </div>

      {/* Logo watermark */}
      {logoWatermarkSrc && (
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
          <img
            src={logoWatermarkSrc}
            alt=""
            aria-hidden
            className="w-[260px] sm:w-[380px] md:w-[500px] lg:w-[580px] opacity-[0.04] object-contain"
            style={{ filter: "invert(1)" }}
          />
        </div>
      )}

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#556B5D]/60 to-transparent" />

      {/* Vertical label — xl only */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 z-10 pointer-events-none">
        <div className="h-16 w-px bg-gradient-to-b from-transparent to-white/20" />
        <span className="text-gray-600 text-[9px] tracking-[0.45em] uppercase font-medium"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Built Different
        </span>
        <div className="h-16 w-px bg-gradient-to-t from-transparent to-white/20" />
      </div>

      {/* ── Model image ── */}
      {imageSrc && (
        <div className="absolute right-0 top-0 bottom-0 w-[54%] hidden lg:flex items-end justify-center z-[5] pointer-events-none">
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="h-[88%] w-auto object-contain object-bottom relative z-[1]"
            style={{
              WebkitMaskImage: [
                "linear-gradient(to right,  transparent 0%, rgba(0,0,0,0.4) 16%, black 32%)",
                "linear-gradient(to top,    transparent 0%, rgba(0,0,0,0.2) 18%, rgba(0,0,0,0.7) 38%, black 58%)",
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 5%,  black 12%)",
                "linear-gradient(to left,   transparent 0%, rgba(0,0,0,0.7) 3%,  black 8%)",
              ].join(", "),
              WebkitMaskComposite: "destination-in, destination-in, destination-in",
              maskImage: [
                "linear-gradient(to right,  transparent 0%, rgba(0,0,0,0.4) 16%, black 32%)",
                "linear-gradient(to top,    transparent 0%, rgba(0,0,0,0.2) 18%, rgba(0,0,0,0.7) 38%, black 58%)",
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 5%,  black 12%)",
                "linear-gradient(to left,   transparent 0%, rgba(0,0,0,0.7) 3%,  black 8%)",
              ].join(", "),
              maskComposite: "intersect",
              filter: "drop-shadow(-8px 0 32px rgba(9,9,11,0.9)) drop-shadow(0 24px 48px rgba(9,9,11,0.7))",
            }}
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          />

          {activeDrop && (
            <motion.div
              className="absolute top-[18%] right-4 border border-[#556B5D]/50 bg-black/80 backdrop-blur-sm px-4 py-2.5 z-20 pointer-events-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <p className="text-[#556B5D] text-[9px] font-black uppercase tracking-[0.4em] mb-0.5">Drop Activo</p>
              <p className="text-white text-sm font-black uppercase tracking-wider leading-none">Edición Limitada</p>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Text content ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full py-20 lg:py-0">
          <div className="lg:max-w-[52%]">

            {/* Eyebrow */}
            <motion.div className="flex items-center gap-2.5 mb-6" {...fadeUp(0.15)}>
              <span className="w-2 h-2 rounded-full bg-[#556B5D] animate-pulse flex-shrink-0" />
              <span className="text-[#556B5D] text-[11px] font-black uppercase tracking-[0.5em]">
                {eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <h1
              className="text-[52px] sm:text-[72px] lg:text-[80px] xl:text-[96px] text-white leading-[0.88] tracking-tight font-black uppercase mb-6 select-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {lines.map((line, i) => (
                <motion.span
                  key={i}
                  className="block"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.3 + i * 0.15,
                    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            {/* Drop subtitle or brand subtitle */}
            {activeDrop ? (
              <motion.div className="mb-8" {...fadeUp(0.6)}>
                <p className="text-[#556B5D] text-sm font-black uppercase tracking-[0.4em] mb-2">
                  Edición Limitada · {activeDrop.depositPercentage ?? 50}% de seña
                </p>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[380px]">
                  {subtitle}
                </p>
              </motion.div>
            ) : (
              <motion.p
                className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-[380px] mb-8"
                {...fadeUp(0.65)}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Progress bar — only when activeDrop has data */}
            {activeDrop && activeDrop.reservationPct !== undefined && (
              <motion.div className="mb-8 max-w-[340px]" {...fadeUp(0.72)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Reservas</span>
                  <span className="text-[#556B5D] text-[10px] font-black">{activeDrop.reservationPct}% RESERVADO</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#556B5D] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeDrop.reservationPct}%` }}
                    transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div className="flex flex-col sm:flex-row gap-3 mb-10" {...fadeUp(0.8)}>
              <Link
                href={resolvedPrimaryHref}
                className="inline-flex items-center justify-center gap-2 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all hover:scale-[1.03] active:scale-95 w-full sm:w-auto"
              >
                {resolvedPrimaryLabel}
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>

              {activeDrop ? (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#556B5D]/50 text-white/80 hover:text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all w-full sm:w-auto"
                >
                  Compartir Drop
                  <Share2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => scrollTo(secondaryCtaHref.replace("#", ""))}
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#556B5D]/50 text-white/80 hover:text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all w-full sm:w-auto"
                >
                  {secondaryCtaLabel}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            {/* Microcopy */}
            <motion.p className="text-gray-600 text-[11px] uppercase tracking-widest" {...fadeUp(0.95)}>
              📍 Local en Sa Pereira, Santa Fe
            </motion.p>
          </div>
        </div>
      </div>

      {/* ── Benefits bar ── */}
      <motion.div
        className="relative z-10 border-t border-white/[0.06] bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.05]">
            {BENEFITS.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                className="flex items-center gap-3 px-4 sm:px-6 py-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.15 + i * 0.08 }}
              >
                <Icon className="w-4 h-4 text-[#556B5D] flex-shrink-0" />
                <span className="text-gray-300 text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] leading-tight">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
