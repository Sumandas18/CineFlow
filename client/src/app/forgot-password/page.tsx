"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/auth/forgot-password`, { email });
      setSent(true);
    } catch (error) {
      console.error(error);
      setSent(true); // show success anyway for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter mb-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400 text-sm px-4">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="text-center relative z-10">
             <div className="bg-green-500/20 text-green-400 p-4 rounded-xl mb-6">
                Recovery link sent! Please check your email.
             </div>
             <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
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

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <span className="text-xl">→</span>
            </button>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
           <span>🛡️ End-to-end encrypted verification</span>
        </div>
      </motion.div>
    </div>
  );
}
