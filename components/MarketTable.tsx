import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

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

const MarketTable = () => {
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
            symbol: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'USDC', 'ADA', 'AVAX', 'DOGE', 'DOT', 'TRX', 'LINK', 'MATIC', 'WBTC', 'UNI', 'LTC', 'DAI', 'BCH', 'ATOM'][i] || `COIN${i}`,
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

  if (loading) {
    return (
        <div className="w-full h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Market Overview</h2>
            <p className="text-gray-400">Live prices and 24h performance</p>
        </div>
        
        <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-cyan-500 transition duration-150 ease-in-out sm:text-sm"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-[#0b1221]/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Market Cap</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Last 7 Days</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoins.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/5 transition-colors duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                         {/* Fallback for image if API fails or image is missing */}
                         {error ? (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                {coin.symbol[0]}
                            </div>
                         ) : (
                            <img className="h-10 w-10 rounded-full" src={coin.image} alt={coin.name} referrerPolicy="no-referrer" />
                         )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{coin.name}</div>
                        <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-white">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coin.price_change_percentage_24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400 hidden md:table-cell font-mono">
                    ${coin.market_cap.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="h-12 w-32 ml-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors">
                        Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketTable;
