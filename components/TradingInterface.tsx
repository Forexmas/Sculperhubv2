import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, AlertTriangle, TrendingUp, TrendingDown, BrainCircuit, Maximize2, RefreshCw, DollarSign, Clock, ChevronDown } from 'lucide-react';
import { processTradeResult } from '../services/mockBackend';
import { User } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import TradingViewWidget from './TradingViewWidget';

interface TradingInterfaceProps {
  user: User;
  refreshUser: () => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h';

const ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETHUSDT', name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'SOLUSDT', name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', tvSymbol: 'BINANCE:BNBUSDT' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', tvSymbol: 'BINANCE:DOGEUSDT' },
];

const TradingInterface: React.FC<TradingInterfaceProps> = ({ user, refreshUser }) => {
  const [amount, setAmount] = useState<number>(100);
  const [isTrading, setIsTrading] = useState(false);
  const [lastResult, setLastResult] = useState<{success: boolean, message: string} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [duration, setDuration] = useState<number>(5); // Default 5 seconds
  
  // Real-time Data State
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const currentPriceRef = useRef<number>(0); // Ref to access latest price in intervals
  const [priceColor, setPriceColor] = useState<'text-emerald-500' | 'text-red-500' | 'text-white'>('text-white');
  const wsRef = useRef<WebSocket | null>(null);

  // Trade State
  const [tradeState, setTradeState] = useState<{
    active: boolean;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    startTime: number;
    duration: number; // seconds
    timeLeft: number;
  } | null>(null);

  // WebSocket Connection for Real-time Price
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedAsset.symbol.toLowerCase()}@trade`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      
      currentPriceRef.current = price; // Update ref
      setCurrentPrice(prev => {
        if (price > prev) setPriceColor('text-emerald-500');
        else if (price < prev) setPriceColor('text-red-500');
        return price;
      });
    };

    return () => {
      ws.close();
    };
  }, [selectedAsset]);

  // Timer Logic for Active Trade
  useEffect(() => {
    if (!tradeState?.active) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - tradeState.startTime) / 1000;
      const remaining = Math.max(0, tradeState.duration - elapsed);
      
      setTradeState(prev => prev ? { ...prev, timeLeft: remaining } : null);

      if (remaining <= 0) {
        clearInterval(interval);
        finalizeTrade();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [tradeState?.active]); // Only depend on active state to avoid re-creating interval constantly

  const finalizeTrade = () => {
    if (!tradeState) return;

    const closingPrice = currentPriceRef.current; // Use ref for latest price
    const { type, entryPrice } = tradeState;
    let isWin = false;

    if (type === 'BUY') {
      isWin = closingPrice > entryPrice;
    } else {
      isWin = closingPrice < entryPrice;
    }

    const profit = amount * 0.85; // 85% payout
    
    try {
      const result = processTradeResult(user.id, amount, profit, isWin, {
        asset: selectedAsset.symbol,
        direction: type,
        entryPrice: entryPrice,
        exitPrice: closingPrice
      });
      setLastResult(result);
      refreshUser();
    } catch (e: any) {
      setLastResult({ success: false, message: e.message });
    }

    setIsTrading(false);
    setTradeState(null);
  };

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    if (isTrading || currentPrice === 0) return;
    if (amount > user.capital) {
        setLastResult({ success: false, message: "Insufficient Funds" });
        return;
    }

    setIsTrading(true);
    setLastResult(null);

    // Start Trade
    setTradeState({
      active: true,
      type,
      entryPrice: currentPrice,
      startTime: Date.now(),
      duration: duration, 
      timeLeft: duration
    });
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const context = `
      Current Asset: ${selectedAsset.name} (${selectedAsset.symbol}).
      Current Price: ${currentPrice}.
      User Capital available: ${user.capital}.
      Strategy: ${duration}-second Scalping.
    `;

    const analysis = await getMarketAnalysis(context);
    setAiAnalysis(analysis || "Analysis Failed");
    setAnalyzing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-6 flex flex-col min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
             {/* Asset Selector */}
             <div className="relative group">
                <button className="flex items-center gap-2 text-xl font-bold text-white hover:text-cyber-accent transition-colors">
                    <TrendingUp className="text-cyber-accent" />
                    {selectedAsset.name}
                    <ChevronDown size={16} className="text-gray-500" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-cyber-border rounded-lg shadow-xl z-20 hidden group-hover:block">
                    {ASSETS.map(asset => (
                        <button 
                            key={asset.symbol}
                            onClick={() => setSelectedAsset(asset)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                            {asset.name} ({asset.symbol})
                        </button>
                    ))}
                </div>
             </div>
             
             {/* Live Price Display */}
             <div className={`text-2xl font-mono font-bold ${priceColor} transition-colors duration-300`}>
                ${currentPrice.toFixed(2)}
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
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
        
        {/* TradingView Widget Container */}
        <div className="w-full h-[500px] bg-[#0b1120] rounded-lg overflow-hidden relative border border-cyber-border/50">
          <TradingViewWidget symbol={selectedAsset.tvSymbol} />
          
          {/* Active Trade Overlay */}
          {tradeState?.active && (
             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-cyber-accent p-4 rounded-lg shadow-2xl z-10 w-64 animate-pulse">
                <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${tradeState.type === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tradeState.type === 'BUY' ? 'LONG' : 'SHORT'} ENTRY
                    </span>
                    <span className="text-white font-mono font-bold text-xl">{tradeState.timeLeft.toFixed(1)}s</span>
                </div>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-400">
                        <span>Entry Price:</span>
                        <span className="text-white font-mono">{tradeState.entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Current Price:</span>
                        <span className={`font-mono ${
                            (tradeState.type === 'BUY' && currentPrice > tradeState.entryPrice) || 
                            (tradeState.type === 'SELL' && currentPrice < tradeState.entryPrice) 
                            ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                            {currentPrice.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-cyber-accent transition-all duration-100 ease-linear"
                        style={{ width: `${(tradeState.timeLeft / tradeState.duration) * 100}%` }}
                    ></div>
                </div>
             </div>
          )}

          {aiAnalysis && (
            <div className="absolute top-4 left-4 right-16 bg-black/80 backdrop-blur-md border border-cyber-purple/50 p-4 rounded-lg text-sm text-gray-200 shadow-2xl z-10 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit size={14} className="text-cyber-purple" />
                        <span className="text-xs font-bold text-cyber-purple uppercase">AI Insight</span>
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
            <span>Execute Scalp</span>
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
          
          <div className="bg-cyber-dark p-3 rounded border border-cyber-border">
             <p className="text-xs text-gray-400 mb-2 text-center">Duration</p>
             <div className="grid grid-cols-4 gap-2">
                {[5, 10, 30, 60].map((sec) => (
                   <button
                      key={sec}
                      onClick={() => setDuration(sec)}
                      className={`
                        text-xs py-2 rounded font-bold transition-all flex items-center justify-center gap-1
                        ${duration === sec 
                          ? 'bg-cyber-accent text-black shadow-lg shadow-cyber-accent/20' 
                          : 'bg-cyber-card border border-cyber-border text-gray-400 hover:text-white hover:border-cyber-accent/50'}
                      `}
                   >
                      <Clock size={12} />
                      {sec >= 60 ? '1m' : `${sec}s`}
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade('BUY')}
              disabled={isTrading || amount <= 0 || amount > user.capital}
              className={`
                w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all
                ${isTrading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {isTrading ? (
                <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={18} /></span>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>BUY / LONG</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleTrade('SELL')}
              disabled={isTrading || amount <= 0 || amount > user.capital}
              className={`
                w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all
                ${isTrading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                  : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-lg hover:shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {isTrading ? (
                <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={18} /></span>
              ) : (
                <>
                  <TrendingDown size={20} />
                  <span>SELL / SHORT</span>
                </>
              )}
            </button>
          </div>

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
            <p>Scalping involves high risk. Payout is fixed at 85% of investment amount.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;