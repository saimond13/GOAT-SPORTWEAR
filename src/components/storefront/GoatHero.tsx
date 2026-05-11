"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Package, Truck, CreditCard, MapPin } from "lucide-react";
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
  activeDrop?: { id: string; title: string } | null;
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
  eyebrow = "GYMWEAR · TEMPORADA 2026",
  title = "GOAT\nSPORTWEAR",
  subtitle = "Oversize gymwear. Drops limitados. Envíos a todo el país.",
  primaryCtaLabel = "VER CATÁLOGO",
  primaryCtaHref = "#products",
  secondaryCtaLabel = "NUEVO DROP",
  secondaryCtaHref = "#drops",
  imageSrc = "/hero-model.png",
  imageAlt = "GOAT Sportwear",
  logoWatermarkSrc = "/logo.jpg",
  activeDrop,
}: GoatHeroProps) {
  const resolvedPrimaryHref = activeDrop ? `/drop/${activeDrop.id}` : primaryCtaHref;

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const lines = title.split("\n");

  return (
    <section
      id="hero"
      className="relative bg-[#09090b] overflow-hidden flex flex-col"
      style={{ minHeight: "calc(100vh - 2.25rem)" }}
    >
      {/* ── Background layer ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] rounded-full bg-green-500/[0.05] blur-[160px]" />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[300px] rounded-full bg-green-500/[0.04] blur-[100px]" />
        <div className="absolute right-0 bottom-0 w-1/2 h-full"
          style={{ background: "radial-gradient(ellipse 70% 55% at 65% 90%, rgba(255,255,255,0.055) 0%, transparent 70%)" }}
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
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />

      {/* Vertical label — xl only */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 z-10 pointer-events-none">
        <div className="h-16 w-px bg-gradient-to-b from-transparent to-white/20" />
        <span className="text-gray-600 text-[9px] tracking-[0.45em] uppercase font-medium"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Built Different
        </span>
        <div className="h-16 w-px bg-gradient-to-t from-transparent to-white/20" />
      </div>

      {/* ── Model image — absolutely positioned right half, desktop only ── */}
      {imageSrc && (
        <div className="absolute right-0 top-0 bottom-0 w-[52%] hidden lg:flex items-end justify-center z-[5] pointer-events-none">
          {/* Fade left edge — wide & gradual */}
          <div className="absolute left-0 top-0 bottom-0 w-48 z-10"
            style={{ background: "linear-gradient(to right, #09090b 0%, #09090b 20%, rgba(9,9,11,0.7) 55%, transparent 100%)" }} />
          {/* Fade bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-40 z-10"
            style={{ background: "linear-gradient(to top, #09090b 0%, #09090b 15%, rgba(9,9,11,0.6) 60%, transparent 100%)" }} />
          {/* Fade top edge — subtle */}
          <div className="absolute top-0 left-0 right-0 h-24 z-10"
            style={{ background: "linear-gradient(to bottom, #09090b 0%, rgba(9,9,11,0.4) 50%, transparent 100%)" }} />
          {/* Fade right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="h-[88%] w-auto object-contain object-bottom relative z-[1]"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          />

          {/* Drop badge */}
          {activeDrop && (
            <motion.div
              className="absolute top-[18%] right-4 border border-green-500/50 bg-black/80 backdrop-blur-sm px-4 py-2.5 z-20 pointer-events-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-0.5">Drop 001</p>
              <p className="text-white text-sm font-black uppercase tracking-wider leading-none">Limited Drop</p>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Text content ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full py-20 lg:py-0">
          {/* Constrain text to left ~55% on desktop */}
          <div className="lg:max-w-[52%]">

            {/* Eyebrow */}
            <motion.div className="flex items-center gap-2.5 mb-6" {...fadeUp(0.15)}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.5em]">
                {eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <h1
              className="text-[52px] sm:text-[72px] lg:text-[80px] xl:text-[96px] text-white leading-[0.88] tracking-tight font-black uppercase mb-6 select-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {lines.map((line, i) => {
                const isLast = i === lines.length - 1;
                const parts = isLast ? line.split(" ") : [line];
                const multiWord = parts.length > 1;
                return (
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
                    {isLast && multiWord
                      ? parts.map((word, wi) =>
                          wi === parts.length - 1
                            ? <span key={wi} className="text-green-500">{word}</span>
                            : <span key={wi}>{word} </span>
                        )
                      : line}
                  </motion.span>
                );
              })}
            </h1>

            {/* Subtitle */}
            <motion.p
              className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-[380px] mb-8"
              {...fadeUp(0.65)}
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-col sm:flex-row gap-3 mb-10" {...fadeUp(0.8)}>
              <Link
                href={resolvedPrimaryHref}
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all hover:scale-[1.03] active:scale-95 w-full sm:w-auto"
              >
                {primaryCtaLabel}
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <button
                onClick={() => scrollTo(secondaryCtaHref.replace("#", ""))}
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-green-500/50 text-white/80 hover:text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all w-full sm:w-auto"
              >
                {secondaryCtaLabel}
                <ArrowUpRight className="w-4 h-4" />
              </button>
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
                <Icon className="w-4 h-4 text-green-500 flex-shrink-0" />
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
