import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goatsportwear.com.ar";

export const metadata: Metadata = {
  title: "GOAT SPORTWEAR | Tienda Online",
  description: "Ropa deportiva premium. Local en Sa Pereira. Envíos a todo el país por Correo Argentino.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "GOAT SPORTWEAR | Tienda Online",
    description: "Ropa deportiva premium. Local en Sa Pereira. Envíos a todo el país por Correo Argentino.",
    url: BASE_URL,
    siteName: "GOAT SPORTWEAR",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "GOAT SPORTWEAR",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOAT SPORTWEAR | Tienda Online",
    description: "Ropa deportiva premium. Local en Sa Pereira. Envíos a todo el país por Correo Argentino.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        <CartProvider>
          {children}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
