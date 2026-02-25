import React, { useState } from 'react';
import { User } from '../types';
import { Users, Copy, CheckCircle, DollarSign, Gift, Share2, Award } from 'lucide-react';

interface ReferralModuleProps {
  user: User;
  refreshUser: () => void;
}

const ReferralModule: React.FC<ReferralModuleProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://scalperhub.com/register?ref=${user.referralCode || 'USER123'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock referred users data
  const referredUsers = [
    { id: 1, name: 'Michael K.', date: '2025-05-10', status: 'Active', earnings: 50.00 },
    { id: 2, name: 'Jessica T.', date: '2025-05-12', status: 'Pending Deposit', earnings: 0.00 },
    { id: 3, name: 'David R.', date: '2025-05-14', status: 'Active', earnings: 25.00 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyber-accent" />
            Referral Program
          </h2>
          <p className="text-gray-400 text-sm">Invite friends and earn bonuses together.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Referrals</p>
            <h3 className="text-2xl font-bold text-white">{user.referralCount || 0}</h3>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Earnings</p>
            <h3 className="text-2xl font-bold text-white">${(user.referralEarnings || 0).toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Gift size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Bonus Tier</p>
            <h3 className="text-2xl font-bold text-white">Silver</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Link & Instructions */}
        <div className="lg:col-span-2 space-y-6">
            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-cyber-card to-[#1e293b] border border-cyber-border rounded-xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-xl font-bold text-white mb-6">Your Unique Referral Link</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 bg-black/30 border border-cyber-border rounded-lg p-4 font-mono text-gray-300 truncate">
                        {referralLink}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className={`px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-cyber-accent text-cyber-dark hover:bg-white'}`}
                    >
                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <Share2 size={16} />
                    <span>Share via:</span>
                    <button className="hover:text-white transition">Twitter</button>
                    <span className="text-gray-600">•</span>
                    <button className="hover:text-white transition">Telegram</button>
                    <span className="text-gray-600">•</span>
                    <button className="hover:text-white transition">WhatsApp</button>
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center relative">
                        <div className="w-16 h-16 mx-auto bg-cyber-dark border border-cyber-border rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-cyber-accent/10">1</div>
                        <h4 className="font-bold text-white mb-2">Invite Friends</h4>
                        <p className="text-sm text-gray-400">Share your unique link with friends and community.</p>
                    </div>
                    <div className="text-center relative">
                         <div className="hidden md:block absolute top-8 left-[-50%] right-[50%] h-px bg-gradient-to-r from-transparent via-cyber-border to-transparent"></div>
                        <div className="w-16 h-16 mx-auto bg-cyber-dark border border-cyber-border rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-cyber-accent/10">2</div>
                        <h4 className="font-bold text-white mb-2">They Deposit</h4>
                        <p className="text-sm text-gray-400">Friends sign up and make their first deposit.</p>
                    </div>
                    <div className="text-center relative">
                        <div className="hidden md:block absolute top-8 left-[-50%] right-[50%] h-px bg-gradient-to-r from-transparent via-cyber-border to-transparent"></div>
                        <div className="w-16 h-16 mx-auto bg-cyber-dark border border-cyber-border rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-cyber-accent/10">3</div>
                        <h4 className="font-bold text-white mb-2">You Earn</h4>
                        <p className="text-sm text-gray-400">Get 5% of their deposit directly to your bonus balance.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Referred Users List */}
        <div className="space-y-6">
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 h-full">
                <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                    <span>Referred Users</span>
                    <span className="text-xs font-normal text-gray-500">Last 30 Days</span>
                </h3>
                
                {user.referralCount > 0 ? (
                    <div className="space-y-4">
                        {referredUsers.map((ref) => (
                            <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-gray-300">
                                        {ref.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{ref.name}</p>
                                        <p className="text-xs text-gray-500">{ref.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-400">+${ref.earnings}</p>
                                    <p className="text-[10px] text-gray-500">{ref.status}</p>
                                </div>
                            </div>
                        ))}
                         <button className="w-full py-2 text-xs text-center text-gray-500 hover:text-white mt-2">View All History</button>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No referrals yet.</p>
                        <p className="text-xs mt-2">Share your link to get started!</p>
                    </div>
                )}
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <Award className="text-yellow-500 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-white mb-1">Pro Tip</h4>
                        <p className="text-sm text-gray-300">Reach 10 active referrals to unlock the <span className="text-yellow-400 font-bold">Gold Tier</span> and earn 8% commission on all deposits.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ReferralModule;
