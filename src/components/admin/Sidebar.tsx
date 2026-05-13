"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Megaphone, Mail, Users, LogOut, X, Boxes, Bookmark, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Productos" },
  { href: "/admin/stock", icon: Boxes, label: "Stock" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Pedidos" },
  { href: "/admin/campaigns", icon: Megaphone, label: "Campañas" },
  { href: "/admin/preventa", icon: Bookmark, label: "Preventa" },
  { href: "/admin/envios", icon: Truck, label: "Envíos" },
  { href: "/admin/waitlist", icon: Mail, label: "Waitlist" },
  { href: "/admin/users", icon: Users, label: "Admins" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="admin-sidebar w-60 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpg" alt="GOAT" className="h-8 w-auto object-contain" />
          <p className="text-[#556B5D] text-[9px] font-bold tracking-[0.2em] uppercase">Admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white md:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-[#556B5D]/20 text-[#556B5D]"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
