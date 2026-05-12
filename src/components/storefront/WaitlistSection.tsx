"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error" | "rate_limited">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      if (res.ok) { setStatus("success"); setEmail(""); setName(""); }
      else if (res.status === 409) setStatus("duplicate");
      else if (res.status === 429) setStatus("rate_limited");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="waitlist" className="bg-[#E7E7E4] py-24 border-t border-[#111111]/5 scroll-mt-28">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-[#B8B8B8] uppercase mb-4">
            Newsletter
          </p>
          <h2
            className="text-[42px] sm:text-[64px] md:text-[90px] text-[#111111] tracking-tight leading-none mb-6"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            SÉ EL
            <br />
            <span className="text-[#556B5D]">PRIMERO</span>
          </h2>
          <p className="text-[#2B2B2B] text-base mb-10 max-w-sm mx-auto leading-relaxed font-semibold">
            Enterate antes que nadie de los nuevos drops, ofertas exclusivas y colecciones limitadas.
          </p>

          {status === "success" ? (
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-10 h-10 text-[#556B5D]" />
              <p className="text-[#111111] font-bold text-base uppercase tracking-widest">¡Estás dentro!</p>
              <p className="text-[#B8B8B8] text-sm">Te avisamos primero</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Nombre (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-36 sm:flex-shrink-0 px-4 py-3 bg-white border border-[#111111]/10 text-[#111111] placeholder-[#B8B8B8] text-sm focus:outline-none focus:border-[#556B5D] transition-colors"
              />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-white border border-[#111111]/10 text-[#111111] placeholder-[#B8B8B8] text-sm focus:outline-none focus:border-[#556B5D] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:flex-shrink-0 px-6 py-3 bg-[#556B5D] hover:bg-[#4a5f52] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirse"}
              </button>
            </form>
          )}

          {status === "duplicate" && (
            <p className="text-[#556B5D] text-xs mt-4 uppercase tracking-widest">Ya estás suscripto ✓</p>
          )}
          {status === "rate_limited" && (
            <p className="text-orange-500 text-xs mt-4 uppercase tracking-widest">Demasiados intentos. Esperá unos minutos.</p>
          )}
          {status === "error" && (
            <p className="text-red-500 text-xs mt-4 uppercase tracking-widest">Algo salió mal, intentá de nuevo</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
