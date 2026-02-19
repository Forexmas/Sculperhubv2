import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/mockBackend';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Eye, EyeOff, Activity, ChevronLeft, Shield } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        const user = loginUser(email, password);
        
        // Strict Role Check
        if (userRole === 'ADMIN' && user.role !== 'ADMIN') {
            throw new Error("Access Denied: You do not have administrator privileges.");
        }
        if (userRole === 'USER' && user.role === 'ADMIN') {
            throw new Error("Admin accounts must log in via the Admin Portal.");
        }

        onLoginSuccess(user);
      } else {
        // Registration is only for Users
        if (!name) throw new Error("Name is required");
        const user = registerUser(name, email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (role: 'USER' | 'ADMIN') => {
      setUserRole(role);
      setIsLogin(true); // Always reset to login when switching contexts
      setError(null);
      setEmail('');
      setPassword('');
      setName('');
  };

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group"
        >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
        </button>

        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b] rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${userRole === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20'}`}>
               {userRole === 'ADMIN' ? <Shield className="text-white w-8 h-8" /> : <Activity className="text-white w-8 h-8" />}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {userRole === 'ADMIN' ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-center text-gray-400 mb-6 text-sm">
            {userRole === 'ADMIN' 
                ? 'Restricted access for system administrators.'
                : (isLogin ? 'Enter your credentials to access your terminal.' : 'Join the high-frequency trading elite.')
            }
          </p>

          {/* Role Separation Tabs */}
          <div className="flex bg-[#0b1120] rounded-lg p-1 mb-6 border border-[#1e293b]">
            <button 
                onClick={() => handleRoleSwitch('USER')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userRole === 'USER' ? 'bg-[#1e293b] text-white shadow ring-1 ring-white/10' : 'text-gray-400 hover:text-white'}`}
            >
                Trader Login
            </button>
            <button 
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userRole === 'ADMIN' ? 'bg-purple-900/30 text-purple-200 shadow ring-1 ring-purple-500/30' : 'text-gray-400 hover:text-white'}`}
            >
                Admin Access
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && userRole === 'USER' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b1120] border border-[#1e293b] rounded-lg py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#0b1120] border border-[#1e293b] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-1 transition-all placeholder-gray-600 ${userRole === 'ADMIN' ? 'focus:border-purple-500 focus:ring-purple-500' : 'focus:border-cyan-500 focus:ring-cyan-500'}`}
                  placeholder={userRole === 'ADMIN' ? "admin@scalperhub.com" : "name@example.com"}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#0b1120] border border-[#1e293b] rounded-lg py-3 pl-10 pr-12 text-white focus:outline-none focus:ring-1 transition-all placeholder-gray-600 ${userRole === 'ADMIN' ? 'focus:border-purple-500 focus:ring-purple-500' : 'focus:border-cyan-500 focus:ring-cyan-500'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 mt-6 transition-all transform active:scale-[0.98] ${isLoading ? 'bg-gray-700 cursor-not-allowed' : (userRole === 'ADMIN' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25')}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {userRole === 'ADMIN' ? 'Access Control Panel' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {userRole === 'USER' && (
            <div className="mt-6 pt-6 border-t border-[#1e293b] text-center">
                <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors"
                >
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
                </p>
            </div>
          )}

          {userRole === 'ADMIN' && (
              <div className="mt-6 pt-6 border-t border-[#1e293b] text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Lock size={12} /> Secure Connection. IP Logged.
                  </p>
              </div>
          )}
          
          {/* Mock Credentials Hint */}
          <div className="mt-8 bg-[#0b1120] p-4 rounded text-xs text-gray-500 border border-[#1e293b]">
            <p className="font-bold text-gray-400 mb-1">Demo Credentials:</p>
            {userRole === 'USER' ? (
                <div className="flex justify-between">
                    <span>User: alex@scalperhub.com</span>
                    <span>Pass: password123</span>
                </div>
            ) : (
                <div className="flex justify-between mt-1">
                    <span>Admin: admin@scalperhub.com</span>
                    <span>Pass: admin</span>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;