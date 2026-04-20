"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag, Truck, Building2, MapPin, User, Phone, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import type { Agency } from "@/lib/paqar";
import Image from "next/image";

const FREE_SHIPPING_THRESHOLD = 100_000;

interface RateOption {
  serviceId: string;
  serviceName: string;
  price: number;
  deliveryType: "D" | "S";
  deliveryTimeMin?: string;
  deliveryTimeMax?: string;
}

export function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, total, shipping, setShipping } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;

  // Shipping quote state
  const [rates, setRates] = useState<RateOption[]>([]);
  const [quotingShipping, setQuotingShipping] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Agencies state (for sucursal mode)
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  // Debounced quote fetch when postalCode changes
  useEffect(() => {
    if (!shipping.type || shipping.postalCode.length < 4) {
      setRates([]);
      setQuoteError("");
      return;
    }
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setQuotingShipping(true);
      setQuoteError("");
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postalCode: shipping.postalCode, deliveryType: shipping.type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al cotizar");
        setRates(data.rates ?? []);
      } catch {
        setQuoteError("");
        setRates([]);
      } finally {
        setQuotingShipping(false);
      }
    }, 800);
    return () => { if (quoteTimer.current) clearTimeout(quoteTimer.current); };
  }, [shipping.postalCode, shipping.type]);

  // Fetch agencies when switching to sucursal mode
  useEffect(() => {
    if (shipping.type !== "sucursal") { setAgencies([]); return; }
    setLoadingAgencies(true);
    fetch("/api/shipping/agencies")
      .then((r) => r.json())
      .then((d) => setAgencies(d.agencies ?? []))
      .catch(() => setAgencies([]))
      .finally(() => setLoadingAgencies(false));
  }, [shipping.type]);

  const TRANSFER_DISCOUNT_PCT = 0.15;
  const [paymentMode, setPaymentMode] = useState<"mp" | "transferencia">("mp");
  const transferDiscount = paymentMode === "transferencia" ? Math.round(total * TRANSFER_DISCOUNT_PCT) : 0;
  const finalTotal = total - transferDiscount;

  const [loadingMP, setLoadingMP] = useState(false);

  const handleMercadoPago = async () => {
    if (!items.length) return;
    setLoadingMP(true);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            size: i.size,
          })),
          total,
          shipping: shipping.type ? shipping : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar pago");

      window.location.href = data.checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al conectar con Mercado Pago");
    } finally {
      setLoadingMP(false);
    }
  };

  const handleWhatsApp = () => {
    if (!items.length) return;
    const whatsappItems = items.map((i) => ({
      product: { id: i.product.id, name: i.product.name, price: i.product.price },
      size: i.size,
      quantity: i.quantity,
      paymentMethod: i.paymentMethod,
    }));

    // Best rate for WhatsApp message
    const bestRate = rates[0];
    const shippingData = shipping.type
      ? {
          ...shipping,
          quotedPrice: bestRate?.price,
          quotedService: bestRate?.serviceName,
        }
      : undefined;

    window.open(
      getWhatsAppUrl(buildWhatsAppMessage(whatsappItems, total, shippingData as Parameters<typeof buildWhatsAppMessage>[2], transferDiscount || undefined)),
      "_blank"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} />

          <motion.div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                <span className="font-black text-base text-gray-900">Mi Carrito</span>
                {items.length > 0 && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free shipping bar */}
            {items.length > 0 && (
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-gray-500">
                    {isFreeShipping ? (
                      <span className="text-green-600">🚚 ¡Envío gratis desbloqueado!</span>
                    ) : (
                      <>Te faltan <span className="text-black font-black">{formatPrice(remaining)}</span> para envío gratis</>
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors ${isFreeShipping ? "bg-green-500" : "bg-black"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-14 h-14 text-gray-200" />
                  <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
                  <button onClick={() => setIsOpen(false)} className="text-sm font-bold text-black hover:underline">
                    Seguir comprando →
                  </button>
                </div>
              ) : items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name}
                      className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">👕</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black text-sm leading-tight truncate">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">T. {item.size}</span>
                      <span className="text-[10px] text-gray-400 truncate">{item.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-black">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-sm w-4 text-center text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-black">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-black text-sm text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.product.id, item.size)}
                    className="text-gray-300 hover:text-red-400 transition-colors self-start mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 flex flex-col">
                {/* Delivery type */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2.5">Tipo de envío</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShipping({ type: "domicilio", agencyId: "" })}
                      className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-left transition-all ${
                        shipping.type === "domicilio"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      <Truck className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-black">A domicilio</p>
                        <p className="text-[9px] opacity-60">Correo Argentino</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setShipping({ type: "sucursal", address: "" })}
                      className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-left transition-all ${
                        shipping.type === "sucursal"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-black">A sucursal</p>
                        <p className="text-[9px] opacity-60">Correo Argentino</p>
                      </div>
                    </button>
                  </div>

                  {/* Address / agency fields */}
                  <AnimatePresence mode="wait">
                    {shipping.type === "domicilio" && (
                      <motion.div
                        key="domicilio"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {/* Recipient info */}
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Nombre y apellido"
                            value={shipping.recipientName}
                            onChange={(e) => setShipping({ recipientName: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Teléfono"
                            value={shipping.recipientPhone}
                            onChange={(e) => setShipping({ recipientPhone: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        {/* Address */}
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Dirección (calle y número)"
                            value={shipping.address}
                            onChange={(e) => setShipping({ address: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Localidad"
                            value={shipping.city}
                            onChange={(e) => setShipping({ city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="Cód. postal"
                            value={shipping.postalCode}
                            onChange={(e) => setShipping({ postalCode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        <ShippingQuote quoting={quotingShipping} rates={rates} error={quoteError} isFree={isFreeShipping} />
                      </motion.div>
                    )}

                    {shipping.type === "sucursal" && (
                      <motion.div
                        key="sucursal"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {/* Recipient info */}
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Nombre y apellido"
                            value={shipping.recipientName}
                            onChange={(e) => setShipping({ recipientName: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Teléfono"
                            value={shipping.recipientPhone}
                            onChange={(e) => setShipping({ recipientPhone: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Localidad"
                            value={shipping.city}
                            onChange={(e) => setShipping({ city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="Cód. postal"
                            value={shipping.postalCode}
                            onChange={(e) => setShipping({ postalCode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:border-black placeholder-gray-400"
                          />
                        </div>

                        {/* Agency selector */}
                        {loadingAgencies ? (
                          <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Cargando sucursales…
                          </div>
                        ) : agencies.length > 0 && (
                          <select
                            value={shipping.agencyId}
                            onChange={(e) => setShipping({ agencyId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black text-gray-700"
                          >
                            <option value="">Seleccionar sucursal…</option>
                            {agencies.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} — {a.address}, {a.city}
                              </option>
                            ))}
                          </select>
                        )}

                        <ShippingQuote quoting={quotingShipping} rates={rates} error={quoteError} isFree={isFreeShipping} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Total + actions */}
                <div className="p-5 space-y-3">

                  {/* Payment mode selector */}
                  <div>
                    <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Forma de pago</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMode("mp")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black transition-all ${
                          paymentMode === "mp"
                            ? "bg-[#009EE3] border-[#009EE3] text-white"
                            : "border-gray-200 text-gray-600 hover:border-[#009EE3]"
                        }`}
                      >
                        <Image src="/mp-logo.svg" alt="" width={16} height={16} />
                        Mercado Pago
                      </button>
                      <button
                        onClick={() => setPaymentMode("transferencia")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-black transition-all ${
                          paymentMode === "transferencia"
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-gray-200 text-gray-600 hover:border-green-600"
                        }`}
                      >
                        🏦 Transferencia
                      </button>
                    </div>
                  </div>

                  {/* Transfer details + discount */}
                  {paymentMode === "transferencia" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-700">🎁 Descuento 15%</span>
                        <span className="text-xs font-black text-green-700">-{formatPrice(transferDiscount)}</span>
                      </div>
                      <div className="h-px bg-green-200" />
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Datos para transferir:</p>
                      <p className="text-xs text-gray-700">• Titular: <strong>Tadeo Vanstrate</strong></p>
                      <p className="text-xs text-gray-700">• Alias MP: <strong>vanstrate</strong></p>
                      <p className="text-[10px] text-gray-500 mt-1">Coordiná el envío por WhatsApp después de transferir</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium text-sm">Subtotal</span>
                    <span className={`font-black text-xl ${paymentMode === "transferencia" ? "line-through text-gray-400 text-base" : "text-gray-900"}`}>
                      {formatPrice(total)}
                    </span>
                  </div>
                  {paymentMode === "transferencia" && (
                    <div className="flex justify-between items-center -mt-1">
                      <span className="text-green-700 font-black text-sm">Total con descuento</span>
                      <span className="font-black text-xl text-green-700">{formatPrice(finalTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium text-sm">Envío</span>
                    {isFreeShipping ? (
                      <span className="text-green-600 font-black text-sm">GRATIS 🎉</span>
                    ) : rates.length > 0 ? (
                      <span className="font-black text-sm text-gray-900">{formatPrice(rates[0].price)}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">A cotizar</span>
                    )}
                  </div>

                  {/* Mercado Pago */}
                  {paymentMode === "mp" && (
                    <button
                      onClick={handleMercadoPago}
                      disabled={loadingMP}
                      className="w-full bg-[#009EE3] hover:bg-[#0088c7] disabled:opacity-60 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm uppercase tracking-wide"
                    >
                      {loadingMP ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Image src="/mp-logo.svg" alt="Mercado Pago" width={20} height={20} />
                      )}
                      Pagar con Mercado Pago
                    </button>
                  )}

                  {/* Separador */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {paymentMode === "mp" ? "o coordinar por" : "coordinar por"}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* WhatsApp */}
                  <button onClick={handleWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bc5b] text-white font-black py-3 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm uppercase tracking-wide">
                    <MessageCircle className="w-5 h-5" />
                    {paymentMode === "transferencia" ? "Confirmar por WhatsApp" : "Coordinar por WhatsApp"}
                  </button>

                  <button onClick={clearCart} className="w-full text-gray-300 text-xs hover:text-red-400 transition-colors">
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShippingQuote({ quoting, rates, error, isFree }: {
  quoting: boolean;
  rates: RateOption[];
  error: string;
  isFree: boolean;
}) {
  if (isFree) return null;
  if (quoting) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Cotizando envío…
      </div>
    );
  }
  if (error) {
    return <p className="text-red-400 text-[10px]">{error}</p>;
  }
  if (!rates.length) return null;

  return (
    <div className="space-y-1 pt-1">
      {rates.map((r) => (
        <div key={r.serviceId + r.deliveryType} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-1.5">
          <div>
            <span className="text-[11px] font-bold text-gray-700">{r.serviceName}</span>
            {r.deliveryTimeMin && r.deliveryTimeMax && (
              <span className="text-[10px] text-gray-400 ml-1">({r.deliveryTimeMin}-{r.deliveryTimeMax}d)</span>
            )}
          </div>
          <span className="text-[11px] font-black text-black">{formatPrice(r.price)}</span>
        </div>
      ))}
    </div>
  );
}
