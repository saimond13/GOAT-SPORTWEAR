"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
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
    const { error } = await supabase.from("waitlist").insert({ email, name: name || null, source: "storefront" });

    if (!error) { setStatus("success"); setEmail(""); setName(""); }
    else if (error.code === "23505") setStatus("duplicate");
    else setStatus("error");
  };

  return (
    <section id="waitlist" className="bg-black py-24">
      <div className="h-[2px] green-line absolute left-0 right-0" style={{ marginTop: -96 }} />
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-6">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <p className="text-green-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">Newsletter</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            SÉ EL<br /><span className="text-green-500">PRIMERO</span>
          </h2>
          <p className="text-gray-400 text-base mb-8 max-w-md mx-auto">
            Enterate antes que nadie de los nuevos lanzamientos, ofertas exclusivas y drops limitados.
          </p>

          {status === "success" ? (
            <motion.div className="flex flex-col items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-white font-bold text-lg">¡Estás dentro! Te avisamos primero 🐐</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="text" placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)}
                className="flex-shrink-0 sm:w-36 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500" />
              <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500" />
              <button type="submit" disabled={status === "loading"}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors flex-shrink-0">
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirse"}
              </button>
            </form>
          )}

          {status === "duplicate" && <p className="text-yellow-500 text-sm mt-3">Ya estás suscripto con ese email ✓</p>}
          {status === "error" && <p className="text-red-400 text-sm mt-3">Algo salió mal, intentá de nuevo</p>}
        </motion.div>
      </div>
    </section>
  );
}
