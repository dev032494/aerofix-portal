import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { ShieldAlert, Compass, LogIn, Key, User, Terminal, Cpu } from 'lucide-react';
import logoImg from '../assets/logo.png'; // Referencing the verbatim filename for your asset

export default function DeveloperLoginView({ onLoginSuccess }) {
  // Authentication Form States
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Hook for accurate System Logging timestamps
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dispatch Admin/Dev Authentication payloads directly to secure authorization endpoints
  const handleDevSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({
        user_name: formData.user_name,
        password: formData.password,
      });

      const { token, data } = res.data;
      const userRole = data.user.role;

      // Restrict this login view exclusively to 'admin' and 'developer' roles
      if (userRole !== 'admin' && userRole !== 'developer') {
        throw new Error('Access Denied. Insufficient administrative privileges.');
      }

      // Commit to session storage configuration
      localStorage.setItem('aerofix_token', token);
      localStorage.setItem('aerofix_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);

    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Cryptographic authentication challenge failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient radial glow panels matching the Dev/Admin theme colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-cyan-500/5" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className={`w-full max-w-md bg-slate-900 border rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-5 transition-all duration-500 border-cyan-900/40 ${loading ? 'scale-[0.99] shadow-xl' : 'scale-100'}`}>
        
        {/* NETWORK ACTION BLUR OVERLAY */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-cyan-500/20 rounded-full animate-ping duration-1000" />
              <div className="p-3 bg-slate-950 rounded-full border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Compass className="h-6 w-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                Authenticating Root
              </h4>
              <p className="text-[10px] text-slate-400 max-w-[200px]">
                Validating security keys and resolving administrative privileges...
              </p>
            </div>
          </div>
        )}

        {/* Branding Title Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="Academy Official Seal" 
              className="w-full h-full object-contain object-center drop-shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 tracking-wider uppercase font-mono bg-cyan-950/40 border border-cyan-900/30 w-fit mx-auto px-2.5 py-0.5 rounded-md">
              <Terminal className="h-3.5 w-3.5" />
              System Overlord Gateway
            </div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase pt-1">
              National Aviation Academy of the Philippines
            </h2>
            <div className="text-[10px] text-slate-400 font-mono inline-block bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              Dev Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-mono">{error}</p>
          </div>
        )}

        {/* --- SECURITY ROOT GATE INTERFACE --- */}
        <form onSubmit={handleDevSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="block font-bold text-slate-400 uppercase tracking-wide">Username *</label>
            <div className="relative text-sm">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                name="user_name" 
                required 
                value={formData.user_name} 
                onChange={handleInputChange} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500" 
                placeholder="root_operator" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-400 uppercase tracking-wide">Password *</label>
            <div className="relative text-sm">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleInputChange} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500" 
                placeholder="••••••••" 
              />
            </div>
          </div>

         
          {/* Root Submit Action */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs mt-4 uppercase tracking-wider"
          >
            <LogIn className="h-4 w-4" />
            <span>Establish Root Session</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/40">
          <span className="text-[10px] text-slate-500 font-mono">
            System Operations Matrix IP: 192.168.10.154
          </span>
        </div>

      </div>
    </div>
  );
}