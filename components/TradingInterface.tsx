import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { PlayCircle, AlertTriangle, TrendingUp, TrendingDown, BrainCircuit, Maximize2, RefreshCw } from 'lucide-react';
import { simulateTrade } from '../services/mockBackend';
import { User } from '../types';
import { getMarketAnalysis } from '../services/geminiService';

interface TradingInterfaceProps {
  user: User;
  refreshUser: () => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h';

const TradingInterface: React.FC<TradingInterfaceProps> = ({ user, refreshUser }) => {
  const [amount, setAmount] = useState<number>(100);
  const [isTrading, setIsTrading] = useState(false);
  const [lastResult, setLastResult] = useState<{success: boolean, message: string} | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  // Generate data based on timeframe
  const generateData = (tf: Timeframe) => {
    const data = [];
    let price = 70400; // Base BTC price
    let volatility = 20;
    let trend = 0;

    // Adjust simulation parameters based on timeframe
    switch (tf) {
      case '1m': volatility = 15; trend = 2; break; // Micro movements
      case '5m': volatility = 40; trend = 5; break;
      case '15m': volatility = 100; trend = 10; break;
      case '1h': volatility = 300; trend = 20; break; // Macro movements
    }

    // Generate 100 data points for zoom capability
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * volatility + (Math.random() > 0.5 ? trend : -trend);
      price = price + change;
      data.push({ 
        time: i, 
        label: `${i}${tf}`, 
        price: Number(price.toFixed(2)) 
      });
    }
    return data;
  };

  // Initial load and timeframe change
  useEffect(() => {
    setChartData(generateData(timeframe));
    // Clear previous AI analysis when timeframe changes to avoid confusion
    setAiAnalysis(""); 
  }, [timeframe]);

  // Live updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const lastPrice = prev[prev.length - 1].price;
        const volatility = timeframe === '1m' ? 20 : 50;
        const newPrice = lastPrice + (Math.random() - 0.5) * volatility;
        
        // Keep array size constant-ish or let it grow slightly for the session
        const newPoint = { 
          time: prev[prev.length - 1].time + 1, 
          label: 'Live',
          price: Number(newPrice.toFixed(2)) 
        };
        
