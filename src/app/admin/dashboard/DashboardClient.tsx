"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, ShoppingBag, DollarSign, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  waitlistCount: number;
}

const StatCard = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</span>
      <div className="w-9 h-9 bg-green-600/20 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-green-500" />
      </div>
    </div>
    <p className="text-white font-black text-3xl">{value}</p>
    {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
  </div>
);

export function DashboardClient({ stats, chartData }: { stats: Stats; chartData: { month: string; revenue: number }[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black text-2xl">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general de GOAT SPORTWEAR</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Ingresos totales" value={formatPrice(stats.totalRevenue)} sub="Pedidos pagados" />
        <StatCard icon={ShoppingBag} label="Pedidos" value={stats.totalOrders.toString()} sub="Total registrados" />
        <StatCard icon={Package} label="Productos" value={stats.totalProducts.toString()} sub="Activos en tienda" />
        <StatCard icon={Mail} label="Suscriptores" value={stats.waitlistCount.toString()} sub="Waitlist" />
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-white font-black text-base mb-5">Ingresos mensuales</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
            Sin datos aún. Registrá pedidos para ver las métricas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#fff", fontWeight: 700 }}
                formatter={(v) => [formatPrice(Number(v)), "Ingresos"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2}
                fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#16a34a" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Empty state tip */}
      {stats.totalOrders === 0 && (
        <div className="bg-green-600/10 border border-green-600/20 rounded-2xl p-5">
          <p className="text-green-400 font-bold text-sm mb-1">¡Bienvenido al panel! 🐐</p>
          <p className="text-gray-400 text-xs">Empezá cargando tus productos en la sección <strong className="text-white">Productos</strong>. Cuando recibas pedidos por WhatsApp, registralos en <strong className="text-white">Pedidos</strong> para ver las métricas acá.</p>
        </div>
      )}
    </div>
  );
}
