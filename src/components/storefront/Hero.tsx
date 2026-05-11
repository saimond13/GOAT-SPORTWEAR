"use client";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";

export function Hero({ heroImage }: { heroImage?: string }) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-[#09090b] overflow-hidden flex flex-col"
    >
      <ParticleCanvas />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      {/* 3-column editorial grid */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-[1fr_340px_1fr] lg:grid-cols-[1fr_420px_1fr] gap-6 items-center py-28 md:py-0">

          {/* LEFT — tagline + CTAs */}
          <motion.div
            className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-green-500 text-[10px] font-bold tracking-[0.6em] uppercase mb-5">
              Gymwear · Temporada 2026
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[200px]">
              Local en Sa Pereira, Santa Fe.{" "}
              Envíos a todo el país.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <button
                onClick={() => scrollTo("products")}
                className="bg-green-500 hover:bg-green-400 text-black font-black py-3.5 text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-95"
              >
                Ver Catálogo
              </button>
              <button
                onClick={() => scrollTo("campaigns")}
                className="border border-white/20 hover:border-white/60 text-white/70 hover:text-white font-bold py-3.5 text-xs uppercase tracking-[0.2em] transition-all"
              >
                Drops
              </button>
            </div>
          </motion.div>

          {/* CENTER — circle glow + product image */}
          <div className="order-1 md:order-2 relative flex justify-center items-end h-[380px] sm:h-[460px] md:h-[540px]">
            {/* Outer glow */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 w-[270px] h-[270px] sm:w-[330px] sm:h-[330px] md:w-[370px] md:h-[370px] rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.04) 65%, transparent 100%)",
                boxShadow: "0 0 90px 30px rgba(34,197,94,0.07)",
              }}
            />
            {/* Circle border */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="absolute bottom-0 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] rounded-full border border-green-500/20 pointer-events-none"
            />
            {/* Product image */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="GOAT Sportwear"
                  className="h-[340px] sm:h-[420px] md:h-[490px] w-auto object-contain"
                  style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.6))" }}
                />
              ) : (
                <div className="h-[280px] w-[160px] bg-white/[0.03] border border-white/10" />
              )}
            </motion.div>
          </div>

          {/* RIGHT — big brand text */}
          <motion.div
            className="order-3 text-center md:text-right"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h1
              className="text-[80px] sm:text-[110px] md:text-[96px] lg:text-[128px] text-white leading-[0.82] tracking-tight select-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              GOAT
            </h1>
            <h2
              className="text-[30px] sm:text-[42px] md:text-[36px] lg:text-[48px] leading-none tracking-[0.12em] mt-2 select-none"
              style={{
                fontFamily: "'Anton', sans-serif",
                WebkitTextStroke: "1px rgba(255,255,255,0.28)",
                color: "transparent",
              }}
            >
              SPORTWEAR
            </h2>
          </motion.div>

        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollTo("products")}
        className="relative z-10 mx-auto mb-8 text-white/30 hover:text-green-500 transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ArrowDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
}
