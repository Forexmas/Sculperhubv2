import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { createTransaction, getUserTransactions, getDepositAddresses } from '../services/mockBackend';
import { Copy, Check, QrCode, ArrowDownLeft, Wallet, AlertCircle, History, RefreshCw, ChevronRight } from 'lucide-react';

interface DepositModuleProps {
  user: User;
  refreshUser: () => void;
}

type CryptoAsset = 'BTC' | 'ETH' | 'USDT';

const DepositModule: React.FC<DepositModuleProps> = ({ user, refreshUser }) => {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('BTC');
  const [amount, setAmount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'HISTORY'>('DEPOSIT');
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({
    BTC: '', ETH: '', USDT: ''
  });

  useEffect(() => {
    setHistory(getUserTransactions(user.id));
    setDepositAddresses(getDepositAddresses());
  }, [user.id, activeTab]);

  const handleCopy = () => {
    const addr = depositAddresses[selectedAsset];
    if (addr) {
      navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      createTransaction(user.id, 'DEPOSIT', amount, `${selectedAsset} Transfer`);
      setAmount(0);
      refreshUser();
      setActiveTab('HISTORY');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-cyber-accent" />
            Deposit Funds
          </h2>
          <p className="text-gray-400 text-sm">Securely transfer crypto assets to your trading wallet.</p>
        </div>
        
        <div className="flex bg-cyber-dark p-1 rounded-lg border border-cyber-border">
          <button 
            onClick={() => setActiveTab('DEPOSIT')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'DEPOSIT' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            New Deposit
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'DEPOSIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Left Column: Asset Selection & Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Asset Selection Cards */}
            <div className="grid grid-cols-3 gap-4">
              {(['BTC', 'ETH', 'USDT'] as CryptoAsset[]).map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedAsset === asset 
                      ? 'bg-cyber-accent/10 border-cyber-accent shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' 
                      : 'bg-cyber-card border-cyber-border hover:border-gray-500 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    asset === 'BTC' ? 'bg-orange-500' : asset === 'ETH' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {asset[0]}
                  </div>
                  <span className={`font-bold ${selectedAsset === asset ? 'text-cyber-accent' : 'text-gray-400'}`}>
                    {asset}
                  </span>
                </button>
              ))}
            </div>

            {/* Deposit Form */}
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Deposit Details</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Deposit Amount (USD Equivalent)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input 
                      type="number"
                      min="10"
                      required
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-8 text-white focus:border-cyber-accent outline-none text-lg font-mono placeholder-gray-600"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimum deposit amount: $50.00</p>
                </div>

                <div className="p-4 bg-cyber-dark border border-cyber-border rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Target Wallet ({selectedAsset})</span>
                      <button 
                        type="button"
                        onClick={handleCopy}
                        className="text-xs flex items-center gap-1 text-cyber-accent hover:text-white transition"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Address'}
                      </button>
                   </div>
                   <div className="font-mono text-sm text-white break-all bg-black/30 p-3 rounded border border-white/5">
                      {depositAddresses[selectedAsset] || 'Loading...'}
                   </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 text-sm text-blue-300">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <p>Please ensure you are sending <strong>{selectedAsset}</strong> via the correct network. Sending other assets may result in permanent loss.</p>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="w-full py-4 bg-cyber-accent text-cyber-dark font-bold rounded-lg hover:bg-emerald-400 transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} /> Processing Request...
                    </>
                  ) : (
                    <>
                      Confirm Deposit <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: QR Code & Info */}
          <div className="space-y-6">
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 flex flex-col items-center text-center">
              <h3 className="text-white font-bold mb-6">Scan to Pay</h3>
              <div className="w-48 h-48 bg-white p-2 rounded-lg mb-6">
                {/* Simulated QR Code with CSS Pattern */}
                <div className="w-full h-full bg-black relative overflow-hidden" 
                     style={{
                        backgroundImage: `radial-gradient(black 30%, transparent 31%), radial-gradient(black 30%, transparent 31%)`,
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 5px 5px',
                        backgroundColor: 'white'
                     }}
                >
                   {/* Center Logo Placeholder */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                          <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            selectedAsset === 'BTC' ? 'bg-orange-500' : selectedAsset === 'ETH' ? 'bg-purple-500' : 'bg-green-500'
                          }`}>
                              {selectedAsset[0]}
                          </div>
                      </div>
                   </div>
                   {/* QR Code Corners */}
                   <div className="absolute top-0 left-0 w-10 h-10 border-4 border-black bg-transparent"></div>
                   <div className="absolute top-0 right-0 w-10 h-10 border-4 border-black bg-transparent"></div>
                   <div className="absolute bottom-0 left-0 w-10 h-10 border-4 border-black bg-transparent"></div>
                </div>
              </div>
              <p className="text-sm text-gray-400">Send only <strong>{selectedAsset}</strong> to this address.</p>
            </div>

            <div className="bg-cyber-dark border border-cyber-border rounded-xl p-6">
               <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Instructions</h4>
               <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="bg-cyber-card w-5 h-5 rounded-full flex items-center justify-center text-xs border border-cyber-border shrink-0">1</span>
                    Select your preferred asset.
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-cyber-card w-5 h-5 rounded-full flex items-center justify-center text-xs border border-cyber-border shrink-0">2</span>
                    Copy the wallet address or scan QR.
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-cyber-card w-5 h-5 rounded-full flex items-center justify-center text-xs border border-cyber-border shrink-0">3</span>
                    Send the funds from your wallet.
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-cyber-card w-5 h-5 rounded-full flex items-center justify-center text-xs border border-cyber-border shrink-0">4</span>
                    Enter the USD amount and confirm.
                  </li>
               </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
           {history.filter(tx => tx.type === 'DEPOSIT').length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-20" />
                <p>No deposit history found.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-cyber-dark border-b border-cyber-border text-xs text-gray-500 uppercase font-bold">
                   <tr>
                     <th className="p-4">Reference ID</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Method</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-cyber-border text-sm">
                    {history.filter(tx => tx.type === 'DEPOSIT').map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-mono text-gray-400">#{tx.id}</td>
                        <td className="p-4 text-white">{tx.date}</td>
                        <td className="p-4">
                           <span className="flex items-center gap-2 text-white">
                              <ArrowDownLeft size={16} className="text-green-500" /> {tx.method}
                           </span>
                        </td>
                        <td className="p-4 font-bold text-white">${tx.amount.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      )}

    </div>
  );
};

export default DepositModule;