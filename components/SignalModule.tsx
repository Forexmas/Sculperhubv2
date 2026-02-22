import React, { useState, useEffect } from 'react';
import { Signal, User } from '../types';
import { Signal as SignalIcon, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';

interface SignalModuleProps {
  user: User;
  refreshUser: () => void;
}

// Mock Signals Data
const MOCK_SIGNALS: Signal[] = [
    { id: 'sig-1', pair: 'BTC/USDT', type: 'BUY', entryPrice: 69500, stopLoss: 68000, takeProfit: 72000, status: 'ACTIVE', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), confidence: 85 },
    { id: 'sig-2', pair: 'ETH/USDT', type: 'SELL', entryPrice: 3500, stopLoss: 3600, takeProfit: 3300, status: 'ACTIVE', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), confidence: 78 },
    { id: 'sig-3', pair: 'SOL/USDT', type: 'BUY', entryPrice: 145, stopLoss: 138, takeProfit: 160, status: 'HIT_TP', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), confidence: 92 },
    { id: 'sig-4', pair: 'XRP/USDT', type: 'SELL', entryPrice: 0.62, stopLoss: 0.65, takeProfit: 0.58, status: 'HIT_SL', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), confidence: 65 },
    { id: 'sig-5', pair: 'ADA/USDT', type: 'BUY', entryPrice: 0.45, stopLoss: 0.42, takeProfit: 0.50, status: 'EXPIRED', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), confidence: 60 },
];

const SignalModule: React.FC<SignalModuleProps> = ({ user }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  useEffect(() => {
      // Simulate fetching signals
      setSignals(MOCK_SIGNALS);
  }, []);

  const filteredSignals = signals.filter(s => 
      activeTab === 'ACTIVE' ? s.status === 'ACTIVE' : s.status !== 'ACTIVE'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SignalIcon className="text-purple-500" /> Trading Signals
          </h2>
          <p className="text-gray-400 text-sm">Expert analysis and market predictions.</p>
        </div>
        
        <div className="flex gap-2 bg-[#1e293b] p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === 'ACTIVE' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Active Signals
            </button>
            <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${activeTab === 'HISTORY' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Signal History
            </button>
        </div>
      </div>

      {/* VIP Banner if user capital is low (Mock Logic) */}
      {user.capital < 1000 && (
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-500">
                  <Lock size={24} />
              </div>
              <div>
                  <h3 className="font-bold text-yellow-500">Unlock Premium Signals</h3>
                  <p className="text-sm text-gray-400">Deposit $1,000+ to access high-confidence VIP signals with 90%+ accuracy.</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSignals.map(signal => (
              <div key={signal.id} className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden hover:border-purple-500/50 transition group">
                  <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]/50">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {signal.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                          <div>
                              <h3 className="font-bold text-white">{signal.pair}</h3>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${signal.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {signal.type}
                              </span>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-xs text-gray-500">Confidence</div>
                          <div className="font-bold text-purple-400">{signal.confidence}%</div>
                      </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Entry Price</span>
                          <span className="text-white font-mono">${signal.entryPrice}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Take Profit</span>
                          <span className="text-green-400 font-mono">${signal.takeProfit}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Stop Loss</span>
                          <span className="text-red-400 font-mono">${signal.stopLoss}</span>
                      </div>
                  </div>

                  <div className="p-3 bg-[#0f172a]/30 border-t border-[#334155] flex justify-between items-center text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(signal.timestamp).toLocaleDateString()}
                      </span>
                      {signal.status === 'ACTIVE' && <span className="text-blue-400 font-bold animate-pulse">ACTIVE</span>}
                      {signal.status === 'HIT_TP' && <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={12} /> WON</span>}
                      {signal.status === 'HIT_SL' && <span className="text-red-500 font-bold flex items-center gap-1"><XCircle size={12} /> LOST</span>}
                      {signal.status === 'EXPIRED' && <span className="text-gray-500 font-bold">EXPIRED</span>}
                  </div>
              </div>
          ))}
      </div>
      
      {filteredSignals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
              <SignalIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>No signals found in this category.</p>
          </div>
      )}
    </div>
  );
};

export default SignalModule;
