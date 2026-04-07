"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { GoatLogo } from "@/components/ui/GoatLogo";

const floatingImages = [
  { image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", label: "Nueva Colección", pos: "left-[3%] top-[18%]", rotate: "-rotate-6" },
  { image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&q=80", label: "Destacado", pos: "right-[3%] top-[12%]", rotate: "rotate-5" },
  { image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80", label: "Bestseller", pos: "left-[18%] bottom-[6%]", rotate: "rotate-3" },
  { image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80", label: "Nuevo", pos: "right-[16%] bottom-[8%]", rotate: "-rotate-4" },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const yArr = [y1, y2, y3, y4];

  return (
    <section id="hero" ref={containerRef}
      className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Particles */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)` }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] green-line" />

      {/* Floating product images */}
      {floatingImages.map((img, i) => (
        <motion.div key={i} className={`absolute ${img.pos} w-40 h-56 md:w-52 md:h-72 ${img.rotate} hidden md:block`}
          style={{ y: yArr[i] }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.6 }}>
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={img.image} alt={img.label} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3">
              <span className="bg-white text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                {img.label}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Center content */}
      <motion.div className="relative z-10 text-center px-6" style={{ y: textY, opacity }}>
        <motion.div className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <GoatLogo size={80} variant="white" />
        </motion.div>

        <motion.p className="text-green-500 text-xs font-bold tracking-[0.4em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Ropa Deportiva · Temporada 2025
        </motion.p>

        <motion.h1 className="text-6xl md:text-8xl lg:text-[110px] font-black text-white leading-none tracking-tight mb-2"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
          GOAT
        </motion.h1>
        <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8"
          style={{ WebkitTextStroke: "2px white", color: "transparent" }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}>
          SPORTWEAR
        </motion.h1>

        <motion.p className="text-gray-400 text-base md:text-lg max-w-sm mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          Las mejores marcas. Local en Sa Pereira.<br/>Envíos a todo el país.
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white text-black font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors">
            Ver Productos
          </button>
          <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            className="border border-white/30 text-white hover:border-white font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-colors">
            Novedades
          </button>
        </motion.div>

        <motion.div className="flex items-center justify-center gap-10 mt-16 pt-10 border-t border-white/10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {[{ v: "500+", l: "Productos" }, { v: "9", l: "Marcas" }, { v: "100%", l: "Original" }].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-black text-white">{s.v}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll arrow */}
      <motion.button
        onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors"
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        <ArrowDown className="w-6 h-6" />
      </motion.button>
    </section>
  );
}
