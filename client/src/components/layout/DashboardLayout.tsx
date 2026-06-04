"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { LayoutDashboard, Wand2, BarChart2, CreditCard, LogOut, Settings, Bell, Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [aiLimits, setAiLimits] = useState<any>(null);

  const fetchUser = useCallback(() => {
    api.get('/auth/me?t=' + new Date().getTime()).then(res => {
      if (res.data && res.data.user) {
        const userObj = res.data.user;
        userObj.name = userObj.name || 'Creator';
        userObj.initials = userObj.name.substring(0, 2).toUpperCase();
        
        if (userObj.avatar && !userObj.avatar.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
          userObj.avatar = `${baseUrl}/${userObj.avatar.replace(/^[/\\]+/, '')}`;
        }

        if (res.data.aiLimits) {
          setAiLimits(res.data.aiLimits);
        }
        setUser(userObj);
      }
    }).catch(err => {
      console.error("DashboardLayout fetchUser error:", err);
      // Let the individual pages handle redirection to avoid race conditions
    });
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('user-updated', fetchUser);

    fetchUser();

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('user-updated', fetchUser);
    };
  }, [fetchUser]);

  return (
    <div className="min-h-screen bg-transparent flex">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Topbar user={user} aiLimits={aiLimits} />
        <main className="flex-1 p-6 z-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: any }) {
    
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0">
      <Link href="/" className="p-6 border-b border-white/10 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tighter">CineFlow</span>
      </Link>
      
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 w-full">
          {user ? (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold overflow-hidden border border-white/20 shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <>{user.initials}</>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">{user.name}</div>
                <div className="text-xs text-purple-400 capitalize">{user.subscription?.plan || 'Free Plan'}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <NavItem href="/studio" icon={<Wand2 size={20} />} label="AI Studio" />
        <NavItem href="/analytics" icon={<BarChart2 size={20} />} label="Analytics" />
        <NavItem href="/pricing" icon={<CreditCard size={20} />} label="Pricing" />
      </nav>

      <div className="p-4 border-t border-white/10">
        <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-white/5">
          <LogOut size={20} />
          <span className="font-medium text-sm">Log Out</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Logout</h3>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                No, Cancel
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('cineflow_persistent');
                  sessionStorage.removeItem('cineflow_session_active');
                  api.post('/auth/logout').then(() => window.location.href = '/').catch(() => window.location.href = '/');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

export function Topbar({ user, aiLimits }: { user: any, aiLimits?: any }) {
  const isPremium = user?.subscription?.status === 'active';
  const isUnlimited = isPremium && user?.subscription?.plan === 'Unlimited Pro+';
  const totalCredits = aiLimits ? aiLimits.maxLimit : (isPremium ? 50 : 3);
  const creditsLeft = aiLimits ? aiLimits.remaining : 0;

  return (
    <div className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-end px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {user && (
          <div className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2 transition-all">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">⚡ {creditsLeft}/{totalCredits} Daily Tokens</span>
            {creditsLeft === 0 && <span className="text-xs text-orange-400/80 ml-1">(Limit Reached)</span>}
          </div>
        )}
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
