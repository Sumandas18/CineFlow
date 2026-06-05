"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  Activity,
  CreditCard,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import api from "@/lib/api";
import MeshGradientBackground from "@/components/ui/MeshGradientBackground";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        if (res.data.admin) {
          setAdmin(res.data.admin);
        } else {
          router.push('/cineflow-admin');
        }
      } catch (err) {
        router.push('/cineflow-admin');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Assuming you have a logout endpoint or just clear cookie on client side
      // if no endpoint exists, just clear local storage
      localStorage.removeItem("admin_persistent");
      // Actually backend needs a way to clear the HttpOnly cookie, but if not we can just redirect
      // For now, let's just clear the cookie by making a fake delete call or redirecting
      document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push('/cineflow-admin');
    } catch (e) {
      router.push('/cineflow-admin');
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/cineflow-admin/dashboard", id: "dashboard", icon: LayoutDashboard },
    { name: "User Analytics", href: "/cineflow-admin/dashboard?tab=analytics", id: "analytics", icon: Users },
    { name: "Creator Tools", href: "/cineflow-admin/dashboard?tab=tools", id: "tools", icon: ShieldAlert },
    { name: "Subscription Plans", href: "/cineflow-admin/dashboard?tab=plans", id: "plans", icon: CreditCard },
    { name: "System Health", href: "/cineflow-admin/dashboard?tab=health", id: "health", icon: Activity },
    { name: "Settings", href: "/cineflow-admin/dashboard?tab=settings", id: "settings", icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono">INITIALIZING NEXUS_CORE...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 border-r border-blue-900/40 bg-[#040f26]/95 lg:bg-[#040f26]/60 backdrop-blur-md flex flex-col justify-between fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:relative lg:translate-x-0'}`}>
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-blue-900/40 gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-1">CINE<span className="text-white">FLOW</span> <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-500/30">ADMIN</span></h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isDashboard = item.id === 'dashboard' && pathname === '/cineflow-admin/dashboard' && typeof window !== 'undefined' && !window.location.search.includes('tab=');
              const isActive = isDashboard || (typeof window !== 'undefined' && window.location.search.includes(`tab=${item.id}`));
              const Icon = item.icon;
              return (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                    isActive 
                      ? 'bg-blue-500/10 text-cyan-400 border border-blue-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={`transition-transform duration-300 ${isActive ? "text-cyan-400 scale-110" : "group-hover:scale-110 group-hover:text-cyan-300"}`} />
                  {item.name}
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-t border-blue-900/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a1b38]/50 border border-blue-800/30 relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-sm border-2 border-slate-900 shadow-lg text-white">
              {admin?.name?.substring(0, 2).toUpperCase() || 'NA'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold truncate text-slate-200">{admin?.name || 'Nexus Admin'}</h3>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest truncate">Super Admin Access</p>
            </div>
            
            {/* Logout Button on Hover */}
            <button 
              onClick={handleLogout}
              className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
          <div className="text-center mt-3 text-[9px] text-slate-500 font-mono">v2.5.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Animated Background Gradient/Grid */}
        <MeshGradientBackground />

        {/* Header */}
        <header className="h-20 border-b border-blue-900/40 bg-[#040f26]/40 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 relative z-10">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors hover:scale-110 duration-200 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-200 hidden sm:block">CineFlow Admin</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-blue-900/40">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">Admin Core</div>
                <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Active Node
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-cyan-400 font-bold text-xs">
                AC
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}
