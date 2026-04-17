"use client";
import { ShoppingCart, Menu, X, ChevronDown, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { SearchModal } from "./SearchModal";

const infoLinks = [
  { label: "Cómo comprar", slug: "como-comprar" },
  { label: "Métodos de pago", slug: "metodos-de-pago" },
  { label: "Envíos y plazos", slug: "envios-y-plazos" },
  { label: "Cambios y devoluciones", slug: "cambios-y-devoluciones" },
  { label: "Preguntas frecuentes", slug: "preguntas-frecuentes" },
];

export function Header() {
  const { itemCount, setIsOpen } = useCart();
  const { products } = useProducts();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setInfoOpen(false);
    if (pathname !== "/") {
      // Navigate to homepage with anchor — browser handles the scroll
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Inicio", id: "hero" },
    { label: "Productos", id: "products" },
    { label: "Drops", id: "campaigns" },
    { label: "Contacto", id: "contact" },
  ];

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — just "GOAT" text, clean and readable small */}
          <button
            className="flex items-center"
            onClick={() => scrollTo("hero")}
          >
            <span
              className="text-white text-2xl leading-none tracking-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              GOAT
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-[0.15em] transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}

            {/* Info dropdown */}
            <div ref={infoRef} className="relative">
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-[0.15em] transition-colors duration-200"
              >
                Info
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${infoOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {infoOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-52 bg-[#111113] border border-white/[0.08] py-1"
                  >
                    {infoLinks.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/info/${item.slug}`}
                        onClick={() => setInfoOpen(false)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Cart + search + mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 hover:bg-white/5 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-black text-[10px] font-black flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:text-green-500 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <SearchModal products={products} open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#09090b] border-t border-white/[0.07] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-sm font-semibold text-gray-300 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/[0.05] last:border-0 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-1 pb-2 border-b border-white/[0.05]">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Info</p>
                {infoLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/info/${item.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left text-sm text-gray-400 hover:text-white py-2 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
