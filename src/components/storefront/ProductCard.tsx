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
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  const handleAdd = () => {
    if (!expanded) { setExpanded(true); return; }
    if (!selectedSize || !payment) return;
    addItem(product, selectedSize, quantity, payment);
    setAdded(true);
    setTimeout(() => { setAdded(false); setExpanded(false); }, 1800);
  };

  return (
    <motion.div className="product-card bg-white border border-gray-100 rounded-2xl overflow-hidden group"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}>
      {/* Image — molde fijo 3:4, todas las imágenes se ajustan igual */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-5xl">👕</span>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="bg-black text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded">
              -{discount}%
            </span>
          </div>
        )}
        <button onClick={() => setExpanded(!expanded)}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-bold text-black text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black text-black text-base">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-gray-300 text-xs line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>

        {/* Expanded options */}
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 border-t border-gray-100 pt-3 mb-3">
            {/* Sizes */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Talle</p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      selectedSize === s ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cantidad</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-black">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-black text-sm w-5 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-black">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pago</p>
              <div className="relative">
                <select value={payment} onChange={(e) => setPayment(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 appearance-none focus:outline-none focus:border-black bg-white pr-7">
                  <option value="">Seleccionar...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        <button onClick={handleAdd}
          disabled={expanded && (!selectedSize || !payment)}
          className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
            added ? "bg-green-600 text-white" :
            expanded && (!selectedSize || !payment) ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
            "bg-black text-white hover:bg-gray-800"
          }`}>
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? "¡Agregado!" : expanded ? "Agregar al carrito" : "Seleccionar"}
        </button>
      </div>
    </motion.div>
  );
}
