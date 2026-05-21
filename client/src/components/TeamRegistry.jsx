import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Users, UserPlus, Mail, X, CheckCircle } from 'lucide-react';

export default function TeamRegistry() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'mechanic', certificate_type: 'A&P', certificate_number: '', signature_pin: '' });

  const fetchUsers = () => {
    setLoading(true);
    userService.getAllUsers()
      .then(res => { setUsers(res.data?.data?.users || []); setError(null); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'mechanic', certificate_type: 'A&P', certificate_number: '', signature_pin: '' });
      fetchUsers();
    } catch (err) { alert(`Validation rejected: ${err.message}`); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
      <Users className="h-10 w-10 text-sky-500 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Querying employee registry...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Title block banner layout overview section */}
      <div className="flex flex-col gap-4 bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Crew Personnel Directory</h1>
          <p className="text-slate-400 text-xs mt-1">Manage active structural maintenance crew members and authorization sign-off privileges.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Add Crew Member
        </button>
      </div>

      {/* ⚡ THE ADAPTIVE LAYOUT CREW DIRECTORY RESPONSIVE GRID PLACEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {users?.map(user => (
          <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-5 text-sm">
            <div className="flex justify-between items-start gap-4">
              <div className="truncate">
                <h3 className="font-bold text-white text-base truncate">{user.first_name} {user.last_name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1 truncate"><Mail className="h-3 w-3 text-slate-600" /> {user.email}</p>
              </div>
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 tracking-wider shrink-0">{user.role}</span>
            </div>
            
            <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{user.certificate_type || 'FAA'} ID</span>
                <span className="font-mono text-slate-300 font-medium mt-0.5 block">{user.certificate_number || 'NON-LICENSED'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-md shadow-inner text-[11px]"><CheckCircle className="h-3.5 w-3.5" /> PIN Active</div>
            </div>
          </div>
        )) || <p className="text-sm text-slate-500 italic text-center col-span-full py-10">No active maintenance personnel recorded.</p>}
      </div>

      {/* =========================================================================
          ⚡ ADAPTIVE ACCOUNT CREATION DRAWER SHEET MODAL OVERLAY LAYOUT
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <h3 className="font-bold text-white text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-sky-500" /> Provision Crew Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1 rounded-lg hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">First Name *</label><input type="text" name="first_name" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Last Name *</label><input type="text" name="last_name" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
              </div>
              <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Email Address *</label><input type="email" name="email" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Passphrase *</label><input type="password" name="password" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Clearance Role *</label><select name="role" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"><option value="mechanic">Mechanic</option><option value="inspector">Inspector</option><option value="manager">Manager</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">License Type</label><input type="text" name="certificate_type" defaultValue="A&P" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">License ID</label><input type="text" name="certificate_number" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
              </div>
              <div><label className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Electronic Sign-off PIN (4 Digits) *</label><input type="password" maxLength="4" name="signature_pin" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center text-sm text-sky-400 font-bold bg-slate-950" placeholder="0000" /></div>
              
              <div className="pt-4 flex gap-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md">Provision</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}