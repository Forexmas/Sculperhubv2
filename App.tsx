import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import StatCard from './components/StatCard';
import TradingInterface from './components/TradingInterface';
import AdminPanel from './components/AdminPanel';
import NFTModule from './components/NFTModule';
import KYCModule from './components/KYCModule';
import DepositModule from './components/DepositModule';
import WithdrawalModule from './components/WithdrawalModule';
import TransferModule from './components/TransferModule';
import InvestmentModule from './components/InvestmentModule';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import LiveTradeFeed from './components/LiveTradeFeed';
import { getCurrentUser, getAdminUser, getUser, getAllUsers } from './services/mockBackend';
import { View, User } from './types';
import { Wallet, ArrowRightLeft, Gift, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simple Ticker Component
const TickerBar = () => (
  <div className="bg-[#1e293b] border-b border-[#334155] py-2 px-4 overflow-hidden flex items-center text-sm font-mono whitespace-nowrap">
    <div className="flex items-center gap-6 animate-marquee">
        <span className="flex items-center gap-2 text-white">
            <span className="font-bold">BTC</span>
            <span className="text-[#ef4444]">70,406 -125.00 (-0.18%)</span>
        </span>
        <span className="flex items-center gap-2 text-white">
            <span className="font-bold">Ethereum</span>
            <span className="text-[#ef4444]">2,055.2 -6.30 (-0.30%)</span>
        </span>
        <span className="flex items-center gap-2 text-white">
            <span className="font-bold bg-red-600 px-1 rounded text-xs">500</span>
            <span className="font-bold">S&P 500</span>
            <span className="text-[#10b981]">6,926.2 +159.4 (+2.1%)</span>
        </span>
         <span className="flex items-center gap-2 text-white">
            <span className="font-bold">USDT</span>
            <span className="text-gray-400">1.00 (0.00%)</span>
        </span>
    </div>
  </div>
);

// Dashboard Chart Component (Simplified for Dashboard View)
const DashboardChart = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    // Generate dummy candlestick-like data for Area chart
    const initialData = [];
    let price = 70400;
    for(let i=0; i<50; i++) {
        price += (Math.random() - 0.5) * 50;
        initialData.push({ time: i, price });
    }
    setData(initialData);
  }, []);

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-4 mt-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                 <div className="bg-orange-500/20 p-1 rounded">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                 </div>
                 <span className="font-bold text-white">Bitcoin / U.S. Dollar</span>
                 <span className="text-gray-500 text-xs">• 1 • Coinbase</span>
             </div>
             <div className="flex gap-2 text-xs text-gray-400">
                 <button className="hover:text-white bg-[#1e293b] px-2 py-1 rounded">1m</button>
                 <button className="hover:text-white px-2 py-1">30m</button>
                 <button className="hover:text-white px-2 py-1">1h</button>
             </div>
        </div>
        
        {/* Price Stats Header inside Chart */}
        <div className="flex gap-4 text-xs font-mono mb-4 border-b border-[#1e293b] pb-2">
            <span className="text-red-500">O 70,437.99</span>
            <span className="text-red-500">H 70,438.00</span>
            <span className="text-red-500">L 70,384.01</span>
            <span className="text-red-500">C 70,406.01</span>
            <span className="text-red-500">-31.99 (-0.05%)</span>
        </div>

        <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} orientation="right" tick={{fill: '#64748b', fontSize: 10}} tickCount={5} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

