import React, { useState, useEffect } from 'react';
import { aircraftService, workOrderService } from '../services/api';
import { Activity, Gauge, ShieldAlert, Plus, X, FileText, Calendar, Compass, ArrowLeft, Plane, Info } from 'lucide-react';

export default function AircraftDashboard() {
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState(null);
  const [data, setData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});

  // Detailed Inspection Trackers for Clicked Cards
  const [inspectItem, setInspectItem] = useState(null);

  const fetchFleetListOnly = async () => {
    try {
      const res = await aircraftService.getAllAircraft();
      const fleet = Array.isArray(res.data?.data?.aircraft) 
        ? res.data.data.aircraft 
        : res.data?.data?.profile ? [res.data.data.profile] : [];
      setAircraftList(fleet);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const syncDashboardData = async (autoSelectId = null) => {
    setLoading(true);
    try {
      await fetchFleetListOnly();
      const targetId = autoSelectId || selectedAircraftId;
      if (targetId) {
        await handleSelectAircraft(targetId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectAircraft = async (id) => {
    setLoading(true);
    setSelectedAircraftId(id);
    try {
      const res = await aircraftService.getDashboard(id);
      setData(res.data?.data?.profile || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFleetList = () => {
    setLoading(true);
    setData(null);
    setSelectedAircraftId(null);
    fetchFleetListOnly().finally(() => setLoading(false));
  };

  useEffect(() => {
    syncDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, aircraft_id: data?.id || selectedAircraftId };
      switch (activeModal) {
        case 'aircraft':
          const newAc = await aircraftService.create(formData);
          const newId = newAc.data?.data?.aircraft?.id || newAc.data?.data?.id;
          setActiveModal(null);
          setFormData({});
          syncDashboardData(newId);
          return;
        case 'engine': await workOrderService.addEngine(payload); break;
        case 'logbook': await workOrderService.addLogbookEntry(payload); break;
        case 'inspection': await workOrderService.addInspection(payload); break;
        case 'compliance': await workOrderService.addCompliance(payload); break;
        default: break;
      }
      setActiveModal(null);
      setFormData({});
      syncDashboardData();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
      <Compass className="h-10 w-10 text-sky-500 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Syncing fleet telemetry matrix...</span>
    </div>
  );

  if (error) return (
    <div className="text-rose-400 bg-rose-950/30 p-5 border border-rose-800 rounded-xl max-w-2xl mx-auto mt-10 shadow-lg">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-2">🚨 Connection Glitch</h3>
      <p className="text-sm text-rose-300/80">Could not resolve operational profiles: {error}</p>
      <button onClick={handleBackToFleetList} className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 cursor-pointer">Force Reset Context</button>
    </div>
  );

  // =========================================================================
  // CORE LAYOUT SWITCH CONTROLLER ENGINE
  // =========================================================================
  return (
    <div className="space-y-6">
      
      {/* 🧭 CONTEXT LAYER 1: FLEET REGISTER GRID (Rendered when selectedAircraftId is null) */}
      {!selectedAircraftId ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col gap-4 bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Fleet Asset Register</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Select an active operational tail number configuration to inspect maintenance profiles.</p>
            </div>
            <button 
              onClick={() => { setFormData({}); setActiveModal('aircraft'); }}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Aircraft
            </button>
          </div>

          {aircraftList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
              <Plane className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">No Assets Registered</h3>
              <p className="text-xs text-slate-400">Initialize a master airframe index file row to begin tracking parameters operations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {aircraftList.map((ac) => (
                <div 
                  key={ac.id} 
                  onClick={() => handleSelectAircraft(ac.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-5 rounded-2xl shadow-xl space-y-4 cursor-pointer transition-all hover:-translate-y-1 group active:scale-98"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-sky-400 transition-colors tracking-tight">{ac.tail_number}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{ac.model_variant}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-mono">S/N: {ac.serial_number}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5"><Gauge className="h-4 w-4 text-sky-500" /> <span>{ac.base_ttaf || '0.0'} h</span></div>
                    <div className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-amber-500" /> <span>{ac.engines?.length || 0} Engines</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !data ? (
        /* Unpacked Data Error State Guard */
        <div className="text-center p-12 space-y-4 bg-slate-900 rounded-2xl border border-slate-800 max-w-md mx-auto">
          <p className="text-sm text-slate-400">Unable to resolve nested children array indices properties for this reference pointer.</p>
          <button onClick={handleBackToFleetList} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 cursor-pointer">Return to register index</button>
        </div>
      ) : (
        
        /* 🧭 CONTEXT LAYER 2: DETAILED AIRFRAME TRACKING METRICS WORKSPACE */
        <div className="space-y-6 animate-fadeIn">
          <button 
            onClick={handleBackToFleetList} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Fleet List Overview
          </button>

          {/* ⚡ HEAD ACTIONS HEADER CARD */}
          <div className="flex flex-col gap-5 bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{data.tail_number}</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-xs font-semibold">Active</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">{data.model_variant} | S/N: {data.serial_number}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <button onClick={() => { setFormData({}); setActiveModal('aircraft'); }} className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer order-last sm:order-first col-span-2 sm:col-span-1">
                <Plus className="h-4 w-4 text-sky-500" /> Add Aircraft
              </button>
              <button onClick={() => setActiveModal('engine')} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Plus className="h-4 w-4" /> Engine
              </button>
              <button onClick={() => setActiveModal('logbook')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <FileText className="h-4 w-4" /> Log Entry
              </button>
              <button onClick={() => setActiveModal('inspection')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Calendar className="h-4 w-4" /> Interval
              </button>
              <button onClick={() => setActiveModal('compliance')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <ShieldAlert className="h-4 w-4" /> AD Check
              </button>
            </div>
          </div>

          {/* ⚡ CARD SUMMARY WIDGETS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Airframe Hours</p><h3 className="text-2xl font-black text-white mt-0.5">{data.base_ttaf || '0.0'} h</h3></div>
              <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl"><Gauge className="h-5 w-5" /></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mounted Engines</p><h3 className="text-2xl font-black text-white mt-0.5">{data.engines?.length || 0} U</h3></div>
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Activity className="h-5 w-5" /></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">AD Compliances</p><h3 className="text-2xl font-black text-white mt-0.5">{data.compliances?.length || 0} Records</h3></div>
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><ShieldAlert className="h-5 w-5" /></div>
            </div>
          </div>

          {/* ⚡ DATA SUB-TABLES SEGMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5"><Activity className="h-4 w-4 text-amber-500" /> Propulsion Plant</h2>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {data.engines && data.engines.length > 0 ? (
                  data.engines.map(eng => (
                    <div 
                      key={eng.id} 
                      onClick={() => setInspectItem({ type: 'engine', details: eng })}
                      className="p-3.5 bg-slate-950 hover:bg-slate-900/60 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm cursor-pointer transition-all hover:border-slate-700 active:scale-99 group"
                    >
                      <div>
                        <p className="font-bold text-slate-200 group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                          {eng.make_model} <Info className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-xs text-slate-500 font-mono">S/N: {eng.serial_number}</p>
                      </div>
                      <div className="sm:text-right text-xs text-slate-400 font-mono">Inst: {eng.installed_date || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No engine blocks bound.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5"><Calendar className="h-4 w-4 text-sky-400" /> Maintenance Schedule</h2>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {data.inspections && data.inspections.length > 0 ? (
                  data.inspections.map(insp => (
                    <div 
                      key={insp.id} 
                      onClick={() => setInspectItem({ type: 'inspection', details: insp })}
                      className="p-3.5 bg-slate-950 hover:bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center text-sm cursor-pointer transition-all hover:border-slate-700 active:scale-99 group"
                    >
                      <div>
                        <p className="font-bold text-slate-200 truncate max-w-[140px] sm:max-w-xs group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                          {insp.inspection_type} <Info className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[11px] text-rose-400 mt-0.5">Due: {insp.next_due_date || 'N/A'}</p>
                      </div>
                      <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300 shrink-0">Due: {insp.next_due_tech}h</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No tracking intervals recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ⚡ HOISTED MODALS: SHARED POPUPS WINDOW (Accessible by both page views)
          ========================================================================= */}
      
      {/* 1. CARD SPECIFICATION DRAWER POPUP */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-400" /> Asset Meta Specification
              </h3>
              <button onClick={() => setInspectItem(null)} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-5 space-y-4 text-sm text-slate-300">
              {inspectItem.type === 'engine' ? (
                <div className="space-y-3">
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Nomenclature Model</span><p className="text-white font-bold text-base">{inspectItem.details.make_model}</p></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Serial tracking Number</span><p className="text-amber-400 font-mono font-medium">{inspectItem.details.serial_number}</p></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Hangar Mount Date</span><p className="text-slate-200 font-mono">{inspectItem.details.installed_date || 'N/A'}</p></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Inspection Threshold</span><p className="text-white font-bold text-base">{inspectItem.details.inspection_type}</p></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Interval Months</span><p className="text-slate-200">{inspectItem.details.interval_months || 'N/A'} m</p></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Interval Hours</span><p className="text-slate-200">{inspectItem.details.interval_hours || '0.0'} h</p></div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                    <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Calendar Deadline</span><p className="text-rose-400 font-medium font-mono">{inspectItem.details.next_due_date || 'N/A'}</p></div>
                    <div className="text-right"><span className="text-[10px] uppercase font-bold text-slate-500 block">Tach Limit</span><p className="text-sky-400 font-bold font-mono">{inspectItem.details.next_due_tech}h</p></div>
                  </div>
                </div>
              )}
              <button onClick={() => setInspectItem(null)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2 rounded-xl mt-2 cursor-pointer transition-colors">Dismiss Window</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATION PARAMETERS ENTRY CHANNEL MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <h3 className="font-bold text-white text-base capitalize">Add {activeModal === 'aircraft' ? 'Airframe' : activeModal} Record</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
              {activeModal === 'aircraft' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tail Number *</label><input type="text" name="tail_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="e.g. N123AF" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Serial Number *</label><input type="text" name="serial_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="e.g. 172-55401" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Model Variant *</label><input type="text" name="model_variant" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="e.g. Cessna 172S" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Model Year</label><input type="number" name="mode_year" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="2026" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base TTAF (Hours)</label><input type="number" step="0.01" name="base_ttaf" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="0.00" /></div>
                  </div>
                </>
              )}

              {activeModal === 'engine' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Make & Model *</label><input type="text" name="make_model" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Lycoming IO-360" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Serial Number *</label><input type="text" name="serial_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="S/N Block" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Installation Date</label><input type="date" name="installed_date" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
                </>
              )}

              {activeModal === 'logbook' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Logbook Type *</label><select name="logbook_type" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"><option value="">-- Select --</option><option value="airframe">Airframe Log</option><option value="engine">Engine Log</option></select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tach Time *</label><input type="number" step="0.01" name="tach_time" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Time *</label><input type="number" step="0.01" name="total_time" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entry Date *</label><input type="date" name="entry_date" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signatory Inspector Full Name *</label><input type="text" name="mechanic_name" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="John Doe" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">FAA A&P Certificate / License ID *</label><input type="text" name="certificate_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="AP-3649521" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance Scope Summary Narrative</label><textarea name="description" rows="3" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Sign-off details..."></textarea></div>
                </>
              )}

              {activeModal === 'inspection' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Inspection Operations Label *</label><input type="text" name="inspection_type" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="e.g. 100-Hour Inspection" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interval Months</label><input type="number" name="interval_months" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interval Hours</label><input type="number" step="0.1" name="interval_hours" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Due Date</label><input type="date" name="next_due_date" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Due Tach Hour *</label><input type="number" step="0.01" name="next_due_tech" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" /></div>
                  </div>
                </>
              )}

              {activeModal === 'compliance' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AD Identifier Number *</label><input type="text" name="ad_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="e.g. AD 2026-08-12" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bulletin Action Subject *</label><input type="text" name="subject" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="e.g. Wing Fitting Check" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Method Of Compliance Details *</label><textarea name="method_of_compliance" rows="3" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Describe actions logged..."></textarea></div>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="is_recurring" name="is_recurring" onChange={handleInputChange} className="h-4 w-4 accent-sky-500 bg-slate-950 border-slate-800 rounded cursor-pointer" />
                    <label htmlFor="is_recurring" className="text-xs text-slate-300 font-medium select-none cursor-pointer">Requires recurring checks?</label>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-2 border-t border-slate-800">
                <button type="button" onClick={() => { setActiveModal(null); }} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md">Commit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}