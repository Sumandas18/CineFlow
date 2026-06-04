"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles, Star, Zap, ShieldCheck, Smartphone, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import Script from 'next/script';

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<{name: string, price: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [successModal, setSuccessModal] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({
    'Starter': 199,
    'Creator Pro': 499,
    'Unlimited Pro+': 899
  });

  React.useEffect(() => {
    api.get('/plans').then(res => {
      if (res.data.success && res.data.plans) {
        const newPrices: Record<string, number> = {};
        res.data.plans.forEach((p: any) => {
          newPrices[p.name] = p.price;
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
      }
    }).catch(console.error);
  }, []);

  const handleSelectPlan = (planName: string, price: number) => {
    setCheckoutPlan({ name: planName, price });
  };

  const handleCheckout = async (planName: string) => {
    setLoadingPlan(planName);
    try {
      const res = await api.post('/payment/create-order', { plan: planName });
      const { id, amount, currency, key } = res.data;

      const options = {
        key: key || "rzp_test_dummy",
        amount: amount,
        currency: currency,
        name: "CineFlow AI",
        description: `Subscription to ${planName}`,
        order_id: id,
        handler: async function (response: any) {
          // Immediately hide the checkout modal as soon as Razorpay closes
          setCheckoutPlan(null);
          
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setSuccessModal(true);
          } catch (err: any) {
            setErrorToast(err.response?.data?.message || "Payment verification failed.");
            setTimeout(() => setErrorToast(null), 5000);
          }
        },
        theme: { color: "#a855f7" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setErrorToast("Payment failed: " + response.error.description);
        setTimeout(() => setErrorToast(null), 5000);
      });
      rzp.open();
    } catch (err: any) {
      setErrorToast(err.response?.data?.message || "Failed to initiate payment");
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20 relative z-10 pt-8 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Error Toast */}
      {errorToast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium">
          <ShieldCheck size={18} /> {errorToast}
        </motion.div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-purple-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] max-w-sm w-full mx-4 text-center">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-400 mb-8">Your premium subscription is now active. Welcome to the elite tier.</p>
            <button onClick={() => window.location.href = "/dashboard"} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      )}
      
      <div className="text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-bold text-purple-300 uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          ✨ Unlock Premium AI
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 drop-shadow-lg">
          Choose Your Creative Journey
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-400 max-w-2xl mx-auto text-lg">
          Power your workflow with the most advanced AI vision engine. Go viral effortlessly with our smart analysis.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
        {/* 3 Months Plan */}
        <HoverCard delay={0.1}>
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col group-hover:border-purple-500/30 transition-all duration-500 group-hover:bg-zinc-900/60 shadow-xl group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={80} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <p className="text-sm text-gray-400 mb-6 h-10">Essential AI tools to start your viral journey.</p>
            <div className="mb-8">
              <span className="text-6xl font-black text-white">₹{prices['Starter']}</span>
              <span className="text-sm text-gray-500 font-medium">/3 Months</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-1">
              <FeatureItem>Image Upload</FeatureItem>
              <FeatureItem>AI Caption Generation</FeatureItem>
              <FeatureItem>Trending Hashtags</FeatureItem>
              <FeatureItem>Best Time to Post</FeatureItem>
            </ul>
            <CheckoutButton onClick={() => handleSelectPlan('Starter', prices['Starter'])} loading={loadingPlan === 'Starter'} label="Select Plan" />
          </div>
        </HoverCard>

        {/* 6 Months Plan */}
        <HoverCard delay={0.2}>
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col group-hover:border-purple-500/30 transition-all duration-500 group-hover:bg-zinc-900/60 shadow-xl group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} className="text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Creator Pro</h3>
            <p className="text-sm text-gray-400 mb-6 h-10">Enhanced media support for serious creators.</p>
            <div className="mb-8">
              <span className="text-6xl font-black text-white">₹{prices['Creator Pro']}</span>
              <span className="text-sm text-gray-500 font-medium">/6 Months</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-1">
              <FeatureItem>Image & Video Upload (Cloudinary)</FeatureItem>
              <FeatureItem>AI Caption Generation</FeatureItem>
              <FeatureItem>Trending Hashtags</FeatureItem>
              <FeatureItem>Best Time to Post</FeatureItem>
            </ul>
            <CheckoutButton onClick={() => handleSelectPlan('Creator Pro', prices['Creator Pro'])} loading={loadingPlan === 'Creator Pro'} label="Select Plan" />
          </div>
        </HoverCard>

        {/* 12 Months Plan (Most Popular) */}
        {/* 12 Months Plan (Most Popular) */}
        <HoverCard delay={0.3} isPopular>
          <div className="relative h-full transform md:-translate-y-4 z-10">
            <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 border border-white/20">
                <Star size={12} className="fill-white" /> Best Value
              </span>
            </div>
            <div className="bg-gradient-to-b from-[#2a0845]/80 to-[#1a0b2e]/80 border-2 border-purple-500/50 rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col group-hover:border-pink-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-pink-500/20 blur-[60px] rounded-full pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold text-white mb-2 mt-2">Unlimited Pro+</h3>
              <p className="text-sm text-purple-200/70 mb-6 h-10">The ultimate viral machine with all premium features.</p>
              <div className="mb-8">
                <span className="text-6xl font-black text-white">₹{prices['Unlimited Pro+']}</span>
                <span className="text-sm text-purple-300/50 font-medium">/12 Months</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-100 flex-1 relative z-10">
                <FeatureItem highlight>Image & Video Upload (Cloudinary)</FeatureItem>
                <FeatureItem highlight>AI Caption Generation</FeatureItem>
                <FeatureItem highlight>Trending Hashtags</FeatureItem>
                <FeatureItem highlight>Best Time to Post</FeatureItem>
                <FeatureItem highlight>Viral Hooks Generation</FeatureItem>
                <FeatureItem highlight>3-4 AI Song Suggestions</FeatureItem>
              </ul>
              <CheckoutButton onClick={() => handleSelectPlan('Unlimited Pro+', prices['Unlimited Pro+'])} loading={loadingPlan === 'Unlimited Pro+'} label="Get Premium Now" />
            </div>
          </div>
        </HoverCard>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-24">
        <h3 className="text-3xl font-bold text-center mb-10 tracking-tight">Compare Plan Features</h3>
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[100px] pointer-events-none rounded-full"></div>
          <table className="w-full text-left text-sm relative z-10">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="py-5 font-bold uppercase tracking-wider">Capabilities</th>
                <th className="py-5 font-bold uppercase tracking-wider text-center">3 Months (₹{prices['Starter']})</th>
                <th className="py-5 font-bold uppercase tracking-wider text-center">6 Months (₹{prices['Creator Pro']})</th>
                <th className="py-5 font-bold uppercase tracking-wider text-center text-pink-400">12 Months (₹{prices['Unlimited Pro+']})</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <TableRow title="Media Upload" plan1="Image Only" plan2="Image + Video" plan3="Image + Video" highlight3 />
              <TableRow title="AI Captions & Hashtags" plan1="✓" plan2="✓" plan3="✓" />
              <TableRow title="Best Time to Post" plan1="✓" plan2="✓" plan3="✓" />
              <TableRow title="Cloudinary Storage" plan1="✕" plan2="✓" plan3="✓" />
              <TableRow title="Viral Hooks" plan1="✕" plan2="✕" plan3="✓" highlight3 />
              <TableRow title="AI Song Suggestions" plan1="✕" plan2="✕" plan3="✓ (3-4 Songs)" highlight3 />
            </tbody>
          </table>
        </div>
      </motion.div>
      {checkoutPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm">
           <motion.div initial={{opacity:0, y:20, scale:0.98}} animate={{opacity:1, y:0, scale:1}} className="bg-[#121214] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-5xl w-full flex flex-col md:flex-row relative overflow-hidden max-h-[90vh]">
              <button onClick={() => setCheckoutPlan(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-50 p-2 bg-white/5 rounded-full hover:bg-white/10">✕</button>
              
              {/* Left Pane - Order Summary */}
              <div className="w-full md:w-[45%] bg-[#16161a] p-10 flex flex-col justify-between border-r border-white/5 relative overflow-y-auto custom-scrollbar">
                 <div>
                   <div className="flex justify-between items-start mb-6">
                     <div className="inline-block px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                        SELECTED PLAN
                     </div>
                     <div className="text-right">
                       <div className="text-2xl font-black text-white">₹{checkoutPlan.price}</div>
                       <div className="text-xs text-gray-500 font-medium">{checkoutPlan.name === 'Starter' ? '/3 Months' : checkoutPlan.name === 'Creator Pro' ? '/6 Months' : '/12 Months'}</div>
                     </div>
                   </div>
                   
                   <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">{checkoutPlan.name}</h2>
                   
                   <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-purple-400" /> Premium AI Capabilities
                     </li>
                     <li className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-purple-400" /> High-Resolution Export
                     </li>
                     <li className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-purple-400" /> Priority Processing Queue
                     </li>
                   </ul>
                 </div>

                 <div>
                   <div className="space-y-3 mb-8">
                      <div className="flex justify-between text-gray-400 text-sm">
                         <span>Subtotal</span>
                         <span>₹{checkoutPlan.price}.00</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-sm">
                         <span>Tax (GST 18%)</span>
                         <span>₹{Math.round(checkoutPlan.price * 0.18)}.00</span>
                      </div>
                      <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-white/10 mt-4">
                         <span>Total Amount</span>
                         <div className="text-right">
                            <span>₹{checkoutPlan.price + Math.round(checkoutPlan.price * 0.18)}</span>
                            <div className="text-[9px] text-gray-500 font-normal uppercase mt-1 tracking-wider">INCLUDES ALL TAXES</div>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 text-xs text-green-400 bg-green-400/5 p-4 rounded-xl border border-green-400/20">
                      <ShieldCheck size={20} />
                      <div>
                        <div className="font-bold tracking-wide">SSL SECURE</div>
                        <div className="text-[10px] text-green-400/70">256-bit encryption</div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Right Pane - Payment Details */}
              <div className="w-full md:w-[55%] p-10 flex flex-col relative bg-[#121214] overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-bold text-white">Select Payment Method</h3>
                   <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2">
                     POWERED BY <span className="text-[#3395ff] tracking-normal text-sm font-black capitalize">Razorpay</span>
                   </div>
                 </div>

                 <div className="space-y-3 mb-10 flex-1">
                   {/* UPI Option */}
                   <div 
                     onClick={() => setPaymentMethod('upi')}
                     className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'upi' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 hover:border-white/10 bg-white/5'}`}
                   >
                     <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                       <Smartphone size={24} className={paymentMethod === 'upi' ? 'text-purple-400' : 'text-gray-400'} />
                     </div>
                     <div className="flex-1">
                       <div className="text-white font-bold text-sm">UPI / Instant Pay</div>
                       <div className="text-gray-500 text-xs">GPay, PhonePe, Paytm & more</div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-purple-500' : 'border-gray-600'}`}>
                       {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                     </div>
                   </div>

                   {/* Card Option */}
                   <div 
                     onClick={() => setPaymentMethod('card')}
                     className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 ${paymentMethod === 'card' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 hover:border-white/10 bg-white/5'}`}
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                         <CreditCard size={24} className={paymentMethod === 'card' ? 'text-purple-400' : 'text-gray-400'} />
                       </div>
                       <div className="flex-1">
                         <div className="text-white font-bold text-sm">Credit / Debit Card</div>
                         <div className="text-gray-500 text-xs">Visa, Mastercard, RuPay</div>
                       </div>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-purple-500' : 'border-gray-600'}`}>
                         {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                       </div>
                     </div>
                     
                     {/* Mock Card Input Fields if selected */}
                     {paymentMethod === 'card' && (
                       <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="bg-black/40 border border-white/10 rounded-xl p-3 mb-2 flex justify-between items-center opacity-50 pointer-events-none">
                           <span className="text-gray-500 text-sm font-mono tracking-widest">Card Number</span>
                           <CreditCard size={16} className="text-gray-600" />
                         </div>
                         <div className="flex gap-2 opacity-50 pointer-events-none">
                           <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex-1">
                             <span className="text-gray-500 text-sm">MM/YY</span>
                           </div>
                           <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex-1">
                             <span className="text-gray-500 text-sm">CVV</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Netbanking Option */}
                   <div 
                     onClick={() => setPaymentMethod('netbanking')}
                     className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${paymentMethod === 'netbanking' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 hover:border-white/10 bg-white/5'}`}
                   >
                     <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                       <Building2 size={24} className={paymentMethod === 'netbanking' ? 'text-purple-400' : 'text-gray-400'} />
                     </div>
                     <div className="flex-1">
                       <div className="text-white font-bold text-sm">Netbanking</div>
                       <div className="text-gray-500 text-xs">Secure login for 50+ Indian banks</div>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'netbanking' ? 'border-purple-500' : 'border-gray-600'}`}>
                       {paymentMethod === 'netbanking' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <button 
                      onClick={() => handleCheckout(checkoutPlan.name)}
                      disabled={loadingPlan !== null}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:scale-100"
                   >
                      {loadingPlan === checkoutPlan.name ? <Loader2 size={20} className="animate-spin" /> : null}
                      Pay ₹{checkoutPlan.price + Math.round(checkoutPlan.price * 0.18)} Now →
                   </button>
                   <div className="text-center mt-4 text-[10px] text-gray-500">
                     By continuing, you agree to our <span className="text-gray-400 underline cursor-pointer">Terms of Service</span> & <span className="text-gray-400 underline cursor-pointer">Privacy Policy</span>
                   </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

    </div>
  );
}

function HoverCard({ children, delay, isPopular = false }: { children: React.ReactNode, delay: number, isPopular?: boolean }) {
  return (
    <motion.div 
      initial={{opacity: 0, y: 30}} 
      animate={{opacity: 1, y: 0}} 
      transition={{duration: 0.6, delay}}
      whileHover={{ y: -10 }}
      className={`group cursor-pointer relative h-full`}
    >
      {children}
    </motion.div>
  );
}

function FeatureItem({ children, highlight = false }: { children: React.ReactNode, highlight?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'}`}>
        <Check size={12} />
      </div>
      <span className={highlight ? 'font-medium text-white' : ''}>{children}</span>
    </li>
  );
}

function CheckoutButton({ onClick, loading, label }: { onClick: () => void, loading: boolean, label: string }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 font-bold transition-all duration-500 flex justify-center items-center gap-2 disabled:opacity-50 text-gray-300 group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-[#7e22ce] group-hover:to-[#be185d] group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] text-lg relative z-10"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {label}
    </button>
  );
}

function TableRow({ title, plan1, plan2, plan3, highlight3 = false }: { title: string, plan1: string, plan2: string, plan3: string, highlight3?: boolean }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
      <td className="py-5 font-medium text-white px-2 rounded-l-xl">{title}</td>
      <td className="py-5 text-center text-gray-400">{plan1}</td>
      <td className="py-5 text-center text-gray-300">{plan2}</td>
      <td className={`py-5 text-center font-bold px-2 rounded-r-xl ${highlight3 ? 'text-pink-400 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors' : 'text-purple-300'}`}>{plan3}</td>
    </tr>
  );
}