type ViewState = 'LANDING' | 'AUTH' | 'APP';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');

  // Refresh user data if logged in
  useEffect(() => {
    if (currentUser) {
       refreshData();
    }
  }, []);

  const refreshData = () => {
    if (currentUser) {
      const updated = getUser(currentUser.id);
      if (updated) setCurrentUser({...updated});
    }
  };

  const handleAuthNavigation = () => {
    setViewState('AUTH');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setViewState('APP');
    // Determine view based on role
    setCurrentView(user.role === 'ADMIN' ? 'ADMIN' : 'DASHBOARD');
  };

  const handleBackToLanding = () => {
    setViewState('LANDING');
  }

  if (viewState === 'LANDING') {
    return <LandingPage onEnter={handleAuthNavigation} />;
  }

  if (viewState === 'AUTH') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToLanding} />;
  }

  if (!currentUser) return <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">Authentication Error</div>;

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        // Calculate display values based on role
        let displayCapital = currentUser.capital;
        let displayAccumulating = currentUser.accumulating_balance;
        let displayBonus = currentUser.bonus;
        let displayProfit = currentUser.profit;

        if (currentUser.role === 'ADMIN') {
            const allUsers = getAllUsers().filter(u => u.role === 'USER');
            displayCapital = allUsers.reduce((sum, u) => sum + u.capital, 0);
            displayAccumulating = allUsers.reduce((sum, u) => sum + u.accumulating_balance, 0);
            displayBonus = allUsers.reduce((sum, u) => sum + u.bonus, 0);
            displayProfit = allUsers.reduce((sum, u) => sum + u.profit, 0);
        }

        // Calculate Win Rate for User
        const totalTrades = currentUser.total_won + currentUser.total_loss;
        const winRate = totalTrades > 0 ? ((currentUser.total_won / totalTrades) * 100).toFixed(1) : '0.0';

        return (
          <div className="space-y-6">
            <TickerBar />
            
            <div className="px-4 lg:px-8 pb-8">
                {/* 2x2 Grid + Full Width Rows */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Row 1 Left: Capital */}
                    <StatCard 
                        title={currentUser.role === 'ADMIN' ? "Total User Capital" : "Capital"}
                        value={`$${displayCapital.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                        subValue="BTC"
                        icon={Wallet} 
                        variant="blue"
                    />

                    {/* Row 1 Right: Accumulating Balance */}
                    <StatCard 
                        title={currentUser.role === 'ADMIN' ? "Total Accumulating Balance" : "Accumulating Balance"}
                        value={`$${displayAccumulating.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                        subValue="BTC 0.01993769"
                        variant="green"
                        rightElement={
                            <div className="text-right">
                                <ArrowRightLeft className="inline-block text-white/80 mb-1" size={20} />
                                <p className="text-xs text-white/80">{currentUser.role === 'ADMIN' ? "Total Bonus" : "Bonus"}</p>
                                <p className="text-lg font-bold">${displayBonus.toFixed(2)}</p>
                            </div>
                        }
                    />

                    {/* Row 2 Left: Trade Status (UPDATED) */}
                    <StatCard 
                        title="Trade Performance" 
                        value={`${winRate}%`}
                        subValue={currentUser.role === 'ADMIN' ? 'System Avg. Win Rate' : 'Personal Win Rate'}
                        variant="dark"
                        footer={
                            <div className="flex justify-between items-center px-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white mb-1">{currentUser.total_won}</p>
                                    <div className="flex items-center gap-1 text-[#10b981] text-xs uppercase font-bold">
                                        <ArrowUp size={14} /> Total Won
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white mb-1">{currentUser.total_loss}</p>
                                    <div className="flex items-center gap-1 text-[#ef4444] text-xs uppercase font-bold">
                                        <ArrowDown size={14} /> Total Loss
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    {/* Row 2 Right: Crypto Plan */}
                    <StatCard 
                        title="Crypto Plan" 
                        value="Silver"
                        subValue="Package Status: active"
                        icon={Gift} 
                        variant="yellow"
                    />
                </div>

                {/* Row 3: Profit (Full Width) */}
                <StatCard 
                    title={currentUser.role === 'ADMIN' ? "Total User Profit" : "Profit"}
                    value={`$${displayProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                    subValue="BTC 0.00503764"
                    variant="emerald"
                    rightElement={<ArrowRightLeft className="text-white/80" size={24} />}
                />

                {/* Charts and Live Feed Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2">
                        <DashboardChart />
                    </div>
                    <div className="h-[400px]">
                        <LiveTradeFeed />
                    </div>
                </div>

                {/* Chat Widget Mock */}
                <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
                    <button className="bg-white text-black px-4 py-2 rounded-full font-medium shadow-lg hover:bg-gray-100 transition flex items-center gap-2">
                        Chat with us <span className="text-xl">👋</span>
                    </button>
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0b1120]">1</span>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'TRADING':
        return <TradingInterface user={currentUser} refreshUser={refreshData} />;
      case 'NFT':
        return <NFTModule user={currentUser} refreshUser={refreshData} />;
      case 'KYC':
        return <KYCModule user={currentUser} refreshUser={refreshData} />;
      case 'DEPOSIT':
        return <DepositModule user={currentUser} refreshUser={refreshData} />;
      case 'WITHDRAWAL':
        return <WithdrawalModule user={currentUser} refreshUser={refreshData} />;
      case 'TRANSFER':
        return <TransferModule user={currentUser} refreshUser={refreshData} />;
      case 'INVESTMENT':
        return <InvestmentModule user={currentUser} refreshUser={refreshData} />;
      case 'ADMIN':
        if (currentUser.role !== 'ADMIN') return <div>Access Denied</div>;
        return <AdminPanel />;
      default:
        // Render other mock pages
        return (
             <div className="p-8 text-center text-gray-500">
                <h2 className="text-2xl font-bold text-white mb-2 capitalize">{currentView.toLowerCase().replace('_', ' ')}</h2>
                <p>This module is currently under development or maintenance.</p>
             </div>
        );
    }
  };

  return (
    <DashboardLayout 
      currentView={currentView} 
      setCurrentView={setCurrentView}
      currentUser={currentUser}
    >
      {renderContent()}
    </DashboardLayout>
  );
}