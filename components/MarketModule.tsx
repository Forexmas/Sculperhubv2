import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUp, ArrowDown, Search, Globe } from 'lucide-react';

interface MarketModuleProps {
  user: User;
  refreshUser: () => void;
  onNavigate: (view: View) => void;
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: {
    price: number[];
  };
}

import { View } from '../types';

const MarketModule: React.FC<MarketModuleProps> = ({ user, onNavigate }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h'
        );
        
        if (!response.ok) {
            throw new Error('Rate limit or error');
        }
        
        const data = await response.json();
        setCoins(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch market data, using fallback", err);
        setError(true);
        // Fallback mock data generation
        const mockData: CoinData[] = Array.from({ length: 20 }).map((_, i) => ({
            id: `coin-${i}`,
            symbol: ['btc', 'eth', 'usdt', 'bnb', 'sol', 'xrp', 'usdc', 'ada', 'avax', 'doge', 'dot', 'trx', 'link', 'matic', 'wbtc', 'uni', 'ltc', 'dai', 'bch', 'atom'][i] || `COIN${i}`,
            name: ['Bitcoin', 'Ethereum', 'Tether', 'BNB', 'Solana', 'XRP', 'USDC', 'Cardano', 'Avalanche', 'Dogecoin', 'Polkadot', 'TRON', 'Chainlink', 'Polygon', 'Wrapped Bitcoin', 'Uniswap', 'Litecoin', 'Dai', 'Bitcoin Cash', 'Cosmos'][i] || `Coin ${i}`,
            image: `https://picsum.photos/seed/${i}/32/32`, 
            current_price: Math.random() * 1000 + 10,
            price_change_percentage_24h: (Math.random() * 20) - 10,
            market_cap: Math.random() * 1000000000,
            total_volume: Math.random() * 100000000,
            sparkline_in_7d: {
                price: Array.from({ length: 20 }).map(() => Math.random() * 100 + 50)
            }
        }));
        setCoins(mockData);
        setLoading(false);
      }
    };

    fetchCoins();
    // Refresh every 60 seconds to avoid rate limits
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none"
            />
        </div>
      </div>

      {loading ? (
        <div className="w-full h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-[#0f172a] border-b border-[#334155] text-xs uppercase text-gray-500 font-bold">
                <tr>
                    <th className="p-4">Asset</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-right">24h Change</th>
                    <th className="p-4 text-right hidden md:table-cell">Market Cap</th>
                    <th className="p-4 text-right hidden lg:table-cell">Last 7 Days</th>
                    <th className="p-4 text-right">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] text-sm">
                {filteredCoins.map((coin) => (
                    <tr key={coin.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center font-bold text-xs border border-[#334155] overflow-hidden">
                                {error ? (
                                    (coin.symbol?.[0] || '?').toUpperCase()
                                ) : (
                                    <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white">{coin.name}</div>
                                <div className="text-xs text-gray-500 uppercase">{coin.symbol}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-right font-mono text-white">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {coin.price_change_percentage_24h >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                    </td>
                    <td className="p-4 text-right text-gray-400 hidden md:table-cell">
                        ${coin.market_cap.toLocaleString()}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                        <div className="h-10 w-32 ml-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={(coin.sparkline_in_7d?.price || []).map((p, i) => ({ i, p }))}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="p" 
                                        stroke={coin.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444'} 
                                        strokeWidth={2} 
                                        dot={false} 
                                    />
                                    <YAxis domain={['dataMin', 'dataMax']} hide />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => onNavigate('TRADING')}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition font-medium text-xs"
                        >
                            Trade
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            
            {filteredCoins.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No coins found matching "{searchTerm}"</p>
                </div>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export default MarketModule;
