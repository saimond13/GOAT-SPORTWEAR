"use client";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PagoExitoso() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-3">¡Pago exitoso!</h1>
        <p className="text-gray-400 mb-2">
          Tu pedido fue confirmado. Te llegará un email de Mercado Pago con el comprobante.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Nos ponemos en contacto para coordinar el envío.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-500 text-black font-black px-8 py-3 hover:bg-green-400 transition-colors uppercase tracking-wide"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
