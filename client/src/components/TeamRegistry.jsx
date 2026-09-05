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
        // Strictly filter for student role accounts
        const studentOnlyUsers = allUsers.filter(u => (u.role || '').toLowerCase() === 'student');
        setRegistrations(studentOnlyUsers); 
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

  // Filter student list based on search query AND status dropdown selection
  const filteredStudents = registrations.filter(student => {
    // Double-check role enforcement
    const isStudentRole = (student.role || '').toLowerCase() === 'student';
    if (!isStudentRole) return false;

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
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3 bg-slate-50">
      <Users className="h-10 w-10 text-sky-600 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Querying registration databases...</span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900">
      <div className="w-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">
        
        {/* Top Banner Block */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">Student Intake Registry</h1>
            <p className="text-slate-500 text-xs mt-1 truncate">Verify student certifications, track active training accounts, and manage admissions paperwork.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Review</span>
              <span className="text-base font-mono font-bold text-amber-600">{pendingCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Roster</span>
              <span className="text-base font-mono font-bold text-sky-600">{registrations.length}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-50 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar space-y-6">

          {/* Master Database Roster View Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden text-xs flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider w-full md:w-auto">Master Database Roster</h2>
              
              {/* Controls: Search + Status Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                
                {/* Status Filter Dropdown */}
                <div className="relative w-full sm:w-44">
                  <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium appearance-none cursor-pointer text-xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Profiles</option>
                    <option value="pending">Pending Review</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search student name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>

              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider bg-slate-100/70 text-[10px]">
                    <th className="p-4">Student Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Status Toggle</th>
                    <th className="p-4 text-right">Verification State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                        No student records matched the active search and status filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const active = isStudentActive(student);
                      const verified = isStudentVerified(student);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 text-sm">{getStudentName(student)}</div>
                            <div className="text-slate-500 font-mono mt-0.5 text-[11px]">{student.email}</div>
                          </td>
                          <td className="p-4 align-middle text-slate-700 font-medium capitalize">
                            {student.role || 'student'}
                          </td>
                          <td className="p-4 text-center align-middle">
                            <button
                              onClick={() => handleToggleStatus(student.id, active)}
                              disabled={updatingStatusId === student.id}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                                active 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="h-3 w-3" />
                              {updatingStatusId === student.id ? 'Updating...' : active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                          <td className="p-4 text-right align-middle">
                            {active && verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle className="h-3 w-3 text-emerald-600" /> Active Profile
                              </span>
                            ) : !active && !verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Clock className="h-3 w-3 text-amber-600" /> Pending Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                <XCircle className="h-3 w-3 text-rose-600" /> Inactive
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
      </div>
    </div>
  );
}