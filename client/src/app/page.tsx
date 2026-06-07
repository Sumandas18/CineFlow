"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Video, Zap, BarChart2, Cloud, Sparkles, Check, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, MoreHorizontal, Activity } from "lucide-react";
import api from "@/lib/api";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Enable sound by default as requested

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const checkAuth = async () => {
    // Fast path: if no token exists locally, instantly show Login/Signup
    const token = typeof window !== 'undefined' ? (localStorage.getItem('cineflow_token') || sessionStorage.getItem('cineflow_token')) : null;
    
    if (!token) {
      setIsAuthenticated(false);
      // Proactively wake up the server in the background so it's ready when they click Login
      api.get('/').catch(() => {});
      return;
    }

    try {
      const res = await api.get('/auth/me?t=' + new Date().getTime());
      if (res.data?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // check auth when component mounts
    checkAuth();

    // re-check auth if user comes back to the tab (e.g. after login/logout in another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // auto play/pause video when scrolling to save performance
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl.play().then(() => setIsPlaying(true)).catch((err) => {
               // browser blocked autoplay because of sound, update state so UI shows play button
               console.warn("browser blocked autoplay:", err.message);
               setIsPlaying(false);
            });
          } else {
            videoEl.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(videoEl);

    return () => observer.disconnect();
  }, []);
  
  // mouse tracking for the 3D phone effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const phoneRotateX = useTransform(springY, [-1, 1], [15, -15]);
  const phoneRotateY = useTransform(springX, [-1, 1], [-20, 20]);
  const phoneTranslateZ = useTransform(springY, [-1, 1], [0, 50]);

  const reelsData = [
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=900&fit=crop",
      caption: "The majesty of the valley 🏔️✨ #nature #mountains",
      likes: "3.4M", comments: "15.2K", username: "@nature_cineflow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=500&h=900&fit=crop",
      caption: "King of the jungle in 4K 🐅🔥 #wildlife #tiger",
      likes: "5.1M", comments: "42.8K", username: "@wild_cineflow",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
    },
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=900&fit=crop",
      caption: "Breathtaking views from the peak! ❄️💙 #explore",
      likes: "1.8M", comments: "6.7K", username: "@adventure_ai",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop"
    },
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=900&fit=crop",
      caption: "The majesty of the valley 🏔️✨ #nature #mountains",
      likes: "3.4M", comments: "15.2K", username: "@nature_cineflow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="text-white overflow-x-hidden font-sans selection:bg-purple-500/30 relative">
      
      {/* Floating Pill Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 bg-[#0a0510]/60 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-full">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles size={16} className="text-white" />
            </div>
            <span>CineFlow</span>
          </Link>
          <div className="flex items-center gap-6">
            {isAuthenticated === true ? (
              <Link href="/dashboard" className="text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 px-5 py-2 rounded-full transition-transform shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Dashboard
              </Link>
            ) : isAuthenticated === false ? (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log In</Link>
                <Link href="/signup" className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition-colors border border-white/5">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="w-20 h-8 rounded-full bg-white/5 animate-pulse"></div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between perspective-1000"
      >
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Starburst Premium Badge (Top Left) */}
        <Link href={isAuthenticated ? "/pricing" : "/login"} className="absolute top-12 lg:top-32 left-4 lg:-left-8 z-50 group cursor-pointer hidden md:flex flex-col items-center justify-center w-[84px] h-[84px] hover:scale-110 transition-transform duration-300">
          {/* Animated Glow */}
          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse blur-xl opacity-40"></div>
          
          {/* Starburst Shape (12 points) */}
          <div className="absolute inset-0 flex items-center justify-center animate-[spin_15s_linear_infinite] group-hover:scale-105 transition-all">
            <div className="absolute w-[60px] h-[60px] bg-gradient-to-br from-yellow-300 to-amber-500 rounded-[8px] shadow-lg border border-yellow-200/50"></div>
            <div className="absolute w-[60px] h-[60px] bg-gradient-to-br from-yellow-300 to-amber-500 rounded-[8px] shadow-lg border border-yellow-200/50 rotate-[30deg]"></div>
            <div className="absolute w-[60px] h-[60px] bg-gradient-to-br from-yellow-300 to-amber-500 rounded-[8px] shadow-lg border border-yellow-200/50 rotate-[60deg]"></div>
          </div>
          
          {/* Clear, Legible Text */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="text-[12px] font-black text-black leading-none tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] mb-0.5">
              GET
            </span>
            <span className="text-[18px] font-black text-black leading-none tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              PRO
            </span>
          </div>
        </Link>

        {/* Left Content */}
        <div className="w-full lg:w-1/2 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-6"
          >
            AI-POWERED VIRAL GROWTH
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Go Viral with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">AI-Powered</span> Reels
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-lg leading-relaxed"
          >
            Turn your long-form content into short-form gold. Our AI identifies high-engagement moments and generates viral-ready reels in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto"
          >
            <Link href={isAuthenticated ? "/studio" : "/login"} className="w-full md:w-auto text-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm md:text-base hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              Open AI Studio
            </Link>
            <button 
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-bold text-sm md:text-base hover:bg-white/10 transition-colors"
            >
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Right Floating Elements (3D Interactive Phone) */}
        <div className="w-full lg:w-1/2 h-[550px] relative mt-16 lg:mt-0 hidden md:block" style={{ perspective: '1200px' }}>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/20 blur-[100px] rounded-full pointer-events-none" />
           
           {/* Floating 3D Phone Mockup */}
           <motion.div
             style={{ 
               rotateX: phoneRotateX,
               rotateY: phoneRotateY,
               z: phoneTranslateZ,
               transformStyle: 'preserve-3d' 
             }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[540px] rounded-[3rem] bg-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_0_2px_#333,inset_0_0_20px_rgba(255,255,255,0.1)] p-2"
           >
              {/* Inner Screen */}
              <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative shadow-inner flex flex-col">
                
                {/* Hardware Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-2xl z-50 flex items-center justify-center gap-2">
                   <div className="w-12 h-2 rounded-full bg-black/50"></div>
                   <div className="w-3 h-3 rounded-full bg-black/50 flex items-center justify-center">
                     <div className="w-1 h-1 rounded-full bg-blue-900/50"></div>
                   </div>
                </div>

                {/* Real-looking Reels Swiping UI Background */}
                <motion.div 
                  className="absolute inset-0 w-full h-[400%] flex flex-col"
                  animate={{ y: ["0%", "0%", "-25%", "-25%", "-50%", "-50%", "-75%", "-75%"] }}
                  transition={{ duration: 12, times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
                >
                  {reelsData.map((reel, idx) => (
                    <div key={idx} className="w-full h-1/4 relative">
                      <img src={reel.src} alt={`Reel ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Reels UI Elements for this specific reel */}
                      <div className="absolute bottom-4 left-4 right-16 z-30">
                         <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-full border border-white/50 bg-cover bg-center" style={{ backgroundImage: `url('${reel.avatar}')` }}></div>
                           <span className="text-sm font-bold text-white drop-shadow-md">{reel.username}</span>
                         </div>
                         <p className="text-xs text-white/90 drop-shadow-md mb-2">{reel.caption}</p>
                         <div className="flex items-center gap-1 text-[10px] text-white/80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full w-max">
                           <Sparkles size={10} /> AI Enhanced
                         </div>
                      </div>

                      {/* Right Action Bar for this specific reel */}
                      <div className="absolute bottom-6 right-2 z-30 flex flex-col items-center gap-4">
                         <div className="flex flex-col items-center gap-1">
                           <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                             <Heart size={20} className="text-white fill-white" />
                           </div>
                           <span className="text-[10px] font-bold text-white drop-shadow-md">{reel.likes}</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                           <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                             <MessageCircle size={20} className="text-white" />
                           </div>
                           <span className="text-[10px] font-bold text-white drop-shadow-md">{reel.comments}</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                           <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                             <Share2 size={20} className="text-white fill-white" />
                           </div>
                           <span className="text-[10px] font-bold text-white drop-shadow-md">Share</span>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                           <MoreHorizontal size={16} className="text-white" />
                         </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Screen Glare Layer */}
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-bl from-white/10 to-transparent pointer-events-none transform -translate-y-1/4 translate-x-1/4 rotate-12 z-40"></div>
              </div>
           </motion.div>

           {/* Floating Badge: +12.4k Views */}
           <motion.div
             style={{ 
               rotateX: phoneRotateX,
               rotateY: phoneRotateY,
               translateZ: 80 
             }}
             className="absolute top-[20%] right-[5%] px-4 py-2 rounded-xl bg-[#120b1c]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 backdrop-blur-md"
           >
             <span className="text-xs font-bold text-cyan-400">+12.4k Views</span>
           </motion.div>

           {/* Floating Badge: Viral Score */}
           <motion.div
             style={{ 
               rotateX: phoneRotateX,
               rotateY: phoneRotateY,
               translateZ: 60 
             }}
             className="absolute bottom-[25%] left-[5%] px-4 py-2 rounded-xl bg-[#120b1c]/80 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 backdrop-blur-md"
           >
             <span className="text-xs font-bold text-pink-500">Viral Score: 92%</span>
           </motion.div>
        </div>
      </div>

      {/* Features Grid Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Everything you need to <span className="text-pink-500">dominate</span>.
          </h2>
          <p className="text-gray-400 text-sm">The most advanced AI toolset designed specifically for short-form creators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
          {[
            { icon: <Zap size={24} className="text-purple-400"/>, title: "AI Generation", desc: "Our neural networks scan hours of raw footage to find the top 5% of viral clips, adding subtitles and B-roll automatically." },
            { icon: <BarChart2 size={24} className="text-cyan-400"/>, title: "Analytics", desc: "Real-time predictions of reach before you post. Know your ROI instantly with our proprietary viral score." },
            { icon: <Cloud size={24} className="text-pink-400"/>, title: "Cloud Storage", desc: "Unlimited 4K storage for your raw assets. Seamless collaboration for teams with instant sync." },
            { icon: <Sparkles size={24} className="text-purple-400"/>, title: "Smart Hooks", desc: "AI-generated headlines and hooks proven to stop the scroll. Tested against 1M+ viral videos." }
          ].map((feature, i) => (
            <Hover3DCard key={i} className="p-8 rounded-3xl bg-gradient-to-b from-[#12081d] to-[#0a0510] border border-white/5 shadow-xl hover:border-purple-500/30 transition-colors h-full">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </Hover3DCard>
          ))}
        </div>
      </div>

      {/* Video Preview Section */}
      <div id="demo-video" className="py-24 px-6 max-w-5xl mx-auto text-center relative">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          Experience the <span className="text-purple-500">Future</span> of Creation.
        </h2>
        <p className="text-gray-400 text-sm mb-12">Watch how our AI transforms hours of footage into viral gold in seconds.</p>
        
        <Hover3DCard className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(168,85,247,0.15)] bg-[#0d0d0d] group">
           
           <video 
             ref={videoRef}
             loop  
             muted={isMuted}
             playsInline 
             className="absolute inset-0 w-full h-full object-cover z-10"
             src="/landingpage/landing.mp4"
           />
           
           <div className="relative z-10 w-full h-[500px]"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-20" />
           
           {/* Custom Video Controls (Smaller & Hover Only) */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors flex items-center justify-center">
               {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             </button>
             <div className="w-px h-4 bg-white/20"></div>
             <button onClick={toggleMute} className="text-white hover:text-pink-400 transition-colors flex items-center gap-1.5 text-xs font-bold">
               {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
               {isMuted ? "Unmute" : "Sound On"}
             </button>
           </div>
        </Hover3DCard>
      </div>


      {/* CTA Section */}
      <div className="py-24 px-6 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Main Heading OUTSIDE the box */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black drop-shadow-lg leading-tight">
            Ready to go <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Viral?</span>
          </h2>
        </div>

        {/* The Card */}
        <div className="w-full bg-[#0a0510] border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(168,85,247,0.2)] relative overflow-hidden flex flex-col items-center p-8 md:p-12">
          
          {/* Small text at the top inside the box */}
          <p className="text-gray-400 text-sm md:text-base text-center max-w-xl mx-auto mb-8 z-10 relative">
            Join 50,000+ creators scaling their influence with CineFlow AI. No credit card required to start.
          </p>

          {/* Map Area */}
          <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center mb-10 z-0">
             {/* Subtle Grid */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

             {/* Map Image centered */}
             <div 
               className="absolute inset-0 bg-no-repeat bg-center opacity-30 mix-blend-screen" 
               style={{ 
                 backgroundImage: `url('/world-map.svg')`,
                 backgroundSize: 'contain',
                 filter: 'invert(1)'
               }}
             />
             
             {/* Map Pins connected to countries */}
             <MapPin top="35%" left="22%" color="bg-pink-500" label="TikTok 98%" delay={0} />
             <MapPin top="30%" left="50%" color="bg-purple-500" label="IG Reels 94%" delay={1.2} />
             <MapPin top="48%" left="68%" color="bg-cyan-500" label="YT Shorts 89%" delay={2.5} />
             <MapPin top="65%" left="32%" color="bg-yellow-500" label="Snapchat 85%" delay={0.8} />
             <MapPin top="75%" left="85%" color="bg-green-500" label="Twitter 78%" delay={1.8} />
             
             {/* Center Glow */}
             <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-600/20 blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* CTA Buttons (Bottom Centered) */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4 w-full">
            <Link href={isAuthenticated ? "/studio" : "/login"} className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm md:text-base hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Open AI Studio
            </Link>
            <Link href={isAuthenticated ? "/pricing" : "/login"} className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm md:text-base hover:bg-white/10 transition-colors backdrop-blur-sm">
              View Detailed Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm text-gray-400 hover:text-white transition-colors">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
             <Sparkles size={10} className="text-white" />
          </div>
          CineFlow
        </Link>
        <p>© 2026 CineFlow AI. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-300">Privacy</a>
          <a href="#" className="hover:text-gray-300">Terms</a>
          <a href="#" className="hover:text-gray-300">Contact</a>
        </div>
      </footer>
    </div>
  );
}

// Tactical Map Marker Component
function MapPin({ top, left, color, label, delay }: { top: string, left: string, color: string, label: string, delay: number }) {
  return (
    <motion.div 
      className="absolute flex flex-col items-center z-10"
      style={{ top, left, transform: 'translate(-50%, -100%)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
    >
      <div className="bg-[#120b1c]/90 border border-white/10 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-white backdrop-blur-sm whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-2 mb-1">
        <div className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}></span>
          <span className={`relative inline-flex rounded-full h-full w-full ${color}`}></span>
        </div>
        {label}
      </div>
      <div className={`w-px h-6 md:h-10 bg-gradient-to-b from-white/40 to-transparent`}></div>
      <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_10px_currentColor] mt-[-3px]`}></div>
    </motion.div>
  );
}

// Reusable 3D Hover Card Component
function Hover3DCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative transform-gpu ${className}`}
    >
      <motion.div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </motion.div>
      {/* Spotlight glow effect */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 pointer-events-none mix-blend-screen transition-opacity duration-300 z-50"
        style={{
          background: useTransform(
            () => `radial-gradient(circle at ${(x.get() + 0.5) * 100}% ${(y.get() + 0.5) * 100}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          ),
        }}
      />
    </motion.div>
  );
}
