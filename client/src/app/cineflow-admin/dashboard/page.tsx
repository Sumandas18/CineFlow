"use client";
import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Download, 
  Activity, 
  Server, 
  Filter,
  Search,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  MoreHorizontal,
  Bell,
  Sparkles,
  Users
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Line } from "recharts";
import api from "@/lib/api";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<{name: string, price: number} | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    autoDeleteFailed: false,
    platformName: 'CineFlow',
    supportEmail: 'support@cineflow.ai'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.metrics);
          setUsers(res.data.users || []);
        }
        const planRes = await api.get('/plans');
        if (planRes.data.success) {
          setPlans(planRes.data.plans || []);
        }
        const settingsRes = await api.get('/admin/settings');
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.settings);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <div className="text-xs text-blue-400 font-mono tracking-widest animate-pulse">SYNCING WITH NEXUS_CORE...</div>
        </div>
      </div>
    );
  }

  // Format large numbers for revenue
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(stats?.totalRevenue || 1248590.45);

  const activityChartData = [
    { name: 'Jan', revenue: 4000, generations: 2400 },
    { name: 'Feb', revenue: 3000, generations: 1398 },
    { name: 'Mar', revenue: 5000, generations: 3800 },
    { name: 'Apr', revenue: 4500, generations: 3908 },
    { name: 'May', revenue: 6000, generations: 4800 },
    { name: 'Jun', revenue: 5500, generations: 3800 },
    { name: 'Jul', revenue: 8000, generations: 7300 },
  ];

  if (currentTab === 'analytics') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black tracking-tighter">User Analytics</h1>
          <button className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20 hover:bg-blue-500/20 transition-colors">Export Data</button>
        </div>
        
        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[ 
            { title: "Daily Active Users", value: "8,432", change: "+14%", color: "cyan" },
            { title: "Avg. Session Length", value: "12m 45s", change: "+2%", color: "pink" },
            { title: "Churn Rate", value: "1.2%", change: "-0.5%", color: "green" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className={`bg-[#121212] border border-blue-900/40 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl group-hover:bg-${stat.color}-500/20 transition-colors`}></div>
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 relative z-10">{stat.title}</h3>
              <div className="text-3xl font-black text-white mb-2 relative z-10">{stat.value}</div>
              <div className={`text-xs font-bold text-${stat.color}-400 relative z-10 flex items-center gap-1`}><TrendingUp size={12} /> {stat.change} vs last week</div>
            </motion.div>
          ))}
        </div>

        {/* Real User Data Table */}
        <div className="bg-[#121212]/80 backdrop-blur-md border border-blue-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Users size={16} className="text-cyan-400"/> Registered Users List
            </h3>
            <div className="text-[10px] text-slate-500 font-mono">Total: {users.length} Users</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-900/40">
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Info</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Join Date</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Plan</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Validity</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  let daysLeft = 'Lifetime';
                  let isEndingSoon = false;
                  
                  if (user.subscription?.endDate) {
                    const diffTime = new Date(user.subscription.endDate).getTime() - new Date().getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                      daysLeft = 'Expired';
                    } else {
                      daysLeft = `${diffDays} Days`;
                      if (diffDays <= 2) isEndingSoon = true;
                    }
                  } else if (user.subscription?.plan && user.subscription.plan !== 'free') {
                     // Assume 30 days from updated at if no end date provided for paid plans
                     daysLeft = 'Unknown';
                  }

                  return (
                    <tr key={user._id} className="border-b border-blue-900/40 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center font-bold text-xs text-white border border-blue-800/30">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-200">{user.name || 'User'}</div>
                            <div className="text-[10px] text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md bg-white/5 border border-blue-800/30 text-[10px] font-bold uppercase tracking-wider ${user.subscription?.plan === 'free' ? 'text-slate-400' : 'text-cyan-400'}`}>
                          {user.subscription?.plan || 'Free'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`text-xs font-bold ${isEndingSoon ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                          {user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Lifetime'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">{daysLeft}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={async (e) => {
                            const newStatus = user.status === 'deactivated' ? 'active' : 'deactivated';
                            try {
                              const res = await api.put(`/admin/users/${user._id}/status`, { status: newStatus });
                              if(res.data.success) {
                                setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
                              }
                            } catch(err) {
                              console.error(err);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ml-auto transition-colors ${user.status === 'deactivated' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'deactivated' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                          {user.status === 'deactivated' ? 'Deactivated' : 'Active'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">No users found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (currentTab === 'tools') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black tracking-tighter mb-4">Creator Tools & AI Control</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Model Settings */}
          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>
            <h3 className="text-sm font-bold text-white mb-6">Active AI Engine</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-black/50 border border-blue-800/30 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-colors">
                <div>
                  <div className="text-sm font-bold text-blue-400 flex items-center gap-2">gemini-3.5-flash <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Primary Engine. The latest and most advanced AI vision model.</div>
                </div>
                <div className="w-4 h-4 rounded-full border-4 border-blue-500 bg-black"></div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-blue-800/30 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-colors opacity-70">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">gemini-2.5-flash <span className="bg-yellow-500/20 text-yellow-400 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/30">AUTO-FALLBACK</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Secondary engine if 3.5 is overloaded.</div>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-600 bg-transparent"></div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-blue-800/30 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-colors opacity-70">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">gemini-1.5-flash <span className="bg-yellow-500/20 text-yellow-400 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/30">AUTO-FALLBACK</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Secondary engine if 2.5 is overloaded.</div>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-600 bg-transparent"></div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-blue-800/30 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-colors opacity-50">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">gemini-1.5-pro <span className="bg-yellow-500/20 text-yellow-400 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/30">AUTO-FALLBACK</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Slower, higher accuracy. Used as final fallback.</div>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-600 bg-transparent"></div>
              </div>
            </div>
          </motion.div>

          {/* Global Prompt Manager */}
          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4">Global System Prompt</h3>
            <p className="text-[10px] text-slate-400 mb-4">This prompt is injected before every user request to guide the AI's tone and behavior.</p>
            
            <div className="flex-1 bg-black/50 rounded-2xl border border-blue-800/30 p-4 relative font-mono text-xs text-green-400 shadow-inner overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-3 py-1 bg-white/10 rounded-lg text-white text-[10px] hover:bg-white/20">Edit</button>
              </div>
              &gt; You are a viral social media expert.<br/><br/>
              &gt; RULE 1: Never use offensive language.<br/>
              &gt; RULE 2: Maximize engagement with Gen-Z slang where appropriate.<br/>
              &gt; RULE 3: Keep hashtags under 15.<br/><br/>
              <span className="animate-pulse">_</span>
            </div>
          </motion.div>
        </div>

        {/* Moderation Panel */}
        <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 shadow-xl mt-6">
          <h3 className="text-sm font-bold text-white mb-6">Moderation & Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Strict Profanity Filter", desc: "Blocks all NSFW and aggressive text.", active: true },
              { name: "Political Content Ban", desc: "Prevents generating captions about politics.", active: true },
              { name: "Competitor Mention Block", desc: "Blocks mentions of other AI apps.", active: false }
            ].map((mod, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-blue-900/40">
                <div>
                  <div className="text-sm font-bold text-slate-200">{mod.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{mod.desc}</div>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${mod.active ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${mod.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }
  if (currentTab === 'plans') {
    const handleSavePrice = async () => {
      if (!editingPlan) return;
      
      const newPrice = Number(newPriceInput);
      if (isNaN(newPrice) || newPrice < 0) {
        alert('Please enter a valid price.');
        return;
      }

      setUpdatingPrice(true);
      try {
        const res = await api.put('/plans', { name: editingPlan.name, price: newPrice });
        if (res.data.success) {
          setPlans(plans.map(p => p.name === editingPlan.name ? { ...p, price: newPrice } : p));
          setEditingPlan(null);
        }
      } catch (err: any) {
        alert('Failed to update plan: ' + (err.response?.data?.message || err.message));
      } finally {
        setUpdatingPrice(false);
      }
    };

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 relative">
        
        {/* Custom Price Edit Modal */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="bg-[#121212] border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-black text-white mb-2">Edit {editingPlan.name}</h3>
              <p className="text-xs text-slate-400 mb-6">Enter the new price for this subscription tier.</p>
              
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number" 
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full bg-black/50 border border-blue-800/30 rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingPlan(null)}
                  disabled={updatingPrice}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePrice}
                  disabled={updatingPrice}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] flex justify-center items-center gap-2"
                >
                  {updatingPrice ? <RefreshCw size={16} className="animate-spin" /> : "Save Price"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <h1 className="text-2xl font-black tracking-tighter mb-4">Subscription & Monetization</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.length > 0 ? plans.map((plan, i) => {
            const color = plan.name === 'Starter' ? 'gray' : plan.name === 'Creator Pro' ? 'pink' : 'purple';
            const tokens = plan.name === 'Starter' ? 50 : plan.name === 'Creator Pro' ? 300 : 'Unlimited';
            return (
              <motion.div key={i} variants={itemVariants} className={`bg-[#121212] border border-blue-900/40 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-3xl p-6 relative overflow-hidden flex flex-col group transition-all duration-300`}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-black text-white mb-6">₹{plan.price}<span className="text-xs text-slate-500">/{plan.name === 'Starter' ? '3 Months' : plan.name === 'Creator Pro' ? '6 Months' : '12 Months'}</span></div>
                
                <div className="flex-1 space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-300"><span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span> {tokens} Tokens</div>
                  <div className="flex items-center gap-2 text-sm text-slate-300"><span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span> Premium Support</div>
                  <div className="flex items-center gap-2 text-sm text-slate-300"><span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span> AI Video Analysis</div>
                </div>
                
                <button onClick={() => { setEditingPlan(plan); setNewPriceInput(plan.price.toString()); }} className={`w-full py-3 rounded-xl font-bold text-xs bg-white/5 text-slate-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300`}>Edit Price</button>
              </motion.div>
            )
          }) : <div className="col-span-3 text-center text-slate-500 py-10">Loading plans...</div>}
        </div>

        <div className="mt-6">
          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 lg:w-1/2">
            <h3 className="text-sm font-bold text-white mb-4">Revenue Breakdown</h3>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                 {/* Fake CSS Pie Chart */}
                 <div className="w-full h-full rounded-full border-[12px] border-blue-500 relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }}></div>
                 <div className="w-full h-full rounded-full border-[12px] border-cyan-500 absolute inset-0" style={{ clipPath: 'polygon(0 50%, 100% 100%, 0 100%)' }}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">100%</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm text-slate-300">Pro Plan (65%)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div><span className="text-sm text-slate-300">Unlimited (35%)</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  if (currentTab === 'health') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black tracking-tighter mb-4">System Health & Telemetry</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-cyan-500/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">Server CPU</h3>
            <div className="w-32 h-32 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#222" strokeWidth="6" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="6" strokeDasharray="251" strokeDashoffset="150" />
              </svg>
              <span className="absolute text-2xl font-black text-white">42%</span>
            </div>
            <p className="text-[10px] font-mono text-cyan-400 animate-pulse">Running Optimal</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-blue-500/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">Memory Usage</h3>
            <div className="w-32 h-32 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#222" strokeWidth="6" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="6" strokeDasharray="251" strokeDashoffset="80" />
              </svg>
              <span className="absolute text-2xl font-black text-white">68%</span>
            </div>
            <p className="text-[10px] font-mono text-blue-400">12.4 GB / 16 GB</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(236,72,153,0.1)]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Gemini API Cost Tracker</h3>
            <div className="text-4xl font-black text-white mb-2">$342.50</div>
            <div className="text-xs text-cyan-400 font-bold mb-6">This Month</div>
            
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
              <div className="w-[60%] h-full bg-cyan-500 rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$0</span>
              <span>Limit: $500</span>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-black border border-blue-800/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs font-bold text-slate-500 font-mono">live_server_logs.sh</span>
          </div>
          <div className="font-mono text-[11px] leading-relaxed text-green-400/80 max-h-48 overflow-y-auto scrollbar-hide space-y-1">
            <p>[2026-06-04 14:15:01] INFO: Connected to MongoDB cluster.</p>
            <p>[2026-06-04 14:15:05] HTTP: GET /api/admin/stats 200 OK - 42ms</p>
            <p className="text-yellow-400">[2026-06-04 14:17:22] WARN: Rate limit approaching for IP 192.168.1.5</p>
            <p>[2026-06-04 14:20:10] HTTP: POST /api/reels 201 CREATED - 1800ms</p>
            <p className="text-red-400">[2026-06-04 14:22:05] ERROR: CloudinaryUploadFailed - Invalid signature.</p>
            <p>[2026-06-04 14:22:06] INFO: Auto-retrying upload (1/3)...</p>
            <p>[2026-06-04 14:22:08] INFO: Upload successful on retry.</p>
            <p className="animate-pulse">_</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  if (currentTab === 'settings') {
    const handleToggle = async (field: string) => {
      const newValue = !settings[field];
      setSettings({ ...settings, [field]: newValue });
      try {
        await api.put('/admin/settings', { [field]: newValue });
      } catch (err) {
        setSettings({ ...settings, [field]: !newValue });
        alert('Failed to update setting');
      }
    };

    const handleSaveBrand = async () => {
      try {
        await api.put('/admin/settings', { platformName: settings.platformName, supportEmail: settings.supportEmail });
        alert('Brand settings saved successfully!');
      } catch (err) {
        alert('Failed to save settings');
      }
    };

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black tracking-tighter mb-4">Platform Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 relative overflow-hidden group">
            <h3 className="text-sm font-bold text-white mb-6">Global Controls</h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <div>
                <div className="text-sm font-bold text-red-400">Maintenance Mode</div>
                <div className="text-[10px] text-slate-500 mt-1">Take the entire site offline for normal users.</div>
              </div>
              <div onClick={() => handleToggle('maintenanceMode')} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-blue-900/40 mt-4">
              <div>
                <div className="text-sm font-bold text-slate-200">Auto-Delete Failed Reels</div>
                <div className="text-[10px] text-slate-500 mt-1">Clean up database automatically.</div>
              </div>
              <div onClick={() => handleToggle('autoDeleteFailed')} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${settings.autoDeleteFailed ? 'bg-blue-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoDeleteFailed ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#121212] border border-blue-900/40 rounded-3xl p-6 relative overflow-hidden group">
            <h3 className="text-sm font-bold text-white mb-6">Brand Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold mb-2 block">Platform Name</label>
                <input type="text" value={settings.platformName} onChange={(e) => setSettings({...settings, platformName: e.target.value})} className="w-full bg-black/50 border border-blue-800/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold mb-2 block">Support Email</label>
                <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} className="w-full bg-black/50 border border-blue-800/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleSaveBrand} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors mt-2">Save Changes</button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative rounded-3xl p-8 overflow-hidden bg-[#121212]/80 backdrop-blur-xl border border-blue-800/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
              CineFlow Admin <Sparkles size={24} className="text-cyan-400" />
            </h1>
            <p className="text-slate-400 text-sm">System is running at <span className="text-green-400 font-bold">98.4% efficiency</span>. 1,420 AI models successfully processed today.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-blue-800/30 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center gap-2">
              <RefreshCw size={16} /> Sync Data
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 shadow-lg shadow-cyan-500/25 text-white text-sm font-bold transition-all flex items-center gap-2">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Revenue", value: formattedRevenue, icon: TrendingUp, color: "from-cyan-500 to-rose-500", shadow: "shadow-cyan-500/20", trend: "+12.4%" },
          { title: "Active Creators", value: stats?.totalUsersCount || "14,204", icon: Users, color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/20", trend: "+5.2%" },
          { title: "AI Generations", value: stats?.reelsInQueue || "84,592", icon: Sparkles, color: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20", trend: "+28.1%" },
          { title: "System Load", value: "42%", icon: Activity, color: "from-green-500 to-emerald-500", shadow: "shadow-green-500/20", trend: "Stable" }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} variants={itemVariants} className="group relative bg-[#121212]/50 backdrop-blur-md border border-blue-900/40 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg ${kpi.shadow}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 border border-blue-800/30 ${kpi.trend === 'Stable' ? 'text-slate-400' : 'text-green-400'}`}>
                  {kpi.trend}
                </span>
              </div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">{kpi.title}</h3>
              <div className="text-2xl font-black text-white tracking-tight relative z-10">{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#121212]/80 backdrop-blur-md border border-blue-800/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Platform Activity</h3>
              <p className="text-xs text-slate-400">Revenue vs Content Generation</p>
            </div>
            <select className="bg-black/50 border border-blue-800/30 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none focus:border-cyan-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(24,24,27,0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                  itemStyle={{ color: '#fff' }} 
                  formatter={(value: any, name: any) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'AI Generations']}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area yAxisId="right" type="monotone" dataKey="generations" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorGens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Microservices Status */}
        <motion.div variants={itemVariants} className="bg-[#121212]/80 backdrop-blur-md border border-blue-800/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white mb-1">Microservices</h3>
          <p className="text-xs text-slate-400 mb-8">Live system nodes</p>
          
          <div className="flex-1 space-y-6">
            {[
              { name: "Gemini Vision AI", status: "Operational", ping: "42ms", color: "bg-green-500" },
              { name: "Cloudinary CDN", status: "Operational", ping: "18ms", color: "bg-green-500" },
              { name: "MongoDB Atlas", status: "Operational", ping: "24ms", color: "bg-green-500" },
              { name: "Render Queue", status: "High Load", ping: "150ms", color: "bg-yellow-500" }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-blue-900/40 group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black border border-blue-800/30">
                    <div className={`w-2 h-2 rounded-full ${node.color} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{node.name}</div>
                    <div className="text-[10px] text-slate-500">{node.status}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400">{node.ping}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
