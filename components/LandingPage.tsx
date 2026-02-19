import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, Zap, TrendingUp, Globe, Activity, Lock, Smartphone, ChevronRight, Bitcoin, Cpu, Disc, DollarSign } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

import MarketTable from './MarketTable';

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden relative">
      {/* CSS for custom float animation */}
      <style>{`
        @keyframes drift {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }
        .animate-drift {
          animation: drift linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-cyan-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Glass Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-[#050b14]/70 backdrop-blur-xl py-4 shadow-lg shadow-cyan-500/5' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-sm opacity-50 rounded-full"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center border border-white/20">
                <Activity className="text-white w-5 h-5" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">ScalperHub <span className="text-cyan-400">V2</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#market" className="hover:text-cyan-300 transition hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Market</a>
            <a href="#features" className="hover:text-cyan-300 transition hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Features</a>
            <a href="#security" className="hover:text-cyan-300 transition hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={onEnter}
                className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Log In
            </button>
            <button 
              onClick={onEnter}
              className="group relative px-6 py-2.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2 text-sm font-bold text-white group-hover:text-cyan-50 transition-colors">
                Start Trading <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        
        {/* Floating Crypto Tickers - Z-INDEX UPDATED to 30 to float ABOVE content */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-30">
            <FloatingTicker 
                symbol="BTC" 
                name="Bitcoin" 
                initialPrice={48234.10} 
                change={2.4} 
                top="12%"
                duration="40s"
                delay="-5s"
                icon={<Bitcoin className="text-orange-500" />}
            />
            <FloatingTicker 
                symbol="ETH" 
                name="Ethereum" 
                initialPrice={2890.45} 
                change={1.2} 
                top="25%"
                duration="45s"
                delay="-25s"
                icon={<Cpu className="text-purple-500" />}
            />
            <FloatingTicker 
                symbol="SOL" 
                name="Solana" 
                initialPrice={104.20} 
                change={5.6} 
                top="55%"
                duration="35s"
                delay="-15s"
                icon={<Zap className="text-cyan-400" />}
            />
            <FloatingTicker 
                symbol="XRP" 
                name="Ripple" 
                initialPrice={0.54} 
                change={-0.5} 
                top="75%"
                duration="50s"
                delay="-2s"
                icon={<Activity className="text-blue-400" />}
            />
            <FloatingTicker 
                symbol="USDT" 
                name="Tether" 
                initialPrice={1.00} 
                change={0.01} 
                top="40%"
                duration="60s"
                delay="-35s"
                icon={<Disc className="text-green-400" />}
            />
             <FloatingTicker 
                symbol="BNB" 
                name="Binance" 
                initialPrice={312.40} 
                change={0.8} 
                top="85%"
                duration="55s"
                delay="-10s"
                icon={<DollarSign className="text-yellow-400" />}
            />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-20">
          
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-cyan-300 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            System Online: AI Engine V3.0 Active
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-white max-w-5xl mx-auto leading-[1.1] drop-shadow-2xl">
            High-Frequency <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">Glass Architecture</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md">
            Experience the next evolution of trading. ScalperHub V2 combines institutional-grade execution speeds with a translucent, proprietary AI interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onEnter}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg text-white shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)] hover:shadow-[0_0_60px_-10px_rgba(34,211,238,0.7)] transition-all duration-300 border border-white/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
              <span className="relative">Launch Terminal</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/10 hover:border-white/30 transition flex items-center justify-center gap-2 shadow-lg">
              View Live Demo <Globe size={18} />
            </button>
          </div>
        </div>

        {/* Glass Stats Ticker */}
        <div className="max-w-7xl mx-auto mt-24 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { val: "$4.2B+", label: "Quarterly Volume" },
               { val: "0.05ms", label: "Latency" },
               { val: "24/7", label: "Market Access" },
               { val: "125k+", label: "Verified Users" }
             ].map((stat, i) => (
               <div key={i} className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-500 text-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative">
                   <div className="text-3xl font-bold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{stat.val}</div>
                   <div className="text-sm text-cyan-200/70 uppercase tracking-wider font-medium">{stat.label}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* NEW: Live Market Ticker Section */}
      <section id="market" className="border-y border-white/5 bg-[#050b14]/50 backdrop-blur-sm relative z-20 py-4 overflow-hidden flex flex-col gap-8">
        <div className="flex animate-scroll hover:pause whitespace-nowrap">
           {/* First Set */}
           <MarketTickerItem symbol="BTC" price={64231.45} change={1.2} />
           <MarketTickerItem symbol="ETH" price={3452.10} change={-0.5} />
           <MarketTickerItem symbol="SOL" price={148.20} change={4.2} />
           <MarketTickerItem symbol="ADA" price={0.45} change={0.8} />
           <MarketTickerItem symbol="XRP" price={0.62} change={-1.1} />
           <MarketTickerItem symbol="DOT" price={7.20} change={0.8} />
           <MarketTickerItem symbol="DOGE" price={0.16} change={4.2} />
           <MarketTickerItem symbol="AVAX" price={35.40} change={1.5} />
           <MarketTickerItem symbol="LINK" price={18.90} change={-0.2} />
           <MarketTickerItem symbol="MATIC" price={0.72} change={0.5} />
           
           {/* Duplicate Set for Loop */}
           <MarketTickerItem symbol="BTC" price={64231.45} change={1.2} />
           <MarketTickerItem symbol="ETH" price={3452.10} change={-0.5} />
           <MarketTickerItem symbol="SOL" price={148.20} change={4.2} />
           <MarketTickerItem symbol="ADA" price={0.45} change={0.8} />
           <MarketTickerItem symbol="XRP" price={0.62} change={-1.1} />
           <MarketTickerItem symbol="DOT" price={7.20} change={0.8} />
           <MarketTickerItem symbol="DOGE" price={0.16} change={4.2} />
           <MarketTickerItem symbol="AVAX" price={35.40} change={1.5} />
           <MarketTickerItem symbol="LINK" price={18.90} change={-0.2} />
           <MarketTickerItem symbol="MATIC" price={0.72} change={0.5} />
        </div>

        <MarketTable />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">Engineered for Transparency</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Our platform uses a crystalline node architecture designed to outpace standard market aggregators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassFeatureCard 
              icon={Zap}
              title="Microsecond Execution"
              desc="Direct market access ensures your trades are placed before the crowd moves."
              color="from-yellow-400 to-orange-500"
            />
            <GlassFeatureCard 
              icon={Shield}
              title="Military-Grade Encryption"
              desc="Your assets are secured in cold storage with multi-sig authorization protocols."
              color="from-green-400 to-emerald-600"
            />
            <GlassFeatureCard 
              icon={TrendingUp}
              title="AI Market Analysis"
              desc="Proprietary Gemini-powered algorithms predict trend reversals with 87% accuracy."
              color="from-cyan-400 to-blue-500"
            />
            <GlassFeatureCard 
              icon={Lock}
              title="Instant Withdrawals"
              desc="Automated processing ensures your profits are in your wallet within minutes."
              color="from-purple-400 to-pink-500"
            />
            <GlassFeatureCard 
              icon={Smartphone}
              title="Mobile Optimized"
              desc="Full trading functionality on any device. Never miss a signal."
              color="from-rose-400 to-red-500"
            />
            <GlassFeatureCard 
              icon={Activity}
              title="Real-Time Analytics"
              desc="Deep dive into your performance with granular profit/loss tracking."
              color="from-teal-400 to-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Giant glowing orb in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">Ready to dominate?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join the elite tier of traders using ScalperHub V2 to compound their capital daily.
            </p>
            <button 
              onClick={onEnter}
              className="px-10 py-5 bg-white text-gray-900 font-bold text-xl rounded-full hover:bg-cyan-50 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.5)] flex items-center gap-3 mx-auto transform hover:-translate-y-1"
            >
              Create Free Account <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Glass Footer */}
      <footer className="border-t border-white/5 bg-[#050b14]/50 backdrop-blur-lg py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-white/20">
               <Activity className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-gray-200">ScalperHub V2</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400 font-medium">
            <a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition">Risk Disclosure</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 ScalperHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const MarketTickerItem = ({ symbol, price, change }: { symbol: string, price: number, change: number }) => {
  const [currentPrice, setCurrentPrice] = useState(price);
  const [currentChange, setCurrentChange] = useState(change);
  
  // Simulation effect
  useEffect(() => {
     const interval = setInterval(() => {
         // randomize small fluctuation
         setCurrentPrice(p => p * (1 + (Math.random() - 0.5) * 0.002));
         setCurrentChange(c => c + (Math.random() - 0.5) * 0.1);
     }, 3000 + Math.random() * 2000);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-8 border-r border-white/10 min-w-[200px] justify-center">
       <span className="font-bold text-white text-sm">{symbol}</span>
       <span className="font-mono text-gray-300 text-sm">${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
       <span className={`text-xs font-medium flex items-center ${currentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
         {currentChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 rotate-180" />}
         {Math.abs(currentChange).toFixed(2)}%
       </span>
    </div>
  )
}

const FloatingTicker = ({ symbol, name, initialPrice, change, top, duration, delay, icon }: any) => {
    const [price, setPrice] = useState(initialPrice);
    
    // Simulate live price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPrice((prev: number) => {
                const fluctuation = (Math.random() - 0.5) * (prev * 0.002); // 0.2% variance
                return prev + fluctuation;
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(price);

    return (
        <div 
            className="absolute left-0 animate-drift hover:z-50 pointer-events-auto"
            style={{ 
                top: top,
                animationDuration: duration,
                animationDelay: delay,
                width: 'fit-content'
            }}
        >
            <div className="glass-card flex items-center gap-3 p-3 pr-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 hover:scale-105 transition-transform duration-300 hover:bg-white/10 hover:border-cyan-400/30">
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                   {icon}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{symbol}</span>
                        <span className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change}%
                        </span>
                    </div>
                    <div className="text-white font-mono text-xs tracking-wide opacity-80">
                        {formattedPrice}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GlassFeatureCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="group relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500 overflow-hidden hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
    {/* Gradient blob on hover */}
    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${color} rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
    
    <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white relative z-10">{title}</h3>
    <p className="text-gray-400 leading-relaxed relative z-10 text-sm">{desc}</p>
  </div>
);

export default LandingPage;