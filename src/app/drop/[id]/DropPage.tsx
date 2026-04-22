"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, CheckCircle, Loader2, ArrowLeft, Lock, Shield, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Campaign } from "@/types/admin";
import { formatPrice } from "@/lib/utils";
import { Header } from "@/components/storefront/Header";
import { Cart } from "@/components/storefront/Cart";

// ── Countdown ──────────────────────────────────────────────────────────────
function useCountdown(target?: string) {
  const calc = () => {
    if (!target) return null;
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

function CountdownBlock({ target }: { target: string }) {
  const time = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (!time) return (
    <div className="flex items-center gap-2 text-green-500 text-sm font-black uppercase tracking-widest">
      <Timer className="w-4 h-4" /> Reservas abiertas
    </div>
  );
  return (
    <div className="flex items-center gap-4">
      {[
        { val: time.d, label: "días" },
        { val: time.h, label: "hs" },
        { val: time.m, label: "min" },
        { val: time.s, label: "seg" },
      ].map(({ val, label }) => (
        val > 0 || label === "min" || label === "seg" ? (
          <div key={label} className="text-center">
            <div
              className="text-4xl md:text-5xl text-white tabular-nums"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {pad(val)}
            </div>
            <div className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mt-1">{label}</div>
          </div>
        ) : null
      ))}
    </div>
  );
}

// ── Waitlist form ──────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, source: "drop" }),
      });
      if (res.ok) setStatus("success");
      else if (res.status === 409) setStatus("duplicate");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" || status === "duplicate") {
    return (
      <motion.div
        className="flex flex-col items-center gap-3 py-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="text-white font-black uppercase tracking-widest text-sm">
          {status === "success" ? "¡Estás en la lista!" : "Ya estás anotado ✓"}
        </p>
        <p className="text-gray-500 text-xs text-center">
          Cuando abran las reservas, te avisamos primero.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:w-36 px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50"
        />
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
      >
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "QUIERO ACCESO ANTICIPADO"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs text-center">Algo salió mal. Intentá de nuevo.</p>
      )}
    </form>
  );
}

// ── Reservation form ───────────────────────────────────────────────────────
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function ReservationForm({ campaign }: { campaign: Campaign }) {
  const depositPct = campaign.deposit_percentage ?? 30;
  const unitPrice = campaign.unit_price ?? 0;
  const depositAmount = Math.round(unitPrice * depositPct / 100);
  const balanceAmount = unitPrice - depositAmount;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    size: campaign.target_category ? "" : "Único",
    quantity: 1,
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const needsSize = !!campaign.target_category;
  const totalDeposit = depositAmount * form.quantity;
  const totalBalance = balanceAmount * form.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsSize && !form.size) return;
    if (!form.name || !form.phone) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/preventa/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          size: form.size,
          quantity: form.quantity,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Error al procesar"); setStatus("error"); return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Price breakdown */}
      <div className="bg-white/[0.03] border border-white/10 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Precio del producto</span>
          <span className="text-white font-bold">{formatPrice(unitPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-400 font-bold">Seña ahora ({depositPct}%)</span>
          <span className="text-green-400 font-black">{formatPrice(totalDeposit)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-white/5 pt-2">
          <span className="text-gray-500">Saldo al recibir</span>
          <span className="text-gray-400">{formatPrice(totalBalance)}</span>
        </div>
      </div>

      {/* Size selector */}
      {needsSize && (
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Talle *</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, size: s }))}
                className={`w-12 h-12 text-sm font-bold border transition-all ${
                  form.size === s
                    ? "bg-green-500 text-black border-green-500"
                    : "border-white/15 text-gray-300 hover:border-white/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Cantidad</p>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setForm((f) => ({ ...f, quantity: q }))}
              className={`w-10 h-10 text-sm font-bold border transition-all ${
                form.quantity === q
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-gray-300 hover:border-white/40"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre *</p>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">WhatsApp *</p>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
            placeholder="+54 9 11 1234-5678"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email (opcional)</p>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      {/* Guarantees */}
      <div className="space-y-2">
        {[
          { icon: Shield, text: "Si no podemos cumplir, devolvemos el 100% sin preguntas" },
          { icon: Lock, text: "Tu unidad queda guardada hasta el despacho" },
          { icon: RotateCcw, text: "El saldo se cobra antes de enviar, no antes" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2">
            <Icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-500 text-xs">{text}</span>
          </div>
        ))}
      </div>

      {status === "error" && (
        <p className="text-red-400 text-xs text-center">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || (needsSize && !form.size) || !form.name || !form.phone}
        className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-sm uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          `RESERVAR — SEÑA ${formatPrice(totalDeposit)}`
        )}
      </button>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function DropPage({ campaign }: { campaign: Campaign }) {
  const allImages = campaign.images?.length
    ? campaign.images
    : campaign.image_url
    ? [campaign.image_url]
    : [];

  const isPreventaOpen = campaign.is_preventa && campaign.unit_price && campaign.unit_price > 0 &&
    (!campaign.preventa_closes_at || new Date(campaign.preventa_closes_at) > new Date());

  const [activeTab, setActiveTab] = useState<"waitlist" | "reserva">(
    isPreventaOpen ? "reserva" : "waitlist"
  );

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <Cart />

      {/* Hero */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background image */}
        {allImages.length > 0 && (
          <div className="absolute inset-0">
            <img
              src={allImages[0]}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/60 via-[#09090b]/40 to-[#09090b]" />
          </div>
        )}

        {/* Content */}
        <div className="relative flex-1 flex flex-col justify-end max-w-4xl mx-auto w-full px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors mb-12"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver
            </Link>

            <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
              Drop Limitado
            </p>

            <h1
              className="text-[64px] md:text-[100px] text-white leading-none tracking-tight mb-6"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {campaign.title}
            </h1>

            {/* Countdown */}
            {campaign.countdown_ends_at && (
              <div className="mb-8">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mb-4">
                  {isPreventaOpen ? "Reservas cierran en" : "Lanzamiento en"}
                </p>
                <CountdownBlock target={campaign.countdown_ends_at} />
              </div>
            )}

            {campaign.description && (
              <p className="text-gray-300 text-base max-w-lg leading-relaxed mb-10">
                {campaign.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-12">
              <span className="border border-white/10 text-gray-500 text-[9px] uppercase tracking-[0.3em] px-3 py-1.5">
                Stock limitado
              </span>
              <span className="border border-white/10 text-gray-500 text-[9px] uppercase tracking-[0.3em] px-3 py-1.5">
                Sin restock
              </span>
              {campaign.is_preventa && (
                <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] uppercase tracking-[0.3em] px-3 py-1.5">
                  Reserva con {campaign.deposit_percentage}% de seña
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action section */}
      <div className="max-w-xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Tabs */}
          {isPreventaOpen && (
            <div className="flex mb-8 border-b border-white/10">
              <button
                onClick={() => setActiveTab("reserva")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === "reserva"
                    ? "text-green-500 border-b-2 border-green-500 -mb-px"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                Reservar lugar
              </button>
              <button
                onClick={() => setActiveTab("waitlist")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === "waitlist"
                    ? "text-white border-b-2 border-white -mb-px"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                Solo anotarme
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "reserva" && isPreventaOpen ? (
              <motion.div
                key="reserva"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">
                  Reservá tu unidad con una seña. Pagás el saldo cuando enviamos.
                </p>
                <ReservationForm campaign={campaign} />
              </motion.div>
            ) : (
              <motion.div
                key="waitlist"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">
                  Anotate y avisamos antes que nadie cuando abran las reservas.
                </p>
                <WaitlistForm />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
