import React, { useState } from 'react';
import { authService } from '../services/api';
import { Hammer, Mail, Key, ShieldAlert, Compass, UserPlus, LogIn } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  // Navigation State switching between 'login' and 'register' modes
  const [viewMode, setViewMode] = useState('login'); 

  // Combined Form States matching backend user schema criteria
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'mechanic',
    signature_pin: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manual Login / Registration Submission Handling Core
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (viewMode === 'login') {
        res = await authService.login({ email: formData.email, password: formData.password });
      } else {
        // ⚡ FIX: Maps keys safely across both casing formats to satisfy backend validations
        res = await authService.register({
          first_name: formData.first_name,
          firstName: formData.first_name,
          last_name: formData.last_name,
          lastName: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          signature_pin: formData.signature_pin,
          signaturePin: formData.signature_pin
        });
      }

      const { token, data } = res.data;
      
      // Cache structural authorization parameters inside local browser storage
      localStorage.setItem('aerofix_token', token);
      localStorage.setItem('aerofix_user', JSON.stringify(data.user));
      
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization server handshakes could not be authenticated.');
    } finally {
      setLoading(false);
    }
  };

  // Third-Party Google OAuth Federated Sign-In Core Redirect
  const handleGoogleAuthRedirect = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`;
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient radial glow panels */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-5">
        
        {/* Terminal Branding Title Header */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-11 h-11 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl flex items-center justify-center shadow-inner">
            <Hammer className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-wider uppercase">
            {viewMode === 'login' ? 'Aerofix Access Portal' : 'Create Hangar Profile'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {viewMode === 'login' 
              ? 'Enter secure shift credentials or federated verification to initialize hangar clearance.' 
              : 'Provision a new mechanic account directly into the active personnel registry base.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          
          {/* REGISTRATION FIELDS INTERCEPT BLOCK */}
          {viewMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">First Name *</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500" placeholder="John" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Last Name *</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Duty Clearance *</label>
                  <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500">
                    <option value="mechanic">Mechanic</option>
                    <option value="inspector">Inspector</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Electronic Sign PIN *</label>
                  <input type="password" maxLength="4" name="signature_pin" required value={formData.signature_pin} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-center text-sm tracking-widest text-sky-400 font-bold focus:outline-none focus:border-sky-500" placeholder="0000" />
                </div>
              </div>
            </>
          )}

          {/* BASIC SECURITY CARD ID INPUTS */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-400 uppercase tracking-wide">Corporate Email Address</label>
            <div className="relative text-sm">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" placeholder="name@aerofix.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-400 uppercase tracking-wide">Passphrase</label>
            <div className="relative text-sm">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" placeholder="••••••••" />
            </div>
          </div>

          {/* Core Structural Processing Submit Trigger */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs mt-2"
          >
            {loading ? (
              <>
                <Compass className="h-4 w-4 animate-spin" />
                <span>Syncing Database Ledgers...</span>
              </>
            ) : viewMode === 'login' ? (
              <>
                <LogIn className="h-4 w-4" />
                <span>Initialize Hangar Session</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Register & Provision Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Visual Content Section Divider Block */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Federated OAuth Sign-In Trigger */}
        <button
          type="button"
          onClick={handleGoogleAuthRedirect}
          className="w-full bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs group"
        >
          <svg className="h-3.5 w-3.5 group-hover:scale-105 transition-transform shrink-0" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Authenticate with Google Network</span>
        </button>

        {/* Navigation Switcher Footer */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setViewMode(viewMode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-sky-400 font-medium transition-colors cursor-pointer underline"
          >
            {viewMode === 'login' 
              ? "Don't have an asset logging profile? Create one here" 
              : "Already provisioned on crew manifests? Return to Login"}
          </button>
        </div>

      </div>
    </div>
  );
}