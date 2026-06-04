"use client";
import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full"></div>
      
      <div className="z-10 flex flex-col items-center text-center max-w-lg px-6">
        <div className="w-24 h-24 rounded-full bg-blue-900/30 flex items-center justify-center mb-8 border border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative">
          <Settings size={48} className="text-cyan-400 animate-[spin_4s_linear_infinite]" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center">
            <Sparkles size={14} className="text-pink-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">We're Upgrading CineFlow</h1>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          The platform is currently offline for scheduled maintenance and system upgrades. Our engineers are making CineFlow even faster and smarter.
        </p>
        
        <div className="bg-[#121212] border border-blue-900/40 rounded-2xl p-6 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-300">System Status</span>
          </div>
          <div className="text-left text-xs text-slate-500 font-mono mt-4 space-y-2">
            <p className="text-cyan-400">&gt; Database migration in progress...</p>
            <p>&gt; Upgrading AI Vision Models...</p>
            <p>&gt; Estimated time: 1 minute</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-10 px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors"
        >
          Check Again
        </button>
      </div>
    </div>
  );
}
