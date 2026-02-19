import React, { useState, useEffect } from 'react';
import { generateDummyTrade, LiveTrade, getRecentGlobalTrades } from '../services/mockBackend';
import { Activity, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

const LiveTradeFeed: React.FC = () => {
  const [trades, setTrades] = useState<LiveTrade[]>([]);

  useEffect(() => {
    // Initial load
    setTrades(getRecentGlobalTrades(8));

    // Live update simulation
    const interval = setInterval(() => {
      setTrades(prev => {
        const newTrade = generateDummyTrade();
        const updated = [newTrade, ...prev];
        if (updated.length > 8) updated.pop();
        return updated;
      });
    }, 2500); // New trade every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-cyber-border bg-cyber-dark/50 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-cyber-accent animate-pulse" />
          Live Market Activity
        </h3>
        <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-mono">SYSTEM ACTIVE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <table className="w-full text-left text-sm">
          <thead className="bg-cyber-dark text-xs text-gray-500 uppercase font-bold sticky top-0 z-10">
            <tr>
              <th className="p-3 pl-4">Asset</th>
              <th className="p-3">Trader</th>
              <th className="p-3">Type</th>
              <th className="p-3">Invest</th>
              <th className="p-3 text-right pr-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/50">
            {trades.map((trade) => (
              <tr key={trade.id} className="animate-in fade-in slide-in-from-top-2 hover:bg-white/5 transition-colors duration-200">
                <td className="p-3 pl-4 font-mono font-bold text-white">
                    {trade.pair}
                </td>
                <td className="p-3 text-gray-400 text-xs">
                    {trade.user}
                </td>
                <td className="p-3">
                   <span className={`flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border ${trade.type === 'CALL' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                       {trade.type === 'CALL' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                       {trade.type}
                   </span>
                </td>
                <td className="p-3 font-mono text-gray-300">
                    ${trade.amount.toLocaleString()}
                </td>
                <td className="p-3 text-right pr-4">
                    {trade.result === 'WIN' ? (
                        <div className="flex items-center justify-end gap-1 text-cyber-accent font-bold">
                             <TrendingUp size={14} />
                             +${trade.payout.toLocaleString()}
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-1 text-gray-600 font-bold">
                             <TrendingDown size={14} />
                             -$0.00
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveTradeFeed;