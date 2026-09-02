import React, { useState, useEffect, useCallback } from 'react';
import { userActivationService } from '../services/api';
import { ShieldAlert, Search, Calendar, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

export default function UserActivationDashboard() {
  // Data States
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUserId, setModalUserId] = useState('');
  const [modalAction, setModalAction] = useState('approved');
  const [modalNotes, setModalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch history from API
  const fetchAuditHistory = useCallback(async (targetOffset = offset) => {
    setLoading(true);
    try {
      const response = await userActivationService.getGlobalHistory(limit, targetOffset);
      const data = response.data;
      setLogs(data.history || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to retrieve audit log history.');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  // Reactive Fetch on Page Shift
  useEffect(() => {
    fetchAuditHistory(offset);
  }, [offset, fetchAuditHistory]);

  const changePage = (direction) => {
    setOffset((prev) => prev + direction * limit);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  const openModal = () => {
    setModalUserId('');
    setModalNotes('');
    setModalAction('approved');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!modalUserId.trim() || !modalNotes.trim()) {
      alert('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await userActivationService.processApproval({
        userId: modalUserId.trim(),
        action: modalAction,
        notes: modalNotes.trim()
      });

      alert(response.data.message);
      closeModal();
      setOffset(0);
      fetchAuditHistory(0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-Side Search and Date Range Filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(log.userId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(log.actionedBy || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!log.createdAt) return matchesSearch;
    const logTime = new Date(log.createdAt).getTime();

    const matchesStart = startDate ? logTime >= new Date(startDate + 'T00:00:00').getTime() : true;
    const matchesEnd = endDate ? logTime <= new Date(endDate + 'T23:59:59').getTime() : true;

    return matchesSearch && matchesStart && matchesEnd;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900">
      <div className="w-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">
        
        {/* Header Section */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl shrink-0 mt-1">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-slate-900 uppercase truncate">User Activation Logs</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 truncate">Review system validation histories and modify access privileges.</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs md:text-sm font-black rounded-xl shadow-xs transition-all uppercase cursor-pointer shrink-0"
          >
            Process Status Update
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-50 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar space-y-6">

          {/* Date & Keyword Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Search className="h-3 w-3 text-slate-400" /> Search Remarks & IDs
              </label>
              <input
                type="text"
                placeholder="Search details..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none placeholder-slate-400 focus:bg-white"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="h-3 w-3 text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Calendar className="h-3 w-3 text-slate-400" /> End Date
                </label>
                {(searchQuery || startDate || endDate) && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 font-bold uppercase cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Clear Filters
                  </button>
                )}
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Logs Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                System Log Index (<span className="text-sky-600 font-mono">{filteredLogs.length}</span> visible)
              </h2>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => changePage(-1)}
                  disabled={offset === 0 || loading}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-[11px] font-bold uppercase rounded-lg disabled:opacity-30 text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="h-3 w-3" /> Previous
                </button>
                <button
                  onClick={() => changePage(1)}
                  disabled={offset + limit >= totalRecords || loading}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-[11px] font-bold uppercase rounded-lg disabled:opacity-30 text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
                >
                  Next <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4 w-36">Actioned By</th>
                    <th className="p-4">Notes / System Remarks</th>
                    <th className="p-4 w-44">Log Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-sky-600 font-medium animate-pulse">
                        Querying system audit logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-slate-400 italic">
                        No matching log entries found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-slate-400">#{log.id}</td>
                        <td className="p-4 font-semibold text-slate-700">
                          {log.operator ? `${log.operator.firstName} ${log.operator.lastName}` : log.actionedBy ? `Admin ID: ${log.actionedBy}` : <span className="text-slate-400 italic">System</span>}
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs md:max-w-md break-words" title={log.notes}>
                          {log.notes || '—'}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs z-50">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase">Modify Activation Status</h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User Target ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter User ID..."
                  value={modalUserId}
                  onChange={(e) => setModalUserId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`border rounded-xl p-3 flex items-center gap-2.5 cursor-pointer ${modalAction === 'approved' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <input type="radio" name="action" value="approved" checked={modalAction === 'approved'} onChange={() => setModalAction('approved')} />
                    <span className="text-xs font-bold uppercase text-emerald-700">Approve</span>
                  </label>
                  <label className={`border rounded-xl p-3 flex items-center gap-2.5 cursor-pointer ${modalAction === 'rejected' ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                    <input type="radio" name="action" value="rejected" checked={modalAction === 'rejected'} onChange={() => setModalAction('rejected')} />
                    <span className="text-xs font-bold uppercase text-rose-700">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Justification Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter justification notes..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none resize-none focus:bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-200">
                  Close
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow-xs">
                  {submitting ? 'Processing...' : 'Commit Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}