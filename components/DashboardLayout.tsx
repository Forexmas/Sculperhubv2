import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Image as ImageIcon, 
  ShieldCheck, 
  Menu, 
  X,
  LogOut,
  UserCircle,
  FileCheck,
  Settings,
  History,
  CreditCard,
  ArrowRightLeft,
  Wallet,
  BarChart2,
  Signal,
  Globe,
  PieChart
} from 'lucide-react';
import { View, User, KYCStatus } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView,
  currentUser 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userRole = currentUser.role;

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
    { id: 'MARKET', label: 'Market', icon: Globe, section: 'APPS' },
    { id: 'INVESTMENT', label: 'Investment', icon: PieChart, section: 'APPS' },
    { id: 'DEPOSIT', label: 'Deposit', icon: CreditCard, section: 'APPS' },
    { id: 'TRANSFER', label: 'Fund Transfer', icon: ArrowRightLeft, section: 'APPS' },
    { id: 'WITHDRAWAL', label: 'Withdrawal', icon: Wallet, section: 'APPS' },
    { id: 'HISTORY', label: 'History', icon: History, section: 'APPS' },
    { id: 'TRADING', label: 'Scalping Trade', icon: TrendingUp, section: 'APPS' },
    { id: 'SIGNAL', label: 'Signal', icon: Signal, section: 'APPS' },
    { id: 'KYC', label: 'AML / KYC', icon: ShieldCheck, section: 'APPS' }, // Changed icon to ShieldCheck to match screenshot vibe
    { id: 'SETTINGS', label: 'Settings', icon: Settings, section: 'APPS' },
  ];

  if (userRole === 'ADMIN') {
    navItems.unshift({ id: 'ADMIN', label: 'Admin Dashboard', icon: ShieldCheck, section: 'ADMIN' });
  } else {
    // If not admin, add NFT as an app (custom addition to fit the prompt requirements while keeping screenshot look)
    navItems.splice(9, 0, { id: 'NFT', label: 'NFT Portfolio', icon: ImageIcon, section: 'APPS' });
  }

  const getKYCBadge = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.VERIFIED: return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">Verified</span>;
      case KYCStatus.PENDING: return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>;
      case KYCStatus.REJECTED: return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>;
      default: return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Unverified</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0f172a] border-r border-[#1e293b] 
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-[#10b981] w-8 h-8" />
            <span className="text-xl font-bold text-[#10b981]">ScalperHub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              // Render Section Header if it's the first item of a new section (excluding MAIN)
              const showSectionHeader = item.section !== 'MAIN' && (index === 0 || navItems[index - 1].section !== item.section);

              return (
                <React.Fragment key={item.id}>
                  {showSectionHeader && (
                    <li className="px-6 py-2 mt-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {item.section}
                      </span>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        setCurrentView(item.id as View);
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-6 py-3 border-l-4 transition-all duration-200
                        ${isActive 
                          ? 'border-[#3b82f6] bg-[#1e293b] text-white' 
                          : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1e293b]/50'}
                      `}
                    >
                      <Icon size={18} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-[#1e293b]">
             <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full px-2 py-2">
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
             </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            {/* Breadcrumb placeholder */}
            <h2 className="text-white font-medium hidden md:block capitalize">
                {currentView.toLowerCase().replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded border border-[#334155]">
                <span className="text-sm text-gray-300">English</span>
                <Globe size={14} className="text-gray-400" />
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white leading-none">
                        {userRole === 'ADMIN' ? 'Super Admin' : (currentUser.name || 'Trader')}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <p className="text-xs text-gray-500">TRIN EXCH</p>
                        {userRole !== 'ADMIN' && getKYCBadge(currentUser.kycStatus)}
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                        <UserCircle className="text-gray-300" size={24} />
                    </div>
                </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto bg-[#0b1120] text-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;