import type { NextConfig } from "next";
import path from "path";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Mercado Pago + Meta Pixel + framer-motion inline
      "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://connect.facebook.net",
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Supabase storage + data URIs + MP
      `img-src 'self' data: blob: https://${supabaseHost} https://http2.mlstatic.com https://www.facebook.com`,
      // Connect: self + Supabase + MP + Meta Pixel
      `connect-src 'self' https://${supabaseHost} https://api.mercadopago.com https://www.facebook.com https://api.correoargentino.com.ar`,
      // Frames: MP checkout
      "frame-src https://www.mercadopago.com.ar https://www.mercadopago.com https://www.sandbox.mercadopago.com.ar",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // No-cache for API routes
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
