"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Loader2, Hash, Copy, TrendingUp, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AIStudioPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCaption, setCopiedCaption] = useState<number | null>(null);

  useEffect(() => {
    api.get('/auth/me?t=' + new Date().getTime()).then(res => {
      setUser(res.data.user);
    }).catch(() => {
      window.location.href = '/login';
    }).finally(() => setLoadingUser(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); 
      setErrorMsg("");
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setErrorMsg("Please upload an image first.");
      return;
    }
    
    // Check usage limits locally before sending to server
    const totalCredits = user?.credits || 10;
    if (totalCredits < 1000 && (user?.aiUsageCount || 0) >= totalCredits) {
      window.location.href = '/pricing';
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await api.post('/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setResult({
          imageUrl: res.data.imageUrl,
          resourceType: res.data.resourceType,
          captions: res.data.captions,
          hashtags: res.data.hashtags,
          viralHooks: res.data.viralHooks,
          songSuggestions: res.data.songSuggestions
        });
        
        // Refresh user to update usage count locally
        const uRes = await api.get('/auth/me?t=' + new Date().getTime());
        setUser(uRes.data.user);
        // Dispatch event to update layout (Sidebar/Topbar)
        window.dispatchEvent(new Event('user-updated'));
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        window.location.href = '/pricing';
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to analyze image.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(index);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  if (loadingUser) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  const usageCount = user?.aiUsageCount || 0;
  const totalCredits = user?.credits || 10;
  const isPremium = user?.subscription?.status === 'active';
  const isLimitReached = (totalCredits < 1000) && (usageCount >= totalCredits);

  return (
    <div className="flex flex-col lg:h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)] relative">
      


      {isLimitReached && (
        <div className="absolute inset-0 z-50 rounded-3xl bg-black/60 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
          <div className="bg-zinc-900/90 p-8 rounded-3xl border border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center max-w-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-pink-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-6 relative z-10">
              <Sparkles className="text-pink-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Upgrade Your Plan</h2>
            <p className="text-gray-400 text-sm mb-8 relative z-10">You have exhausted your free credits (2/2). Upgrade to Premium to unlock unlimited AI analysis.</p>
            <Link href="/pricing" className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex justify-center text-sm relative z-10">
              View Pricing Plans
            </Link>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-7xl mx-auto w-full flex-1 min-h-0 pb-10 lg:pb-0 ${isLimitReached ? 'pointer-events-none opacity-30 blur-[2px] select-none' : ''}`}>
        {/* Left Sidebar - Upload Area */}
        <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-3xl p-8 flex flex-col backdrop-blur-md">
        <h2 className="text-2xl font-bold text-white mb-2">AI Image Analyzer</h2>
        <p className="text-gray-400 text-sm mb-8">Upload your image and let our AI vision engine detect the perfect viral captions and hashtags.</p>
        
        <label className={`flex-1 border-2 border-dashed ${imagePreview ? 'border-purple-500/50 bg-purple-500/5 p-2' : 'border-white/10 p-8'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group hover:border-purple-500/50 hover:bg-purple-500/5 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]`}>
           {imagePreview ? (
              <div className="w-full h-full relative rounded-xl overflow-hidden bg-[#0a0a0a] flex items-center justify-center shadow-inner">
                 {imageFile?.type.startsWith('video/') ? (
                    <video src={imagePreview} className="absolute inset-0 w-full h-full object-contain" autoPlay loop muted playsInline />
                 ) : (
                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain" />
                 )}
                 {/* Hover Overlay for change */}
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                       <Upload size={24} className="text-white" />
                    </div>
                    <p className="text-white font-bold text-lg drop-shadow-md">Click to Change Media</p>
                 </div>
              </div>
           ) : (
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                   <Upload size={32} className="text-purple-400" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Click or Drag Media Here</p>
                <p className="text-gray-500 text-sm">Supports Image & Video (Max 50MB)</p>
              </div>
           )}
           <input type="file" className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />
        </label>

        {errorMsg && (
          <div className="mt-6 text-red-400 text-sm bg-red-400/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
        )}

        {/* Upload Action */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleGenerate}
            disabled={!imageFile || isGenerating || isLimitReached}
            className="w-full max-w-xl py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            <Sparkles size={24} />
            {isGenerating 
              ? "AI is detecting your media... (Wait 6-7s)" 
              : isLimitReached 
                ? "Limit Exhausted. Wait for Next Day ⏳"
                : "⚡ Process Media with AI"
            }
          </button>
        </div>
      </div>

      {/* Right Sidebar - Result Card */}
      <div className="w-full lg:w-[500px] flex flex-col mt-4 lg:mt-0">
         {result ? (
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="bg-zinc-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md h-full group hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]">
               {/* Top Image/Video */}
               <div className="h-64 w-full bg-[#0a0a0a] relative shrink-0">
                  {result.resourceType === 'video' ? (
                    <video src={result.imageUrl} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                  ) : (
                    <img src={result.imageUrl} className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">Analyzed by AI</span>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-green-400 flex items-center gap-2 border border-white/10 shadow-lg">
                      <TrendingUp size={14} /> Viral Match: 98%
                    </div>
                  </div>
               </div>
               
               <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <Sparkles className="text-purple-400" size={20} /> AI Captions (Top Picks)
                  </h3>
                  <div className="space-y-3 mb-8">
                     {result.captions.map((cap: string, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:border-purple-500/30 transition-all flex justify-between items-start gap-4 group">
                          <p className="leading-relaxed">{cap}</p>
                          <button 
                            onClick={() => copyToClipboard(cap, i)}
                            className="text-gray-500 hover:text-white shrink-0 bg-black/40 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedCaption === i ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                          </button>
                        </div>
                     ))}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 mt-8">
                     <Hash className="text-pink-400" size={20} /> Trending Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {result.hashtags.map((tag: string, i: number) => (
                        <span key={i} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-500/30 hover:scale-105 hover:text-white transition-all shadow-sm">
                           {tag}
                        </span>
                     ))}
                  </div>

                  {result.viralHooks && (
                    <>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 mt-8">
                         <TrendingUp className="text-yellow-400" size={20} /> Viral Hooks (Pro+)
                      </h3>
                      <div className="space-y-3 mb-8">
                         {result.viralHooks.map((hook: string, i: number) => (
                            <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm text-yellow-100/90 shadow-sm">
                              "{hook}"
                            </div>
                         ))}
                      </div>
                    </>
                  )}

                  {result.songSuggestions && (
                    <>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 mt-8">
                         <Sparkles className="text-cyan-400" size={20} /> AI Song Suggestions (Pro+)
                      </h3>
                      <div className="space-y-3 mb-8">
                         {result.songSuggestions.map((song: string, i: number) => (
                            <div key={i} className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl text-sm text-cyan-200/90 shadow-sm flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">🎵</div>
                              <span>{song}</span>
                            </div>
                         ))}
                      </div>
                    </>
                  )}

                  <div className="mt-8 pt-6 border-t border-white/10 pb-4">
                     <button
                        onClick={handleGenerate}
                        disabled={isGenerating || isLimitReached}
                        className="w-full py-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold hover:bg-purple-500/20 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
                     >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {isGenerating ? "Regenerating..." : "Regenerate Results"}
                     </button>
                  </div>
               </div>
            </motion.div>
         ) : (
            <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center border-dashed backdrop-blur-md">
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                  <Sparkles className="text-purple-400" size={40} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Viral AI Output</h3>
               <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  Upload an image and click Generate. Our Vision AI will deeply analyze your photo to craft engaging captions and trending hashtags guaranteed to boost your reach.
               </p>
            </div>
         )}
      </div>
    </div>
    </div>
  );
}


