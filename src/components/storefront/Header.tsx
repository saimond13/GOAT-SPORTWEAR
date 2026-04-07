"use client";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { GoatLogo } from "@/components/ui/GoatLogo";

export function Header() {
  const { itemCount, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: "Inicio", id: "hero" },
    { label: "Productos", id: "products" },
    { label: "Novedades", id: "campaigns" },
    { label: "Contacto", id: "contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button className="flex items-center gap-2.5" onClick={() => scrollTo("hero")}>
            <GoatLogo size={36} variant="black" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg tracking-tight text-black">GOAT</span>
              <span className="font-bold text-[10px] tracking-[0.2em] text-green-600 uppercase">Sportwear</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-black" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3">
          {navLinks.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className="block w-full text-left text-sm font-medium text-gray-700 py-3 border-b border-gray-50 last:border-0">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
