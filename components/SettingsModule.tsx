import React, { useState } from 'react';
import { User } from '../types';
import { Settings, User as UserIcon, Lock, Bell, Shield, Wallet, Save, LogOut } from 'lucide-react';

interface SettingsModuleProps {
  user: User;
  refreshUser: () => void;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'PREFERENCES'>('PROFILE');
  
  // Mock Form States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  
  const [message, setMessage] = useState('');

  const handleSaveProfile = () => {
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSecurity = () => {
      if (newPassword !== confirmPassword) {
          setMessage('Passwords do not match.');
          return;
      }
      setMessage('Security settings updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setWithdrawalPin('');
      setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                  <UserIcon className="text-gray-300" size={32} />
              </div>
          </div>
          <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {user.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {user.status}
                  </span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
              <button 
                  onClick={() => setActiveTab('PROFILE')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'PROFILE' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white hover:bg-[#334155]'}`}
              >
                  <UserIcon size={18} /> Profile
              </button>
              <button 
                  onClick={() => setActiveTab('SECURITY')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'SECURITY' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white hover:bg-[#334155]'}`}
              >
                  <Lock size={18} /> Security
              </button>
              <button 
                  onClick={() => setActiveTab('PREFERENCES')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'PREFERENCES' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white hover:bg-[#334155]'}`}
              >
                  <Bell size={18} /> Preferences
              </button>
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-[#1e293b] border border-[#334155] rounded-xl p-6">
              {message && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-sm flex items-center gap-2">
                      <Shield size={16} /> {message}
                  </div>
              )}

              {activeTab === 'PROFILE' && (
                  <div className="space-y-6">
                      <h3 className="text-xl font-bold text-white border-b border-[#334155] pb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-sm text-gray-400">Full Name</label>
                              <input 
                                  type="text" 
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm text-gray-400">Email Address</label>
                              <input 
                                  type="email" 
                                  value={email}
                                  disabled
                                  className="w-full bg-[#0f172a]/50 border border-[#334155] rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                              />
                              <p className="text-xs text-gray-500">Contact support to change email.</p>
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm text-gray-400">User ID</label>
                              <input 
                                  type="text" 
                                  value={user.id}
                                  disabled
                                  className="w-full bg-[#0f172a]/50 border border-[#334155] rounded-lg px-4 py-2 text-gray-500 font-mono cursor-not-allowed"
                              />
                          </div>
                      </div>
                      <div className="pt-4">
                          <button 
                              onClick={handleSaveProfile}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                          >
                              <Save size={18} /> Save Changes
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'SECURITY' && (
                  <div className="space-y-8">
                      <div>
                          <h3 className="text-xl font-bold text-white border-b border-[#334155] pb-4 mb-6">Change Password</h3>
                          <div className="space-y-4 max-w-md">
                              <div className="space-y-2">
                                  <label className="text-sm text-gray-400">Current Password</label>
                                  <input 
                                      type="password" 
                                      value={currentPassword}
                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm text-gray-400">New Password</label>
                                  <input 
                                      type="password" 
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-sm text-gray-400">Confirm New Password</label>
                                  <input 
                                      type="password" 
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                  />
                              </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-xl font-bold text-white border-b border-[#334155] pb-4 mb-6">Withdrawal PIN</h3>
                          <div className="space-y-4 max-w-md">
                              <div className="space-y-2">
                                  <label className="text-sm text-gray-400">New PIN Code (4-6 digits)</label>
                                  <input 
                                      type="password" 
                                      value={withdrawalPin}
                                      onChange={(e) => setWithdrawalPin(e.target.value)}
                                      maxLength={6}
                                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono tracking-widest"
                                      placeholder="••••"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="pt-4">
                          <button 
                              onClick={handleSaveSecurity}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                          >
                              <Save size={18} /> Update Security
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'PREFERENCES' && (
                  <div className="space-y-6">
                      <h3 className="text-xl font-bold text-white border-b border-[#334155] pb-4">Notifications</h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                              <div>
                                  <h4 className="text-white font-medium">Email Notifications</h4>
                                  <p className="text-sm text-gray-400">Receive emails about account activity and promotions.</p>
                              </div>
                              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                                  <span className="absolute left-0 inline-block w-6 h-6 bg-white border-2 border-green-500 rounded-full transform translate-x-6"></span>
                              </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                              <div>
                                  <h4 className="text-white font-medium">Trade Alerts</h4>
                                  <p className="text-sm text-gray-400">Get notified when your trade hits TP or SL.</p>
                              </div>
                              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                                  <span className="absolute left-0 inline-block w-6 h-6 bg-white border-2 border-green-500 rounded-full transform translate-x-6"></span>
                              </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                              <div>
                                  <h4 className="text-white font-medium">Marketing Updates</h4>
                                  <p className="text-sm text-gray-400">Receive news about new features and tokens.</p>
                              </div>
                              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-600">
                                  <span className="absolute left-0 inline-block w-6 h-6 bg-white border-2 border-gray-600 rounded-full transform translate-x-0"></span>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default SettingsModule;
