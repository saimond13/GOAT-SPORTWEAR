"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Suspense } from "react";

function ExitosoContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const externalRef = searchParams.get("external_reference");
    const status = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");

    if (externalRef && paymentId && status === "approved") {
      fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: externalRef, paymentId }),
      }).finally(() => setConfirmed(true));
    } else {
      setConfirmed(true);
    }

    clearCart();
  }, [clearCart, searchParams]);

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

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
        <Link href="/"
          className="inline-block bg-green-500 text-black font-black px-8 py-3 hover:bg-green-400 transition-colors uppercase tracking-wide">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    }>
      <ExitosoContent />
    </Suspense>
  );
}
