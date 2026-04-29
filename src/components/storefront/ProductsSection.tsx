"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types/product";
import { CATEGORIES, GENDERS, SIZES } from "@/types/product";
import { ProductCard } from "./ProductCard";

const SORT_OPTIONS = [
  { label: "Novedades", value: "new" },
  { label: "Menor precio", value: "price_asc" },
  { label: "Mayor precio", value: "price_desc" },
  { label: "Más vendidos", value: "bestseller" },
];

export function ProductsSection({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeGender, setActiveGender] = useState("Todos");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("new");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const maxPrice = useMemo(
    () => Math.max(0, ...products.map((p) => p.price)),
    [products]
  );

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const hasFilters = selectedSizes.length > 0 || priceMax !== null || priceMin !== null;

  const clearFilters = () => { setSelectedSizes([]); setPriceMin(null); setPriceMax(null); };

  const filtered = useMemo(() => {
    let list = activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

    if (activeGender !== "Todos") {
      list = list.filter((p) => !p.gender || p.gender === activeGender || p.gender === "Unisex");
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }
    if (priceMin !== null) list = list.filter((p) => p.price >= priceMin);
    if (priceMax !== null) list = list.filter((p) => p.price <= priceMax);

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "bestseller")
      list = [...list].sort((a, b) => (b.badge === "BESTSELLER" ? 1 : 0) - (a.badge === "BESTSELLER" ? 1 : 0));

    return list;
  }, [products, activeCategory, activeGender, selectedSizes, priceMax, sortBy]);

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

        {/* Gender filter */}
        <div className="flex gap-2 flex-wrap mb-3">
          {["Todos", ...GENDERS].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGender(g)}
              className={`px-4 py-1.5 text-xs font-bold border uppercase tracking-[0.15em] transition-all rounded-full ${
                activeGender === g
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-4">
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

        {/* Toolbar: filters + sort */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border uppercase tracking-[0.15em] transition-all ${
                filtersOpen || hasFilters
                  ? "bg-green-500/10 border-green-500 text-green-400"
                  : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
              {hasFilters && (
                <span className="w-4 h-4 bg-green-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {selectedSizes.length + (priceMax !== null ? 1 : 0)}
                </span>
              )}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
            <span className="text-[11px] text-gray-600">
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111113] border border-white/10 text-gray-400 text-xs px-3 py-2 focus:outline-none focus:border-green-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Advanced filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-white/10 rounded-xl p-5 mb-6 bg-[#111113] space-y-5">
                {/* Sizes */}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Talle</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                          selectedSizes.includes(s)
                            ? "bg-green-500 text-black border-green-500"
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range — min / max editable */}
                {maxPrice > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Rango de precio</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[9px] text-gray-600 mb-1">Mínimo</p>
                        <input
                          type="number"
                          min={0}
                          max={priceMax ?? maxPrice}
                          step={1000}
                          value={priceMin ?? ""}
                          onChange={(e) => setPriceMin(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
                          placeholder="$0"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-green-500 placeholder-gray-600"
                        />
                      </div>
                      <span className="text-gray-600 text-xs mt-4">—</span>
                      <div className="flex-1">
                        <p className="text-[9px] text-gray-600 mb-1">Máximo</p>
                        <input
                          type="number"
                          min={priceMin ?? 0}
                          step={1000}
                          value={priceMax ?? ""}
                          onChange={(e) => setPriceMax(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
                          placeholder={`$${maxPrice.toLocaleString("es-AR")}`}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-green-500 placeholder-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            Sin productos con estos filtros
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
