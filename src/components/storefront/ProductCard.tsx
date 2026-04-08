"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, ChevronDown } from "lucide-react";
import type { Product } from "@/types/product";
import { PAYMENT_METHODS } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAdd = () => {
    if (!expanded) { setExpanded(true); return; }
    if (!selectedSize || !payment) return;
    addItem(product, selectedSize, quantity, payment);
    setAdded(true);
    setTimeout(() => { setAdded(false); setExpanded(false); }, 1800);
  };

  return (
    <motion.div
      className="product-card bg-[#111113] border border-white/[0.06] overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      {/* Image — molde fijo 3:4 */}
      <div className="relative overflow-hidden bg-[#1a1a1e] aspect-[3/4]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-600"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1e]">
            <div className="text-center">
              <div className="w-12 h-12 border border-white/10 mx-auto mb-2 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white/20" />
              </div>
              <span className="text-white/15 text-[10px] uppercase tracking-widest">Sin imagen</span>
            </div>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span
              className="bg-green-500 text-black text-[9px] font-black px-2 py-1 uppercase tracking-wider"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-white text-black text-[9px] font-black px-2 py-1">
              -{discount}%
            </span>
          </div>
        )}

        {/* Quick add hover button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-3 right-3 w-8 h-8 bg-green-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-green-400"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-1">
          {product.category}
        </p>
        <h3 className="font-bold text-white text-sm leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black text-white text-base">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-gray-600 text-xs line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Expanded options */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 border-t border-white/[0.06] pt-3 mb-3 overflow-hidden"
          >
            {/* Sizes */}
            <div>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-1.5">
                Talle
              </p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-2.5 py-1 text-xs font-bold border transition-all ${
                      selectedSize === s
                        ? "bg-green-500 text-black border-green-500"
                        : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-1.5">
                Cantidad
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 border border-white/10 flex items-center justify-center hover:border-white/30 text-gray-400 hover:text-white transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-black text-white text-sm w-5 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 border border-white/10 flex items-center justify-center hover:border-white/30 text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-1.5">
                Pago
              </p>
              <div className="relative">
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="w-full text-xs border border-white/10 px-2.5 py-2 appearance-none focus:outline-none focus:border-green-500/50 bg-[#1a1a1e] text-gray-300 pr-7 transition-colors"
                >
                  <option value="">Seleccionar...</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleAdd}
          disabled={expanded && (!selectedSize || !payment)}
          className={`w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-[0.15em] ${
            added
              ? "bg-green-500 text-black"
              : expanded && (!selectedSize || !payment)
              ? "bg-white/5 text-gray-600 cursor-not-allowed"
              : "bg-white text-black hover:bg-green-500 hover:text-black"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? "¡Agregado!" : expanded ? "Agregar al carrito" : "Seleccionar"}
        </button>
      </div>
    </motion.div>
  );
}
