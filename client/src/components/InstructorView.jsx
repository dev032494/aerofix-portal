import React, { useState, useEffect } from 'react';
import { instructorService } from '../services/api';
import {
  User,
  FileBadge,
  Save,
  GraduationCap,
  X,
  Plus,
  Search,
  Filter,
  Power,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Hash
} from 'lucide-react';

function Instructor() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'inactive'

  // Toast Notification State
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

  // Extract active user safely
  let activeUser = {};
  const cachedData = localStorage.getItem('aerofix_user');
  if (cachedData) {
    try {
      activeUser = JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached user data', e);
    }
  }

  // Modal State for Adding / Editing Instructor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructorId, setEditingInstructorId] = useState(null);
  const [formData, setFormData] = useState({
    i_first_name: '',
    i_middle_name: '',
    i_last_name: '',
    i_license_number: '',
    i_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim(),
  });

  // Helper to trigger auto-dismissing toast notifications
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helpers to safely read name, license, and status properties
  const getInstructorName = (i) => {
    const first = i.i_first_name || i.first_name || i.firstName || '';
    const middle = i.i_middle_name || i.middle_name || i.middleName || '';
    const last = i.i_last_name || i.last_name || i.lastName || '';
    return `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim() || 'Unknown Instructor';
  };

  const getLicenseNumber = (i) => i.i_license_number || i.license_number || i.licenseNumber || 'N/A';
  const isInstructorActive = (i) => Boolean(i.i_status);

  const fetchInstructors = () => {
    setLoading(true);
    instructorService.getAllInstructors()
      .then(res => {
        const data = res.data?.data?.instructors || res.data?.instructors || res.data || [];
        setInstructors(Array.isArray(data) ? data : []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        const errMsg = err.message || 'Failed to connect to instructor database.';
        setError(errMsg);
        triggerToast(errMsg, 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleToggleStatus = async (instructorId, currentStatus) => {
    setUpdatingStatusId(instructorId);
    try {
      console.log(!currentStatus);

      await instructorService.updateStatus(instructorId, !currentStatus);
      triggerToast(`Instructor account ${!currentStatus ? 'activated' : 'deactivated'} successfully.`, 'success');
      fetchInstructors();
    } catch (err) {
      triggerToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingInstructorId(null);
    setFormData({
      i_first_name: '',
      i_middle_name: '',
      i_last_name: '',
      i_license_number: '',
      i_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (instructor) => {
    setEditingInstructorId(instructor.i_id || instructor.id);
    setFormData({
      i_first_name: instructor.i_first_name || instructor.first_name || instructor.firstName || '',
      i_middle_name: instructor.i_middle_name || instructor.middle_name || instructor.middleName || '',
      i_last_name: instructor.i_last_name || instructor.last_name || instructor.lastName || '',
      i_license_number: getLicenseNumber(instructor),
      i_create_by: instructor.i_create_by || `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim(),
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstructorId) {
        // Update Instructor
        if (instructorService.updateInstructor) {
          await instructorService.updateInstructor(editingInstructorId, formData);
        } else {
          // Fallback call if update function is named differently in API
          await instructorService.createInstructor({ id: editingInstructorId, ...formData });
        }
        triggerToast('Instructor profile updated successfully!', 'success');
      } else {
        // Add Instructor
        await instructorService.createInstructor(formData);
        triggerToast('New instructor registered successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchInstructors();
    } catch (err) {
      triggerToast(`Failed to save instructor: ${err.message}`, 'error');
    }
  };

  const pendingCount = instructors.filter(i => !isInstructorActive(i)).length;

  const filteredInstructors = instructors.filter(instructor => {
    const fullName = getInstructorName(instructor).toLowerCase();
    const license = getLicenseNumber(instructor).toLowerCase();
    const idString = String(instructor.i_id || instructor.id || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(term) || license.includes(term) || idString.includes(term);

    const active = isInstructorActive(instructor);

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = activ;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !active;
    }

    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
      <GraduationCap className="h-10 w-10 text-sky-500 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Querying instructor database...</span>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans relative">

      {/* Dynamic Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${toast.type === 'error'
            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-medium">
              <p className="font-bold mb-0.5 uppercase tracking-wider text-[10px]">
                {toast.type === 'error' ? 'System Notification' : 'Operation Complete'}
              </p>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Block */}
      <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Instructor Registry</h1>
          <p className="text-slate-400 text-xs mt-1">Manage flight & technical instructor credentials, license records, and duty status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending Review</span>
              <span className="text-base font-mono font-bold text-amber-400">{pendingCount}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Cadre</span>
              <span className="text-base font-mono font-bold text-sky-400">{instructors.length}</span>
            </div>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-600/20 active:scale-98"
          >
            <Plus className="h-4 w-4" /> Add Instructor
          </button>
        </div>
      </div>

      {/* Master Roster Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full md:w-auto">Master Instructor Roster</h2>

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
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search ID, name or license #..."
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
                <th className="p-4 w-20">ID</th>
                <th className="p-4">Instructor Details</th>
                <th className="p-4">License Number</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                    No instructor records matched the active search and status filters.
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((instructor) => {
                  const active = isInstructorActive(instructor);
                  const instId = instructor.i_id || instructor.id;

                  return (
                    <tr key={instId || instructor.i_license_number} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-4 align-middle">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                          <Hash className="h-3 w-3 text-slate-600" />
                          {instId ?? 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-sky-400 shrink-0" />
                          {getInstructorName(instructor)}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-slate-300 font-mono font-medium">
                        <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
                          <FileBadge className="h-3.5 w-3.5 text-slate-500" />
                          {getLicenseNumber(instructor)}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                            <CheckCircle className="h-3 w-3" /> Active Cadre
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded-md">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right align-middle">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Info Button */}
                          <button
                            onClick={() => handleOpenEditModal(instructor)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Edit className="h-3 w-3 text-sky-400" />
                            Edit Info
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(instId, active)}
                            disabled={updatingStatusId === instId}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-1.5 ${active
                              ? 'bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/40'
                              : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/40'
                              }`}
                          >
                            <Power className="h-3 w-3" />
                            {updatingStatusId === instId ? 'Updating...' : active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Container holding the Instructor Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-slate-100 font-sans">

            {/* Form Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                    {editingInstructorId ? 'Edit Instructor Profile' : 'Add Instructor Profile'}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {editingInstructorId ? 'Update existing instructor details and CAA license records.' : 'Enter new cadre credentials and CAA license records.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Inputs Stacked Vertically */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">

              {/* First Name */}
              <div className="space-y-1.5">
                <label htmlFor="i_first_name" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    id="i_first_name"
                    name="i_first_name"
                    maxLength={120}
                    required
                    value={formData.i_first_name}
                    onChange={handleChange}
                    placeholder="e.g. Alexander"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div className="space-y-1.5">
                <label htmlFor="i_middle_name" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  Middle Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    id="i_middle_name"
                    name="i_middle_name"
                    maxLength={120}
                    required
                    value={formData.i_middle_name}
                    onChange={handleChange}
                    placeholder="e.g. Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label htmlFor="i_last_name" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    id="i_last_name"
                    name="i_last_name"
                    maxLength={120}
                    required
                    value={formData.i_last_name}
                    onChange={handleChange}
                    placeholder="e.g. Sterling"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-medium transition-all"
                  />
                </div>
              </div>

              {/* License Number */}
              <div className="space-y-1.5">
                <label htmlFor="i_license_number" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  License Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <FileBadge className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    id="i_license_number"
                    name="i_license_number"
                    maxLength={120}
                    required
                    value={formData.i_license_number}
                    onChange={handleChange}
                    placeholder="e.g. LIC-994820-A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono font-medium transition-all"
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl transition-all cursor-pointer active:scale-98"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-600/20 active:scale-98"
                >
                  <Save className="h-4 w-4" /> {editingInstructorId ? 'Update Instructor' : 'Save Instructor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Instructor;