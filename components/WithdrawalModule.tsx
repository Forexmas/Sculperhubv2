import React, { useState, useEffect } from 'react';
import { User, Transaction, KYCStatus } from '../types';
import { createTransaction, getUserTransactions, verifyWithdrawalPassword } from '../services/mockBackend';
import { Wallet, ArrowUpRight, History, Lock, AlertCircle, RefreshCw, CheckCircle, ChevronRight, Hash } from 'lucide-react';

interface WithdrawalModuleProps {
  user: User;
  refreshUser: () => void;
}

type CryptoAsset = 'BTC' | 'ETH' | 'USDT';

const WithdrawalModule: React.FC<WithdrawalModuleProps> = ({ user, refreshUser }) => {
  const [activeTab, setActiveTab] = useState<'REQUEST' | 'HISTORY'>('REQUEST');
  const [history, setHistory] = useState<Transaction[]>([]);
  
  // Form State
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('BTC');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setHistory(getUserTransactions(user.id));
  }, [user.id, activeTab]);

  const totalWithdrawable = user.capital + user.profit;

  const handleAssetChange = (asset: CryptoAsset) => {
      setSelectedAsset(asset);
      setNetwork(asset === 'USDT' ? 'TRC20' : asset); // Default networks
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (amount <= 0) {
        setError("Invalid withdrawal amount.");
        return;
    }
    if (amount > totalWithdrawable) {
        setError("Insufficient funds.");
        return;
    }
    if (!address) {
        setError("Wallet address is required.");
        return;
    }
    if (!pin) {
        setError("Withdrawal PIN is required.");
        return;
    }

    setIsSubmitting(true);
    
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validation Logic
    if (!verifyWithdrawalPassword(user.id, pin)) {
        setError("Invalid Withdrawal PIN.");
        setIsSubmitting(false);
        return;
    }

    try {
      createTransaction(user.id, 'WITHDRAWAL', amount, `${selectedAsset} (${network}) to ${address.substring(0,6)}...`);
      setAmount(0);
      setPin('');
      setAddress('');
      setSuccess(true);
      refreshUser();
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      setError(e.message || "Withdrawal request failed.");
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
            <ArrowUpRight className="text-cyber-danger" />
            Withdraw Funds
          </h2>
          <p className="text-gray-400 text-sm">Request a payout to your external wallet.</p>
        </div>
        
        <div className="flex bg-cyber-dark p-1 rounded-lg border border-cyber-border">
          <button 
            onClick={() => setActiveTab('REQUEST')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'REQUEST' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Request
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-cyber-accent text-cyber-dark font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'REQUEST' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Left: Withdrawal Form */}
              <div className="lg:col-span-2 space-y-6">
                  {/* Balance Display */}
                  <div className="bg-gradient-to-r from-cyber-dark to-[#1e293b] border border-cyber-border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center shadow-lg">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className="w-12 h-12 rounded-full bg-cyber-accent/20 flex items-center justify-center text-cyber-accent">
                              <Wallet size={24} />
                          </div>
                          <div>
                              <p className="text-sm text-gray-400">Available Withdrawal Balance</p>
                              <h3 className="text-2xl font-bold text-white">${totalWithdrawable.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-gray-500">Capital: <span className="text-white">${user.capital.toLocaleString()}</span></p>
                          <p className="text-xs text-gray-500">Profit: <span className="text-green-400">${user.profit.toLocaleString()}</span></p>
                      </div>
                  </div>

                  <form onSubmit={handleSubmit} className="bg-cyber-card border border-cyber-border rounded-xl p-6 space-y-6">
                      {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 animate-pulse">
                              <AlertCircle size={20} />
                              {error}
                          </div>
                      )}
                      
                      {success && (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 animate-in fade-in">
                              <CheckCircle size={20} />
                              Withdrawal request submitted successfully!
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className="block text-sm text-gray-400 mb-2">Select Asset</label>
                               <div className="grid grid-cols-3 gap-2">
                                   {(['BTC', 'ETH', 'USDT'] as CryptoAsset[]).map(asset => (
                                       <button
                                            type="button"
                                            key={asset}
                                            onClick={() => handleAssetChange(asset)}
                                            className={`py-3 rounded border text-sm font-bold transition ${selectedAsset === asset ? 'bg-cyber-accent text-cyber-dark border-cyber-accent' : 'bg-cyber-dark text-gray-400 border-cyber-border hover:bg-white/5'}`}
                                       >
                                           {asset}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm text-gray-400 mb-2">Network</label>
                               <select 
                                    value={network}
                                    onChange={(e) => setNetwork(e.target.value)}
                                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none"
                                >
                                   {selectedAsset === 'BTC' && <option value="BTC">Bitcoin (BTC)</option>}
                                   {selectedAsset === 'ETH' && <option value="ERC20">Ethereum (ERC20)</option>}
                                   {selectedAsset === 'USDT' && (
                                       <>
                                         <option value="TRC20">Tron (TRC20)</option>
                                         <option value="ERC20">Ethereum (ERC20)</option>
                                       </>
                                   )}
                               </select>
                           </div>
                      </div>

                      <div>
                          <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                          <input 
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Paste destination address"
                              className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-accent outline-none font-mono text-sm"
                          />
                      </div>

                      <div>
                          <label className="block text-sm text-gray-400 mb-2">Amount</label>
                          <div className="relative">
                              <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                              <input 
                                  type="number"
                                  value={amount || ''}
                                  onChange={(e) => setAmount(Number(e.target.value))}
                                  placeholder="0.00"
                                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-8 text-white focus:border-cyber-accent outline-none text-lg font-mono"
                              />
                              <button 
                                type="button"
                                onClick={() => setAmount(totalWithdrawable)}
                                className="absolute right-3 top-2.5 text-xs bg-cyber-card border border-cyber-border px-2 py-1 rounded text-cyber-accent hover:text-white transition"
                              >
                                  MAX
                              </button>
                          </div>
                      </div>

                      <div className="border-t border-cyber-border pt-6">
                           <label className="block text-sm text-gray-400 mb-2">Security PIN</label>
                           <div className="relative">
                               <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                               <input 
                                  type="password"
                                  value={pin}
                                  onChange={(e) => setPin(e.target.value)}
                                  placeholder="Enter 4-digit withdrawal PIN"
                                  maxLength={6}
                                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-3 pl-10 text-white focus:border-cyber-accent outline-none tracking-widest"
                              />
                           </div>
                           <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                               <AlertCircle size={12} /> Funds are usually processed within 1-2 hours after admin approval.
                           </p>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting || user.kycStatus !== KYCStatus.VERIFIED}
                        className={`
                            w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                            ${user.kycStatus !== KYCStatus.VERIFIED 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                                : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-900/40'}
                        `}
                      >
                         {isSubmitting ? (
                             <>
                                <RefreshCw className="animate-spin" size={20} /> Processing...
                             </>
                         ) : user.kycStatus !== KYCStatus.VERIFIED ? (
                             <>
                                <Lock size={20} /> KYC Verification Required
                             </>
                         ) : (
                             <>
                                Confirm Withdrawal <ChevronRight size={20} />
                             </>
                         )}
                      </button>
                      
                      {user.kycStatus !== KYCStatus.VERIFIED && (
                          <div className="text-center text-sm text-red-400">
                              You must complete Identity Verification (KYC) before withdrawing funds.
                          </div>
                      )}
                  </form>
              </div>

              {/* Right: Info Panel */}
              <div className="space-y-6">
                 <div className="bg-cyber-card border border-cyber-border rounded-xl p-6">
                     <h3 className="font-bold text-white mb-4">Important Notice</h3>
                     <ul className="space-y-3 text-sm text-gray-400 list-disc pl-4">
                         <li>Minimum withdrawal amount is $50.00.</li>
                         <li>Ensure you are using the correct network ({network || 'Select Network'}) to avoid loss of funds.</li>
                         <li>Withdrawals to new addresses may require additional email confirmation.</li>
                         <li>ScalperHub is not responsible for funds sent to incorrect addresses.</li>
                     </ul>
                 </div>

                 <div className="bg-cyber-dark border border-cyber-border rounded-xl p-6">
                     <h3 className="font-bold text-white mb-4">Security Status</h3>
                     <div className="space-y-3">
                         <div className="flex items-center justify-between p-3 rounded bg-white/5">
                             <span className="text-sm text-gray-300">KYC Verification</span>
                             {user.kycStatus === KYCStatus.VERIFIED ? (
                                 <CheckCircle size={16} className="text-green-500" />
                             ) : (
                                 <AlertCircle size={16} className="text-red-500" />
                             )}
                         </div>
                         <div className="flex items-center justify-between p-3 rounded bg-white/5">
                             <span className="text-sm text-gray-300">Email Verified</span>
                             <CheckCircle size={16} className="text-green-500" />
                         </div>
                         <div className="flex items-center justify-between p-3 rounded bg-white/5">
                             <span className="text-sm text-gray-300">Withdrawal PIN Set</span>
                             <CheckCircle size={16} className="text-green-500" />
                         </div>
                     </div>
                 </div>
              </div>
          </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
           {history.filter(tx => tx.type === 'WITHDRAWAL').length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-20" />
                <p>No withdrawal history found.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-cyber-dark border-b border-cyber-border text-xs text-gray-500 uppercase font-bold">
                   <tr>
                     <th className="p-4">Reference ID</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Details</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-cyber-border text-sm">
                    {history.filter(tx => tx.type === 'WITHDRAWAL').map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-mono text-gray-400">#{tx.id}</td>
                        <td className="p-4 text-white">{tx.date}</td>
                        <td className="p-4">
                           <span className="flex items-center gap-2 text-white">
                              <ArrowUpRight size={16} className="text-red-400" /> {tx.method}
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

export default WithdrawalModule;