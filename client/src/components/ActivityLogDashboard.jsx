import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '../services/api';
import { 
  Activity, Search, Calendar, Filter, ArrowLeft, ArrowRight, 
  RotateCcw, Eye, Code, User as UserIcon, Globe, Clock, ChevronDown 
} from 'lucide-react';

export default function ActivityLogDashboard() {
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Modal Payload State
  const [activePayload, setActivePayload] = useState(null);

  const fetchModules = async () => {
    try {
      const res = await activityLogService.getModules();
      setModules(res.data?.data?.modules || []);
    } catch (err) {
      console.error('Failed to load activity modules:', err);
    }
  };

  const fetchLogs = useCallback(async (currentOffset = offset) => {
    setLoading(true);
    try {
      const params = {
        limit,
        offset: currentOffset,
        search: search.trim() || undefined,
        module: selectedModule || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await activityLogService.getLogs(params);
      const data = res.data?.data || {};

      setLogs(data.logs || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, search, selectedModule, startDate, endDate]);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchLogs(offset);
  }, [offset, fetchLogs]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedModule('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  const changePage = (direction) => {
    setOffset((prev) => prev + direction * limit);
  };

  const getUserName = (user) => {
    if (!user) return 'System / Guest';
    return `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.email;
  };

  const getMethodBadge = (method) => {
    const m = (method || 'LOG').toUpperCase();
    const colors = {
      GET: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
      POST: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      PUT: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      PATCH: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
      DELETE: 'bg-rose-950/60 text-rose-400 border-rose-800/50'
    };
    return (
      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${colors[m] || 'bg-slate-800 text-slate-300'}`}>
        {m}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-slate-100 p-2 md:p-4">
      
      {/* Header */}
      <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">System Activity Logs</h1>
            <p className="text-slate-400 text-xs mt-0.5">Audit system interactions, operational actions, and request footprints.</p>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Records</span>
          <span className="text-base font-mono font-bold text-sky-400">{totalRecords}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Search className="h-3 w-3 text-slate-500" /> Search Terms
          </label>
          <input
            type="text"
            placeholder="Search action, description, IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-600"
          />
        </div>

        {/* Module Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3 w-3 text-slate-500" /> System Module
          </label>
          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setOffset(0); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Start Date */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-500" /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 [color-scheme:dark]"
          />
        </div>

        {/* End Date & Reset */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" /> End Date
            </label>
            {(search || selectedModule || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Clear
              </button>
            )}
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 [color-scheme:dark]"
          />
        </div>

      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col text-xs">
        
        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Index Stream (<span className="text-sky-400 font-mono">{logs.length}</span> visible)
          </h2>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => changePage(-1)}
              disabled={offset === 0 || loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-bold uppercase disabled:opacity-30 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Prev
            </button>
            <button
              onClick={() => changePage(1)}
              disabled={offset + limit >= totalRecords || loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-bold uppercase disabled:opacity-30 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              Next <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-950/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <th className="p-4 w-16">ID</th>
                <th className="p-4 w-32">Module / Action</th>
                <th className="p-4 w-44">User / Actor</th>
                <th className="p-4">Description</th>
                <th className="p-4 w-28">Method / Path</th>
                <th className="p-4 w-36">IP / Timestamp</th>
                <th className="p-4 w-16 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-sky-400 font-medium animate-pulse">
                    Querying activity trail indexes...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500 italic">
                    No activity logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="p-4 font-mono text-slate-500">#{log.id}</td>
                    <td className="p-4 space-y-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase text-[9px] block w-max">
                        {log.module}
                      </span>
                      <span className="font-bold text-white block">{log.action}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3 text-slate-500" />
                        {getUserName(log.user)}
                      </div>
                      {log.user?.role && (
                        <span className="text-[10px] text-slate-500 capitalize">{log.user.role}</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs break-words">
                      {log.description || '—'}
                    </td>
                    <td className="p-4 space-y-1">
                      <div>{getMethodBadge(log.method)}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]" title={log.path}>
                        {log.path || '—'}
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-600" /> {log.ipAddress || 'Internal'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-600" /> {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {log.payload ? (
                        <button
                          onClick={() => setActivePayload(log.payload)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-400 rounded-lg transition-colors cursor-pointer"
                          title="View Payload JSON"
                        >
                          <Code className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {activePayload && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activity Context Payload</h3>
              </div>
              <button
                onClick={() => setActivePayload(null)}
                className="text-slate-500 hover:text-white text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto font-mono text-[11px] bg-slate-950 text-emerald-400 rounded-b-2xl">
              <pre>{JSON.stringify(activePayload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}