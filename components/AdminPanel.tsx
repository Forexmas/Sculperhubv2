import React, { useState, useEffect } from 'react';
import { getAllUsers, adminAdjustFunds, updateKYCStatus, toggleUserStatus, getPendingTransactions, processTransaction, getSupportLogs, getDepositAddresses, updateDepositAddress } from '../services/mockBackend';
import { User, WalletType, KYCStatus, AccountStatus, Transaction } from '../types';
import { Shield, Check, X, Users, DollarSign, MessageSquare, AlertTriangle, Lock, Unlock, Power, ArrowRight, ArrowDownLeft, ArrowUpRight, RotateCcw, FileText, Calendar, MapPin, CreditCard, User as UserIcon, Eye, Briefcase, Wallet, Mail, Phone, Settings, Save } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'FINANCE' | 'LOGS' | 'KYC' | 'SETTINGS'>('USERS');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [message, setMessage] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState<number>(0);
  const [targetWallet, setTargetWallet] = useState<WalletType>('profit');
  const [fundAction, setFundAction] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  
  // KYC Review State
  const [kycReviewUser, setKycReviewUser] = useState<User | null>(null);

  // Settings State
  const [adminAddresses, setAdminAddresses] = useState(getDepositAddresses());

  useEffect(() => {
    setUsers(getAllUsers().filter(u => u.role === 'USER'));
    setTransactions(getPendingTransactions());
    setLogs(getSupportLogs());
    setAdminAddresses(getDepositAddresses());
  }, [refreshTrigger, activeTab]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFundAdjustment = () => {
    if (!selectedUser) return;
    try {
      adminAdjustFunds(selectedUser, targetWallet, fundAmount, fundAction);
      showMessage(`Successfully ${fundAction === 'CREDIT' ? 'added' : 'deducted'} $${fundAmount} from ${targetWallet}.`);
      setFundAmount(0);
      setSelectedUser(null);
      refreshData();
    } catch (e) {
      showMessage('Error processing fund adjustment.');
    }
  };

  const handleKYCUpdate = (userId: string, status: KYCStatus) => {
    updateKYCStatus(userId, status);
    showMessage(`User KYC updated to ${status}.`);
    setKycReviewUser(null); // Close modal if open
    refreshData();
  };

  const handleStatusToggle = (userId: string, currentStatus: AccountStatus) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      toggleUserStatus(userId, newStatus);
      showMessage(`User account ${newStatus.toLowerCase()}.`);
      refreshData();
  };

  const handleTransaction = (txId: string, action: 'APPROVE' | 'REJECT') => {
      processTransaction(txId, action);
      showMessage(`Transaction ${action.toLowerCase()}d.`);
      refreshData();
  };

  const handleAddressUpdate = (asset: 'BTC' | 'ETH' | 'USDT', value: string) => {
      try {
          updateDepositAddress(asset, value);
          setAdminAddresses(prev => ({...prev, [asset]: value}));
          showMessage(`${asset} address updated successfully.`);
      } catch(e: any) {
          showMessage(`Error: ${e.message}`);
      }
  };

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.VERIFIED: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30 shadow-[0_0_10px_-3px_rgba(74,222,128,0.3)]">Verified</span>;
      case KYCStatus.PENDING: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 animate-pulse">Pending Review</span>;
      case KYCStatus.REJECTED: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-500/30">Rejected</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">Unverified</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-cyber-purple" />
            Backend Controller
            </h2>
            <p className="text-gray-400 text-sm">System Administration & Override Console</p>
        </div>
        
        {message && (
          <div className="bg-cyber-accent/10 text-cyber-accent px-4 py-2 rounded border border-cyber-accent/50 animate-pulse flex items-center gap-2">
            <Check size={16} /> {message}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cyber-border overflow-x-auto">
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'USERS' ? 'text-cyber-accent border-b-2 border-cyber-accent' : 'text-gray-400 hover:text-white'}`}
          >
            <Users size={16} /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('KYC')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'KYC' ? 'text-cyber-accent border-b-2 border-cyber-accent' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText size={16} /> KYC Center
             {users.filter(u => u.kycStatus === KYCStatus.PENDING).length > 0 && <span className="bg-yellow-500 text-black text-[10px] px-1.5 rounded-full font-bold">{users.filter(u => u.kycStatus === KYCStatus.PENDING).length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('FINANCE')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'FINANCE' ? 'text-cyber-accent border-b-2 border-cyber-accent' : 'text-gray-400 hover:text-white'}`}
          >
            <DollarSign size={16} /> Financial Queue 
            {transactions.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{transactions.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'LOGS' ? 'text-cyber-accent border-b-2 border-cyber-accent' : 'text-gray-400 hover:text-white'}`}
          >
            <MessageSquare size={16} /> Comms & Logs
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-3 px-4 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'SETTINGS' ? 'text-cyber-accent border-b-2 border-cyber-accent' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings size={16} /> Settings
          </button>
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'USERS' && (
        <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-cyber-dark border-b border-cyber-border">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Identity</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Balances</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">KYC / Account Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Controls</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-[10px] text-gray-600 font-mono mt-1">ID: {user.id}</div>
                    </td>
                    <td className="p-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        <span className="text-gray-400">Capital:</span> <span className="text-white font-mono">${user.capital.toFixed(2)}</span>
                        <span className="text-gray-400">Profit:</span> <span className="text-cyber-accent font-mono">${user.profit.toFixed(2)}</span>
                        <span className="text-gray-400">Bonus:</span> <span className="text-cyber-purple font-mono">${user.bonus.toFixed(2)}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                        <div className="flex items-center gap-2">
                             {getStatusBadge(user.kycStatus)}
                             <span className={`px-2 py-0.5 rounded text-xs border ${user.status === 'ACTIVE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                                {user.status}
                             </span>
                        </div>
                        
                        <div className="flex gap-1 mt-2">
                            {user.kycStatus !== KYCStatus.VERIFIED && (
                                <button 
                                    onClick={() => handleKYCUpdate(user.id, KYCStatus.VERIFIED)} 
                                    title="Approve KYC" 
                                    className="p-1.5 bg-green-500/10 hover:bg-green-500/30 text-green-500 border border-green-500/30 rounded transition flex items-center gap-1 text-[10px]"
                                >
                                    <Check size={12} /> Approve
                                </button>
                            )}
                            {user.kycStatus !== KYCStatus.REJECTED && (
                                <button 
                                    onClick={() => handleKYCUpdate(user.id, KYCStatus.REJECTED)} 
                                    title="Reject KYC" 
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded transition flex items-center gap-1 text-[10px]"
                                >
                                    <X size={12} /> Reject
                                </button>
                            )}
                            {(user.kycStatus === KYCStatus.VERIFIED || user.kycStatus === KYCStatus.REJECTED) && (
                                <button 
                                    onClick={() => handleKYCUpdate(user.id, KYCStatus.PENDING)} 
                                    title="Reset to Pending" 
                                    className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 rounded transition flex items-center gap-1 text-[10px]"
                                >
                                    <RotateCcw size={12} /> Reset
                                </button>
                            )}
                        </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition">
                            <button 
                                onClick={() => { setSelectedUser(user.id); setTargetWallet('profit'); setFundAction('CREDIT'); }}
                                className="px-2 py-1 bg-cyber-dark hover:bg-cyber-accent/20 border border-gray-700 hover:border-cyber-accent text-gray-300 hover:text-cyber-accent rounded text-xs transition flex items-center gap-1"
                            >
                                <DollarSign size={12} /> Adjust Funds
                            </button>
                            <button 
                                onClick={() => handleStatusToggle(user.id, user.status)}
                                className={`px-2 py-1 rounded text-xs transition border flex items-center gap-1 ${user.status === 'ACTIVE' ? 'bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40' : 'bg-green-900/20 border-green-900/50 text-green-400 hover:bg-green-900/40'}`}
                            >
                                <Power size={12} /> {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {/* KYC CENTER TAB */}
      {activeTab === 'KYC' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             {/* Pending Requests List */}
             <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-cyber-border bg-cyber-dark flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FileText size={18} className="text-yellow-500" /> Pending Verification Requests
                    </h3>
                    <span className="text-xs text-gray-500">
                        {users.filter(u => u.kycStatus === KYCStatus.PENDING).length} pending
                    </span>
                </div>
                {users.filter(u => u.kycStatus === KYCStatus.PENDING).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <CheckCircleIcon className="mx-auto mb-3 opacity-20" size={48} />
                        <p>No pending KYC requests found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-cyber-border">
                        {users.filter(u => u.kycStatus === KYCStatus.PENDING).map(user => (
                            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-xs text-gray-400">{user.email} • Submitted: {user.kycData?.submittedAt ? new Date(user.kycData.submittedAt).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setKycReviewUser(user)}
                                    className="px-4 py-2 bg-cyber-accent text-cyber-dark font-bold rounded hover:bg-emerald-400 transition flex items-center gap-2"
                                >
                                    <Eye size={16} /> Review
                                </button>
                            </div>
                        ))}
                    </div>
                )}
             </div>

             {/* Verified History (Database) */}
            <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-cyber-border bg-cyber-dark flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Check size={18} className="text-green-500" /> Verified User Database
                    </h3>
                    <span className="text-xs text-gray-500">
                        {users.filter(u => u.kycStatus === KYCStatus.VERIFIED).length} records
                    </span>
                </div>
                
                {users.filter(u => u.kycStatus === KYCStatus.VERIFIED).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No verified users in database.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-cyber-dark/50 text-xs text-gray-500 uppercase font-bold">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Country</th>
                                    <th className="p-4">ID Type</th>
                                    <th className="p-4">ID Number</th>
                                    <th className="p-4">Submission Date</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cyber-border text-sm">
                                {users.filter(u => u.kycStatus === KYCStatus.VERIFIED).map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">{user.kycData?.country || 'N/A'}</td>
                                        <td className="p-4 text-gray-300 capitalize">{user.kycData?.idType.replace('_', ' ') || 'N/A'}</td>
                                        <td className="p-4 font-mono text-gray-400">{user.kycData?.idNumber || 'N/A'}</td>
                                        <td className="p-4 text-gray-400">{user.kycData?.submittedAt ? new Date(user.kycData.submittedAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setKycReviewUser(user)}
                                                className="px-3 py-1.5 bg-cyber-dark hover:bg-white/10 border border-cyber-border rounded text-xs font-medium transition text-gray-300 hover:text-white"
                                            >
                                                View Data
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </div>
      )}

      {/* FINANCIAL QUEUE TAB */}
      {activeTab === 'FINANCE' && (
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
             {transactions.length === 0 ? (
                 <div className="text-center py-12 text-gray-500">
                     <Check size={48} className="mx-auto mb-4 opacity-20" />
                     <p>All financial requests cleared.</p>
                 </div>
             ) : (
                 <div className="space-y-4">
                     {transactions.map(tx => (
                         <div key={tx.id} className="bg-cyber-dark border border-cyber-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                             <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                     {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                 </div>
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-white text-lg">${tx.amount.toLocaleString()}</span>
                                         <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{tx.type}</span>
                                     </div>
                                     <div className="text-sm text-gray-400">
                                         {tx.userName} • <span className="font-mono text-xs">{tx.method}</span>
                                     </div>
                                     <div className="text-xs text-gray-600 mt-1">{tx.date}</div>
                                 </div>
                             </div>
                             <div className="flex gap-3">
                                 <button 
                                    onClick={() => handleTransaction(tx.id, 'APPROVE')}
                                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 rounded font-medium transition flex items-center gap-2"
                                >
                                     <Check size={16} /> Approve
                                 </button>
                                 <button 
                                    onClick={() => handleTransaction(tx.id, 'REJECT')}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded font-medium transition flex items-center gap-2"
                                >
                                     <X size={16} /> Reject
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'SETTINGS' && (
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Wallet size={20} className="text-cyber-accent" /> System Deposit Wallets</h3>
             
             <div className="space-y-6 max-w-2xl">
                 <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-border">
                     <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Bitcoin (BTC) Wallet</label>
                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={adminAddresses.BTC}
                            onChange={(e) => handleAddressUpdate('BTC', e.target.value)}
                            className="flex-1 bg-black/30 border border-cyber-border rounded p-3 text-white font-mono text-sm focus:border-cyber-accent outline-none"
                         />
                     </div>
                     <p className="text-xs text-gray-500 mt-2">Used for all BTC deposit requests.</p>
                 </div>

                 <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-border">
                     <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Ethereum (ETH) Wallet</label>
                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={adminAddresses.ETH}
                            onChange={(e) => handleAddressUpdate('ETH', e.target.value)}
                            className="flex-1 bg-black/30 border border-cyber-border rounded p-3 text-white font-mono text-sm focus:border-cyber-accent outline-none"
                         />
                     </div>
                     <p className="text-xs text-gray-500 mt-2">Used for all ETH and ERC20 deposit requests.</p>
                 </div>

                 <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-border">
                     <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">USDT (TRC20) Wallet</label>
                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={adminAddresses.USDT}
                            onChange={(e) => handleAddressUpdate('USDT', e.target.value)}
                            className="flex-1 bg-black/30 border border-cyber-border rounded p-3 text-white font-mono text-sm focus:border-cyber-accent outline-none"
                         />
                     </div>
                     <p className="text-xs text-gray-500 mt-2">Used for USDT TRC20 deposit requests.</p>
                 </div>
             </div>
          </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'LOGS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="md:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-cyber-accent" /> Live Support Feed</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {logs.map((log) => (
                          <div key={log.id} className="p-3 rounded bg-cyber-dark border border-cyber-border">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-sm font-bold text-white">{log.user}</span>
                                  <span className="text-xs text-gray-500">{log.time}</span>
                              </div>
                              <p className="text-sm text-gray-300">{log.msg}</p>
                              {log.type === 'ALERT' && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                                      <AlertTriangle size={12} /> System Flag
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-cyber-card border border-cyber-border rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                      <button className="w-full text-left p-3 rounded bg-cyber-dark hover:bg-white/5 border border-cyber-border transition text-sm text-gray-300 hover:text-white">
                          Generate Daily Report
                      </button>
                      <button className="w-full text-left p-3 rounded bg-cyber-dark hover:bg-white/5 border border-cyber-border transition text-sm text-gray-300 hover:text-white">
                          Broadcast Maintenance Alert
                      </button>
                      <button className="w-full text-left p-3 rounded bg-cyber-dark hover:bg-white/5 border border-cyber-border transition text-sm text-gray-300 hover:text-white">
                          Export User Database (CSV)
                      </button>
                      <button className="w-full text-left p-3 rounded bg-red-900/10 hover:bg-red-900/20 border border-red-900/30 transition text-sm text-red-400">
                          Reset System Cache
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Fund Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Fund Management</h3>
            <p className="text-gray-400 text-xs mb-6 font-mono">
              TARGET: <span className="text-white">{selectedUser}</span>
            </p>

            <div className="space-y-4">
              {/* Action Type */}
              <div className="flex gap-2 p-1 bg-cyber-dark rounded-lg border border-cyber-border">
                  <button 
                    onClick={() => setFundAction('CREDIT')}
                    className={`flex-1 py-2 rounded text-sm font-medium transition ${fundAction === 'CREDIT' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                      Credit (+)
                  </button>
                  <button 
                    onClick={() => setFundAction('DEBIT')}
                    className={`flex-1 py-2 rounded text-sm font-medium transition ${fundAction === 'DEBIT' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                      Debit (-)
                  </button>
              </div>

              {/* Wallet Select */}
              <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Target Wallet</label>
                  <select 
                    value={targetWallet} 
                    onChange={(e) => setTargetWallet(e.target.value as WalletType)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded p-3 text-white focus:border-cyber-accent outline-none"
                  >
                      <option value="profit">Profit Wallet</option>
                      <option value="capital">Capital Wallet</option>
                      <option value="bonus">Bonus Balance</option>
                      <option value="accumulating_balance">Accumulating Balance</option>
                  </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">Amount ($)</label>
                <input 
                  type="number" 
                  value={fundAmount}
                  onChange={(e) => setFundAmount(Number(e.target.value))}
                  className="w-full bg-cyber-dark border border-cyber-border rounded p-3 text-white focus:border-cyber-accent outline-none text-lg font-mono"
                  autoFocus
                  min="0"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-3 rounded border border-cyber-border text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFundAdjustment}
                  className={`flex-1 py-3 rounded font-bold text-white transition shadow-lg ${fundAction === 'CREDIT' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                >
                  Confirm {fundAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Review Modal */}
      {kycReviewUser && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
              <div className="bg-cyber-card border border-cyber-border rounded-xl w-full max-w-4xl shadow-2xl my-8">
                  <div className="p-6 border-b border-cyber-border flex justify-between items-center sticky top-0 bg-cyber-card z-10 rounded-t-xl">
                      <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Shield className="text-cyber-accent" /> {kycReviewUser.kycStatus === KYCStatus.VERIFIED ? 'Verified User Data' : 'Review Verification'}
                          </h3>
                          <p className="text-sm text-gray-400">Viewing submission for <span className="text-white font-bold">{kycReviewUser.name}</span></p>
                      </div>
                      <button 
                        onClick={() => setKycReviewUser(null)}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                      >
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-8">
                      {/* Personal Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Legal Name</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><UserIcon size={14} /> {kycReviewUser.kycData?.fullName || 'N/A'}</div>
                          </div>
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Email</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm truncate" title={kycReviewUser.kycData?.email}><Mail size={14} /> {kycReviewUser.kycData?.email || 'N/A'}</div>
                          </div>
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Phone</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><Phone size={14} /> {kycReviewUser.kycData?.phone || 'N/A'}</div>
                          </div>
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Date of Birth</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><Calendar size={14} /> {kycReviewUser.kycData?.dob || 'N/A'}</div>
                          </div>
                           <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Country</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><MapPin size={14} /> {kycReviewUser.kycData?.country || 'N/A'}</div>
                          </div>
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Full Address</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm truncate" title={kycReviewUser.kycData?.address}>{kycReviewUser.kycData?.address || 'N/A'}</div>
                          </div>
                      </div>
                      
                      {/* Financial Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Occupation</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><Briefcase size={14} /> {kycReviewUser.kycData?.occupation || 'N/A'}</div>
                          </div>
                          <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Source of Funds</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><DollarSign size={14} /> {kycReviewUser.kycData?.sourceOfFunds || 'N/A'}</div>
                          </div>
                           <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Tax ID</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm font-mono">{kycReviewUser.kycData?.taxId || 'N/A'}</div>
                          </div>
                           <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Wallet Whitelist</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm font-mono truncate" title={kycReviewUser.kycData?.walletAddress}><Wallet size={14} /> {kycReviewUser.kycData?.walletAddress || 'N/A'}</div>
                          </div>
                      </div>

                      {/* ID Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Document Type</label>
                              <div className="font-bold text-white flex items-center gap-2 capitalize text-sm"><CreditCard size={14} /> {kycReviewUser.kycData?.idType.replace('_', ' ') || 'N/A'}</div>
                          </div>
                           <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                              <label className="text-xs text-gray-500 uppercase block mb-1">Document Number</label>
                              <div className="font-bold text-white flex items-center gap-2 text-sm"><FileText size={14} /> {kycReviewUser.kycData?.idNumber || 'N/A'}</div>
                          </div>
                      </div>

                      {/* Images */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase">Front Side ID</h4>
                              <div className="bg-black/50 border border-cyber-border rounded-lg h-40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyber-accent transition">
                                  {kycReviewUser.kycData?.frontImageUrl ? (
                                      <img src={kycReviewUser.kycData.frontImageUrl} alt="ID Front" className="w-full h-full object-contain" />
                                  ) : (
                                      <span className="text-gray-600 text-xs">No Image</span>
                                  )}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase">Back Side ID</h4>
                              <div className="bg-black/50 border border-cyber-border rounded-lg h-40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyber-accent transition">
                                   {kycReviewUser.kycData?.backImageUrl ? (
                                      <img src={kycReviewUser.kycData.backImageUrl} alt="ID Back" className="w-full h-full object-contain" />
                                  ) : (
                                      <span className="text-gray-600 text-xs">No Image</span>
                                  )}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase">Proof of Address</h4>
                              <div className="bg-black/50 border border-cyber-border rounded-lg h-40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyber-accent transition">
                                   {kycReviewUser.kycData?.proofOfAddressUrl ? (
                                      <img src={kycReviewUser.kycData.proofOfAddressUrl} alt="POA" className="w-full h-full object-contain" />
                                  ) : (
                                      <span className="text-gray-600 text-xs">No Image</span>
                                  )}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase">Selfie</h4>
                              <div className="bg-black/50 border border-cyber-border rounded-lg h-40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyber-accent transition">
                                   {kycReviewUser.kycData?.selfieImageUrl ? (
                                      <img src={kycReviewUser.kycData.selfieImageUrl} alt="Selfie" className="w-full h-full object-contain" />
                                  ) : (
                                      <span className="text-gray-600 text-xs">No Image</span>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-cyber-border bg-cyber-card flex justify-end gap-4 rounded-b-xl sticky bottom-0">
                      <button 
                        onClick={() => setKycReviewUser(null)}
                        className="px-6 py-3 text-gray-400 hover:text-white font-medium"
                      >
                          {kycReviewUser.kycStatus === KYCStatus.VERIFIED ? 'Close' : 'Cancel'}
                      </button>
                      
                      {kycReviewUser.kycStatus === KYCStatus.PENDING && (
                        <>
                            <button 
                                onClick={() => handleKYCUpdate(kycReviewUser.id, KYCStatus.REJECTED)}
                                className="px-6 py-3 bg-red-900/20 text-red-400 border border-red-900/50 rounded font-bold hover:bg-red-900/40 transition flex items-center gap-2"
                            >
                                <X size={18} /> Reject Application
                            </button>
                            <button 
                                onClick={() => handleKYCUpdate(kycReviewUser.id, KYCStatus.VERIFIED)}
                                className="px-8 py-3 bg-cyber-accent text-cyber-dark font-bold rounded hover:bg-emerald-400 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                            >
                                <Check size={18} /> Approve & Verify
                            </button>
                        </>
                      )}
                      
                      {/* Allow revocation for verified users if needed, or just view mode */}
                      {kycReviewUser.kycStatus === KYCStatus.VERIFIED && (
                          <button 
                            onClick={() => handleKYCUpdate(kycReviewUser.id, KYCStatus.REJECTED)}
                            className="px-6 py-3 bg-red-900/10 text-red-500 border border-red-900/30 rounded font-bold hover:bg-red-900/30 transition flex items-center gap-2"
                          >
                             <X size={18} /> Revoke Verification
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Helper component for empty state
const CheckCircleIcon = ({ size, className }: { size: number, className?: string }) => (
    <div className={`rounded-full border-2 border-current flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Check size={size * 0.5} />
    </div>
);

export default AdminPanel;