"use client";
import { motion } from "framer-motion";

import type { Campaign } from "@/types/admin";

export function CampaignsBanner({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section id="campaigns" className="bg-white py-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase mb-3">Lanzamientos</p>
          <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight">
            NOVEDADES<br /><span className="text-green-600">& DROPS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c, i) => (
            <motion.div key={c.id} className="relative overflow-hidden rounded-2xl bg-black group cursor-pointer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              {c.image_url && (
                <img src={c.image_url} alt={c.title}
                  className="w-full h-64 object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
              )}
              <div className={`${c.image_url ? "absolute inset-0" : ""} flex flex-col justify-end p-6`}>
                <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-2">Próximo lanzamiento</span>
                <h3 className="text-white font-black text-2xl">{c.title}</h3>
                {c.description && <p className="text-gray-300 text-sm mt-2">{c.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
