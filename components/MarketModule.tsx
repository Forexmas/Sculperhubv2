import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Globe, TrendingUp, TrendingDown, Star, Search, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MarketModuleProps {
  user: User;
  refreshUser: () => void;
}

// Mock Market Data
const MOCK_MARKET = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 70406.20, change24h: 2.45, volume: '45.2B', marketCap: '1.3T', sparkline: [68000, 69000, 68500, 70000, 69800, 70406] },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3505.10, change24h: -1.20, volume: '15.8B', marketCap: '420B', sparkline: [3600, 3550, 3580, 3490, 3520, 3505] },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 145.30, change24h: 5.67, volume: '3.2B', marketCap: '65B', sparkline: [135, 138, 142, 140, 144, 145.3] },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 590.45, change24h: 0.85, volume: '1.1B', marketCap: '88B', sparkline: [580, 585, 582, 588, 591, 590.45] },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', price: 0.62, change24h: -0.45, volume: '800M', marketCap: '34B', sparkline: [0.63, 0.62, 0.64, 0.61, 0.62, 0.62] },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: 1.12, volume: '400M', marketCap: '16B', sparkline: [0.43, 0.44, 0.43, 0.45, 0.44, 0.45] },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change24h: 8.40, volume: '1.5B', marketCap: '21B', sparkline: [0.13, 0.14, 0.13, 0.15, 0.14, 0.15] },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 7.20, change24h: -2.10, volume: '250M', marketCap: '10B', sparkline: [7.5, 7.4, 7.3, 7.1, 7.2, 7.2] },
];

const MiniChart = ({ data, isPositive }: { data: number[], isPositive: boolean }) => {
    const chartData = data.map((val, i) => ({ time: i, value: val }));
    const color = isPositive ? '#10b981' : '#ef4444';
    
    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`color-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${isPositive})`} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const MarketModule: React.FC<MarketModuleProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['btc', 'eth', 'sol']);

  const toggleFavorite = (id: string) => {
      if (favorites.includes(id)) {
          setFavorites(favorites.filter(f => f !== id));
      } else {
          setFavorites([...favorites, id]);
      }
  };

  const filteredMarket = MOCK_MARKET.filter(coin => 
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-500" /> Market Overview
          </h2>
          <p className="text-gray-400 text-sm">Live cryptocurrency prices and market data.</p>
        </div>
        
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Search coin..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none"
            />
        </div>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-[#0f172a] border-b border-[#334155] text-xs uppercase text-gray-500 font-bold">
                    <tr>
                        <th className="p-4 w-12"></th>
                        <th className="p-4">Asset</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">24h Change</th>
                        <th className="p-4 text-right hidden md:table-cell">24h Volume</th>
                        <th className="p-4 text-right hidden lg:table-cell">Market Cap</th>
                        <th className="p-4 text-center hidden sm:table-cell">Last 7 Days</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] text-sm">
                    {filteredMarket.map((coin) => {
                        const isPositive = coin.change24h >= 0;
                        const isFav = favorites.includes(coin.id);

                        return (
                            <tr key={coin.id} className="hover:bg-white/5 transition group">
                                <td className="p-4 text-center">
                                    <button onClick={() => toggleFavorite(coin.id)} className="text-gray-500 hover:text-yellow-500 transition">
                                        <Star size={18} className={isFav ? 'fill-yellow-500 text-yellow-500' : ''} />
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center font-bold text-xs border border-[#334155]">
                                            {coin.symbol[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{coin.name}</div>
                                            <div className="text-xs text-gray-500">{coin.symbol}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-white">
                                    ${coin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 6})}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {Math.abs(coin.change24h)}%
                                    </span>
                                </td>
                                <td className="p-4 text-right text-gray-400 hidden md:table-cell">
                                    ${coin.volume}
                                </td>
                                <td className="p-4 text-right text-gray-400 hidden lg:table-cell">
                                    ${coin.marketCap}
                                </td>
                                <td className="p-4 hidden sm:table-cell">
                                    <div className="flex justify-center">
                                        <MiniChart data={coin.sparkline} isPositive={isPositive} />
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition font-medium text-xs">
                                        Trade
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {filteredMarket.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No coins found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MarketModule;