        // Remove first element to keep performance good if array gets huge, 
        // but for zoom demo we want some history. Let's cap at 150.
        const newData = [...prev, newPoint];
        if (newData.length > 150) newData.shift();
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const handleTrade = async () => {
    if (isTrading) return;
    setIsTrading(true);
    setLastResult(null);

    // Artificial delay for "processing"
    setTimeout(() => {
      try {
        const result = simulateTrade(user.id, amount);
        setLastResult(result);
        refreshUser();
      } catch (err: any) {
        setLastResult({ success: false, message: err.message });
      } finally {
        setIsTrading(false);
      }
    }, 1500);
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const lastPrice = chartData[chartData.length - 1]?.price.toFixed(2);
    // Simple logic to determine local trend for the prompt
    const startPrice = chartData[0]?.price;
    const endPrice = chartData[chartData.length - 1]?.price;
    const trendDir = endPrice > startPrice ? "Upward" : "Downward";
    
    const context = `
      Timeframe: ${timeframe}.
      Current Asset: BTC/USD.
      Current Price: ${lastPrice}.
      Observed Trend over last 100 periods: ${trendDir}.
      User Capital available: ${user.capital}.
      Volatility Setting: ${timeframe === '1m' ? 'High/Scalping' : 'Swing/Macro'}.
    `;

    const analysis = await getMarketAnalysis(context);
    setAiAnalysis(analysis || "Analysis Failed");
    setAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-6 flex flex-col min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-cyber-accent" />
            BTC/USD Analysis
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
             {/* Timeframe Selectors */}
             <div className="flex bg-cyber-dark rounded-lg p-1 border border-cyber-border">
                {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                      timeframe === tf 
                      ? 'bg-cyber-accent text-cyber-dark shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
             </div>

             <button 
              onClick={handleAIAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50 rounded hover:bg-cyber-purple/30 transition text-xs font-bold uppercase tracking-wider"
            >
              <BrainCircuit size={14} />
              {analyzing ? 'Processing...' : 'Ask AI Agent'}
            </button>
          </div>
        </div>
        
        {/* Changed from flex-1 to explicit height to prevent Recharts size warning */}
        <div className="w-full h-[400px] bg-[#0b1120] rounded-lg overflow-hidden relative border border-cyber-border/50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#4b5563', fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                orientation="right"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => value.toLocaleString()}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={500}
              />
              {/* Zoom and Pan Brush */}
              <Brush 
                dataKey="time" 
                height={30} 
                stroke="#10b981" 
                fill="#1f2937" 
                tickFormatter={() => ''}
                travellerWidth={10}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {aiAnalysis && (
            <div className="absolute top-4 left-4 right-16 bg-black/80 backdrop-blur-md border border-cyber-purple/50 p-4 rounded-lg text-sm text-gray-200 shadow-2xl z-10 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit size={14} className="text-cyber-purple" />
                        <span className="text-xs font-bold text-cyber-purple uppercase">AI Insight ({timeframe})</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm leading-relaxed">{aiAnalysis}</pre>
                 </div>
                 <button onClick={() => setAiAnalysis("")} className="text-gray-500 hover:text-white"><Maximize2 size={14} /></button>
               </div>
            </div>
          )}
        </div>

        {/* Trade Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-cyber-dark p-4 rounded border border-cyber-border flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest">Winning Trades</p>
                <p className="text-2xl font-bold text-cyber-accent mt-1">{user.total_won}</p>
            </div>
            <TrendingUp className="text-cyber-accent opacity-20" size={32} />
          </div>
          <div className="bg-cyber-dark p-4 rounded border border-cyber-border flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest">Losing Trades</p>
                <p className="text-2xl font-bold text-cyber-danger mt-1">{user.total_loss}</p>
            </div>
            <TrendingDown className="text-cyber-danger opacity-20" size={32} />
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 h-fit">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
            <span>Execute Trade</span>
            <span className="text-xs bg-cyber-accent/10 text-cyber-accent px-2 py-1 rounded">Wallet: ${user.capital.toFixed(2)}</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-cyber-accent transition-colors font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
             {[0.25, 0.50, 0.75, 1].map((pct) => (
                 <button 
                    key={pct}
                    onClick={() => setAmount(Math.floor(user.capital * pct))}
                    className="text-xs bg-cyber-dark hover:bg-white/5 border border-cyber-border hover:border-cyber-accent text-gray-400 hover:text-white py-2 rounded transition-all"
                 >
                   {pct === 1 ? 'MAX' : `${pct * 100}%`}
                 </button>
             ))}
          </div>

          <button
            onClick={handleTrade}
            disabled={isTrading || amount <= 0 || amount > user.capital}
            className={`
              w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all
              ${isTrading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                : 'bg-gradient-to-r from-cyber-accent to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'}
            `}
          >
            {isTrading ? (
              <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={18} /> Processing</span>
            ) : (
              <>
                <PlayCircle size={20} />
                <span>PLACE TRADE</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {lastResult && (
            <div className={`p-4 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${lastResult.success ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
              {lastResult.success ? <TrendingUp className="text-cyber-accent shrink-0 mt-1" /> : <TrendingDown className="text-cyber-danger shrink-0 mt-1" />}
              <div>
                <p className={`font-bold ${lastResult.success ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
                  {lastResult.success ? 'TRADE WON' : 'TRADE LOST'}
                </p>
                <p className="text-sm text-gray-300 leading-tight mt-1">{lastResult.message}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-cyber-border text-[10px] text-gray-500 flex items-start gap-2">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <p>Trading simulation engine active. Market data is generated algorithmically for demonstration purposes and does not reflect real-world exchange liquidity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;