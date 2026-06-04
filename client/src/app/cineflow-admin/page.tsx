"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Key, Mail, Lock, Zap, Server } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in as admin
    const checkAdminAuth = async () => {
      try {
        const res = await api.get('/admin/profile');
        if (res.data?.admin) {
          router.push('/cineflow-admin/dashboard');
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    };
    checkAdminAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post('/admin/login', {
        email,
        password,
        securityKey
      });

      if (res.data.success) {
        localStorage.setItem("admin_persistent", "true");
        router.push("/cineflow-admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Server className="text-pink-400" size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Nexus Admin</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Creator OS Framework</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-1">Initialize Session</h2>
            <p className="text-xs text-gray-400">Enter credentials to access the central node.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexus.io"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-white placeholder-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Security Key</label>
                <span className="text-[10px] text-gray-500 cursor-help" title="Your unique administrator access key">Help?</span>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                </div>
                <input 
                  type="password" 
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="NEXUS-XXX"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-white placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Initialize Session <Zap size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
             <div className="text-[9px] text-gray-500 font-mono tracking-widest">ENCRYPTED END-TO-END • AES-256 STANDARD</div>
          </div>
        </motion.div>

        {/* Footer Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between w-full px-4 text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-400">System Status: <span className="text-green-400 font-bold">Online</span></span>
          </div>
          <span className="text-gray-500">v2.4.0</span>
        </motion.div>
      </div>
    </div>
  );
}
