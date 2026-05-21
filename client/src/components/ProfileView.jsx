import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { User, Key, Mail, Shield, CheckCircle, Save, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function ProfileView() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Message feedback systems
  const [infoMessage, setInfoMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Form states mapped directly to your user model properties
  const [infoForm, setInfoForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    certificate_type: '',
    certificate_number: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    // Read the active authenticated session from local cache memory arrays
    const cachedData = localStorage.getItem('aerofix_user');
    if (cachedData) {
      const activeUser = JSON.parse(cachedData);
      setUser(activeUser);
      setInfoForm({
        first_name: activeUser.first_name || '',
        last_name: activeUser.last_name || '',
        email: activeUser.email || '',
        certificate_type: activeUser.certificate_type || 'A&P',
        certificate_number: activeUser.certificate_number || ''
      });
    }
    setLoading(false);
  }, []);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit Handler 1: Update General Personnel Info
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoMessage(null);
    try {
      const res = await userService.updateProfile(user.id, infoForm);
      const updatedUser = res.data?.data?.user || { ...user, ...infoForm };
      
      // Sync local browser data layers with new server parameters
      localStorage.setItem('aerofix_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setInfoMessage({ type: 'success', text: 'Personnel records synchronized successfully.' });
    } catch (err) {
      setInfoMessage({ type: 'error', text: err.response?.data?.message || 'Database validation rejected changes.' });
    }
  };

  // Submit Handler 2: Secure Passphrase Roll-Over
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Confirmation input mismatch. Passphrases must align.' });
      return;
    }

    try {
      await userService.updatePassword(user.id, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordMessage({ type: 'success', text: 'Account password rolled over cleanly.' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Current shift passphrase verification failed.' });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* Dynamic Profile Cover Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-sky-600/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-black text-xl shadow-inner shrink-0">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
          <h1 className="text-2xl font-black text-white tracking-tight truncate">{user.first_name} {user.last_name}</h1>
          <p className="text-xs text-slate-400 font-mono tracking-wide truncate">{user.email}</p>
          <div className="flex gap-2 justify-center sm:justify-start pt-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-md">Role: {user.role}</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md flex items-center gap-1"><CheckCircle className="h-3 w-3" /> PIN Armed</span>
          </div>
        </div>
      </div>

      {/* Two-Column Form Field Configuration Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOCK A: UPDATE ACCOUNT INFORMATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="h-4 w-4 text-sky-400" /> Personnel Data Attributes
            </h3>

            {infoMessage && (
              <div className={`p-3 text-xs rounded-xl flex items-start gap-2 ${infoMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                {infoMessage.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <ShieldAlert className="h-4 w-4 shrink-0" />}
                <p className="font-semibold">{infoMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">First Name *</label>
                  <input type="text" name="first_name" required value={infoForm.first_name} onChange={handleInfoChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-sans text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Last Name *</label>
                  <input type="text" name="last_name" required value={infoForm.last_name} onChange={handleInfoChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-sans text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Email Target Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                  <input type="email" name="email" required value={infoForm.email} onChange={handleInfoChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">FAA License Type</label>
                  <input type="text" name="certificate_type" value={infoForm.certificate_type} onChange={handleInfoChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 text-sm" placeholder="e.g. A&P" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Certificate License ID</label>
                  <input type="text" name="certificate_number" value={infoForm.certificate_number} onChange={handleInfoChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono text-sm" placeholder="e.g. 1245152" />
                </div>
              </div>

              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-sm">
                <Save className="h-4 w-4" /> Save Record Shifts
              </button>
            </form>
          </div>
        </div>

        {/* BLOCK B: ROLL OVER PASSPHRASE CRITERIA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="h-4 w-4 text-amber-500" /> Security Credential Roll-Over
            </h3>

            {passwordMessage && (
              <div className={`p-3 text-xs rounded-xl flex items-start gap-2 ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <ShieldAlert className="h-4 w-4 shrink-0" />}
                <p className="font-semibold">{passwordMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Current Shift Passphrase *</label>
                <input type="password" name="current_password" required value={passwordForm.current_password} onChange={handlePasswordChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-sky-500" placeholder="••••••••" />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">New Secure Passphrase *</label>
                <input type="password" name="new_password" required value={passwordForm.new_password} onChange={handlePasswordChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-sky-500" placeholder="••••••••" />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Confirm New Passphrase *</label>
                <input type="password" name="confirm_password" required value={passwordForm.confirm_password} onChange={handlePasswordChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-sky-500" placeholder="••••••••" />
              </div>

              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm">
                <Shield className="h-4 w-4 text-amber-500" /> Re-Authorize Security Keys
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}