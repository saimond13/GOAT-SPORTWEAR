"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { CATEGORIES } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductsSection({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="bg-[#09090b] py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-gray-400 uppercase mb-4">
            Catálogo
          </p>
          <h2
            className="text-[60px] md:text-[80px] text-white tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NUESTROS
            <br />
            <span className="text-green-500">PRODUCTOS</span>
          </h2>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {["Todos", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold border uppercase tracking-[0.15em] transition-all ${
                activeCategory === cat
                  ? "bg-green-500 text-black border-green-500"
                  : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/30 to-transparent mb-10" />

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-400 text-base font-medium uppercase tracking-widest">
              Catálogo en preparación
            </p>
            <p className="text-gray-700 text-sm mt-2">Volvé pronto</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm uppercase tracking-widest">
            Sin productos en esta categoría
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
