import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Users, CheckCircle, XCircle, Clock, Search, Power, Filter } from 'lucide-react';

export default function StudentApprovalRegistry() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'inactive'

  // Helper to extract property values handling both camelCase and snake_case models
  const getStudentName = (s) => `${s.first_name || s.firstName || ''} ${s.last_name || s.lastName || ''}`.trim() || 'Unknown Student';
  const isStudentActive = (s) => Boolean(s.is_active ?? s.isActive);
  const isStudentVerified = (s) => Boolean(s.is_verified ?? s.isValidated);

  const fetchRegistrations = () => {
    setLoading(true);
    userService.getAllUsers()
      .then(res => { 
        const allUsers = res.data?.data?.users || res.data?.users || [];
        setRegistrations(allUsers); 
        setError(null); 
        setLoading(false); 
      })
      .catch(err => { 
        setError(err.message || 'Failed to connect to database.'); 
        setLoading(false); 
      });
  };

  useEffect(() => { 
    fetchRegistrations(); 
  }, []);

  // Directly toggle active user state from master roster
  const handleToggleStatus = async (studentId, currentStatus) => {
    setUpdatingStatusId(studentId);
    try {
      await userService.updateStatus(studentId, !currentStatus);
      fetchRegistrations();
    } catch (err) {
      alert(`Failed to update user active state: ${err.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const pendingCount = registrations.filter(s => !isStudentActive(s) && !isStudentVerified(s)).length;

  // Filter students based on search query AND status dropdown selection
  const filteredStudents = registrations.filter(student => {
    const fullName = getStudentName(student).toLowerCase();
    const email = (student.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(term) || email.includes(term);

    const active = isStudentActive(student);
    const verified = isStudentVerified(student);

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = active && verified;
    } else if (statusFilter === 'pending') {
      matchesStatus = !active && !verified;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !active && verified;
    }

    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
      <Users className="h-10 w-10 text-sky-500 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Querying registration databases...</span>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Banner Block */}
      <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Student Intake Registry</h1>
          <p className="text-slate-400 text-xs mt-1">Verify student certifications, track active training accounts, and manage admissions paperwork.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[100px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending Review</span>
            <span className="text-base font-mono font-bold text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[100px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Roster</span>
            <span className="text-base font-mono font-bold text-sky-400">{registrations.length}</span>
          </div>
        </div>
      </div>

      {/* Master Database Roster View Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full md:w-auto">Master Database Roster</h2>
          
          {/* Controls: Search + Status Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            
            {/* Status Filter Dropdown */}
            <div className="relative w-full sm:w-44">
              <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-medium appearance-none cursor-pointer text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Profiles</option>
                <option value="pending">Pending Review</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
              <input 
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider bg-slate-950/40">
                <th className="p-4">Student Details</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Status Toggle</th>
                <th className="p-4 text-right">Verification State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                    No student records matched the active search and status filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const active = isStudentActive(student);
                  const verified = isStudentVerified(student);

                  return (
                    <tr key={student.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{getStudentName(student)}</div>
                        <div className="text-slate-400 font-mono mt-0.5 text-[11px]">{student.email}</div>
                      </td>
                      <td className="p-4 align-middle text-slate-300 font-medium capitalize">
                        {student.role || <span className="text-slate-500 italic">Unassigned Track</span>}
                      </td>
                      <td className="p-4 text-center align-middle">
                        <button
                          onClick={() => handleToggleStatus(student.id, active)}
                          disabled={updatingStatusId === student.id}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            active 
                              ? 'bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/40' 
                              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/40'
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          {updatingStatusId === student.id ? 'Updating...' : active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td className="p-4 text-right align-middle">
                        {active && verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3 w-3" /> Active Profile
                          </span>
                        ) : !active && !verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-md">
                            <Clock className="h-3 w-3" /> Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-md">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}