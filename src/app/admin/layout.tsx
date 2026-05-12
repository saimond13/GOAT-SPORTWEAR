"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="flex h-screen bg-[#F5F5F3] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex-shrink-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-[#111111]/10 bg-[#F5F5F3] flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[#B8B8B8] hover:text-[#111111] p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-[#556B5D] flex-shrink-0" />
            <span className="text-[#2B2B2B] text-xs font-medium truncate max-w-[120px]">
              {profile?.full_name ?? profile?.email ?? "Admin"}
            </span>
          </div>
        </header>

        {/* Page content — scrollable, responsive padding */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
