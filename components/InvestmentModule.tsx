import React, { useState } from 'react';
import { User, InvestmentPackage, UserInvestment } from '../types';
import { subscribeToInvestment } from '../services/mockBackend';
import { TrendingUp, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface InvestmentModuleProps {
  user: User;
  refreshUser: () => void;
}

const PACKAGES: InvestmentPackage[] = [
  { id: '1', name: 'Tier 1', durationMonths: 1, dailyInterestRate: 0.9, minAmount: 100 },
  { id: '2', name: 'Tier 2', durationMonths: 3, dailyInterestRate: 0.9, minAmount: 500 },
  { id: '3', name: 'Tier 3', durationMonths: 6, dailyInterestRate: 0.9, minAmount: 1000 },
  { id: '4', name: 'Tier 4', durationMonths: 12, dailyInterestRate: 0.9, minAmount: 5000 },
  { id: '5', name: 'Tier 5', durationMonths: 24, dailyInterestRate: 0.9, minAmount: 10000 },
];

const InvestmentModule: React.FC<InvestmentModuleProps> = ({ user, refreshUser }) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (pkg: InvestmentPackage) => {
    setMessage(null);
    setLoading(true);

    try {
      const investAmount = parseFloat(amount);
      if (isNaN(investAmount) || investAmount <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      if (investAmount < pkg.minAmount) {
        throw new Error(`Minimum investment for ${pkg.name} is $${pkg.minAmount}.`);
      }
      if (investAmount > user.capital) {
        throw new Error("Insufficient capital balance.");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      subscribeToInvestment(user.id, pkg.id, investAmount, pkg.durationMonths, pkg.dailyInterestRate);
      
      setMessage({ type: 'success', text: `Successfully subscribed to ${pkg.name}!` });
      setAmount('');
      setSelectedPackage(null);
      refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Investment Packages</h1>
          <p className="text-gray-400">Grow your capital with our secure, high-yield investment tiers.</p>
        </div>
        <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-[#334155] flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
                <DollarSign size={18} className="text-blue-400" />
            </div>
            <div>
                <p className="text-xs text-gray-400">Available Capital</p>
                <p className="text-lg font-bold text-white">${user.capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {PACKAGES.map((pkg) => {
           const isSelected = selectedPackage === pkg.id;
           const monthlyReturn = (pkg.dailyInterestRate * 30).toFixed(1);
           const totalReturn = (pkg.dailyInterestRate * 30 * pkg.durationMonths).toFixed(1);

           return (
            <div 
                key={pkg.id} 
                className={`relative bg-[#0f172a] border rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-[#1e293b] hover:border-gray-600'}`}
            >
                {/* Header */}
                <div className={`p-6 ${isSelected ? 'bg-cyan-500/10' : 'bg-[#1e293b]/30'}`}>
                    <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} />
                        <span>{pkg.durationMonths} Month{pkg.durationMonths > 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Daily Rate</span>
                        <span className="text-green-400 font-bold">{pkg.dailyInterestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Monthly Return</span>
                        <span className="text-white font-medium">{monthlyReturn}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total ROI</span>
                        <span className="text-cyan-400 font-bold">{totalReturn}%</span>
                    </div>
                    
                    <div className="pt-4 border-t border-[#1e293b]">
                        <p className="text-xs text-gray-500 mb-1">Min. Investment</p>
                        <p className="text-lg font-bold text-white">${pkg.minAmount.toLocaleString()}</p>
                    </div>

                    {isSelected ? (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Enter Amount ($)</label>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-[#0b1120] border border-[#334155] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder={`Min ${pkg.minAmount}`}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSelectedPackage(null)}
                                    className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleSubscribe(pkg)}
                                    disabled={loading}
                                    className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setSelectedPackage(pkg.id);
                                setAmount('');
                                setMessage(null);
                            }}
                            className="w-full py-3 rounded-lg bg-[#1e293b] hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-500/30 font-bold transition-all duration-300 mt-2"
                        >
                            Select Plan
                        </button>
                    )}
                </div>
            </div>
           );
        })}
      </div>

      {/* Active Investments Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-cyan-400" />
            Your Active Investments
        </h2>

        {user.investments && user.investments.length > 0 ? (
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1e293b] text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4">Invested Amount</th>
                                <th className="px-6 py-4">Daily Rate</th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4">End Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e293b] text-sm">
                            {user.investments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-[#1e293b]/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">{inv.packageName}</td>
                                    <td className="px-6 py-4 text-gray-300">${inv.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-green-400">{inv.dailyInterestRate}%</td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(inv.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(inv.endDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="text-center py-12 bg-[#0f172a] rounded-xl border border-[#1e293b] border-dashed">
                <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-gray-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Active Investments</h3>
                <p className="text-gray-500">Select a package above to start earning daily interest.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentModule;
