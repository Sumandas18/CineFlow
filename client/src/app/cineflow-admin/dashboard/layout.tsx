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

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    { name: "Dashboard", href: "/cineflow-admin/dashboard", icon: LayoutDashboard },
    { name: "User Analytics", href: "#", icon: Users },
    { name: "Creator Tools", href: "#", icon: ShieldAlert },
    { name: "Subscription Plans", href: "#", icon: CreditCard },
    { name: "System Health", href: "#", icon: Activity },
    { name: "Settings", href: "#", icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono">INITIALIZING NEXUS_CORE...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#121212] flex flex-col justify-between relative z-20">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-white/5 gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">CINE<span className="text-white">FLOW</span></h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={`transition-transform duration-300 ${isActive ? "text-pink-400 scale-110" : "group-hover:scale-110 group-hover:text-pink-300"}`} />
                  {item.name}
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-sm border-2 border-[#121212] shadow-lg">
              {admin?.name?.substring(0, 2).toUpperCase() || 'NA'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold truncate">{admin?.name || 'Nexus Admin'}</h3>
              <p className="text-[10px] text-green-400 uppercase tracking-widest truncate">Super Admin Access</p>
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
          <div className="text-center mt-3 text-[9px] text-gray-600 font-mono">v2.4.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Animated Background Gradient/Grid */}
        <div className="absolute inset-0 bg-[#0a0510] pointer-events-none">
           {/* Moving Grid Background */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
           {/* Animated Glowing Orbs */}
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.5, 0.3],
             }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               scale: [1, 1.5, 1],
               opacity: [0.2, 0.4, 0.2],
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[150px]" 
           />
        </div>

        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#121212]/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors hover:scale-110 duration-200">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-200">CineFlow Dashboard</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-[#121212]"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">Admin Core</div>
                <div className="text-[10px] text-green-400 flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Active Node
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400 font-bold text-xs">
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
