"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";

type GoatHeroProps = {
  videoSrc?: string;
  posterSrc?: string;
  imageAlt?: string;
  activeDrop?: { id: string; title: string; depositPercentage?: number; reservationPct?: number } | null;
};

const TRUST = [
  { icon: ShoppingBag, title: "Envíos a todo el país", sub: "Rápido y seguro" },
  { icon: CreditCard, title: "3 cuotas sin interés", sub: "Todas las tarjetas" },
  { icon: ShieldCheck, title: "Compra segura", sub: "Datos protegidos" },
];

const STEPS = ["01", "02", "03", "04"];

const fadeUp = (delay: number, duration = 0.6) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

/* Side + top feather only — never fades the bottom, so the hands and legs
   that reach the frame edge stay solid. Applied as a mask on the <video>. */
const EDGE_MASK = [
  "linear-gradient(to right, transparent 0%, #000 13%, #000 87%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 5%, #000 100%)",
].join(", ");

/* Tiny white patch over the source watermark in the bottom-right corner.
   White multiplies to the exact page colour, so it disappears into the bg. */
const WATERMARK_PATCH =
  "radial-gradient(ellipse 20% 7% at 100% 100%, #ffffff 0%, #ffffff 35%, transparent 100%)";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Pure mapping: scroll progress (0..1) -> style values for each hero layer.
 * Desktop (lg+) only — mobile/tablet render a static hero with no scroll
 * dependency (see the component below).
 * 0-14% untouched · 14-42% headline + copy clear out · 42-100% the model video
 * is the sole protagonist and eases toward centre stage.
 */
function computeFrame(p: number) {
  const s = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  const headlineOpacity = 1 - s(0.14, 0.4);
  const headlineX = lerp(0, -56, s(0.14, 0.42));
  const headlineY = -(p * 20);

  const secondaryOpacity = 1 - s(0.1, 0.3);
  const secondaryX = lerp(0, -38, s(0.1, 0.34));
  const secondaryY = -(p * 12);

  const trustOpacity = 1 - s(0.08, 0.24);
  const trustY = s(0.08, 0.26) * 24;

  const hintOpacity = 1 - s(0.03, 0.14);

  const videoScale = lerp(0.96, 1, s(0, 0.55));
  const videoX = lerp(0, -13, s(0.2, 0.8));

  return {
    headlineOpacity,
    headlineTransform: `translate3d(${headlineX.toFixed(2)}px, ${headlineY.toFixed(2)}px, 0)`,
    secondaryOpacity,
    secondaryTransform: `translate3d(${secondaryX.toFixed(2)}px, ${secondaryY.toFixed(2)}px, 0)`,
    trustOpacity,
    trustTransform: `translate3d(0, ${trustY.toFixed(2)}px, 0)`,
    hintOpacity,
    videoTransform: `translate3d(${videoX.toFixed(3)}%, 0, 0) scale(${videoScale.toFixed(4)})`,
    step: Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length))),
  };
}

