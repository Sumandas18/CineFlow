"use client";
import React, { useEffect, useState } from "react";
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
  Bell
} from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.metrics);
          setUsers(res.data.users || []);
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
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
          <div className="text-xs text-purple-400 font-mono tracking-widest animate-pulse">SYNCING WITH NEXUS_CORE...</div>
        </div>
      </div>
    );
  }

  // Format large numbers for revenue
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(stats?.totalRevenue || 1248590.45);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Top Banner - Revenue Projection */}
      <motion.div variants={itemVariants} className="bg-[#121212] border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-pink-500/20 transition-colors duration-1000"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              Live Projections
            </div>
            
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Projected Revenue</h3>
            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              {formattedRevenue}
            </div>

            {/* Mock Line Chart */}
            <div className="h-24 w-full max-w-md relative mt-6 flex items-end pb-2">
              <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 80 Q 20 60, 40 80 T 80 50 T 100 20" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              </svg>
              <div className="absolute right-0 bottom-0 text-xs font-bold text-green-400 flex items-center gap-1">
                <TrendingUp size={12} /> +12.4% vs last mo.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
            {/* Circular Progress Mock */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="url(#circleGrad)" strokeWidth="8" 
                  strokeDasharray="283" strokeDashoffset="62" strokeLinecap="round"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 62 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">98%</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Success Rate</span>
              </div>
            </div>
            
            <button className="px-6 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2">
              Export Report <Download size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* API Latency */}
        <motion.div variants={itemVariants} className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Activity size={20} />
            </div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Optimal</span>
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Queued Reels</h3>
          <div className="text-3xl font-black text-white mb-4">{stats?.reelsInQueue || 0}</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
             <div className="w-[15%] h-full bg-cyan-400 rounded-full"></div>
          </div>
          <p className="text-[9px] text-gray-500 mt-3 font-mono">Render queue is currently stable.</p>
        </motion.div>

        {/* Uptime Status */}
        <motion.div variants={itemVariants} className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Server size={20} />
            </div>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Active</span>
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Failed Exports</h3>
          <div className="text-3xl font-black text-white mb-4">{stats?.failedExports || 0}</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
             <div className="w-[5%] h-full bg-purple-400 rounded-full"></div>
          </div>
          <p className="text-[9px] text-gray-500 mt-3 font-mono">Auto-retry mechanism is handling errors.</p>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div variants={itemVariants} className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">Live Activity</h3>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: UserPlus, color: "text-green-400", bg: "bg-green-400/10", title: "New user generated a 15s reel", time: "2 mins ago • Render Server 1" },
              { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-400/10", title: "System processing bulk render", time: "15 mins ago • Auto-Scale" },
              { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", title: "Spike in API usage detected", time: "42 mins ago • Monitoring" }
            ].map((activity, i) => {
               const Icon = activity.icon;
               return (
                 <div key={i} className="flex items-start gap-3">
                   <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                     <Icon size={12} />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-gray-200">{activity.title}</p>
                     <p className="text-[9px] text-gray-500 mt-0.5 font-mono">{activity.time}</p>
                   </div>
                 </div>
               )
            })}
          </div>
        </motion.div>
      </div>

      {/* User Ecosystem Table */}
      <motion.div variants={itemVariants} className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">User Ecosystem</h3>
            <p className="text-xs text-gray-400">Managing {stats?.totalUsersCount || 14204} registered content creators.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search creators..." 
                 className="pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-48 transition-colors"
               />
             </div>
             <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors">
               <Filter size={14} className="text-gray-400" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user, i) => (
                <tr key={user._id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">{user.name || 'Anonymous User'}</div>
                        <div className="text-[10px] text-gray-500">{user.email || 'user@example.com'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                      {user.subscription?.plan || 'Free'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'deactivated' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className="text-xs text-gray-300 capitalize">{user.status || 'Active'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 flex items-center gap-1.5 border border-white/10">
                        <Bell size={12} /> Reminder
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Fallback items if database has less than 3 users */}
              {users.length === 0 && (
                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 px-4" colSpan={5}>
                    <div className="text-center text-sm text-gray-500 py-4">No users found. System empty.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] text-gray-500 font-mono">Showing {Math.min(5, users.length)} of {stats?.totalUsersCount || users.length} creators</div>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px] text-white">1</button>
            <button className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-gray-400 hover:bg-white/10">&gt;</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
