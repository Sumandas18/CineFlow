"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, User, Eye, EyeOff, Sparkles, Upload } from "lucide-react";
import api from "@/lib/api";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await api.post(`/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      window.location.href = "/verify-email";
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create account");
      console.error(error);
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/10 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tighter mb-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-gray-400 text-sm">Step into the future of high-octane content creation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Alex Creator"
              />
            </div>
          </div>

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
            <label className="block text-xs font-medium text-gray-400 mb-1">Profile Avatar (Optional)</label>
            <div className="relative">
              <input 
                type="file"
                accept="image/*"
                onChange={e => setAvatar(e.target.files?.[0] || null)}
                className="hidden"
                id="avatar-upload"
              />
              <label 
                htmlFor="avatar-upload" 
                className="w-full pl-4 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors flex items-center justify-between cursor-pointer hover:bg-white/5"
              >
                <span className="text-gray-300 text-sm truncate max-w-[200px]">
                  {avatar ? avatar.name : "Choose an image..."}
                </span>
                <Upload className="h-4 w-4 text-gray-500" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
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
            <p className="text-[10px] text-gray-500 mt-1">Must be at least 8 characters long.</p>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" id="terms" required className="mt-1 rounded bg-black/50 border-white/10 text-purple-500 focus:ring-purple-500" />
            <label htmlFor="terms" className="text-xs text-gray-400">
              I agree to the <Link href="#" className="text-white hover:underline">Terms of Service</Link> and <Link href="#" className="text-white hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
            <span className="text-xl">→</span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Already have an account? <Link href="/login" className="text-white hover:underline font-medium text-purple-400">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
}
