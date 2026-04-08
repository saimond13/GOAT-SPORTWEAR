"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, name: name || null, source: "storefront" });
    if (!error) { setStatus("success"); setEmail(""); setName(""); }
    else if (error.code === "23505") setStatus("duplicate");
    else setStatus("error");
  };

  return (
    <section id="waitlist" className="bg-[#09090b] py-24 border-t border-white/5">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[9px] font-bold tracking-[0.5em] text-gray-600 uppercase mb-4">
            Newsletter
          </p>
          <h2
            className="text-[56px] md:text-[72px] text-white tracking-tight leading-none mb-6"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            SÉ EL
            <br />
            <span className="text-green-500">PRIMERO</span>
          </h2>
          <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            Enterate antes que nadie de los nuevos drops, ofertas exclusivas y colecciones limitadas.
          </p>

          {status === "success" ? (
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="text-white font-bold text-base uppercase tracking-widest">¡Estás dentro!</p>
              <p className="text-gray-500 text-sm">Te avisamos primero</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Nombre (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-shrink-0 sm:w-36 px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
              />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors flex-shrink-0"
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirse"}
              </button>
            </form>
          )}

          {status === "duplicate" && (
            <p className="text-yellow-500 text-xs mt-4 uppercase tracking-widest">Ya estás suscripto ✓</p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-xs mt-4 uppercase tracking-widest">Algo salió mal, intentá de nuevo</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
