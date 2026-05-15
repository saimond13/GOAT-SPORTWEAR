"use client";
import { MapPin, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";

const infoLinks = [
  { label: "Cómo comprar", slug: "como-comprar" },
  { label: "Métodos de pago", slug: "metodos-de-pago" },
  { label: "Envíos y plazos", slug: "envios-y-plazos" },
  { label: "Cambios y devoluciones", slug: "cambios-y-devoluciones" },
  { label: "Preguntas frecuentes", slug: "preguntas-frecuentes" },
];

export function Footer() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contact" className="bg-[#060608] border-t border-white/5 scroll-mt-28">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#556B5D]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src="/assets/logo-white2.png" alt="GOAT" className="h-10 w-auto object-contain" />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed max-w-xs mb-6">
              Gymwear de calidad premium. Envíos a todo el país por Correo Argentino.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin className="w-3.5 h-3.5 text-[#556B5D] flex-shrink-0 mt-0.5" />
                <div>
                  <span>25 de Mayo 115, S3011 Sa Pereira</span>
                  <br />
                  <span className="text-gray-400">Provincia de Santa Fe, Argentina</span>
                </div>
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
                  href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
                  label: "WhatsApp",
                  icon: <MessageCircle className="w-4 h-4" />,
                },
                {
                  href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`,
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
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-gray-400 hover:border-[#556B5D]/50 hover:text-[#556B5D] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.3em] text-gray-300 font-bold mb-5"
            >
              Categorías
            </h4>
            <ul className="space-y-2.5">
              {["Remeras", "Buzos", "Pantalones", "Camperas", "Shorts", "Conjuntos"].map((c) => (
                <li key={c}>
                  <button
                    onClick={() => scrollTo("products")}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-gray-300 font-bold mb-5">
              Info
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/info/${item.slug}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            © 2026 GOAT SPORTWEAR
          </p>
          <p className="text-gray-500 text-xs">Sa Pereira, Santa Fe, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
