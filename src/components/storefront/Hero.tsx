"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { GoatLogo } from "@/components/ui/GoatLogo";

function OrbitalRing({
  size,
  tiltX,
  speed,
  color,
  thickness = 1,
  y,
  reverse = false,
}: {
  size: number;
  tiltX: number;
  speed: number;
  color: string;
  thickness?: number;
  y: any;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        border: `${thickness}px solid ${color}`,
        y,
        rotateX: tiltX,
      }}
      animate={{ rotateZ: reverse ? [0, -360] : [0, 360] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    />
  );
}

const floatingBars = [
  { w: 100, top: "22%", left: "7%", rotate: -20, delay: 0 },
  { w: 60, top: "38%", right: "5%", rotate: 15, delay: 0.6 },
  { w: 140, bottom: "28%", left: "4%", rotate: 10, delay: 1.2 },
  { w: 80, bottom: "35%", right: "9%", rotate: -12, delay: 1.8 },
  { w: 50, top: "55%", left: "20%", rotate: 30, delay: 0.9 },
];

const glowDots = [
  { top: "18%", left: "18%" },
  { top: "72%", right: "14%" },
  { bottom: "18%", left: "30%" },
  { top: "42%", right: "22%" },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const ring1Y = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const ring2Y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const ring3Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const ring4Y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen bg-[#09090b] overflow-hidden flex items-center justify-center"
      style={{ perspective: "1400px" }}
    >
      {/* Particle background */}
      <ParticleCanvas />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 90px),
            repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 90px)
          `,
        }}
      />

      {/* Top green accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      {/* 3D Orbital rings */}
      <OrbitalRing size={700} tiltX={72} speed={28} color="rgba(34,197,94,0.08)" thickness={1} y={ring1Y} />
      <OrbitalRing size={500} tiltX={68} speed={18} color="rgba(34,197,94,0.15)" thickness={1} y={ring2Y} reverse />
      <OrbitalRing size={320} tiltX={65} speed={11} color="rgba(34,197,94,0.30)" thickness={2} y={ring3Y} />
      <OrbitalRing size={180} tiltX={60} speed={7}  color="rgba(34,197,94,0.50)" thickness={2} y={ring4Y} reverse />

      {/* Orbiting dot on the smallest ring */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 180, height: 180,
          left: "50%", top: "50%",
          marginLeft: -90, marginTop: -90,
          rotateX: 60,
          y: ring4Y,
        }}
        animate={{ rotateZ: [0, 360] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute w-3 h-3 rounded-full bg-green-500"
          style={{
            top: -6,
            left: "50%",
            marginLeft: -6,
            boxShadow: "0 0 16px 6px rgba(34,197,94,0.6)",
          }}
        />
      </motion.div>

      {/* Floating horizontal bars */}
      {floatingBars.map((bar, i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-green-500/35 to-transparent pointer-events-none hidden md:block"
          style={{
            width: bar.w,
            top: bar.top,
            left: (bar as any).left,
            right: (bar as any).right,
            bottom: (bar as any).bottom,
            rotate: bar.rotate,
          }}
          animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.8, 1.1, 0.8] }}
          transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: bar.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Green glow dots */}
      {glowDots.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-green-500 pointer-events-none hidden md:block"
          style={{ ...pos, boxShadow: "0 0 10px 4px rgba(34,197,94,0.35)" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.8, 1] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
        />
      ))}

      {/* Center content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{ y: textY, opacity }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
        >
          <GoatLogo size={60} variant="white" />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="text-green-500 text-[10px] font-bold tracking-[0.6em] uppercase mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Gymwear · Temporada 2026
        </motion.p>

        {/* Main heading */}
        <motion.h1
          className="text-[90px] md:text-[150px] lg:text-[190px] text-white leading-[0.85] tracking-tight mb-3 select-none"
          style={{ fontFamily: "'Anton', sans-serif" }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          GOAT
        </motion.h1>

        {/* Outlined subtitle */}
        <motion.h2
          className="text-[32px] md:text-[52px] lg:text-[64px] leading-none tracking-[0.18em] mb-10 select-none"
          style={{
            fontFamily: "'Anton', sans-serif",
            WebkitTextStroke: "1px rgba(255,255,255,0.45)",
            color: "transparent",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          SPORTWEAR
        </motion.h2>

        {/* Tagline */}
        <motion.p
          className="text-gray-500 text-sm md:text-base max-w-xs mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58, duration: 0.5 }}
        >
          Local en Sa Pereira, Entre Ríos.<br />Envíos a todo el país.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.5 }}
        >
          <button
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-green-500 hover:bg-green-400 text-black font-black px-10 py-4 text-xs uppercase tracking-[0.2em] transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Ver Catálogo
          </button>
          <button
            onClick={() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })}
            className="border border-white/20 hover:border-white/60 text-white/80 hover:text-white font-bold px-10 py-4 text-xs uppercase tracking-[0.2em] transition-all duration-200"
          >
            Drops
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-12 mt-20 pt-8 border-t border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          {[
            { v: "DROP 001", l: "En camino" },
            { v: "LOCAL", l: "Sa Pereira" },
            { v: "100%", l: "Original" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div
                className="text-white text-lg font-black"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                {s.v}
              </div>
              <div className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 hover:text-green-500 transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ArrowDown className="w-5 h-5" />
      </motion.button>
    </section>
  );
}
