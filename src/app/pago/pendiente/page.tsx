"use client";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function PagoPendiente() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-3">Pago pendiente</h1>
        <p className="text-gray-400 mb-2">
          Tu pago está siendo procesado. Mercado Pago te avisará cuando se acredite.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Una vez confirmado te contactamos para coordinar el envío.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-black font-black px-8 py-3 hover:bg-gray-100 transition-colors uppercase tracking-wide"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