export function GoatHero({
  videoSrc = "/videos/goat-scroll.mp4",
  posterSrc = "/assets/hero-model.png",
  imageAlt = "GOAT Sportwear",
  activeDrop,
}: GoatHeroProps) {
  const dropHref = activeDrop ? `/drop/${activeDrop.id}` : "#drops";

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // ── Scroll-scrubbing wiring (desktop only — see the mobile branch below) ──
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const lastSeek = useRef(-1);
  const lastStep = useRef(-1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduceMQL = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMQL = window.matchMedia("(max-width: 1023px)");

    const v0 = videoRef.current;
    if (v0) {
      v0.defaultMuted = true;
      v0.muted = true;
    }

    // Mobile/tablet: the scroll-driven scrub was unreliable on some devices
    // (video decode/seek timing varies a lot on phones and tablets, and the
    // absolute-overlay layout it needs doesn't fit every screen height), so
    // there the hero is a plain static stack and the clip just plays as a
    // normal ambient loop — nothing scroll-dependent that can fail to load.
    if (!reduceMQL.matches && mobileMQL.matches && v0) {
      v0.loop = true;
      v0.play().catch(() => {
        try {
          v0.currentTime = 0.04;
        } catch {
          /* not ready */
        }
      });
      return;
    }

    const applyFrame = (p: number) => {
      const f = computeFrame(p);

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
      const tr = trustRef.current;
      if (tr) {
        tr.style.opacity = f.trustOpacity.toFixed(3);
        tr.style.transform = f.trustTransform;
        tr.style.pointerEvents = f.trustOpacity < 0.04 ? "none" : "";
      }
      const hint = hintRef.current;
      if (hint) hint.style.opacity = f.hintOpacity.toFixed(3);

      const vw = videoWrapRef.current;
      if (vw) vw.style.transform = f.videoTransform;

      if (f.step !== lastStep.current && stepsRef.current) {
        lastStep.current = f.step;
        const kids = stepsRef.current.children;
        for (let i = 0; i < kids.length; i++) {
          const el = kids[i] as HTMLElement;
          const active = i === f.step;
          el.style.opacity = active ? "1" : "0.28";
          const bar = el.firstElementChild as HTMLElement | null;
          if (bar) bar.style.width = active ? "26px" : "8px";
        }
      }

      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        const t = p * (v.duration - 0.001);
        if (Math.abs(t - lastSeek.current) > 0.012) {
          lastSeek.current = t;
          try {
            v.currentTime = t;
          } catch {
            /* seek race — next frame corrects it */
          }
        }
      }
    };

    // Prime Safari's decoder so the first seek actually paints a frame.
    const v = videoRef.current;
    if (v) {
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

    const EASE = 0.16;
    const FRAME_MS = 1000 / 60;

    const tick = (now: number) => {
      rafId.current = null; // this frame is consumed

      const last = lastTs.current ?? now;
      let dt = now - last;
      lastTs.current = now;
      if (dt > 100) dt = 100;

      const alpha = 1 - Math.pow(1 - EASE, dt / FRAME_MS);
      const target = targetProgress.current;
      let cur = currentProgress.current;
      cur += (target - cur) * alpha;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      currentProgress.current = cur;

      try {
        applyFrame(cur);
      } catch {
        /* never let a transient paint error kill the loop */
      }

      if (cur !== target) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        lastTs.current = null;
      }
    };

    const kick = () => {
      if (rafId.current == null) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      const denom = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top;
      targetProgress.current = denom > 0 ? Math.min(1, Math.max(0, -top / denom)) : 0;
      kick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    onScroll();
    applyFrame(currentProgress.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastTs.current = null;
    };
  }, []);

  return (
    <div ref={trackRef} id="hero" className="hero-scroll-track relative w-full lg:h-[195vh]">
      <div className="lg:sticky lg:top-0 h-auto lg:h-[100svh] w-full overflow-hidden bg-[#F5F5F3] flex flex-col">
        {/* Hairline top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#111111]/10 z-30" />

        {/* ── Copy ──
            Mobile/tablet: plain top-anchored block, normal document flow.
            Desktop: centred over the video via the scroll-scrub track above. */}
        <div className="relative z-10 pt-20 pb-8 sm:pt-24 lg:pt-0 lg:pb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full">
            <div className="lg:max-w-[56%]">
              <div ref={headlineRef} style={{ willChange: "transform, opacity" }}>
                <motion.div
                  className="flex items-center gap-2 mb-5 sm:mb-7 text-[#111111]/55"
                  {...fadeUp(0.12)}
                >
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.32em]">
                    Gymwear
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#556B5D]" />
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.32em]">
                    Streetwear
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#556B5D]" />
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.32em]">
                    Disciplina
                  </span>
                </motion.div>

                <h1
                  className="text-[42px] sm:text-[76px] lg:text-[82px] xl:text-[96px] leading-[0.86] tracking-[-0.02em] uppercase mb-5 sm:mb-8 select-none"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  <motion.span
                    className="block text-[#556B5D]"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  >
                    GOAT
                  </motion.span>
                  <motion.span
                    className="block text-[#111111]"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.36, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  >
                    Sportwear
                  </motion.span>
                </h1>
              </div>

              <div ref={secondaryRef} style={{ willChange: "transform, opacity" }}>
                <motion.p
                  className="text-[#111111] text-[13px] sm:text-[15px] font-semibold uppercase tracking-[0.26em] leading-[1.7] mb-5"
                  {...fadeUp(0.5)}
                >
                  Más que ropa,
                  <br />
                  una actitud
                </motion.p>

                <motion.p
                  className="text-[#111111]/60 text-sm sm:text-[15px] leading-relaxed max-w-[380px] mb-7"
                  {...fadeUp(0.58)}
                >
                  Prendas diseñadas para quienes entrenan, compiten y nunca se conforman.
                </motion.p>

                {activeDrop && activeDrop.reservationPct !== undefined && (
                  <motion.div className="mb-7 max-w-[340px]" {...fadeUp(0.64)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#111111]/50 text-[10px] font-bold uppercase tracking-widest">
                        Reservas del drop
                      </span>
                      <span className="text-[#556B5D] text-[10px] font-black">
                        {activeDrop.reservationPct}% reservado
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#111111]/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#556B5D] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeDrop.reservationPct}%` }}
                        transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div className="flex flex-col sm:flex-row gap-3" {...fadeUp(0.7)}>
                  <Link
                    href="#products"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("products");
                    }}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
                  >
                    Ver catálogo
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </Link>

                  <Link
                    href={dropHref}
                    onClick={(e) => {
                      if (!activeDrop) {
                        e.preventDefault();
                        scrollTo("drops");
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all w-full sm:w-auto"
                  >
                    {activeDrop ? "Ver drop" : "Nuevo drop"}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Model video ──
            Mobile/tablet: normal block, own box, plays as a plain ambient loop.
            Desktop: absolute overlay, scroll-scrubbed, multiply-blended into
            the cream bg so the studio background dissolves into the page. */}
        <div
          ref={videoWrapRef}
          className="relative w-full aspect-[4/5] sm:aspect-[16/10] mt-2 lg:mt-0 z-[4] lg:absolute lg:left-0 lg:right-0 lg:top-[104px] lg:bottom-0 lg:aspect-auto lg:w-auto"
          style={{ willChange: "transform", mixBlendMode: "multiply" }}
        >
          <div className="absolute inset-0 lg:inset-y-0 lg:left-[66%] lg:right-auto lg:h-full lg:aspect-[720/1291] lg:-translate-x-1/2 lg:max-w-[94vw]">
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
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: "center 6%",
                filter: "brightness(1.2) contrast(1.32) saturate(0.85)",
                WebkitMaskImage: EDGE_MASK,
                WebkitMaskComposite: "source-in",
                maskImage: EDGE_MASK,
                maskComposite: "intersect",
              }}
              {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            />
            {/* Cover the source watermark in the corner only */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: WATERMARK_PATCH }} />
          </div>
        </div>

        {/* Desktop-only legibility gradient: the copy sits on top of the
            video there, so the left side needs to stay readable. */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none hidden lg:block"
          style={{
            background:
              "linear-gradient(100deg, #F5F5F3 6%, rgba(245,245,243,0.5) 34%, transparent 66%)",
          }}
        />

        {/* Vertical caption — right edge (desktop only: it's tied to the scroll-scrub) */}
        <div className="absolute right-4 lg:right-8 bottom-28 lg:bottom-32 hidden lg:block z-20 pointer-events-none">
          <span
            className="text-[9px] lg:text-[10px] tracking-[0.4em] uppercase text-[#111111]/35 font-semibold"
            style={{ writingMode: "vertical-rl" }}
          >
            Disciplina en cada detalle
          </span>
        </div>

        {/* Step indicator — right edge (desktop only: it tracks scroll progress) */}
        <div
          ref={stepsRef}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 lg:gap-5 z-20 pointer-events-none"
        >
          {STEPS.map((n, i) => (
            <div
              key={n}
              className="flex items-center gap-2 justify-end transition-opacity duration-300"
              style={{ opacity: i === 0 ? 1 : 0.28 }}
            >
              <span
                className="h-px bg-[#111111] transition-all duration-300"
                style={{ width: i === 0 ? "26px" : "8px" }}
              />
              <span className="text-[11px] font-black tracking-widest text-[#111111] tabular-nums">
                {n}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll hint — bottom left (desktop only: nothing to "scrub" below lg) */}
        <div
          ref={hintRef}
          className="absolute left-5 sm:left-10 lg:left-16 bottom-28 z-10 hidden lg:flex items-center gap-3 pointer-events-none"
          style={{ willChange: "opacity" }}
        >
          <span className="h-px w-9 bg-[#111111]/30" />
          <span className="text-[9px] sm:text-[10px] tracking-[0.34em] uppercase text-[#111111]/45 font-semibold">
            Scroll para explorar
          </span>
        </div>

        {/* ── Trust bar ── */}
        <div
          ref={trustRef}
          className="relative z-10 border-t border-[#111111]/10 bg-[#F5F5F3]"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-16">
            <div className="grid grid-cols-3 divide-x divide-[#111111]/10">
              {TRUST.map(({ icon: Icon, title, sub }, i) => (
                <motion.div
                  key={title}
                  className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-1.5 sm:px-6 py-3.5 sm:py-5 text-center sm:text-left"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.08 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#556B5D] flex-shrink-0" strokeWidth={1.75} />
                  <div className="leading-tight">
                    <p className="text-[#111111] text-[9px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.1em]">
                      {title}
                    </p>
                    <p className="text-[#111111]/45 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] mt-0.5">
                      {sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
