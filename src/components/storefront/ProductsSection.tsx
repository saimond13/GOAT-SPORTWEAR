"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { CATEGORIES } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function ProductsSection({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = activeCategory === "Todos"
    ? products : products.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase mb-3">Catálogo</p>
          <h2 className="text-5xl md:text-6xl font-black text-black tracking-tight leading-none">
            NUESTROS<br /><span className="text-green-600">PRODUCTOS</span>
          </h2>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {["Todos", ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                activeCategory === cat
                  ? "bg-black text-white border-black"
                  : "border-gray-200 text-gray-600 hover:border-black hover:text-black"
              }`}>{cat}
            </button>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500 to-transparent mb-10" />

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-300 text-lg font-medium">No hay productos disponibles aún</p>
            <p className="text-gray-400 text-sm mt-2">Volvé pronto, estamos cargando el catálogo</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Sin productos en esta categoría</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
