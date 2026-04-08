"use client";
import { MapPin, MessageCircle, Mail } from "lucide-react";
import { GoatLogo } from "@/components/ui/GoatLogo";

export function Footer() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contact" className="bg-[#060608] border-t border-white/5">
      {/* Top accent */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <GoatLogo size={38} variant="white" />
              <div className="flex flex-col leading-none">
                <span
                  className="text-white text-xl tracking-tight"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  GOAT
                </span>
                <span className="font-bold text-[9px] tracking-[0.25em] text-green-500 uppercase">
                  Sportwear
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mb-6">
              Gymwear de calidad premium. Envíos a todo el país por Correo Argentino.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>25 de Mayo 115, Sa Pereira, Entre Ríos</span>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                {
                  href: "https://www.instagram.com/goatsportwear_/",
                  label: "Instagram",
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493491406188"}`,
                  label: "WhatsApp",
                  icon: <MessageCircle className="w-4 h-4" />,
                },
                {
                  href: "mailto:goatsportwear@gmail.com",
                  label: "Email",
                  icon: <Mail className="w-4 h-4" />,
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-gray-600 hover:border-green-500/50 hover:text-green-500 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="text-[9px] uppercase tracking-[0.35em] text-gray-600 mb-5"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              Categorías
            </h4>
            <ul className="space-y-2.5">
              {["Remeras", "Buzos", "Pantalones", "Camperas", "Shorts", "Conjuntos"].map((c) => (
                <li key={c}>
                  <button
                    onClick={() => scrollTo("products")}
                    className="text-gray-600 hover:text-white text-sm transition-colors"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4
              className="text-[9px] uppercase tracking-[0.35em] text-gray-600 mb-5"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              Info
            </h4>
            <ul className="space-y-2.5">
              {[
                "Cómo comprar",
                "Métodos de pago",
                "Envíos y plazos",
                "Cambios y devoluciones",
                "Preguntas frecuentes",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            © 2026 GOAT SPORTWEAR
          </p>
          <p className="text-gray-700 text-xs">Sa Pereira, Entre Ríos, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
