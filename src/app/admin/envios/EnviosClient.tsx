"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Truck, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface ShippingZone {
  id: string;
  name: string;
  provinces: string[];
  price: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export function EnviosClient({ zones }: { zones: ShippingZone[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(zones.map((z) => [z.id, String(z.price)]))
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = async (zone: ShippingZone) => {
    const newPrice = parseFloat(prices[zone.id] ?? "0");
    if (isNaN(newPrice) || newPrice < 0) return;
    setSaving((s) => ({ ...s, [zone.id]: true }));
    const supabase = createClient();
    await supabase
      .from("shipping_zones")
      .update({ price: newPrice, updated_at: new Date().toISOString() })
      .eq("id", zone.id);
    setSaving((s) => ({ ...s, [zone.id]: false }));
    setSaved((s) => ({ ...s, [zone.id]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [zone.id]: false })), 2000);
    startTransition(() => router.refresh());
  };

  const handleToggle = async (zone: ShippingZone) => {
    const supabase = createClient();
    await supabase
      .from("shipping_zones")
      .update({ is_active: !zone.is_active })
      .eq("id", zone.id);
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 text-sm font-bold">Precios de referencia — Correo Argentino</p>
          <p className="text-gray-500 text-xs mt-0.5">
            Estos precios se muestran como estimados en el carrito. Actualizalos cuando Correo cambie sus tarifas.
            El precio final puede variar según el peso y dimensiones del paquete.
          </p>
        </div>
      </div>

      {/* Zones */}
      <div className="grid gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`bg-white/5 border rounded-2xl p-5 transition-opacity ${
              zone.is_active ? "border-white/10" : "border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-green-500" />
                  <h3 className="text-white font-black text-base">{zone.name}</h3>
                  {!zone.is_active && (
                    <span className="text-[9px] bg-white/10 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Desactivada
                    </span>
                  )}
                </div>
                {zone.description && (
                  <p className="text-gray-500 text-xs mb-3">{zone.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {zone.provinces.map((p) => (
                    <span key={p} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggle active */}
              <button
                onClick={() => handleToggle(zone)}
                className={`flex-shrink-0 w-10 h-5 rounded-full relative transition-colors ${
                  zone.is_active ? "bg-green-600" : "bg-white/10"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  zone.is_active ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            {/* Price editor */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Precio de envío (ARS)
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={prices[zone.id] ?? ""}
                    onChange={(e) => setPrices((p) => ({ ...p, [zone.id]: e.target.value }))}
                    className="w-36 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-black focus:outline-none focus:border-green-500 tabular-nums"
                  />
                  <span className="text-gray-600 text-xs">
                    actual: {formatPrice(zone.price)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSave(zone)}
                disabled={saving[zone.id] || parseFloat(prices[zone.id]) === zone.price}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
                  saved[zone.id]
                    ? "bg-green-600/20 text-green-400 border border-green-500/20"
                    : "bg-green-600 hover:bg-green-500 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                }`}
              >
                {saving[zone.id] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved[zone.id] ? (
                  "Guardado ✓"
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
