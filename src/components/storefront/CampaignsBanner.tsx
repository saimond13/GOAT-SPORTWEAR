"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Timer } from "lucide-react";
import type { Campaign } from "@/types/admin";

/* ── Countdown hook ─────────────────────────────────────────────────── */
function useCountdown(target?: string) {
  const calc = () => {
    if (!target) return null;
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

/* ── Image carousel ─────────────────────────────────────────────────── */
function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="relative overflow-hidden h-72 bg-[#0a0a0c]">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover opacity-55 group-hover:opacity-70 transition-opacity duration-300"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.55, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/30 to-transparent" />

      {/* Arrows — only show if >1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === idx ? "bg-green-500 w-4" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Countdown display ──────────────────────────────────────────────── */
function Countdown({ target }: { target: string }) {
  const time = useCountdown(target);
  if (!time) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 mt-3 mb-1">
      <Timer className="w-3 h-3 text-orange-400 flex-shrink-0" />
      <div className="flex items-center gap-1 text-orange-400">
        {time.d > 0 && (
          <span className="text-xs font-black" style={{ fontFamily: "'Anton', sans-serif" }}>
            {time.d}d
          </span>
        )}
        <span className="text-xs font-black tabular-nums" style={{ fontFamily: "'Anton', sans-serif" }}>
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </span>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function CampaignsBanner({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section id="campaigns" className="bg-[#09090b] py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[9px] font-bold tracking-[0.5em] text-gray-600 uppercase mb-4">
            Lanzamientos
          </p>
          <h2
            className="text-[60px] md:text-[80px] text-white tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NOVEDADES
            <br />
            <span className="text-green-500">& DROPS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => {
            const allImages = c.images?.length ? c.images : c.image_url ? [c.image_url] : [];

            return (
              <motion.div
                key={c.id}
                className="relative overflow-hidden bg-[#111113] border border-white/[0.06] group flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Image carousel */}
                {allImages.length > 0 && (
                  <ImageCarousel images={allImages} title={c.title} />
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-green-500 text-[9px] font-bold uppercase tracking-[0.4em] mb-3">
                    Drop
                  </span>
                  <h3
                    className="text-white text-3xl md:text-4xl leading-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    {c.title}
                  </h3>

                  {/* Countdown */}
                  {c.countdown_ends_at && <Countdown target={c.countdown_ends_at} />}

                  {c.description && (
                    <p className="text-gray-500 text-sm leading-relaxed mt-3 max-w-sm">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {c.target_category && (
                      <span className="border border-white/10 text-gray-500 text-[9px] uppercase tracking-[0.3em] px-3 py-1">
                        {c.target_category}
                      </span>
                    )}

                    {/* CTA button — opens in new tab */}
                    {c.cta_url && (
                      <a
                        href={c.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-[0.15em] px-4 py-2 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.cta_label ?? "Ver más"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
