"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { User, Mail, CreditCard, Trash2, Camera, AlertTriangle, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.user) {
        setUser(res.data.user);
        setName(res.data.user.name);
        setEmail(res.data.user.email);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload: any = { name };
      if (password.trim() !== "") {
        payload.password = password;
      }
      await api.put('/users/profile/update', payload);
      
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);
        await api.put('/users/avatar/update', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      setMessage("Profile updated successfully! Refreshing...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to PERMANENTLY delete your account? This action cannot be undone and all your data will be erased.")) {
      return;
    }
    
    try {
      await api.delete('/users/delete');
      localStorage.removeItem('cineflow_persistent');
      localStorage.removeItem('cineflow_token');
      sessionStorage.removeItem('cineflow_session_active');
      sessionStorage.removeItem('cineflow_token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      await api.post('/auth/logout');
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${baseUrl}/${user.avatar.replace(/^[/\\]+/, '')}`) 
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="text-purple-500" /> Account Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your profile, preferences, and subscription plan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Update */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d0714] border border-white/10 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden border-2 border-white/20 group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold">{user?.name?.substring(0, 2).toUpperCase()}</span>
                  )}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={20} className="text-white mb-1" />
                    <span className="text-[10px] font-bold">CHANGE</span>
                  </label>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => setAvatar(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user?.name}</h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  {avatar && <p className="text-xs text-green-400 mt-2">New image selected: {avatar.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Email Address (Cannot be changed)</label>
                  <div className="relative opacity-60">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none cursor-not-allowed text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">New Password (leave blank to keep current)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sparkles className="h-4 w-4 text-gray-500" />
                    </div>
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {message}
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} /> Danger Zone
            </h2>
            <p className="text-sm text-red-400/80 mb-6">
              Permanently delete your account and all associated data. This action is irreversible.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </motion.div>
        </div>

        {/* Right Column: Plan Information */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-[#1a0b2e] to-[#0d0714] border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px]" />
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-purple-400" size={20} /> Current Plan
            </h2>
            
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6">
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Active Subscription</div>
              <div className="text-2xl font-black text-white capitalize">{user?.subscription?.plan || 'Free Plan'}</div>
              <div className="text-sm mt-1 font-medium flex items-center gap-1">
                {user?.subscription?.status === 'active' ? (
                  <><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> <span className="text-green-400">Active</span></>
                ) : (
                  <><div className="w-2 h-2 rounded-full bg-gray-500"></div> <span className="text-gray-400">Inactive</span></>
                )}
              </div>
            </div>

            {user?.subscription?.status === 'active' && user?.subscription?.plan === 'Unlimited Pro+' ? (
               <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-8 text-center">
                  <div className="text-purple-400 font-bold mb-1 flex justify-center items-center gap-2"><Sparkles size={16} /> Unlimited Access</div>
                  <div className="text-xs text-gray-400">You have unlimited premium generations.</div>
               </div>
            ) : (
               <div className="space-y-4 mb-8">
                 <div>
                   <div className="flex justify-between text-xs mb-1 font-medium">
                     <span className="text-gray-400">{user?.subscription?.status === 'active' ? 'Plan Credits Used' : 'Daily Credits Used'}</span>
                     <span className="text-white">{user?.aiUsageCount || 0}/{user?.credits || 10}</span>
                   </div>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all" style={{ width: `${Math.min(100, ((user?.aiUsageCount || 0) / (user?.credits || 10)) * 100)}%` }} />
                   </div>
                 </div>
               </div>
            )}

            <Link href="/pricing" className="block w-full text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/5">
              Upgrade Plan
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
