"use client";
import { useState, useEffect } from "react";

function calc(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export function FeaturedDropCountdown({ target }: { target: string }) {
  const [time, setTime] = useState(() => calc(target));

  useEffect(() => {
    const id = setInterval(() => setTime(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!time) return (
    <p className="text-[#556B5D] text-xs font-black uppercase tracking-[0.3em]">
      Reservas abiertas ahora
    </p>
  );

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { val: time.d, label: "Días" },
    { val: time.h, label: "Horas" },
    { val: time.m, label: "Min" },
    { val: time.s, label: "Seg" },
  ].filter(({ val, label }) => val > 0 || label === "Min" || label === "Seg");

  return (
    <div>
      <p className="text-[10px] text-[#B8B8B8] uppercase tracking-[0.3em] mb-3">Cierra en</p>
      <div className="flex items-end gap-4 sm:gap-8">
        {units.map(({ val, label }) => (
          <div key={label} className="text-center">
            <div
              className="text-3xl sm:text-5xl text-[#556B5D] tabular-nums"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {pad(val)}
            </div>
            <div className="text-[9px] text-[#B8B8B8] uppercase tracking-[0.3em] mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
