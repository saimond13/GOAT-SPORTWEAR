"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

function Content() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registrationId = searchParams.get("external_reference");
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");

    if (registrationId && paymentId && (status === "approved" || status === "pending")) {
      fetch("/api/preventa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, paymentId }),
      }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1
          className="text-4xl text-white mb-3"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          ¡RESERVA CONFIRMADA!
        </h1>
        <p className="text-gray-400 mb-2">
          Tu seña fue procesada. Tu unidad está guardada.
        </p>
        <p className="text-gray-500 text-sm mb-2">
          Te contactamos por WhatsApp para coordinar el saldo y el envío.
        </p>
        <p className="text-gray-600 text-xs mb-10">
          Si no recibís noticias en 24hs, escribinos directo.
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

export default function PreventaExitoso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    }>
      <Content />
    </Suspense>
  );
}
