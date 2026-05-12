"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Timer } from "lucide-react";
import type { Campaign } from "@/types/admin";

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

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="relative overflow-hidden h-52 sm:h-72 bg-[#E7E7E4]">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.8, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F5F3]/80 hover:bg-[#F5F5F3] text-[#111111] flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F5F5F3]/80 hover:bg-[#F5F5F3] text-[#111111] flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === idx ? "bg-[#556B5D] w-4" : "bg-[#111111]/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Countdown({ target }: { target: string }) {
  const time = useCountdown(target);
  if (!time) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 mt-3 mb-1">
      <Timer className="w-3 h-3 text-orange-500 flex-shrink-0" />
      <div className="flex items-center gap-1 text-orange-500">
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

export function CampaignsBanner({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section id="campaigns" className="bg-[#F5F5F3] py-24 border-t border-[#111111]/5 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-[#B8B8B8] uppercase mb-4">
            Lanzamientos
          </p>
          <h2
            className="text-[38px] sm:text-[60px] md:text-[80px] text-[#111111] tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NOVEDADES
            <br />
            <span className="text-[#556B5D]">& DROPS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => {
            const allImages = c.images?.length ? c.images : c.image_url ? [c.image_url] : [];

            return (
              <motion.div
                key={c.id}
                className="relative overflow-hidden bg-white border border-[#111111]/10 group flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {allImages.length > 0 && (
                  <ImageCarousel images={allImages} title={c.title} />
                )}

                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  <span className="text-[#556B5D] text-[9px] font-bold uppercase tracking-[0.4em] mb-3">
                    Drop
                  </span>
                  <h3
                    className="text-[#111111] text-2xl sm:text-3xl md:text-4xl leading-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    {c.title}
                  </h3>

                  {c.countdown_ends_at && <Countdown target={c.countdown_ends_at} />}

                  {c.description && (
                    <p className="text-[#2B2B2B] text-sm leading-relaxed mt-3 max-w-sm">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {c.target_category && (
                      <span className="border border-[#111111]/10 text-[#B8B8B8] text-[9px] uppercase tracking-[0.3em] px-3 py-1">
                        {c.target_category}
                      </span>
                    )}

                    {c.is_preventa && c.unit_price && c.unit_price > 0 && (
                      <span className="bg-[#556B5D]/10 border border-[#556B5D]/20 text-[#556B5D] text-[9px] uppercase tracking-[0.25em] px-3 py-1">
                        Seña {c.deposit_percentage}%
                      </span>
                    )}

                    <a
                      href={`/drop/${c.id}`}
                      className="flex items-center gap-2 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-black text-xs uppercase tracking-[0.15em] px-4 py-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.is_preventa && c.unit_price && c.unit_price > 0 ? "RESERVAR LUGAR" : (c.cta_label ?? "Ver más")}
                    </a>

                    {c.cta_url && !c.is_preventa && (
                      <a
                        href={c.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-[#111111]/15 text-[#2B2B2B] hover:text-[#111111] text-xs uppercase tracking-[0.15em] px-4 py-2 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#556B5D] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
