import React, { useState, useEffect } from 'react';
import { User, Transaction, WalletType } from '../types';
import { transferFunds, getUserTransactions } from '../services/mockBackend';
import { ArrowRightLeft, History, ArrowRight, Wallet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TransferModuleProps {
  user: User;
  refreshUser: () => void;
}

const WALLETS: { id: WalletType; label: string; color: string }[] = [
  { id: 'capital', label: 'Capital Wallet', color: 'text-blue-400' },
  { id: 'profit', label: 'Profit Wallet', color: 'text-green-400' },
  { id: 'bonus', label: 'Bonus Balance', color: 'text-purple-400' },
  { id: 'accumulating_balance', label: 'Accumulating', color: 'text-yellow-400' },
];

const TransferModule: React.FC<TransferModuleProps> = ({ user, refreshUser }) => {
  const [activeTab, setActiveTab] = useState<'TRANSFER' | 'HISTORY'>('TRANSFER');
  const [history, setHistory] = useState<Transaction[]>([]);
  
  // Form State
  const [fromWallet, setFromWallet] = useState<WalletType>('profit');
  const [toWallet, setToWallet] = useState<WalletType>('capital');
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getUserTransactions(user.id));
  }, [user.id, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (amount <= 0) return;
    if (fromWallet === toWallet) {
        setError("Source and destination wallets must be different.");
        return;
    }

    setIsSubmitting(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      transferFunds(user.id, fromWallet, toWallet, amount);
      setAmount(0);
      setSuccess(true);
      refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Transfer failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBalance = (type: WalletType) => user[type] || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="text-cyber-accent" />
            Internal Transfer
          </h2>
          <p className="text-gray-400 text-sm">Move funds instantly between your portfolios.</p>
        </div>
        
        <div className="flex bg-cyber-dark p-1 rounded-lg border border-cyber-border">
          <button 
            onClick={() => setActiveTab('TRANSFER')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'TRANSFER' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            New Transfer
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'TRANSFER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
           
           {/* Transfer Form */}
           <div className="lg:col-span-2 space-y-6">
             <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-accent/5 rounded-full blur-[80px] pointer-events-none"></div>

               {success && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 animate-in fade-in">
                      <CheckCircle size={20} />
                      Transfer successful! Balances updated.
                  </div>
               )}

               {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 animate-in fade-in">
                      <AlertCircle size={20} />
                      {error}
                  </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* From Section */}
                    <div className="bg-cyber-dark border border-cyber-border rounded-xl p-5 hover:border-cyber-accent/30 transition group">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Transfer From</label>
                        <select 
                            value={fromWallet}
                            onChange={(e) => setFromWallet(e.target.value as WalletType)}
                            className="w-full bg-transparent text-white font-bold text-lg outline-none cursor-pointer border-b border-gray-700 pb-2 mb-2 focus:border-cyber-accent transition"
                        >
                            {WALLETS.map(w => (
                                <option key={w.id} value={w.id} disabled={w.id === toWallet}>{w.label}</option>
                            ))}
                        </select>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Available:</span>
                            <span className={`font-mono font-bold ${WALLETS.find(w => w.id === fromWallet)?.color}`}>
                                ${getBalance(fromWallet).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Arrow Icon (Hidden on mobile, visible on desktop) */}
                    <div className="hidden md:flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-cyber-accent/10 flex items-center justify-center text-cyber-accent">
                            <ArrowRight size={20} />
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="bg-cyber-dark border border-cyber-border rounded-xl p-5 hover:border-cyber-accent/30 transition group">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Transfer To</label>
                        <select 
                            value={toWallet}
                            onChange={(e) => setToWallet(e.target.value as WalletType)}
                            className="w-full bg-transparent text-white font-bold text-lg outline-none cursor-pointer border-b border-gray-700 pb-2 mb-2 focus:border-cyber-accent transition"
                        >
                            {WALLETS.map(w => (
                                <option key={w.id} value={w.id} disabled={w.id === fromWallet}>{w.label}</option>
                            ))}
                        </select>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Current Balance:</span>
                            <span className={`font-mono font-bold ${WALLETS.find(w => w.id === toWallet)?.color}`}>
                                ${getBalance(toWallet).toLocaleString()}
                            </span>
                        </div>
                    </div>
                 </div>

                 {/* Amount Section */}
                 <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount to Transfer</label>
                    <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-500">$</span>
                        <input 
                            type="number" 
                            value={amount || ''}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-cyber-dark border border-cyber-border rounded-xl py-4 pl-10 pr-20 text-white text-2xl font-mono focus:border-cyber-accent outline-none transition-colors"
                            placeholder="0.00"
                        />
                        <button 
                            type="button"
                            onClick={() => setAmount(getBalance(fromWallet))}
                            className="absolute right-4 top-3.5 px-3 py-1 bg-cyber-card border border-cyber-border rounded text-xs text-cyber-accent font-bold hover:text-white hover:border-cyber-accent transition"
                        >
                            MAX
                        </button>
                    </div>
                 </div>

                 <button 
                    type="submit"
                    disabled={isSubmitting || amount <= 0 || amount > getBalance(fromWallet)}
                    className="w-full py-4 bg-cyber-accent text-cyber-dark font-bold text-lg rounded-xl hover:bg-emerald-400 transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <ArrowRightLeft />}
                    {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
                 </button>

               </form>
             </div>
           </div>

           {/* Balance Overview Panel */}
           <div className="space-y-4">
              <h3 className="font-bold text-white mb-2">Portfolio Overview</h3>
              {WALLETS.map(wallet => (
                  <div key={wallet.id} className="bg-cyber-card border border-cyber-border p-4 rounded-xl flex items-center justify-between group hover:border-gray-600 transition">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white/5 ${wallet.color}`}>
                              <Wallet size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-300">{wallet.label}</span>
                      </div>
                      <span className={`font-mono font-bold ${wallet.color}`}>
                          ${getBalance(wallet.id).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </span>
                  </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
                  <p className="font-bold mb-1 flex items-center gap-2"><AlertCircle size={14} /> Tip:</p>
                  Transfer funds to your <strong>Capital Wallet</strong> to increase your trading margin. Move earnings to <strong>Profit Wallet</strong> to request a withdrawal.
              </div>
           </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
           {history.filter(tx => tx.type === 'TRANSFER').length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-20" />
                <p>No internal transfer history.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-cyber-dark border-b border-cyber-border text-xs text-gray-500 uppercase font-bold">
                   <tr>
                     <th className="p-4">Reference ID</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Route</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-cyber-border text-sm">
                    {history.filter(tx => tx.type === 'TRANSFER').map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-mono text-gray-400">#{tx.id}</td>
                        <td className="p-4 text-white">{tx.date}</td>
                        <td className="p-4">
                           <span className="flex items-center gap-2 text-white">
                              <ArrowRightLeft size={16} className="text-purple-400" /> 
                              {tx.method}
                           </span>
                        </td>
                        <td className="p-4 font-bold text-white">${tx.amount.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border text-green-400 bg-green-400/10 border-green-400/20">
                            COMPLETED
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

export default TransferModule;