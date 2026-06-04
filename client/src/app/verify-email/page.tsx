"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.get(`/auth/verify-email/${otp}`);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Invalid or expired OTP token.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center mb-6">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 hover:opacity-80 transition-opacity">
            <Sparkles size={24} className="text-white" />
          </Link>
          <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
          <p className="text-gray-400 text-sm px-4">
            We sent a 6-digit OTP code to your email. Enter it below to activate your account.
          </p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 relative z-10"
          >
            <CheckCircle2 size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Verified!</h3>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 relative z-10">
            <div>
              <input 
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="w-full text-center tracking-widest text-2xl px-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="123456"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
