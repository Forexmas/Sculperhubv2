import React, { useState, useEffect } from 'react';
import { getUserTransactions } from '../services/mockBackend';
import { User, Transaction } from '../types';
import { History, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Briefcase } from 'lucide-react';

interface HistoryModuleProps {
  user: User;
  refreshUser: () => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT'>('ALL');

  useEffect(() => {
    setTransactions(getUserTransactions(user.id));
  }, [user.id]);

  const filteredTransactions = transactions.filter(t => filter === 'ALL' || t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="text-green-500" />;
      case 'WITHDRAWAL': return <ArrowUpRight className="text-red-500" />;
      case 'TRANSFER': return <ArrowRightLeft className="text-blue-500" />;
      case 'INVESTMENT': return <Briefcase className="text-purple-500" />;
      default: return <History className="text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-blue-500" /> Transaction History
          </h2>
          <p className="text-gray-400 text-sm">View all your financial activities.</p>
        </div>
        
        <div className="flex gap-2 bg-[#1e293b] p-1 rounded-lg">
            {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INVESTMENT'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${filter === f ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-20" />
                <p>No transactions found for this filter.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a] border-b border-[#334155] text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Type</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Method / Details</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155] text-sm">
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/5 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#334155] flex items-center justify-center">
                                            {getIcon(tx.type)}
                                        </div>
                                        <span className="font-bold text-white">{tx.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-white">
                                    ${tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </td>
                                <td className="p-4 text-gray-400">
                                    {tx.method}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        tx.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                        tx.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-gray-500 text-xs">
                                    {new Date(tx.date).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModule;
