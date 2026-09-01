"use client";
import { useEffect, useRef } from "react";
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
  videoSrc?: string;
  posterSrc?: string;
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

/* Feathered mask so the video never shows a hard rectangle against the hero. */
const VIDEO_FEATHER = [
  "linear-gradient(to right,  transparent 0%, #000 9%,  #000 91%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 6%,  #000 94%, transparent 100%)",
].join(", ");

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Pure mapping: scroll progress (0..1) -> style values for each hero layer.
 * Phases mirror the brief: 0-15% untouched · 15-40% headline recedes ·
 * 40-80% video takes over · 80-100% video is the protagonist.
 */
function computeFrame(p: number, mobile: boolean) {
  const s = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  // Headline group (eyebrow + H1)
  let headlineOpacity: number;
  if (p < 0.15) headlineOpacity = 1;
  else if (p < 0.4) headlineOpacity = lerp(1, 0.32, s(0.15, 0.4));
  else if (p < 0.8) headlineOpacity = lerp(0.32, 0.06, s(0.4, 0.8));
  else headlineOpacity = lerp(0.06, 0, s(0.8, 1));

  const headlineX =
    lerp(0, mobile ? -18 : -50, s(0.15, 0.4)) + lerp(0, mobile ? -10 : -28, s(0.4, 1));
  const headlineY = -(p * (mobile ? 10 : 30));

  // Secondary group (subtitle + progress + CTAs)
  let secondaryOpacity: number;
  if (p < 0.12) secondaryOpacity = 1;
  else if (p < 0.35) secondaryOpacity = lerp(1, 0.25, s(0.12, 0.35));
  else secondaryOpacity = lerp(0.25, 0, s(0.35, 0.62));
  const secondaryX = lerp(0, mobile ? -12 : -34, s(0.12, 0.5));
  const secondaryY = -(p * (mobile ? 6 : 16));

  // Benefits bar
  const benefitsOpacity = p < 0.1 ? 1 : lerp(1, 0, s(0.1, 0.26));
  const benefitsY = lerp(0, 26, s(0.1, 0.3));

  // Video / model
  const videoScale =
    p < 0.4 ? lerp(1, 1.03, s(0, 0.4)) : lerp(1.03, mobile ? 1.07 : 1.12, s(0.4, 0.85));
  const videoX = lerp(0, mobile ? -6 : -13, s(0.4, 0.85));
  const videoY = p * (mobile ? 4 : 8);

  return {
    headlineOpacity,
    headlineTransform: `translate3d(${headlineX.toFixed(2)}px, ${headlineY.toFixed(2)}px, 0)`,
    secondaryOpacity,
    secondaryTransform: `translate3d(${secondaryX.toFixed(2)}px, ${secondaryY.toFixed(2)}px, 0)`,
    benefitsOpacity,
    benefitsTransform: `translate3d(0, ${benefitsY.toFixed(2)}px, 0)`,
    videoTransform: `translate3d(${videoX.toFixed(3)}%, ${videoY.toFixed(2)}px, 0) scale(${videoScale.toFixed(4)})`,
  };
}

