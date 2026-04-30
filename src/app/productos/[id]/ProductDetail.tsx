"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, Minus, Plus, Ruler, X } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Header } from "@/components/storefront/Header";
import { Cart } from "@/components/storefront/Cart";

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-[3/4] bg-[#1a1a1e] flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-white/10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-[#1a1a1e] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${name} ${idx + 1}`}
            className="w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1">
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-16 sm:w-20 aspect-square overflow-hidden border-2 transition-all ${
                i === idx ? "border-green-500" : "border-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, setIsOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  // All images: new images[] array first, fallback to image_url
  const allImages = product.images?.length
    ? product.images
    : product.image_url
    ? [product.image_url]
    : [];

  const needsSize = product.has_sizes !== false && product.sizes?.length > 0;

  // Stock helpers
  const getStock = (s: string) => product.stock_by_size?.[s] ?? null; // null = unlimited
  const isOutOfStock = (s: string) => {
    const stock = getStock(s);
    return stock !== null && stock <= 0;
  };
  // Products without sizes store stock under "Único"
  const noSizeStock = !needsSize ? (product.stock_by_size?.["Único"] ?? null) : null;
  const maxQty = needsSize
    ? (selectedSize ? (getStock(selectedSize) ?? 99) : 99)
    : (noSizeStock ?? 99);

  const handleAdd = () => {
    if (needsSize && !selectedSize) return;
    addItem(product, selectedSize || "Único", quantity, "Mercado Pago");
    setAdded(true);
    setIsOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <Cart />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm uppercase tracking-widest transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={allImages} name={product.name} />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                {product.category}
              </span>
              {product.badge && (
                <span
                  className="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wider"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl text-white leading-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-2xl sm:text-3xl font-black text-white">{formatPrice(product.price)}</span>
              {product.original_price && (
                <>
                  <span className="text-gray-600 text-lg line-through mb-0.5">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-green-500 text-sm font-black mb-0.5">-{discount}%</span>
                </>
              )}
            </div>

            {/* Transfer discount badge */}
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-2 w-fit">
              <span className="text-green-400 text-sm">🏦</span>
              <span className="text-green-400 text-xs font-black uppercase tracking-wide">
                15% OFF pagando por transferencia
              </span>
              <span className="text-green-600 text-xs font-bold">
                — {formatPrice(Math.round(product.price * 0.85))}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/[0.06] pt-5">
                {product.description}
              </p>
            )}

            <div className="border-t border-white/[0.06] pt-5 space-y-5">
              {/* Size */}
              {needsSize && <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                    Talle
                  </p>
                  {product.size_chart_image && (
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 font-bold uppercase tracking-widest"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Ver tabla de talles
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const oos = isOutOfStock(s);
                    const stock = getStock(s);
                    const lowStock = stock !== null && stock > 0 && stock <= 3;
                    return (
                      <div key={s} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => { if (!oos) { setSelectedSize(s); setQuantity(1); } }}
                          disabled={oos}
                          className={`w-12 h-12 text-sm font-bold border transition-all relative ${
                            oos
                              ? "border-white/5 text-white/20 cursor-not-allowed line-through"
                              : selectedSize === s
                              ? "bg-green-500 text-black border-green-500"
                              : "border-white/15 text-gray-300 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                        {oos && <span className="text-[9px] text-red-500 font-bold uppercase">Agotado</span>}
                        {lowStock && !oos && <span className="text-[9px] text-yellow-500 font-bold">¡{stock} left!</span>}
                      </div>
                    );
                  })}
                </div>
              </div>}

              {/* Quantity */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">
                  Cantidad
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-white/15 flex items-center justify-center text-gray-300 hover:border-white/40 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-black text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 border border-white/15 flex items-center justify-center text-gray-300 hover:border-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {maxQty < 99 && (
                    <span className="text-gray-600 text-xs">máx {maxQty}</span>
                  )}
                </div>
              </div>

              {/* Mercado Pago badge */}
              <div className="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-3">
                  Medios de pago
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-[#009EE3] px-3 py-1.5 rounded-lg">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 8.5l-3 3-2-2-2 2-3-3 5-5 5 5z"/>
                    </svg>
                    <span className="text-white text-xs font-black tracking-wide">Mercado Pago</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Tarjeta de crédito", icon: "💳" },
                    { label: "Tarjeta de débito", icon: "🏦" },
                    { label: "Dinero en cuenta", icon: "💰" },
                  ].map((m) => (
                    <span key={m.label} className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
                      <span>{m.icon}</span>
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* No-size out-of-stock indicator */}
              {!needsSize && noSizeStock !== null && noSizeStock <= 0 && (
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider text-center">Sin stock disponible</p>
              )}
              {!needsSize && noSizeStock !== null && noSizeStock > 0 && noSizeStock <= 5 && (
                <p className="text-orange-400 text-xs font-bold uppercase tracking-wider text-center">¡Últimas {noSizeStock} unidades!</p>
              )}

              {/* CTA */}
              <button
                onClick={handleAdd}
                disabled={(needsSize && !selectedSize) || (!needsSize && noSizeStock !== null && noSizeStock <= 0)}
                className={`w-full py-4 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                  added
                    ? "bg-green-500 text-black"
                    : (needsSize && !selectedSize) || (!needsSize && noSizeStock !== null && noSizeStock <= 0)
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-white text-black hover:bg-green-500"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? "¡Agregado al carrito!" : (!needsSize && noSizeStock !== null && noSizeStock <= 0) ? "Sin stock" : "Agregar al carrito"}
              </button>

              {needsSize && !selectedSize && (
                <p className="text-gray-600 text-xs text-center">Seleccioná un talle</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {showSizeChart && product.size_chart_image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSizeChart(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-bold"
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
    </div>
  );
}
