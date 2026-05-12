"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, ShoppingBag, DollarSign, Mail, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  waitlistCount: number;
  avgTicket: number;
}

interface BestSellingItem { name: string; qty: number; revenue: number; }
interface LowStockItem { name: string; total: number; image?: string | null; }
interface OutOfStockItem { name: string; image?: string | null; }

const StatCard = ({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent?: string;
}) => (
  <div className="bg-white border border-[#111111]/10 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[#B8B8B8] text-xs font-bold uppercase tracking-widest">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ?? "bg-[#556B5D]/20"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-white" : "text-[#556B5D]"}`} />
      </div>
    </div>
    <p className="text-[#111111] font-black text-3xl">{value}</p>
    {sub && <p className="text-[#B8B8B8] text-xs mt-1">{sub}</p>}
  </div>
);

export function DashboardClient({
  stats,
  chartData,
  bestSelling,
  lowStock,
  outOfStock,
}: {
  stats: Stats;
  chartData: { month: string; revenue: number }[];
  bestSelling: BestSellingItem[];
  lowStock: LowStockItem[];
  outOfStock: OutOfStockItem[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#111111] font-black text-2xl">Dashboard</h1>
        <p className="text-[#B8B8B8] text-sm mt-1">Resumen general de GOAT SPORTWEAR</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={DollarSign} label="Ingresos totales" value={formatPrice(stats.totalRevenue)} sub="Pedidos pagados" />
        <StatCard icon={ShoppingBag} label="Pedidos" value={stats.totalOrders.toString()} sub="Total registrados" />
        <StatCard icon={TrendingUp} label="Ticket promedio" value={stats.avgTicket > 0 ? formatPrice(stats.avgTicket) : "—"} sub="Por pedido pagado" />
        <StatCard icon={Package} label="Productos" value={stats.totalProducts.toString()} sub="Activos en tienda" />
        <StatCard icon={Mail} label="Suscriptores" value={stats.waitlistCount.toString()} sub="Waitlist" />
      </div>

      {/* Low stock + out of stock alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {lowStock.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-orange-400 font-black text-sm uppercase tracking-wider">Stock bajo ({lowStock.length})</h3>
              </div>
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    {p.image && <img src={p.image} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111111] text-xs font-bold truncate">{p.name}</p>
                    </div>
                    <span className="text-orange-400 font-black text-xs flex-shrink-0">{p.total} ud.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {outOfStock.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-red-400 font-black text-sm uppercase tracking-wider">Sin stock ({outOfStock.length})</h3>
              </div>
              <div className="space-y-2">
                {outOfStock.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    {p.image && <img src={p.image} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />}
                    <p className="text-[#111111] text-xs font-bold truncate flex-1">{p.name}</p>
                    <span className="text-red-400 font-black text-xs flex-shrink-0">Agotado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-[#111111]/10 rounded-2xl p-5">
        <h2 className="text-[#111111] font-black text-base mb-5">Ingresos mensuales</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-[#B8B8B8] text-sm">
            Sin datos aún. Registrá pedidos para ver las métricas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#556B5D" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#556B5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,17,17,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#B8B8B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B8B8B8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid rgba(17,17,17,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#111111", fontWeight: 700 }}
                formatter={(v) => [formatPrice(Number(v)), "Ingresos"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#556B5D" strokeWidth={2}
                fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#556B5D" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Best selling */}
      {bestSelling.length > 0 && (
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-5">
          <h2 className="text-[#111111] font-black text-base mb-4">Productos más vendidos</h2>
          <div className="space-y-3">
            {bestSelling.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-[#B8B8B8] text-xs font-black w-5 flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#111111] text-sm font-bold truncate">{p.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#111111] font-black text-sm">{p.qty} ud.</p>
                  <p className="text-[#B8B8B8] text-xs">{formatPrice(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state tip */}
      {stats.totalOrders === 0 && (
        <div className="bg-[#556B5D]/10 border border-[#556B5D]/20 rounded-2xl p-5">
          <p className="text-[#556B5D] font-bold text-sm mb-1">¡Bienvenido al panel! 🐐</p>
          <p className="text-[#2B2B2B] text-xs">Empezá cargando tus productos en la sección <strong className="text-[#111111]">Productos</strong>. Cuando recibas pedidos, registralos en <strong className="text-[#111111]">Pedidos</strong> para ver las métricas acá.</p>
        </div>
      )}
    </div>
  );
}
