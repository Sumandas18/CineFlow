"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Activity, TrendingUp, Eye, Heart, MessageCircle, PlayCircle, Hash, Clock, AlignLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';

export default function AnalyticsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReel, setExpandedReel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reelsRes = await api.get('/reels');
        if (reelsRes.data.success) {
          // Map to attach prediction state
          const fetchedReels = reelsRes.data.reels.map((r: any) => ({
            ...r,
            predictedStats: null,
            chartData: null
          }));
          setReels(fetchedReels);
        }
      } catch (err) {
        console.error("Failed to fetch reels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateReelChartData = (reelId: string) => {
    // Generate a unique seed based on the entire reelId to ensure different stats for every image
    const seed = parseInt(reelId.slice(-6), 16) || Math.floor(Math.random() * 100000);
    const chartData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    // Use modulo to keep base views between 2000 and 120000
    const baseViews = (seed % 118000) + 2000; 
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayWeight = ((seed % (i + 1)) * 0.1) + 0.5;
      chartData.push({
        name: days[d.getDay()],
        views: Math.floor((baseViews / 7) * dayWeight),
        likes: Math.floor((baseViews / 7) * dayWeight * 0.12)
      });
    }
    return chartData;
  };

  const handleTogglePrediction = async (reelId: string) => {
    if (expandedReel === reelId) {
      setExpandedReel(null);
      return;
    }

    setExpandedReel(reelId);

    // Find reel and check if we need to load metadata
    const reelIndex = reels.findIndex(r => r._id === reelId);
    if (reelIndex === -1) return;
    
    let currentReel = { ...reels[reelIndex] };

    // Set chart data if not already set
    if (!currentReel.chartData) {
      const chartData = generateReelChartData(reelId);
      const totalViews = chartData.reduce((acc, curr) => acc + curr.views, 0);
      const totalLikes = chartData.reduce((acc, curr) => acc + curr.likes, 0);
      
      currentReel.predictedStats = {
        views: totalViews,
        likes: totalLikes,
        comments: Math.floor(totalLikes * 0.08),
        engagementRate: parseFloat(((totalLikes / totalViews) * 100).toFixed(1))
      };
      currentReel.chartData = chartData;
    }

    // Fetch AI Metadata if missing
    if (!currentReel.aiMetadata || !currentReel.aiMetadata.captions || currentReel.aiMetadata.captions.length === 0) {
      try {
        const metaRes = await api.post(`/reels/${reelId}/ai-metadata`);
        if (metaRes.data.success) {
          currentReel.aiMetadata = metaRes.data.aiMetadata;
        }
      } catch (e) {
        console.error("Error fetching metadata");
      }
    }

    const updatedReels = [...reels];
    updatedReels[reelIndex] = currentReel;
    setReels(updatedReels);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">AI Predicted Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Select a generated reel to view its simulated performance projections.</p>
      </div>

      <div className="space-y-6">
        {reels.map((reel) => {
          const isExpanded = expandedReel === reel._id;
          
          return (
            <motion.div 
              key={reel._id} 
              layout
              className={`bg-zinc-900/40 backdrop-blur-xl border ${isExpanded ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/10 hover:border-purple-500/30'} rounded-3xl overflow-hidden transition-colors`}
            >
              {/* Main Reel Card (Long Box) */}
              <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                
                {/* Media Preview */}
                <div className="w-full md:w-48 h-32 rounded-2xl bg-black/50 overflow-hidden shrink-0 relative border border-white/10 shadow-inner group flex items-center justify-center">
                  {reel.sourceImage ? (
                    reel.sourceImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video 
                        src={reel.sourceImage} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        muted loop playsInline autoPlay 
                      />
                    ) : (
                      <img 
                        src={reel.sourceImage} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        alt="Reel media" 
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle size={32} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">{reel.musicTitle || 'AI Analyzed Media'}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400 mb-4">
                    <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5">{new Date(reel.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 uppercase text-xs font-bold text-green-400">{reel.status}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 w-full md:w-auto">
                  <button 
                    onClick={() => handleTogglePrediction(reel._id)}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isExpanded ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:scale-105 shadow-lg shadow-purple-500/25'}`}
                  >
                    <Sparkles size={18} />
                    {isExpanded ? 'Hide Prediction' : 'View Prediction'}
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expandable Prediction Section */}
              <AnimatePresence>
                {isExpanded && reel.predictedStats && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10 bg-black/20 p-6 md:p-8"
                  >
                    {/* Prediction Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <StatCard title="Predicted Views" value={reel.predictedStats.views.toLocaleString()} icon={Eye} color="text-blue-400" />
                      <StatCard title="Predicted Likes" value={reel.predictedStats.likes.toLocaleString()} icon={Heart} color="text-pink-400" />
                      <StatCard title="Comments" value={reel.predictedStats.comments.toLocaleString()} icon={MessageCircle} color="text-purple-400" />
                      <StatCard title="Engagement Rate" value={`${reel.predictedStats.engagementRate}%`} icon={TrendingUp} color="text-green-400" />
                    </div>

                    {/* Prediction Graph */}
                    <div className="mb-8 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-purple-400" /> Predicted Audience Growth
                      </h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={reel.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="views" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Metadata Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                          <AlignLeft size={16} className="text-purple-400" /> Viral Captions
                        </h3>
                        <div className="space-y-2">
                          {reel.aiMetadata?.captions?.map((caption: string, i: number) => (
                            <div key={i} className="p-3 bg-black/30 rounded-xl text-sm text-gray-300 border border-white/5">
                              {caption}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <Hash size={16} className="text-pink-400" /> Trending Hashtags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {reel.aiMetadata?.hashtags?.map((tag: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-pink-500/10 text-pink-400 rounded-lg text-xs font-bold border border-pink-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-blue-400" /> Best Time to Post
                          </h3>
                          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-300 text-sm font-bold border border-blue-500/20 text-center">
                            {reel.aiMetadata?.bestUploadTime || "Generating optimal time..."}
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {reels.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Media Analyzed Yet</h3>
            <p className="text-gray-400 mb-6">Head over to the AI Studio to analyze an image or generate a reel.</p>
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
      <Icon size={20} className={`${color} mb-2`} />
      <div className="text-xl font-black text-white mb-1">{value || 0}</div>
      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{title}</h3>
    </div>
  );
}
