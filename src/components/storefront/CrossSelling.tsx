"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface Props {
  currentProduct: Product;
  allProducts: Product[];
}

export function CrossSelling({ currentProduct, allProducts }: Props) {
  const related = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        p.is_active &&
        (p.category === currentProduct.category ||
          (currentProduct.badge && p.badge === currentProduct.badge))
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <div className="border-t border-white/[0.06] pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-1">
            Completá el look
          </p>
          <h3
            className="text-3xl text-white"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            TAMBIÉN TE PUEDE GUSTAR
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {related.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/productos/${p.id}`} className="group block">
                <div className="aspect-[3/4] bg-[#1a1a1e] overflow-hidden mb-2">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1e]" />
                  )}
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{p.category}</p>
                <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">
                  {p.name}
                </p>
                <p className="text-sm font-black text-white mt-0.5">{formatPrice(p.price)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
