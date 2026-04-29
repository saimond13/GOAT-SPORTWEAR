"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, CheckCircle, Loader2, ArrowLeft, Lock, Shield, RotateCcw, Minus, Plus } from "lucide-react";
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
const SIZES = ["1", "2", "3"];
const TRANSFER_ALIAS = process.env.NEXT_PUBLIC_TRANSFER_ALIAS ?? "vanstrate";
const TRANSFER_HOLDER = process.env.NEXT_PUBLIC_TRANSFER_HOLDER ?? "Tadeo Vanstrate";
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";

interface ConfirmedData {
  registrationId: string;
  depositAmount: number;
  campaignTitle: string;
  customerName: string;
  size: string;
  quantity: number;
}

function TransferInstructions({ data }: { data: ConfirmedData }) {
  const waMsg = encodeURIComponent(
    `Hola! Acabo de reservar en el Drop "${data.campaignTitle}".\n` +
    `• Nombre: ${data.customerName}\n` +
    `• Talle: ${data.size} × ${data.quantity}\n` +
    `• Seña transferida: $${data.depositAmount.toLocaleString("es-AR")}\n` +
    `• N° de reserva: ${data.registrationId.slice(0, 8).toUpperCase()}\n\n` +
    `Te mando el comprobante de transferencia.`
  );

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-white font-black text-base uppercase tracking-wide">¡Reserva registrada!</p>
          <p className="text-gray-500 text-xs">N° {data.registrationId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <p className="text-gray-400 text-sm">
        Para confirmar tu lugar, transferí la seña y mandanos el comprobante por WhatsApp.
      </p>

      {/* Transfer details */}
      <div className="bg-white/[0.03] border border-green-500/20 p-4 space-y-3">
        <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Datos para transferir</p>
        <div className="space-y-2">
          {[
            { label: "Monto a transferir", value: `$${data.depositAmount.toLocaleString("es-AR")}`, highlight: true },
            { label: "Alias", value: TRANSFER_ALIAS },
            { label: "Titular", value: TRANSFER_HOLDER },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">{label}</span>
              <span className={`text-sm font-black ${highlight ? "text-green-400 text-base" : "text-white"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        MANDAR COMPROBANTE POR WHATSAPP
      </a>

      <p className="text-gray-600 text-xs text-center">
        Una vez que confirmemos la transferencia, tu reserva queda activa.
      </p>
    </motion.div>
  );
}

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
  const [confirmed, setConfirmed] = useState<ConfirmedData | null>(null);

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
      setConfirmed({
        registrationId: data.registrationId,
        depositAmount: data.depositAmount,
        campaignTitle: data.campaignTitle,
        customerName: form.name,
        size: form.size,
        quantity: form.quantity,
      });
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
      setStatus("error");
    }
  };

  if (confirmed) return <TransferInstructions data={confirmed} />;

  if (!unitPrice) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 text-center">
        <p className="text-yellow-400 text-sm font-bold">Las reservas abren pronto.</p>
        <p className="text-gray-500 text-xs mt-1">Anotate en la lista para ser el primero en enterarte.</p>
      </div>
    );
  }

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
          <div className="flex flex-wrap gap-2 mb-3">
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
          {/* Size chart */}
          {campaign.size_chart && campaign.size_chart.length > 0 && (
            <div className="mt-2 border border-white/10 overflow-hidden text-xs">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-1.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Talle</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">A — Largo</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">B — Ancho</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.size_chart.map((row) => (
                    <tr key={row.talle} className="border-t border-white/5">
                      <td className="px-3 py-1.5 text-white font-black">{row.talle}</td>
                      <td className="px-3 py-1.5 text-gray-300">{row.largo}</td>
                      <td className="px-3 py-1.5 text-gray-300">{row.ancho}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Cantidad</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
            className="w-10 h-10 border border-white/15 flex items-center justify-center text-gray-300 hover:border-white/40 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-white font-black text-lg w-8 text-center">{form.quantity}</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, quantity: f.quantity + 1 }))}
            className="w-10 h-10 border border-white/15 flex items-center justify-center text-gray-300 hover:border-white/40 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
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
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : `RESERVAR — SEÑA ${formatPrice(totalDeposit)}`}
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

  const isPreventaOpen = !!campaign.is_preventa &&
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

      {/* Image gallery */}
      {allImages.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {allImages.map((src, i) => (
              <div key={i} className={`overflow-hidden ${i === 0 ? "col-span-2 md:col-span-2 row-span-2" : ""}`}>
                <img
                  src={src}
                  alt={`${campaign.title} — ${i + 1}`}
                  className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
