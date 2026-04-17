"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "🚚 Envío gratis en compras mayores a $100.000",
  "💳 3 y 6 cuotas sin interés con Mercado Pago",
  "⚡ Despacho en 24hs hábiles",
  "✅ Productos 100% originales garantizados",
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative z-[60] bg-green-600 text-black h-9 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-center px-4"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {messages[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
