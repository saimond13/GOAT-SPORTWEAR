"use client";
import { MapPin, Phone, MessageCircle, Mail, Heart } from "lucide-react";
import { GoatLogo } from "@/components/ui/GoatLogo";

export function Footer() {
  return (
    <footer id="contact" className="bg-black text-white">
      <div className="h-[2px] green-line" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <GoatLogo size={40} variant="white" />
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl text-white">GOAT</span>
                <span className="font-bold text-[10px] tracking-[0.2em] text-green-500 uppercase">Sportwear</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              Ropa deportiva de las mejores marcas. Envíos a todo el país por Correo Argentino.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>25 de Mayo 115, Sa Pereira, Entre Ríos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>3404 530462</span>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { href: "https://www.instagram.com/goatsportwear_/", icon: (
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                )},
                { href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493491406188"}`, icon: <MessageCircle className="w-4 h-4" /> },
                { href: "mailto:goatsportwear@gmail.com", icon: <Mail className="w-4 h-4" /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-green-600 mb-4">Categorías</h4>
            <ul className="space-y-2">
              {["Remeras", "Buzos", "Pantalones", "Camperas", "Shorts", "Conjuntos"].map((c) => (
                <li key={c}>
                  <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-gray-500 hover:text-white text-sm transition-colors">{c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-green-600 mb-4">Info</h4>
            <ul className="space-y-2">
              {["Cómo comprar", "Métodos de pago", "Envíos y plazos", "Cambios y devoluciones", "Preguntas frecuentes"].map((item) => (
                <li key={item}><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2025 GOAT SPORTWEAR. Todos los derechos reservados.</p>
          <p className="text-gray-700 text-xs flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-green-600 fill-green-600" /> en Sa Pereira, Entre Ríos
          </p>
        </div>
      </div>
    </footer>
  );
}
