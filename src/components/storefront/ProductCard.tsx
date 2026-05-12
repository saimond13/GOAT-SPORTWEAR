"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Ruler, X } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const needsSize = product.has_sizes !== false && product.sizes?.length > 0;

  const handleAdd = () => {
    if (!expanded) { setExpanded(true); return; }
    if (needsSize && !selectedSize) return;
    addItem(product, selectedSize || "Único", quantity, "Mercado Pago");
    setAdded(true);
    setTimeout(() => { setAdded(false); setExpanded(false); }, 1800);
  };

  return (
    <motion.div
      className="product-card bg-white border border-[#111111]/10 overflow-hidden group rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <Link href={`/productos/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-[#E7E7E4] aspect-[3/4] rounded-t-xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-600"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#E7E7E4]">
              <div className="text-center">
                <div className="w-12 h-12 border border-[#111111]/10 mx-auto mb-2 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[#B8B8B8]" />
                </div>
                <span className="text-[#B8B8B8] text-[10px] uppercase tracking-widest">Sin imagen</span>
              </div>
            </div>
          )}

          {product.badge && (
            <div className="absolute top-3 left-3">
              <span
                className="bg-[#556B5D] text-white text-[9px] font-black px-2 py-1 uppercase tracking-wider"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                {product.badge}
              </span>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-[#111111] text-white text-[9px] font-black px-2 py-1">
                -{discount}%
              </span>
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-[#556B5D] shadow-md hover:scale-110 active:scale-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[9px] font-bold text-[#B8B8B8] uppercase tracking-[0.3em] mb-1">
          {product.category}
        </p>
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-bold text-[#111111] text-sm leading-tight mb-2 line-clamp-2 hover:text-[#556B5D] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-black text-[#111111] text-base">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-[#B8B8B8] text-xs line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {(() => {
          if (!product.stock_by_size || !product.sizes?.length) return null;
          const total = product.sizes.reduce((acc, s) => acc + (product.stock_by_size?.[s] ?? 0), 0);
          if (total <= 0) return null;
          if (total <= 5) {
            return (
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-2">
                ¡Últimas {total} unidades!
              </p>
            );
          }
          return null;
        })()}

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 border-t border-[#111111]/10 pt-3 mb-3 overflow-hidden"
          >
            {needsSize && <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-bold text-[#B8B8B8] uppercase tracking-[0.3em]">Talle</p>
                {product.size_chart_image && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizeChart(true); }}
                    className="flex items-center gap-1 text-[9px] text-[#556B5D] hover:text-[#4a5f52] font-bold uppercase tracking-wider"
                  >
                    <Ruler className="w-2.5 h-2.5" /> Ver tabla
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                      selectedSize === s
                        ? "bg-[#556B5D] text-white border-[#556B5D]"
                        : "border-[#111111]/10 text-[#2B2B2B] hover:border-[#111111]/30 hover:text-[#111111]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>}

            <div>
              <p className="text-[9px] font-bold text-[#B8B8B8] uppercase tracking-[0.3em] mb-1.5">Cantidad</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 border border-[#111111]/10 flex items-center justify-center hover:border-[#111111]/30 text-[#2B2B2B] hover:text-[#111111] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-[#111111] text-sm w-5 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 border border-[#111111]/10 flex items-center justify-center hover:border-[#111111]/30 text-[#2B2B2B] hover:text-[#111111] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#009EE3]/10 border border-[#009EE3]/20 rounded px-2.5 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#009EE3] flex-shrink-0" />
              <span className="text-[10px] font-bold text-[#009EE3]">Mercado Pago</span>
              <span className="text-[9px] text-[#B8B8B8] ml-auto hidden sm:block">💳 débito · crédito · cuenta</span>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleAdd}
          disabled={expanded && needsSize && !selectedSize}
          className={`w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-[0.15em] ${
            added
              ? "bg-[#556B5D] text-white"
              : expanded && needsSize && !selectedSize
              ? "bg-[#111111]/5 text-[#B8B8B8] cursor-not-allowed"
              : "bg-[#111111] text-white hover:bg-[#556B5D]"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? "¡Agregado!" : expanded ? "Agregar al carrito" : "Seleccionar"}
        </button>
      </div>

      {showSizeChart && product.size_chart_image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSizeChart(false)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute -top-10 right-0 text-[#B8B8B8] hover:text-white flex items-center gap-1 text-xs"
            >
              <X className="w-4 h-4" /> Cerrar
            </button>
            <img
              src={product.size_chart_image}
              alt="Tabla de talles"
              className="w-full rounded-xl border border-white/10"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
