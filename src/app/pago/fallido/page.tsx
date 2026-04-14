"use client";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PagoFallido() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-3">Pago fallido</h1>
        <p className="text-gray-400 mb-2">
          Hubo un problema con tu pago. Podés intentarlo de nuevo o contactarnos por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="inline-block bg-white text-black font-black px-8 py-3 hover:bg-gray-100 transition-colors uppercase tracking-wide"
          >
            Volver a la tienda
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white font-black px-8 py-3 hover:bg-[#20bc5b] transition-colors uppercase tracking-wide"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
