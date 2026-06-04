"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!token) throw new Error("No reset token found in URL");
      if (password !== confirmPassword) throw new Error("Passwords do not match");
      
      await api.post(`/auth/reset-password/${token}`, { password });
      window.location.href = "/login";
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || "Failed to reset password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter mb-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span>CineFlow</span>
          </Link>
          <h2 className="text-xl font-bold mb-1">Reset your password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
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
            {/* Password strength bar */}
            <div className="mt-2 flex gap-1">
              <div className="h-1 flex-1 bg-purple-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-purple-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-purple-500 rounded-full"></div>
              <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
            </div>
            <div className="text-right text-[10px] text-purple-400 font-bold mt-1">Strong</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
             <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18} />
             <div>
               <div className="text-xs font-bold text-blue-400 mb-1">Secure your account</div>
               <div className="text-[10px] text-gray-400">Use at least 12 characters, including numbers and special symbols.</div>
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
            <span className="text-xl">→</span>
          </button>

          <div className="mt-6 text-center">
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-between gap-2 text-[8px] text-gray-600 uppercase tracking-widest font-bold border-t border-white/5 pt-4">
           <span>🛡️ End-to-end encryption</span>
           <span>🤖 AI Protected</span>
        </div>
      </motion.div>
    </div>
  );
}
