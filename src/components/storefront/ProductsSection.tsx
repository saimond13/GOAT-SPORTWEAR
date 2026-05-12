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
  const PAGE_SIZE = 10;
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeGender, setActiveGender] = useState("Todos");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("new");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const maxPrice = useMemo(
    () => Math.max(0, ...products.map((p) => p.price)),
    [products]
  );

  const resetPage = () => setPage(1);

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    resetPage();
  };

  const hasFilters =
    selectedSizes.length > 0 ||
    priceMax !== null ||
    priceMin !== null ||
    activeGender !== "Todos" ||
    activeCategory !== "Todos";

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceMin(null);
    setPriceMax(null);
    setActiveGender("Todos");
    setActiveCategory("Todos");
    resetPage();
  };

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
  }, [products, activeCategory, activeGender, selectedSizes, priceMin, priceMax, sortBy]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <section id="products" className="bg-[#F5F5F3] py-24 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-[0.4em] text-[#B8B8B8] uppercase mb-4">
            Catálogo
          </p>
          <h2
            className="text-[38px] sm:text-[60px] md:text-[80px] text-[#111111] tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NUESTROS
            <br />
            <span className="text-[#556B5D]">PRODUCTOS</span>
          </h2>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border uppercase tracking-[0.15em] transition-all ${
                filtersOpen || hasFilters
                  ? "bg-[#556B5D]/10 border-[#556B5D] text-[#556B5D]"
                  : "border-[#111111]/10 text-[#B8B8B8] hover:border-[#111111]/30 hover:text-[#111111]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
              {hasFilters && (
                <span className="w-4 h-4 bg-[#556B5D] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {selectedSizes.length + (priceMax !== null ? 1 : 0) + (activeGender !== "Todos" ? 1 : 0) + (activeCategory !== "Todos" ? 1 : 0)}
                </span>
              )}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="text-[10px] text-[#B8B8B8] hover:text-red-400 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
            <span className="text-[11px] text-[#B8B8B8]">
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              {hasMore && ` · mostrando ${paginated.length}`}
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#E7E7E4] border border-[#111111]/10 text-[#2B2B2B] text-xs px-3 py-2 focus:outline-none focus:border-[#556B5D] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-[#111111]/10 rounded-xl p-5 mb-6 bg-[#E7E7E4] space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-3">Género</p>
                  <div className="flex flex-wrap gap-2">
                    {["Todos", ...GENDERS].map((g) => (
                      <button
                        key={g}
                        onClick={() => { setActiveGender(g); resetPage(); }}
                        className={`px-4 py-1.5 text-xs font-bold border uppercase tracking-[0.15em] transition-all rounded-full ${
                          activeGender === g
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "border-[#111111]/10 text-[#2B2B2B] hover:border-[#111111]/30 hover:text-[#111111]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-3">Categoría</p>
                  <div className="flex flex-wrap gap-2">
                    {["Todos", ...CATEGORIES].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); resetPage(); }}
                        className={`px-4 py-1.5 text-xs font-bold border uppercase tracking-[0.15em] transition-all rounded-lg ${
                          activeCategory === cat
                            ? "bg-[#556B5D] text-white border-[#556B5D]"
                            : "border-[#111111]/10 text-[#2B2B2B] hover:border-[#111111]/30 hover:text-[#111111]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-3">Talle</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                          selectedSizes.includes(s)
                            ? "bg-[#556B5D] text-white border-[#556B5D]"
                            : "border-[#111111]/10 text-[#2B2B2B] hover:border-[#111111]/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {maxPrice > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#B8B8B8] uppercase tracking-widest mb-2">Rango de precio</p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[9px] text-[#B8B8B8] mb-1">Mínimo</p>
                        <input
                          type="number"
                          min={0}
                          max={priceMax ?? maxPrice}
                          step={1000}
                          value={priceMin ?? ""}
                          onChange={(e) => setPriceMin(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
                          placeholder="$0"
                          className="w-full bg-white border border-[#111111]/10 rounded-lg px-2 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D] placeholder-[#B8B8B8]"
                        />
                      </div>
                      <span className="hidden sm:block text-[#B8B8B8] text-xs mt-4">—</span>
                      <div className="flex-1">
                        <p className="text-[9px] text-[#B8B8B8] mb-1">Máximo</p>
                        <input
                          type="number"
                          min={priceMin ?? 0}
                          step={1000}
                          value={priceMax ?? ""}
                          onChange={(e) => setPriceMax(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
                          placeholder={`$${maxPrice.toLocaleString("es-AR")}`}
                          className="w-full bg-white border border-[#111111]/10 rounded-lg px-2 py-2 text-[#111111] text-sm focus:outline-none focus:border-[#556B5D] placeholder-[#B8B8B8]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#556B5D]/30 to-transparent mb-10" />

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-[#B8B8B8] text-base font-medium uppercase tracking-widest">
              Catálogo en preparación
            </p>
            <p className="text-[#B8B8B8]/60 text-sm mt-2">Volvé pronto</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#B8B8B8] text-sm uppercase tracking-widest">
            Sin productos con estos filtros
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {hasMore && (
              <div className="flex flex-col items-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-10 py-4 border border-[#111111]/20 hover:border-[#556B5D] text-[#111111] hover:text-[#556B5D] text-xs font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Ver más productos ({filtered.length - paginated.length} restantes)
                </button>
                <p className="text-[#B8B8B8] text-[10px]">
                  {paginated.length} de {filtered.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
