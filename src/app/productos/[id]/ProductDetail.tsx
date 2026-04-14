"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, Minus, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { PAYMENT_METHODS } from "@/types/product";
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
              className={`flex-shrink-0 w-20 aspect-square overflow-hidden border-2 transition-all ${
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
  const [payment, setPayment] = useState("");
  const [added, setAdded] = useState(false);

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  // All images: new images[] array first, fallback to image_url
  const allImages = product.images?.length
    ? product.images
    : product.image_url
    ? [product.image_url]
    : [];

  // Available payment methods for this product
  const availablePayments = product.payment_methods?.length
    ? product.payment_methods
    : PAYMENT_METHODS;

  // Stock helpers
  const getStock = (s: string) => product.stock_by_size?.[s] ?? null; // null = unlimited
  const isOutOfStock = (s: string) => {
    const stock = getStock(s);
    return stock !== null && stock <= 0;
  };
  const maxQty = selectedSize
    ? (getStock(selectedSize) ?? 99)
    : 99;

  const handleAdd = () => {
    if (!selectedSize || !payment) return;
    addItem(product, selectedSize, quantity, payment);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
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
              className="text-4xl md:text-5xl text-white leading-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-white">{formatPrice(product.price)}</span>
              {product.original_price && (
                <>
                  <span className="text-gray-600 text-lg line-through mb-0.5">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-green-500 text-sm font-black mb-0.5">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/[0.06] pt-5">
                {product.description}
              </p>
            )}

            <div className="border-t border-white/[0.06] pt-5 space-y-5">
              {/* Size */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">
                  Talle
                </p>
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
              </div>

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

              {/* Payment */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">
                  Método de pago
                </p>
                <div className="relative">
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-full border border-white/15 bg-[#1a1a1e] text-gray-300 px-4 py-3 appearance-none focus:outline-none focus:border-green-500/50 text-sm transition-colors pr-10"
                  >
                    <option value="">Seleccionar método...</option>
                    {availablePayments.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleAdd}
                disabled={!selectedSize || !payment}
                className={`w-full py-4 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                  added
                    ? "bg-green-500 text-black"
                    : !selectedSize || !payment
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-white text-black hover:bg-green-500"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? "¡Agregado al carrito!" : "Agregar al carrito"}
              </button>

              {(!selectedSize || !payment) && (
                <p className="text-gray-600 text-xs text-center">
                  {!selectedSize ? "Seleccioná un talle" : "Seleccioná un método de pago"}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
