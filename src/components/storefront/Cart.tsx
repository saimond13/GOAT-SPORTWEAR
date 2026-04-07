"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

export function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, total } = useCart();

  const handleWhatsApp = () => {
    if (!items.length) return;
    const whatsappItems = items.map((i) => ({
      product: { id: i.product.id, name: i.product.name, price: i.product.price },
      size: i.size,
      quantity: i.quantity,
      paymentMethod: i.paymentMethod,
    }));
    window.open(getWhatsAppUrl(buildWhatsAppMessage(whatsappItems, total)), "_blank");
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-black text-base">Mi Carrito</span>
                {items.length > 0 && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-14 h-14 text-gray-200" />
                  <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
                  <button onClick={() => setIsOpen(false)} className="text-sm font-bold hover:underline">
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
                        <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-black">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-black text-sm">{formatPrice(item.product.price * item.quantity)}</span>
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
              <div className="p-5 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium text-sm">Total</span>
                  <span className="font-black text-xl">{formatPrice(total)}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs">📦 Coordinamos entrega y pago por WhatsApp</p>
                </div>
                <button onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20bc5b] text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm uppercase tracking-wide">
                  <MessageCircle className="w-5 h-5" />
                  Hacer Pedido por WhatsApp
                </button>
                <button onClick={clearCart} className="w-full text-gray-300 text-xs hover:text-red-400 transition-colors">
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
