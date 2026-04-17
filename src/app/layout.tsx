import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export const metadata: Metadata = {
  title: "GOAT SPORTWEAR | Tienda Online",
  description: "Ropa deportiva premium. Local en Sa Pereira. Envíos a todo el país por Correo Argentino.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          {children}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