export function GoatHero({
  title = "GOAT\nSPORTWEAR",
  subtitle = "Oversize gymwear de calidad premium. Drops limitados y exclusivos.",
  primaryCtaLabel = "VER CATÁLOGO",
  primaryCtaHref = "#products",
  secondaryCtaLabel = "DROPS",
  secondaryCtaHref = "#drops",
  videoSrc = "/videos/goat-scroll.mp4",
  posterSrc = "/assets/hero-model.png",
  imageAlt = "GOAT Sportwear",
  logoWatermarkSrc = "/assets/logo2.png",
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

  // ── Scroll-scrubbing wiring ──────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const lastSeek = useRef(-1);
  const isMobile = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduceMQL = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMQL = window.matchMedia("(max-width: 1023px)");
    isMobile.current = mobileMQL.matches;

    const applyFrame = (p: number) => {
      const f = computeFrame(p, isMobile.current);

      const h = headlineRef.current;
      if (h) {
        h.style.opacity = f.headlineOpacity.toFixed(3);
        h.style.transform = f.headlineTransform;
      }
      const sec = secondaryRef.current;
      if (sec) {
        sec.style.opacity = f.secondaryOpacity.toFixed(3);
        sec.style.transform = f.secondaryTransform;
      }
      const b = benefitsRef.current;
      if (b) {
        b.style.opacity = f.benefitsOpacity.toFixed(3);
        b.style.transform = f.benefitsTransform;
        b.style.pointerEvents = f.benefitsOpacity < 0.04 ? "none" : "";
      }
      const vw = videoWrapRef.current;
      if (vw) vw.style.transform = f.videoTransform;

      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        const t = p * (v.duration - 0.001);
        if (Math.abs(t - lastSeek.current) > 0.012) {
          lastSeek.current = t;
          try {
            v.currentTime = t;
          } catch {
            /* seek race — ignored, next frame corrects it */
          }
        }
      }
    };

    // Prime Safari's decoder so the first seek actually paints a frame.
    const v = videoRef.current;
    if (v) {
      v.defaultMuted = true;
      v.muted = true;
      const prime = () => {
        try {
          v.currentTime = 0.04;
        } catch {
          /* not ready */
        }
        v.play()
          .then(() => v.pause())
          .catch(() => {});
      };
      if (v.readyState >= 1) prime();
      else v.addEventListener("loadedmetadata", prime, { once: true });
    }

    // Reduced motion → no scrubbing, just a static opening frame.
    if (reduceMQL.matches) {
      applyFrame(0);
      const setStatic = () => {
        const vv = videoRef.current;
        if (vv && Number.isFinite(vv.duration) && vv.duration > 0) {
          try {
            vv.currentTime = 0.04;
          } catch {
            /* not ready */
          }
        }
      };
      if (v && v.readyState >= 1) setStatic();
      else if (v) v.addEventListener("loadedmetadata", setStatic, { once: true });
      return;
    }

    const EASE = 0.12;
    const FRAME_MS = 1000 / 60;

    const tick = (now: number) => {
      const last = lastTs.current ?? now;
      let dt = now - last;
      lastTs.current = now;
      if (dt > 100) dt = 100; // clamp after a tab switch / long frame

      const alpha = 1 - Math.pow(1 - EASE, dt / FRAME_MS);
      const target = targetProgress.current;
      let cur = currentProgress.current;
      cur += (target - cur) * alpha;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      currentProgress.current = cur;

      applyFrame(cur);

      if (cur !== target) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
        lastTs.current = null;
      }
    };

    const kick = () => {
      if (rafId.current == null) {
        lastTs.current = null;
        rafId.current = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const denom = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top;
      targetProgress.current = denom > 0 ? Math.min(1, Math.max(0, -top / denom)) : 0;
      kick();
    };

    const onResize = () => {
      isMobile.current = mobileMQL.matches;
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Paint the correct first frame (handles reloads mid-page).
    onScroll();
    applyFrame(currentProgress.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastTs.current = null;
    };
  }, []);

  return (
    <div
      ref={trackRef}
      id="hero"
      className="hero-scroll-track relative w-full h-[240vh] lg:h-[320vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#09090b] flex flex-col">
        {/* ── Background layer ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-1/4 w-[600px] h-[600px] rounded-full bg-[#556B5D]/[0.07] blur-[160px]" />
          <div className="absolute -bottom-20 left-1/3 w-[400px] h-[300px] rounded-full bg-[#556B5D]/[0.05] blur-[100px]" />
          <div
            className="absolute right-0 bottom-0 w-1/2 h-full"
            style={{ background: "radial-gradient(ellipse 70% 55% at 65% 90%, rgba(255,255,255,0.045) 0%, transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.013]"
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
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#556B5D]/60 to-transparent z-30" />

        {/* Vertical label — xl only */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 z-10 pointer-events-none">
          <div className="h-16 w-px bg-gradient-to-b from-transparent to-white/20" />
          <span
            className="text-gray-600 text-[9px] tracking-[0.45em] uppercase font-medium"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Built Different
          </span>
          <div className="h-16 w-px bg-gradient-to-t from-transparent to-white/20" />
        </div>

        {/* ── Model video (scroll-scrubbed) ── */}
        <div
          ref={videoWrapRef}
          className="absolute inset-0 z-[5] lg:left-[42%] lg:right-0"
          style={{ willChange: "transform" }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            controls={false}
            aria-label={imageAlt}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full"
            style={{
              objectFit: "contain",
              objectPosition: "center bottom",
              WebkitMaskImage: VIDEO_FEATHER,
              maskImage: VIDEO_FEATHER,
              WebkitMaskComposite: "destination-in",
              maskComposite: "intersect",
              filter: "drop-shadow(-8px 0 32px rgba(9,9,11,0.9)) drop-shadow(0 24px 48px rgba(9,9,11,0.7))",
            }}
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
          />
        </div>

        {/* Legibility scrim over the video */}
        <div className="absolute inset-0 z-[6] pointer-events-none bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-[#09090b]/10 lg:hidden" />
        <div
          className="absolute inset-0 z-[6] pointer-events-none hidden lg:block"
          style={{
            background:
              "linear-gradient(100deg, #09090b 0%, rgba(9,9,11,0.9) 34%, rgba(9,9,11,0.25) 56%, transparent 70%)",
          }}
        />

        {activeDrop && (
          <motion.div
            className="absolute top-[16%] right-4 sm:right-8 border border-[#556B5D]/50 bg-black/80 backdrop-blur-sm px-4 py-2.5 z-20 pointer-events-none"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <p className="text-[#556B5D] text-[9px] font-black uppercase tracking-[0.4em] mb-0.5">Drop Activo</p>
            <p className="text-white text-sm font-black uppercase tracking-wider leading-none">Edición Limitada</p>
          </motion.div>
        )}

        {/* ── Text content ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-0 lg:pb-0">
            <div className="lg:max-w-[52%]">

              {/* Headline group */}
              <div ref={headlineRef} style={{ willChange: "transform, opacity" }}>
                {/* Eyebrow */}
                <motion.div className="flex items-center gap-2.5 mb-6 overflow-hidden" {...fadeUp(0.15)}>
                  <span className="w-2 h-2 rounded-full bg-[#556B5D] animate-pulse flex-shrink-0" />
                  <span className="text-[#556B5D] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.4em] truncate">
                    {eyebrow}
                  </span>
                </motion.div>

                {/* Title */}
                <h1
                  className="text-[44px] sm:text-[72px] lg:text-[80px] xl:text-[96px] text-white leading-[0.88] tracking-tight font-black uppercase mb-5 sm:mb-6 select-none"
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
              </div>

              {/* Secondary group */}
              <div ref={secondaryRef} style={{ willChange: "transform, opacity" }}>
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

              </div>
            </div>
          </div>
        </div>

        {/* ── Benefits bar ── */}
        <div
          ref={benefitsRef}
          className="relative z-10 border-t border-white/[0.06] bg-black/50 backdrop-blur-sm"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.05]">
              {BENEFITS.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3.5 sm:py-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.15 + i * 0.08 }}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#556B5D] flex-shrink-0" />
                  <span className="text-gray-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.15em] leading-tight">
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
