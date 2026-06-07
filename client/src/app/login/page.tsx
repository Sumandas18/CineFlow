"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);

  React.useEffect(() => {
    // Wake up Render free tier backend proactively
    api.get('/').catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/auth/login`, { email, password, remember });
      const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
      document.cookie = `token=${res.data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      if (remember) {
        localStorage.setItem('cineflow_persistent', 'true');
        localStorage.setItem('cineflow_token', res.data.token);
      } else {
        localStorage.removeItem('cineflow_persistent');
        sessionStorage.setItem('cineflow_session_active', 'true');
        sessionStorage.setItem('cineflow_token', res.data.token);
      }
      window.location.href = "/dashboard";
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to login");
      console.error(error);
    } finally {
      setLoading(false);
      setServerWaking(false);
    }
  };

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setServerWaking(true);
      }, 5000); // Show warning after 5s of loading
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter mb-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={16} className="text-white" />
            </div>
            <span>CineFlow</span>
          </Link>
          <p className="text-gray-400 text-sm">Empowering the next generation of digital creators.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="alex@creator.os"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-400">Password</label>
              <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">Forgot Password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded bg-black/50 border-white/10 text-purple-500 focus:ring-purple-500" />
            <label htmlFor="remember" className="text-sm text-gray-400">Remember this device</label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity mt-4 disabled:opacity-50 flex flex-col items-center justify-center h-16"
          >
            <span>{loading ? "Authenticating..." : "Login"}</span>
            {serverWaking && <span className="text-[10px] font-normal opacity-80 mt-1 animate-pulse">Waking up secure server... (up to 50s)</span>}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-gray-400 mb-4">OR CONTINUE WITH</p>
          <div className="flex gap-4">
            <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              Google
            </button>
            <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              Apple
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Don't have an account? <Link href="/signup" className="text-white hover:underline font-medium">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
