"use client";
import { motion } from "framer-motion";
import type { Campaign } from "@/types/admin";

export function CampaignsBanner({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section id="campaigns" className="bg-[#09090b] py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[9px] font-bold tracking-[0.5em] text-gray-600 uppercase mb-4">
            Lanzamientos
          </p>
          <h2
            className="text-[60px] md:text-[80px] text-white tracking-tight leading-none"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NOVEDADES
            <br />
            <span className="text-green-500">& DROPS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              className="relative overflow-hidden bg-[#111113] border border-white/[0.06] group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ borderColor: "rgba(34,197,94,0.3)" }}
            >
              {/* Image */}
              {c.image_url && (
                <div className="relative overflow-hidden h-64">
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/40 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className={`${c.image_url ? "absolute inset-0" : ""} flex flex-col justify-end p-6`}>
                <span className="text-green-500 text-[9px] font-bold uppercase tracking-[0.4em] mb-3">
                  Drop
                </span>
                <h3
                  className="text-white text-3xl md:text-4xl leading-tight mb-2"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  {c.title}
                </h3>
                {c.description && (
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mt-2">
                    {c.description}
                  </p>
                )}
                {c.target_category && (
                  <div className="mt-4">
                    <span className="border border-white/10 text-gray-500 text-[9px] uppercase tracking-[0.3em] px-3 py-1">
                      {c.target_category}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
