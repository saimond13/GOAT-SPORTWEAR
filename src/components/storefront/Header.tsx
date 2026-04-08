"use client";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { GoatLogo } from "@/components/ui/GoatLogo";

export function Header() {
  const { itemCount, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: "Inicio", id: "hero" },
    { label: "Productos", id: "products" },
    { label: "Drops", id: "campaigns" },
    { label: "Contacto", id: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            className="flex items-center"
            onClick={() => scrollTo("hero")}
          >
            <GoatLogo size={90} variant="white" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xs font-semibold text-gray-400 hover:text-white uppercase tracking-[0.15em] transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Cart + mobile toggle */}
          <div className="flex items-center gap-2">
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

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#09090b] border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-sm font-semibold text-gray-400 hover:text-white uppercase tracking-[0.2em] py-3 border-b border-white/5 last:border-0 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
