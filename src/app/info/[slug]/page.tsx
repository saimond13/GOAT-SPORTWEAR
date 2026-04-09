import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { INFO_CONTENT } from "./content";
import { Header } from "@/components/storefront/Header";
import { Cart } from "@/components/storefront/Cart";

export const dynamic = "force-dynamic";

const infoLinks = [
  { label: "Cómo comprar", slug: "como-comprar" },
  { label: "Métodos de pago", slug: "metodos-de-pago" },
  { label: "Envíos y plazos", slug: "envios-y-plazos" },
  { label: "Cambios y devoluciones", slug: "cambios-y-devoluciones" },
  { label: "Preguntas frecuentes", slug: "preguntas-frecuentes" },
];

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = INFO_CONTENT[slug];
  if (!info) return notFound();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <Cart />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm uppercase tracking-widest transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        {/* Sidebar nav + content */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="md:w-52 flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
              Info
            </p>
            <nav className="space-y-1">
              {infoLinks.map((item) => (
                <Link
                  key={item.slug}
                  href={`/info/${item.slug}`}
                  className={`block px-3 py-2 text-sm transition-colors ${
                    item.slug === slug
                      ? "text-white border-l-2 border-green-500 pl-3 font-semibold"
                      : "text-gray-400 hover:text-white border-l-2 border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0">
            <h1
              className="text-4xl md:text-5xl text-white leading-tight mb-10"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {info.title}
            </h1>

            <div className="space-y-8">
              {info.content.map((section, i) => (
                <div key={i} className="border-t border-white/[0.06] pt-6 first:border-0 first:pt-0">
                  {section.heading && (
                    <h2 className="text-white font-black text-base mb-3 uppercase tracking-wide">
                      {section.heading}
                    </h2>
                  )}
                  <p className="text-gray-300 text-sm leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 p-6 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-gray-300 text-sm mb-3">¿Tenés alguna duda más?</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493491406188"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-[0.2em] px-5 py-3 transition-colors"
              >
                Consultanos por WhatsApp
              </a>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
