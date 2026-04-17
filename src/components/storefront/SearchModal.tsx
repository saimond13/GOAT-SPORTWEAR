"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface Props {
  products: Product[];
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ products, open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[61] bg-[#111113] border-b border-white/10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search input */}
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá remeras, buzos, talles..."
                className="flex-1 bg-transparent text-white text-base placeholder-gray-600 focus:outline-none"
              />
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="max-w-2xl mx-auto px-4 pb-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/productos/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    {/* Thumb */}
                    <div className="w-12 h-16 bg-[#1a1a1e] flex-shrink-0 overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{p.category}</p>
                      <p className="text-sm font-bold text-white truncate group-hover:text-green-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-sm font-black text-white mt-0.5">{formatPrice(p.price)}</p>
                    </div>
                    {p.badge && (
                      <span className="text-[9px] font-black bg-green-500 text-black px-1.5 py-0.5 uppercase flex-shrink-0">
                        {p.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {query.trim().length >= 2 && results.length === 0 && (
              <div className="max-w-2xl mx-auto px-4 pb-4">
                <p className="text-gray-600 text-sm">Sin resultados para "{query}"</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
