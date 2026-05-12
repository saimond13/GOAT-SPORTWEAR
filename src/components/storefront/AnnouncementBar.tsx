"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const static_messages = [
  "🚚 Envío gratis en compras mayores a $100.000",
  "🏦 15% de descuento pagando por transferencia",
  "⚡ Despacho en 24hs hábiles",
  "✅ Productos 100% originales garantizados",
];

interface Props {
  activeDrop?: { id: string; title: string; depositPercentage?: number } | null;
}

export function AnnouncementBar({ activeDrop }: Props) {
  const messages = activeDrop
    ? [
        `⚡ ${activeDrop.title} — RESERVAS ABIERTAS · ${activeDrop.depositPercentage ?? 50}% de seña · VER DROP →`,
        ...static_messages,
      ]
    : static_messages;

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [activeDrop?.id]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3500);
    return () => clearInterval(t);
  }, [messages.length]);

  const isDropMessage = idx === 0 && !!activeDrop;
  const content = (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        className="text-[11px] font-black uppercase tracking-[0.2em] text-center px-4 truncate w-full"
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -14, opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        {messages[idx]}
      </motion.p>
    </AnimatePresence>
  );

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] h-9 overflow-hidden flex items-center justify-center transition-colors ${
        isDropMessage ? "bg-[#556B5D] text-white" : "bg-[#556B5D] text-white"
      }`}
    >
      {isDropMessage && activeDrop ? (
        <Link href={`/drop/${activeDrop.id}`} className="w-full flex items-center justify-center h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
